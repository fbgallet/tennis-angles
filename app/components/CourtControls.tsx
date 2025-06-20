import React from "react";
import { useLanguage } from "../hooks/useLanguage";
import type {
  CourtOrientation,
  CourtType,
  Handedness,
  SwingType,
  ShotType,
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
  shotType: ShotType;
  setShotType: (shotType: ShotType) => void;
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
  shotType,
  setShotType,
  setHasMovedPlayer1,
  setHasMovedPlayer2,
  feedback,
  setFeedback,
  setShowAngles,
  onCheckPosition,
  onShowSolution,
}) => {
  const { t } = useLanguage();
  return (
    <div className={tcStyles.topControls}>
      <div className={tcStyles.controlSection}>
        <h4 className={tcStyles.controlSectionTitle}>{t("courtSettings")}</h4>
        <div className={tcStyles.compactRow}>
          <label className={tcStyles.selectLabel}>
            <span className={tcStyles.selectText}>{t("orientation")}</span>
            <select
              value={courtOrientation}
              onChange={(e) =>
                setCourtOrientation(e.target.value as CourtOrientation)
              }
              className={tcStyles.smallSelect}
            >
              <option value="portrait">{t("portrait")}</option>
              <option value="landscape">{t("landscape")}</option>
            </select>
          </label>
        </div>
        <div className={tcStyles.compactRow}>
          <label className={tcStyles.selectLabel}>
            <span className={tcStyles.selectText}>{t("courtType")}</span>
            <select
              value={courtType}
              onChange={(e) => setCourtType(e.target.value as CourtType)}
              className={tcStyles.smallSelect}
            >
              <option value="clay">{t("clay")}</option>
              <option value="hard">{t("hard")}</option>
              <option value="grass">{t("grass")}</option>
            </select>
          </label>
        </div>
        <div className={tcStyles.compactRow}>
          <label className={tcStyles.selectLabel}>
            <span className={tcStyles.selectText}>{t("shotType")}</span>
            <select
              value={shotType}
              onChange={(e) => setShotType(e.target.value as ShotType)}
              className={tcStyles.smallSelect}
            >
              <option value="flat_attack">{t("flatAttack")}</option>
              <option value="powerful_topspin">{t("powerfulTopspin")}</option>
              <option value="rally_topspin">{t("rallyTopspin")}</option>
              <option value="defensive_slice">{t("defensiveSlice")}</option>
            </select>
          </label>
        </div>
      </div>
      <div className={tcStyles.controlsPanel}>
        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>
            {t("player1Display")}
          </h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showShotsPlayer1}
                onChange={(e) => setShowShotsPlayer1(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>{t("p1Shots")}</span>
            </label>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showBisectorPlayer1}
                onChange={(e) => setShowBisectorPlayer1(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>{t("p1Bisector")}</span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>
            {t("player2Display")}
          </h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showShotsPlayer2}
                onChange={(e) => setShowShotsPlayer2(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>{t("p2Shots")}</span>
            </label>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showBisectorPlayer2}
                onChange={(e) => setShowBisectorPlayer2(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>{t("p2Bisector")}</span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>{t("other")}</h4>
          <div className={tcStyles.checkboxGroup}>
            <label className={tcStyles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showOptimal}
                onChange={(e) => setShowOptimal(e.target.checked)}
                className={tcStyles.checkbox}
              />
              <span className={tcStyles.checkboxText}>
                {t("optimalPositions")}
              </span>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>
            {t("playerSettings")}
          </h4>
          <div className={tcStyles.playerControls}>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>{t("p1Hand")}</span>
              <select
                value={player1Handedness}
                onChange={(e) => {
                  setPlayer1Handedness(e.target.value as Handedness);
                  setHasMovedPlayer1(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="right">{t("right")}</option>
                <option value="left">{t("left")}</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>{t("p1Swing")}</span>
              <select
                value={player1Swing}
                onChange={(e) => {
                  setPlayer1Swing(e.target.value as SwingType);
                  setHasMovedPlayer1(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="auto">{t("auto")}</option>
                <option value="forehand">{t("forehand")}</option>
                <option value="backhand">{t("backhand")}</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>{t("p2Hand")}</span>
              <select
                value={player2Handedness}
                onChange={(e) => {
                  setPlayer2Handedness(e.target.value as Handedness);
                  setHasMovedPlayer2(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="right">{t("right")}</option>
                <option value="left">{t("left")}</option>
              </select>
            </label>
            <label className={tcStyles.selectLabel}>
              <span className={tcStyles.selectText}>{t("p2Swing")}</span>
              <select
                value={player2Swing}
                onChange={(e) => {
                  setPlayer2Swing(e.target.value as SwingType);
                  setHasMovedPlayer2(true);
                }}
                className={tcStyles.smallSelect}
              >
                <option value="auto">{t("auto")}</option>
                <option value="forehand">{t("forehand")}</option>
                <option value="backhand">{t("backhand")}</option>
              </select>
            </label>
          </div>
        </div>

        <div className={tcStyles.controlSection}>
          <h4 className={tcStyles.controlSectionTitle}>{t("game")}</h4>
          <div className={tcStyles.gameControls}>
            <button className={tcStyles.gameButton} onClick={onCheckPosition}>
              {t("checkPosition")}
            </button>
            <button className={tcStyles.gameButton} onClick={onShowSolution}>
              {t("showSolution")}
            </button>
          </div>
          {feedback && <div className={tcStyles.feedback}>{feedback}</div>}
        </div>
      </div>
    </div>
  );
};

export default CourtControls;
