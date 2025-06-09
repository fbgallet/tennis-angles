import { useState, useEffect } from "react";
import type {
  Position,
  CourtOrientation,
  CourtType,
  Handedness,
  SwingType,
  ResolvedSwingType,
} from "../types/tennis";
import {
  getDefaultPlayerPositions,
  getDefaultShotPositions,
} from "../utils/tennis-logic";

export function useCourtState() {
  // Court settings
  const [courtOrientation, setCourtOrientation] =
    useState<CourtOrientation>("portrait");
  const [courtType, setCourtType] = useState<CourtType>("hard");

  // Display settings
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [showAnglesPlayer2, setShowAnglesPlayer2] = useState(false);
  const [showShotsPlayer1, setShowShotsPlayer1] = useState(true);
  const [showShotsPlayer2, setShowShotsPlayer2] = useState(false);
  const [showBisectorPlayer1, setShowBisectorPlayer1] = useState(true);
  const [showBisectorPlayer2, setShowBisectorPlayer2] = useState(false);
  const [showOptimal, setShowOptimal] = useState(false);

  // Player positions and settings
  const [player1, setPlayer1] = useState(
    () => getDefaultPlayerPositions("portrait").player1
  );
  const [player2, setPlayer2] = useState(
    () => getDefaultPlayerPositions("portrait").player2
  );
  const [hasMovedPlayer1, setHasMovedPlayer1] = useState(false);
  const [hasMovedPlayer2, setHasMovedPlayer2] = useState(false);

  // Player handedness and swing settings
  const [player1Handedness, setPlayer1Handedness] =
    useState<Handedness>("right");
  const [player1Swing, setPlayer1Swing] = useState<SwingType>("auto");
  const [player2Handedness, setPlayer2Handedness] =
    useState<Handedness>("right");
  const [player2Swing, setPlayer2Swing] = useState<SwingType>("auto");

  // Shot positions
  const [shot1, setShot1] = useState(
    () => getDefaultShotPositions("portrait").shot1
  );
  const [shot2, setShot2] = useState(
    () => getDefaultShotPositions("portrait").shot2
  );
  const [shot3, setShot3] = useState(
    () => getDefaultShotPositions("portrait").shot3
  );
  const [shot4, setShot4] = useState(
    () => getDefaultShotPositions("portrait").shot4
  );

  // Swing state tracking for hysteresis
  const [prevPlayer1Swing, setPrevPlayer1Swing] =
    useState<ResolvedSwingType>("forehand");
  const [prevPlayer2Swing, setPrevPlayer2Swing] =
    useState<ResolvedSwingType>("forehand");

  // Game state
  const [feedback, setFeedback] = useState("");

  // Reset positions when orientation changes (unless user has moved)
  useEffect(() => {
    const defaultPositions = getDefaultPlayerPositions(courtOrientation);
    const defaultShots = getDefaultShotPositions(courtOrientation);

    if (!hasMovedPlayer1) {
      setPlayer1(defaultPositions.player1);
      setShot1(defaultShots.shot1);
      setShot2(defaultShots.shot2);
    }
    if (!hasMovedPlayer2) {
      setPlayer2(defaultPositions.player2);
      setShot3(defaultShots.shot3);
      setShot4(defaultShots.shot4);
    }
  }, [courtOrientation, hasMovedPlayer1, hasMovedPlayer2]);

  return {
    // Court settings
    courtOrientation,
    setCourtOrientation,
    courtType,
    setCourtType,

    // Display settings
    showStatsPanel,
    setShowStatsPanel,
    showAngles,
    setShowAngles,
    showAnglesPlayer2,
    setShowAnglesPlayer2,
    showShotsPlayer1,
    setShowShotsPlayer1,
    showShotsPlayer2,
    setShowShotsPlayer2,
    showBisectorPlayer1,
    setShowBisectorPlayer1,
    showBisectorPlayer2,
    setShowBisectorPlayer2,
    showOptimal,
    setShowOptimal,

    // Player positions
    player1,
    setPlayer1,
    player2,
    setPlayer2,
    hasMovedPlayer1,
    setHasMovedPlayer1,
    hasMovedPlayer2,
    setHasMovedPlayer2,

    // Player settings
    player1Handedness,
    setPlayer1Handedness,
    player1Swing,
    setPlayer1Swing,
    player2Handedness,
    setPlayer2Handedness,
    player2Swing,
    setPlayer2Swing,

    // Shot positions
    shot1,
    setShot1,
    shot2,
    setShot2,
    shot3,
    setShot3,
    shot4,
    setShot4,

    // Swing tracking
    prevPlayer1Swing,
    setPrevPlayer1Swing,
    prevPlayer2Swing,
    setPrevPlayer2Swing,

    // Game state
    feedback,
    setFeedback,
  };
}
