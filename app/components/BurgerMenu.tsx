import React, { useState } from "react";
import CourtControls from "./CourtControls";
import { useLanguage } from "../hooks/useLanguage";
import type {
  CourtOrientation,
  CourtType,
  GameMode,
  Handedness,
  SwingType,
  ShotType,
} from "../types/tennis";
import styles from "./BurgerMenu.module.scss";

interface BurgerMenuProps {
  courtOrientation: CourtOrientation;
  setCourtOrientation: (orientation: CourtOrientation) => void;
  courtType: CourtType;
  setCourtType: (type: CourtType) => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
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
  showStatsPanel: boolean;
  setShowStatsPanel: (show: boolean) => void;
}

const BurgerMenu: React.FC<BurgerMenuProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Burger Button */}
      <button
        className={styles.burgerButton}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        type="button"
      >
        <div
          className={`${styles.burgerLine} ${isOpen ? styles.open : ""}`}
        ></div>
        <div
          className={`${styles.burgerLine} ${isOpen ? styles.open : ""}`}
        ></div>
        <div
          className={`${styles.burgerLine} ${isOpen ? styles.open : ""}`}
        ></div>
      </button>

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={closeMenu}></div>}

      {/* Menu Panel */}
      <div className={`${styles.menuPanel} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <h3 className={styles.menuTitle}>{t("controls")}</h3>
          <button
            className={styles.closeButton}
            onClick={closeMenu}
            aria-label="Close menu"
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.menuContent}>
          <CourtControls
            courtOrientation={props.courtOrientation}
            setCourtOrientation={props.setCourtOrientation}
            courtType={props.courtType}
            setCourtType={props.setCourtType}
            gameMode={props.gameMode}
            setGameMode={props.setGameMode}
            showShotsPlayer1={props.showShotsPlayer1}
            setShowShotsPlayer1={props.setShowShotsPlayer1}
            showBisectorPlayer1={props.showBisectorPlayer1}
            setShowBisectorPlayer1={props.setShowBisectorPlayer1}
            showShotsPlayer2={props.showShotsPlayer2}
            setShowShotsPlayer2={props.setShowShotsPlayer2}
            showBisectorPlayer2={props.showBisectorPlayer2}
            setShowBisectorPlayer2={props.setShowBisectorPlayer2}
            showOptimal={props.showOptimal}
            setShowOptimal={props.setShowOptimal}
            player1Handedness={props.player1Handedness}
            setPlayer1Handedness={props.setPlayer1Handedness}
            player1Swing={props.player1Swing}
            setPlayer1Swing={props.setPlayer1Swing}
            player2Handedness={props.player2Handedness}
            setPlayer2Handedness={props.setPlayer2Handedness}
            player2Swing={props.player2Swing}
            setPlayer2Swing={props.setPlayer2Swing}
            shotType={props.shotType}
            setShotType={props.setShotType}
            setHasMovedPlayer1={props.setHasMovedPlayer1}
            setHasMovedPlayer2={props.setHasMovedPlayer2}
            feedback={props.feedback}
            setFeedback={props.setFeedback}
            setShowAngles={props.setShowAngles}
            onCheckPosition={props.onCheckPosition}
            onShowSolution={props.onShowSolution}
          />

          <div className={styles.statsSection}>
            <button
              className={styles.statsToggleBtn}
              onClick={() => props.setShowStatsPanel(!props.showStatsPanel)}
              type="button"
            >
              {props.showStatsPanel ? t("hideStats") : t("showStats")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BurgerMenu;
