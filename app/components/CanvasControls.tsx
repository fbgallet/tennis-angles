import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotate,
  faChartLine,
  faEyeSlash,
  faMobile,
  faDesktop,
  faUser,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "../hooks/useLanguage";
import type { CourtOrientation, GameMode } from "../types/tennis";
import styles from "./CanvasControls.module.scss";

interface CanvasControlsProps {
  courtOrientation: CourtOrientation;
  onOrientationToggle: () => void;
  showStatsPanel: boolean;
  onStatsToggle: () => void;
  gameMode: GameMode;
  onGameModeToggle: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  courtOrientation,
  onOrientationToggle,
  showStatsPanel,
  onStatsToggle,
  gameMode,
  onGameModeToggle,
}) => {
  const { t } = useLanguage();
  return (
    <div className={styles.canvasControls}>
      {/* Game Mode Toggle Button */}
      <button
        className={`${styles.controlButton} ${styles.gameModeButton}`}
        onClick={onGameModeToggle}
        title={gameMode === "singles" ? t("doubles") : t("singles")}
        aria-label={gameMode === "singles" ? t("doubles") : t("singles")}
      >
        <FontAwesomeIcon
          icon={gameMode === "singles" ? faUser : faUserGroup}
          className={styles.buttonIcon}
        />
      </button>

      {/* Orientation Toggle Button */}
      <button
        className={`${styles.controlButton} ${styles.orientationButton}`}
        onClick={onOrientationToggle}
        title={
          courtOrientation === "portrait"
            ? t("switchToLandscape")
            : t("switchToPortrait")
        }
        aria-label={
          courtOrientation === "portrait"
            ? t("switchToLandscape")
            : t("switchToPortrait")
        }
      >
        <FontAwesomeIcon
          icon={courtOrientation === "portrait" ? faMobile : faDesktop}
          className={styles.buttonIcon}
        />
        {/* <span className={styles.buttonLabel}>
          {courtOrientation === "portrait" ? "Landscape" : "Portrait"}
        </span> */}
      </button>

      {/* Stats Toggle Button */}
      <button
        className={`${styles.controlButton} ${styles.statsButton} ${
          showStatsPanel ? styles.active : ""
        }`}
        onClick={onStatsToggle}
        title={showStatsPanel ? t("hideStatistics") : t("showStatistics")}
        aria-label={showStatsPanel ? t("hideStatistics") : t("showStatistics")}
      >
        <FontAwesomeIcon
          icon={showStatsPanel ? faEyeSlash : faChartLine}
          className={styles.buttonIcon}
        />
        {/* <span className={styles.buttonLabel}>
          {showStatsPanel ? "Hide Stats" : "Show Stats"}
        </span> */}
      </button>
    </div>
  );
};

export default CanvasControls;
