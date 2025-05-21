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
        {(() => {
          // Prepare shot data
          const shots = [
            { label: 'Down-the-line shot', value: lenDownLine },
            { label: 'Cross-court shot', value: lenCross },
            { label: 'Medium shot (bisector)', value: lenBisector }
          ];
          // Find min, max
          const values = shots.map(s => s.value);
          const min = Math.min(...values);
          const max = Math.max(...values);
          // Render rows with color
          return shots.map((s, i) => (
            <div className={styles.row} key={s.label}>
              <span className={styles.label}>{s.label}:</span>
              <span
                className={styles.value}
                style={s.value === max ? { color: 'green' } : s.value === min ? { color: 'red' } : {}}
              >
                {s.value.toFixed(2)} m
              </span>
            </div>
          ));
        })()}
        <div className={styles.row}><span className={styles.label}>Difference (Longest - Shortest):</span><span className={styles.value}>{(Math.abs(Math.max(lenDownLine, lenCross, lenBisector) - Math.min(lenDownLine, lenCross, lenBisector))).toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Player 1 → Player 2:</span><span className={styles.value}>{lenP2.toFixed(2)} m</span></div>
        <div className={styles.row}><span className={styles.label}>Angle between shots:</span><span className={styles.value}>{angleDeg.toFixed(2)}°</span></div>
      </div>
    </div>
  );
};

export default ShotInfoPanel;
