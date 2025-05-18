import React from 'react';
import styles from './ShotInfoPanel.module.scss';

interface ShotInfoPanelProps {
  lenDownLine: number;
  lenCross: number;
  lenBisector: number;
  lenP2: number;
  angleDeg: number;
  visible: boolean;
  onClose: () => void;
}

const ShotInfoPanel: React.FC<ShotInfoPanelProps> = ({
  lenDownLine,
  lenCross,
  lenBisector,
  lenP2,
  angleDeg,
  visible,
  onClose
}) => {
  if (!visible) return null;
  return (
    <div className={styles.shotInfoPanel}>
      <button className={styles.closeBtn} onClick={onClose}>✕</button>
      <div className={styles.header}>Shot & Angle Info</div>
      <div className={styles.infoTable}>
        <div className={styles.row}><span className={styles.label}>Down-the-line shot:</span><span className={styles.value}>{lenDownLine.toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Cross-court shot:</span><span className={styles.value}>{lenCross.toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Medium shot (bisector):</span><span className={styles.value}>{lenBisector.toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Player 1 → Player 2:</span><span className={styles.value}>{lenP2.toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Angle between shots:</span><span className={styles.value}>{angleDeg.toFixed(2)}°</span></div>
      </div>
    </div>
  );
};

export default ShotInfoPanel;
