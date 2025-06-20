import React, { useEffect, useRef } from "react";
import ShotInfoPanel from "./ShotInfoPanel";
import BurgerMenu from "./BurgerMenu";
import CourtCanvas from "./CourtCanvas";
import CanvasControls from "./CanvasControls";
import { useCourtState } from "../hooks/useCourtState";
import { useTouchOptimizedDragHandling } from "../hooks/useTouchOptimizedDragHandling";
import { useCanvasSize } from "../hooks/useCanvasSize";
import { useLanguage } from "../hooks/useLanguage";
import {
  resolvePlayerSwing,
  getContactPoint,
  calculateAutoShotPositions,
} from "../utils/tennis-logic";
import {
  calculateBisector,
  calculateShotVectors,
  calculatePlayerDistance,
  getAngleDeg,
} from "../utils/geometry";
import { COURT_LENGTH } from "../constants/tennis";
import { BG_SIZES } from "../constants/tennis";
import type { ShotType } from "../types/tennis";
import tcStyles from "./TennisCourt.module.scss";

const TennisCourt: React.FC = () => {
  // Use custom hooks for state management
  const courtState = useCourtState();
  const dragHandling = useTouchOptimizedDragHandling();
  const { canvasSize, containerRef } = useCanvasSize(
    courtState.courtOrientation
  );
  const { t } = useLanguage();

  // Shot type state
  const [shotType, setShotType] = React.useState<ShotType>("rally_topspin");

  // Refs for coordinate transforms
  const courtToPxRef = useRef<any>(null);
  const pxToCourtRef = useRef<any>(null);
  const hitTestHandlesRef = useRef<any>(null);

  // Handle coordinate transforms from canvas
  const handleTransformsReady = (transforms: any) => {
    courtToPxRef.current = transforms.courtToPx;
    pxToCourtRef.current = transforms.pxToCourt;

    // Create hit test function
    const hitTestHandles = dragHandling.createHitTestFunction(
      courtState.player1,
      courtState.player2,
      courtState.shot1,
      courtState.shot2,
      courtState.shot3,
      courtState.shot4,
      transforms.courtToPx,
      courtState.player1bis,
      courtState.player2bis
    );
    hitTestHandlesRef.current = hitTestHandles;

    // Store anchors for drag handling
    dragHandling.anchorsRef.current = transforms;
  };

  // Track active player (for stats panel)
  const [activePlayer, setActivePlayer] = React.useState<"player1" | "player2">(
    "player1"
  );
  const [hoveredPlayer, setHoveredPlayer] = React.useState<
    "player1" | "player2" | null
  >(null);

  // Update active player when interacting, but only if both players' shots are visible or none are visible
  React.useEffect(() => {
    const bothShotsVisible =
      courtState.showShotsPlayer1 && courtState.showShotsPlayer2;
    const noShotsVisible =
      !courtState.showShotsPlayer1 && !courtState.showShotsPlayer2;
    const canSwitchPlayer = bothShotsVisible || noShotsVisible;

    if (canSwitchPlayer) {
      if (
        dragHandling.dragging === "player1" ||
        dragHandling.dragging === "player2"
      ) {
        setActivePlayer(dragHandling.dragging);
      } else if (hoveredPlayer) {
        setActivePlayer(hoveredPlayer);
      }
    }
  }, [
    dragHandling.dragging,
    hoveredPlayer,
    courtState.showShotsPlayer1,
    courtState.showShotsPlayer2,
  ]);

  // Determine display player based on shot visibility
  const bothShotsVisible =
    courtState.showShotsPlayer1 && courtState.showShotsPlayer2;
  const noShotsVisible =
    !courtState.showShotsPlayer1 && !courtState.showShotsPlayer2;
  const canSwitchPlayer = bothShotsVisible || noShotsVisible;

  let displayPlayer = activePlayer;
  if (!canSwitchPlayer) {
    // Force display to the player whose shots are visible
    if (courtState.showShotsPlayer1 && !courtState.showShotsPlayer2) {
      displayPlayer = "player1";
    } else if (courtState.showShotsPlayer2 && !courtState.showShotsPlayer1) {
      displayPlayer = "player2";
    }
  }

  // Auto-update shot endpoints based on Player 1 position
  useEffect(() => {
    if (!courtState.hasMovedPlayer1) return;

    const resolvedSwing =
      courtState.player1Swing === "auto"
        ? resolvePlayerSwing(
            courtState.player1,
            courtState.player1Handedness,
            courtState.courtOrientation,
            true,
            courtState.prevPlayer1Swing,
            courtState.setPrevPlayer1Swing
          )
        : courtState.player1Swing;

    const contact = getContactPoint(
      courtState.player1,
      courtState.player1Handedness,
      resolvedSwing,
      true,
      courtState.courtOrientation,
      courtToPxRef.current,
      pxToCourtRef.current
    );

    const { shot1, shot2 } = calculateAutoShotPositions(
      courtState.player1,
      contact,
      courtState.courtOrientation,
      true,
      courtState.gameMode
    );

    courtState.setShot1(shot1);
    courtState.setShot2(shot2);
  }, [
    courtState.player1.x,
    courtState.player1.y,
    courtState.hasMovedPlayer1,
    courtState.player1Handedness,
    courtState.player1Swing,
    courtState.courtOrientation,
    courtState.gameMode,
  ]);

  // Auto-update shot endpoints based on Player 2 position
  useEffect(() => {
    if (!courtState.hasMovedPlayer2) return;

    const resolvedSwing =
      courtState.player2Swing === "auto"
        ? resolvePlayerSwing(
            courtState.player2,
            courtState.player2Handedness,
            courtState.courtOrientation,
            false,
            courtState.prevPlayer2Swing,
            courtState.setPrevPlayer2Swing
          )
        : courtState.player2Swing;

    const contact = getContactPoint(
      courtState.player2,
      courtState.player2Handedness,
      resolvedSwing,
      false,
      courtState.courtOrientation,
      courtToPxRef.current,
      pxToCourtRef.current
    );

    const { shot1, shot2 } = calculateAutoShotPositions(
      courtState.player2,
      contact,
      courtState.courtOrientation,
      false,
      courtState.gameMode
    );

    courtState.setShot3(shot1);
    courtState.setShot4(shot2);
  }, [
    courtState.player2.x,
    courtState.player2.y,
    courtState.hasMovedPlayer2,
    courtState.player2Handedness,
    courtState.player2Swing,
    courtState.courtOrientation,
    courtState.gameMode,
  ]);

  // Cycle swing mode for a player
  const cycleSwingMode = (playerId: "player1" | "player2") => {
    if (playerId === "player1") {
      courtState.setPlayer1Swing((s) => {
        const next =
          s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
        return next;
      });
      courtState.setHasMovedPlayer1(true);
    } else {
      courtState.setPlayer2Swing((s) => {
        const next =
          s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
        return next;
      });
      courtState.setHasMovedPlayer2(true);
    }
  };

  // Handle double-click for swing toggle (both players)
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hitTestHandlesRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const hit = hitTestHandlesRef.current(px, py);
    if (hit === "player1") {
      cycleSwingMode("player1");
    } else if (hit === "player2") {
      cycleSwingMode("player2");
    }
  };

  // Game logic handlers
  const handleCheckPosition = () => {
    if (!courtToPxRef.current) return;

    // Get player 1's contact point and calculate bisector
    const resolvedSwing =
      courtState.player1Swing === "auto"
        ? resolvePlayerSwing(
            courtState.player1,
            courtState.player1Handedness,
            courtState.courtOrientation,
            true,
            courtState.prevPlayer1Swing
          )
        : courtState.player1Swing;

    const contact = getContactPoint(
      courtState.player1,
      courtState.player1Handedness,
      resolvedSwing,
      true,
      courtState.courtOrientation,
      courtToPxRef.current,
      pxToCourtRef.current
    );

    const bisectorResult = calculateBisector(
      contact,
      courtState.shot1,
      courtState.shot2,
      courtToPxRef.current,
      BG_SIZES[courtState.courtOrientation],
      courtState.courtOrientation,
      COURT_LENGTH
    );

    if (bisectorResult.optimalP2) {
      const dist = Math.hypot(
        courtState.player2.x - bisectorResult.optimalP2.x,
        courtState.player2.y - bisectorResult.optimalP2.y
      );

      if (dist < 0.5) {
        courtState.setFeedback(t("youWin"));
      } else {
        courtState.setFeedback(t("youLose"));
      }
    }
  };

  const handleShowSolution = () => {
    courtState.setShowAngles(true);
    courtState.setShowOptimal(true);
  };

  // Calculate shot/angle info for stats panel based on display player
  const isDisplayingPlayer1 = displayPlayer === "player1";
  const currentPlayer = isDisplayingPlayer1
    ? courtState.player1
    : courtState.player2;
  const currentShot1 = isDisplayingPlayer1
    ? courtState.shot1
    : courtState.shot3;
  const currentShot2 = isDisplayingPlayer1
    ? courtState.shot2
    : courtState.shot4;
  const currentHandedness = isDisplayingPlayer1
    ? courtState.player1Handedness
    : courtState.player2Handedness;
  const currentSwing = isDisplayingPlayer1
    ? courtState.player1Swing
    : courtState.player2Swing;
  const currentPrevSwing = isDisplayingPlayer1
    ? courtState.prevPlayer1Swing
    : courtState.prevPlayer2Swing;
  const oppositePlayer = isDisplayingPlayer1
    ? courtState.player2
    : courtState.player1;

  const { vDownLine, vCross, lenDownLine, lenCross } = calculateShotVectors(
    currentPlayer,
    currentShot1,
    currentShot2
  );

  const lenP2 = calculatePlayerDistance(currentPlayer, oppositePlayer);
  const angleDeg = getAngleDeg(vDownLine, vCross);

  // Calculate bisector length for stats
  const resolvedCurrentSwing =
    currentSwing === "auto"
      ? resolvePlayerSwing(
          currentPlayer,
          currentHandedness,
          courtState.courtOrientation,
          isDisplayingPlayer1,
          currentPrevSwing
        )
      : currentSwing;

  const currentContact = getContactPoint(
    currentPlayer,
    currentHandedness,
    resolvedCurrentSwing,
    isDisplayingPlayer1,
    courtState.courtOrientation,
    courtToPxRef.current,
    pxToCourtRef.current
  );

  const bisectorResult = courtToPxRef.current
    ? calculateBisector(
        currentContact,
        currentShot1,
        currentShot2,
        courtToPxRef.current,
        BG_SIZES[courtState.courtOrientation],
        courtState.courtOrientation,
        isDisplayingPlayer1 ? COURT_LENGTH : 0
      )
    : null;

  const lenBisector =
    bisectorResult?.optimalP2 || bisectorResult?.optimalP1
      ? Math.hypot(
          (bisectorResult.optimalP2?.x || bisectorResult.optimalP1?.x || 0) -
            currentPlayer.x,
          (bisectorResult.optimalP2?.y || bisectorResult.optimalP1?.y || 0) -
            currentPlayer.y
        )
      : 0;

  // Helper function to calculate lateral distance to intercept a shot trajectory
  const calculateLateralDistanceToTrajectory = (
    shotStart: { x: number; y: number },
    shotEnd: { x: number; y: number },
    playerPos: { x: number; y: number }
  ) => {
    // Calculate the trajectory vector
    const trajectoryVector = {
      x: shotEnd.x - shotStart.x,
      y: shotEnd.y - shotStart.y,
    };

    // Calculate vector from shot start to player
    const toPlayerVector = {
      x: playerPos.x - shotStart.x,
      y: playerPos.y - shotStart.y,
    };

    // Project the player vector onto the trajectory to find the closest point on the trajectory
    const trajectoryLength = Math.hypot(trajectoryVector.x, trajectoryVector.y);
    if (trajectoryLength === 0) return 0;

    const normalizedTrajectory = {
      x: trajectoryVector.x / trajectoryLength,
      y: trajectoryVector.y / trajectoryLength,
    };

    // Calculate the projection length
    const projectionLength =
      toPlayerVector.x * normalizedTrajectory.x +
      toPlayerVector.y * normalizedTrajectory.y;

    // Find the closest point on the trajectory line
    const closestPoint = {
      x: shotStart.x + projectionLength * normalizedTrajectory.x,
      y: shotStart.y + projectionLength * normalizedTrajectory.y,
    };

    // Calculate the lateral distance (perpendicular distance to the trajectory)
    const lateralDistance = Math.hypot(
      playerPos.x - closestPoint.x,
      playerPos.y - closestPoint.y
    );

    return lateralDistance;
  };

  // Calculate lateral distances from opposite player to each shot trajectory
  const distanceToShot1 = calculateLateralDistanceToTrajectory(
    currentContact,
    currentShot1,
    oppositePlayer
  );
  const distanceToShot2 = calculateLateralDistanceToTrajectory(
    currentContact,
    currentShot2,
    oppositePlayer
  );

  // For bisector, calculate distance to the optimal position line
  const distanceToBisector =
    bisectorResult?.optimalP2 || bisectorResult?.optimalP1
      ? calculateLateralDistanceToTrajectory(
          currentContact,
          {
            x: bisectorResult.optimalP2?.x || bisectorResult.optimalP1?.x || 0,
            y: bisectorResult.optimalP2?.y || bisectorResult.optimalP1?.y || 0,
          },
          oppositePlayer
        )
      : 0;

  return (
    <div className={tcStyles.pageRoot}>
      {/* Burger Menu */}
      <BurgerMenu
        courtOrientation={courtState.courtOrientation}
        setCourtOrientation={courtState.setCourtOrientation}
        courtType={courtState.courtType}
        setCourtType={courtState.setCourtType}
        gameMode={courtState.gameMode}
        setGameMode={courtState.setGameMode}
        showShotsPlayer1={courtState.showShotsPlayer1}
        setShowShotsPlayer1={courtState.setShowShotsPlayer1}
        showBisectorPlayer1={courtState.showBisectorPlayer1}
        setShowBisectorPlayer1={courtState.setShowBisectorPlayer1}
        showShotsPlayer2={courtState.showShotsPlayer2}
        setShowShotsPlayer2={courtState.setShowShotsPlayer2}
        showBisectorPlayer2={courtState.showBisectorPlayer2}
        setShowBisectorPlayer2={courtState.setShowBisectorPlayer2}
        showOptimal={courtState.showOptimal}
        setShowOptimal={courtState.setShowOptimal}
        player1Handedness={courtState.player1Handedness}
        setPlayer1Handedness={courtState.setPlayer1Handedness}
        player1Swing={courtState.player1Swing}
        setPlayer1Swing={courtState.setPlayer1Swing}
        player2Handedness={courtState.player2Handedness}
        setPlayer2Handedness={courtState.setPlayer2Handedness}
        player2Swing={courtState.player2Swing}
        setPlayer2Swing={courtState.setPlayer2Swing}
        shotType={shotType}
        setShotType={setShotType}
        setHasMovedPlayer1={courtState.setHasMovedPlayer1}
        setHasMovedPlayer2={courtState.setHasMovedPlayer2}
        feedback={courtState.feedback}
        setFeedback={courtState.setFeedback}
        setShowAngles={courtState.setShowAngles}
        onCheckPosition={handleCheckPosition}
        onShowSolution={handleShowSolution}
        showStatsPanel={courtState.showStatsPanel}
        setShowStatsPanel={courtState.setShowStatsPanel}
      />

      {/* Stats Panel Overlay - Always present but panel visibility controlled by state */}
      <div className={tcStyles.statsOverlay}>
        <ShotInfoPanel
          lenDownLine={lenDownLine}
          lenCross={lenCross}
          lenBisector={lenBisector}
          lenP2={lenP2}
          angleDeg={angleDeg}
          distanceToShot1={distanceToShot1}
          distanceToShot2={distanceToShot2}
          distanceToBisector={distanceToBisector}
          displayPlayer={displayPlayer}
          shotType={shotType}
          contactPoint={currentContact}
          shot1Endpoint={currentShot1}
          shot2Endpoint={currentShot2}
          bisectorEndpoint={
            bisectorResult?.optimalP2 ||
            bisectorResult?.optimalP1 || { x: 0, y: 0 }
          }
          opponentPosition={oppositePlayer}
          visible={courtState.showStatsPanel}
          onClose={() => courtState.setShowStatsPanel(false)}
        />
      </div>

      {/* Court Container */}
      <div ref={containerRef} className={tcStyles.courtContainer}>
        <CourtCanvas
          player1={courtState.player1}
          player2={courtState.player2}
          player1bis={courtState.player1bis}
          player2bis={courtState.player2bis}
          shot1={courtState.shot1}
          shot2={courtState.shot2}
          shot3={courtState.shot3}
          shot4={courtState.shot4}
          courtOrientation={courtState.courtOrientation}
          courtType={courtState.courtType}
          gameMode={courtState.gameMode}
          player1Handedness={courtState.player1Handedness}
          player1Swing={courtState.player1Swing}
          player2Handedness={courtState.player2Handedness}
          player2Swing={courtState.player2Swing}
          prevPlayer1Swing={courtState.prevPlayer1Swing}
          prevPlayer2Swing={courtState.prevPlayer2Swing}
          showShotsPlayer1={courtState.showShotsPlayer1}
          showShotsPlayer2={courtState.showShotsPlayer2}
          showBisectorPlayer1={courtState.showBisectorPlayer1}
          showBisectorPlayer2={courtState.showBisectorPlayer2}
          showOptimal={courtState.showOptimal}
          canvasSize={canvasSize}
          onPointerDown={(e) => {
            const result = dragHandling.handleStart(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              hitTestHandlesRef.current
            );
            if (result?.isDoubleTap && result.target) {
              cycleSwingMode(result.target as "player1" | "player2");
            }
          }}
          onPointerMove={(e) =>
            dragHandling.handleMove(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              courtState.courtOrientation,
              {
                setPlayer1: courtState.setPlayer1,
                setPlayer2: courtState.setPlayer2,
                setPlayer1bis: courtState.setPlayer1bis,
                setPlayer2bis: courtState.setPlayer2bis,
                setShot1: courtState.setShot1,
                setShot2: courtState.setShot2,
                setShot3: courtState.setShot3,
                setShot4: courtState.setShot4,
                setHasMovedPlayer1: courtState.setHasMovedPlayer1,
                setHasMovedPlayer2: courtState.setHasMovedPlayer2,
                setHasMovedPlayer1bis: courtState.setHasMovedPlayer1bis,
                setHasMovedPlayer2bis: courtState.setHasMovedPlayer2bis,
              }
            )
          }
          onPointerUp={dragHandling.handleEnd}
          onMouseMove={(e) => {
            dragHandling.handleMouseMove(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              hitTestHandlesRef.current
            );

            // Track hovering for stats panel
            if (!hitTestHandlesRef.current) return;
            const canvas = e.currentTarget as HTMLCanvasElement;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const px = (e.clientX - rect.left) * scaleX;
            const py = (e.clientY - rect.top) * scaleY;

            const hit = hitTestHandlesRef.current(px, py);
            if (hit === "player1" || hit === "player2") {
              setHoveredPlayer(hit);
            } else {
              setHoveredPlayer(null);
            }
          }}
          onDoubleClick={handleDoubleClick}
          onTransformsReady={handleTransformsReady}
        />

        {/* Canvas Controls Overlay */}
        <CanvasControls
          courtOrientation={courtState.courtOrientation}
          onOrientationToggle={() => {
            courtState.setCourtOrientation(
              courtState.courtOrientation === "portrait"
                ? "landscape"
                : "portrait"
            );
          }}
          showStatsPanel={courtState.showStatsPanel}
          onStatsToggle={() =>
            courtState.setShowStatsPanel(!courtState.showStatsPanel)
          }
          gameMode={courtState.gameMode}
          onGameModeToggle={() => {
            courtState.setGameMode(
              courtState.gameMode === "singles" ? "doubles" : "singles"
            );
          }}
        />
      </div>
    </div>
  );
};

export default TennisCourt;
