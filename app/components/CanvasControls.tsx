import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotate,
  faChartLine,
  faEyeSlash,
  faMobile,
  faDesktop,
} from "@fortawesome/free-solid-svg-icons";
import type { CourtOrientation } from "../types/tennis";
import styles from "./CanvasControls.module.scss";

interface CanvasControlsProps {
  courtOrientation: CourtOrientation;
  onOrientationToggle: () => void;
  showStatsPanel: boolean;
  onStatsToggle: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  courtOrientation,
  onOrientationToggle,
  showStatsPanel,
  onStatsToggle,
}) => {
  return (
    <div className={styles.canvasControls}>
      {/* Orientation Toggle Button */}
      <button
        className={`${styles.controlButton} ${styles.orientationButton}`}
        onClick={onOrientationToggle}
        title={`Switch to ${
          courtOrientation === "portrait" ? "landscape" : "portrait"
        } mode`}
        aria-label={`Switch to ${
          courtOrientation === "portrait" ? "landscape" : "portrait"
        } mode`}
      >
        <FontAwesomeIcon
          icon={courtOrientation === "portrait" ? faDesktop : faMobile}
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
        title={showStatsPanel ? "Hide statistics" : "Show statistics"}
        aria-label={showStatsPanel ? "Hide statistics" : "Show statistics"}
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
