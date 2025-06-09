import React from "react";
import type {
  CourtOrientation,
  CourtType,
  Handedness,
  SwingType,
} from "../types/tennis";
import tcStyles from "./TennisCourt.module.scss";

interface CourtControlsProps {
  courtOrientation: CourtOrientation;
  setCourtOrientation: (orientation: CourtOrientation) => void;
  courtType: CourtType;
  setCourtType: (type: CourtType) => void;
  showShotsPlayer1: boolean;
  setShowShotsPlayer1: (show: boolean) => void;
  showBisectorPlayer1: boolean;
  setShowBisectorPlayer1: (show: boolean) => void;
  showShotsPlayer2: boolean;
  setShowShotsPlayer2: (show: boolean) => void;
  showBisectorPlayer2: boolean;
  setShowBisectorPlayer2: (show: boolean) => void;
  showOptimal: boolean;
  setShowOptimal: (show: boolean) => void;
  player1Handedness: Handedness;
  setPlayer1Handedness: (handedness: Handedness) => void;
  player1Swing: SwingType;
  setPlayer1Swing: (swing: SwingType) => void;
  player2Handedness: Handedness;
  setPlayer2Handedness: (handedness: Handedness) => void;
  player2Swing: SwingType;
  setPlayer2Swing: (swing: SwingType) => void;
  setHasMovedPlayer1: (moved: boolean) => void;
  setHasMovedPlayer2: (moved: boolean) => void;
  feedback: string;
  setFeedback: (feedback: string) => void;
  setShowAngles: (show: boolean) => void;
  onCheckPosition: () => void;
  onShowSolution: () => void;
}

const CourtControls: React.FC<CourtControlsProps> = ({
  courtOrientation,
  setCourtOrientation,
  courtType,
  setCourtType,
  showShotsPlayer1,
  setShowShotsPlayer1,
  showBisectorPlayer1,
  setShowBisectorPlayer1,
  showShotsPlayer2,
  setShowShotsPlayer2,
  showBisectorPlayer2,
  setShowBisectorPlayer2,
  showOptimal,
  setShowOptimal,
  player1Handedness,
  setPlayer1Handedness,
  player1Swing,
  setPlayer1Swing,
  player2Handedness,
  setPlayer2Handedness,
  player2Swing,
  setPlayer2Swing,
  setHasMovedPlayer1,
  setHasMovedPlayer2,
  feedback,
  setFeedback,
  setShowAngles,
  onCheckPosition,
  onShowSolution,
}) => {
  return (
    <div className={tcStyles.topControls}>
      <div className={tcStyles.controlSection}>
        <h4 className={tcStyles.controlSectionTitle}>Court Settings</h4>
        <div className={tcStyles.compactRow}>
          <label className={tcStyles.selectLabel}>
            <span className={tcStyles.selectText}>Orientation:</span>
            <select
              value={courtOrientation}
              onChange={(e) =>
                setCourtOrientation(e.target.value as CourtOrientation)
              }
              className={tcStyles.smallSelect}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>
        <div className={tcStyles.compactRow}>
          <label className={tcStyles.selectLabel}>
            <span className={tcStyles.selectText}>Court type:</span>
            <select
              value={courtType}
              onChange={(e) => setCourtType(e.target.value as CourtType)}
              className={tcStyles.smallSelect}
            >
              <option value="clay">Clay</option>
              <option value="hard">Hard</option>
              <option value="grass">Grass</option>
            </select>
          </label>
        </div>
      </div>
      <div className={tcStyles.controlsPanel}>
        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>Player 1 Display</h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showShotsPlayer1}
                onChange={(e) => setShowShotsPlayer1(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>P1 shots</span>
            </label>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showBisectorPlayer1}
                onChange={(e) => setShowBisectorPlayer1(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>P1 bisector</span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>Player 2 Display</h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showShotsPlayer2}
                onChange={(e) => setShowShotsPlayer2(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>P2 shots</span>
            </label>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showBisectorPlayer2}
                onChange={(e) => setShowBisectorPlayer2(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>P2 bisector</span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>Other</h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showOptimal}
                onChange={(e) => setShowOptimal(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>Optimal positions</span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>Player Settings</h4>
          <div className={tcStyles.playerControls}>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>P1 Hand:</span>
              <select
                value={player1Handedness}
                onChange={(e) => {
                  setPlayer1Handedness(e.target.value as Handedness);
                  setHasMovedPlayer1(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>P1 Swing:</span>
              <select
                value={player1Swing}
                onChange={(e) => {
                  setPlayer1Swing(e.target.value as SwingType);
                  setHasMovedPlayer1(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="auto">Auto</option>
                <option value="forehand">Forehand</option>
                <option value="backhand">Backhand</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>P2 Hand:</span>
              <select
                value={player2Handedness}
                onChange={(e) => {
                  setPlayer2Handedness(e.target.value as Handedness);
                  setHasMovedPlayer2(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>P2 Swing:</span>
              <select
                value={player2Swing}
                onChange={(e) => {
                  setPlayer2Swing(e.target.value as SwingType);
                  setHasMovedPlayer2(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="auto">Auto</option>
                <option value="forehand">Forehand</option>
                <option value="backhand">Backhand</option>
              </select>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>Game</h4>
          <div className={tcStyles.gameControls}>
            <button className={tcStyles.gameButton} onClick={onCheckPosition}>
              🎯 Check Position
            </button>
            <button className={tcStyles.gameButton} onClick={onShowSolution}>
              💡 Show Solution
            </button>
          </div>
          {feedback && <div className={tcStyles.feedback}>{feedback}</div>}
        </div>
      </div>
    </div>
  );
};

export default CourtControls;
