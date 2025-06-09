import React, { useEffect, useRef } from "react";
import ShotInfoPanel from "./ShotInfoPanel";
import CourtControls from "./CourtControls";
import CourtCanvas from "./CourtCanvas";
import { useCourtState } from "../hooks/useCourtState";
import { useDragHandling } from "../hooks/useDragHandling";
import { useCanvasSize } from "../hooks/useCanvasSize";
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
import tcStyles from "./TennisCourt.module.scss";

const TennisCourtRefactored: React.FC = () => {
  // Use custom hooks for state management
  const courtState = useCourtState();
  const dragHandling = useDragHandling();
  const { canvasSize, containerRef } = useCanvasSize(
    courtState.courtOrientation
  );

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
      transforms.courtToPx
    );
    hitTestHandlesRef.current = hitTestHandles;

    // Store anchors for drag handling
    dragHandling.anchorsRef.current = transforms;
  };

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
      true
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
      false
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
  ]);

  // Handle player 1 double-click for swing toggle
  const handlePlayer1DoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hitTestHandlesRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const hit = hitTestHandlesRef.current(px, py);
    if (hit === "player1") {
      courtState.setPlayer1Swing((s) => {
        const next =
          s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
        return next;
      });
      courtState.setHasMovedPlayer1(true);
    }
  };

  // Mobile long-press support for swing toggle
  let longPressTimer: number | null = null;

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!hitTestHandlesRef.current) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const px = touch.clientX - rect.left;
    const py = touch.clientY - rect.top;

    const hit = hitTestHandlesRef.current(px, py);
    if (hit === "player1") {
      longPressTimer = window.setTimeout(() => {
        courtState.setPlayer1Swing((s) => {
          const next =
            s === "auto" ? "forehand" : s === "forehand" ? "backhand" : "auto";
          return next;
        });
        courtState.setHasMovedPlayer1(true);
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
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
        courtState.setFeedback("You win! 🎾");
      } else {
        courtState.setFeedback("You lose, try again or ask for the solution.");
      }
    }
  };

  const handleShowSolution = () => {
    courtState.setShowAngles(true);
    courtState.setShowOptimal(true);
  };

  // Calculate shot/angle info for stats panel
  const { vDownLine, vCross, lenDownLine, lenCross } = calculateShotVectors(
    courtState.player1,
    courtState.shot1,
    courtState.shot2
  );

  const lenP2 = calculatePlayerDistance(courtState.player1, courtState.player2);
  const angleDeg = getAngleDeg(vDownLine, vCross);

  // Calculate bisector length for stats
  const resolvedPlayer1Swing =
    courtState.player1Swing === "auto"
      ? resolvePlayerSwing(
          courtState.player1,
          courtState.player1Handedness,
          courtState.courtOrientation,
          true,
          courtState.prevPlayer1Swing
        )
      : courtState.player1Swing;

  const player1Contact = getContactPoint(
    courtState.player1,
    courtState.player1Handedness,
    resolvedPlayer1Swing,
    true,
    courtState.courtOrientation,
    courtToPxRef.current,
    pxToCourtRef.current
  );

  const bisectorResult = courtToPxRef.current
    ? calculateBisector(
        player1Contact,
        courtState.shot1,
        courtState.shot2,
        courtToPxRef.current,
        BG_SIZES[courtState.courtOrientation],
        courtState.courtOrientation,
        COURT_LENGTH
      )
    : null;

  const lenBisector = bisectorResult?.optimalP2
    ? Math.hypot(
        bisectorResult.optimalP2.x - courtState.player1.x,
        bisectorResult.optimalP2.y - courtState.player1.y
      )
    : 0;

  return (
    <div className={tcStyles.pageRoot}>
      <div className={tcStyles.sidePanel}>
        <div className={tcStyles.topBar}>Tennis Angle Theory</div>

        <CourtControls
          courtOrientation={courtState.courtOrientation}
          setCourtOrientation={courtState.setCourtOrientation}
          courtType={courtState.courtType}
          setCourtType={courtState.setCourtType}
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
          setHasMovedPlayer1={courtState.setHasMovedPlayer1}
          setHasMovedPlayer2={courtState.setHasMovedPlayer2}
          feedback={courtState.feedback}
          setFeedback={courtState.setFeedback}
          setShowAngles={courtState.setShowAngles}
          onCheckPosition={handleCheckPosition}
          onShowSolution={handleShowSolution}
        />

        <div className={tcStyles.sidebarBottom}>
          <button
            className={tcStyles.statsToggleBtn}
            onClick={() =>
              courtState.setShowStatsPanel(!courtState.showStatsPanel)
            }
            type="button"
          >
            {courtState.showStatsPanel ? "Hide stats" : "Show stats"}
          </button>
          {courtState.showStatsPanel && (
            <ShotInfoPanel
              lenDownLine={lenDownLine}
              lenCross={lenCross}
              lenBisector={lenBisector}
              lenP2={lenP2}
              angleDeg={angleDeg}
              visible={true}
              onClose={() => {}}
            />
          )}
        </div>
      </div>

      <div ref={containerRef} className={tcStyles.courtContainer}>
        <CourtCanvas
          player1={courtState.player1}
          player2={courtState.player2}
          shot1={courtState.shot1}
          shot2={courtState.shot2}
          shot3={courtState.shot3}
          shot4={courtState.shot4}
          courtOrientation={courtState.courtOrientation}
          courtType={courtState.courtType}
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
          onPointerDown={(e) =>
            dragHandling.handlePointerDown(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              hitTestHandlesRef.current
            )
          }
          onPointerMove={(e) =>
            dragHandling.handlePointerMove(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              courtState.courtOrientation,
              {
                setPlayer1: courtState.setPlayer1,
                setPlayer2: courtState.setPlayer2,
                setShot1: courtState.setShot1,
                setShot2: courtState.setShot2,
                setShot3: courtState.setShot3,
                setShot4: courtState.setShot4,
                setHasMovedPlayer1: courtState.setHasMovedPlayer1,
                setHasMovedPlayer2: courtState.setHasMovedPlayer2,
              }
            )
          }
          onPointerUp={dragHandling.handlePointerUp}
          onMouseMove={(e) =>
            dragHandling.handleMouseMove(
              e,
              { current: e.currentTarget as HTMLCanvasElement },
              hitTestHandlesRef.current
            )
          }
          onDoubleClick={handlePlayer1DoubleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTransformsReady={handleTransformsReady}
        />
      </div>
    </div>
  );
};

export default TennisCourtRefactored;
