import React, { useState, useRef, useEffect } from "react";
import styles from "./ShotInfoPanel.module.scss";

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
  onClose,
}) => {
  const [position, setPosition] = useState({ x: 20, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains(styles.header)
    ) {
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && panelRef.current) {
      const container = panelRef.current.parentElement;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        const panelRect = panelRef.current.getBoundingClientRect();

        let newX = e.clientX - containerRect.left - dragOffset.x;
        let newY = e.clientY - containerRect.top - dragOffset.y;

        // Keep panel within container bounds
        newX = Math.max(
          0,
          Math.min(newX, containerRect.width - panelRect.width)
        );
        newY = Math.max(
          0,
          Math.min(newY, containerRect.height - panelRect.height)
        );

        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      className={styles.shotInfoPanel}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
    >
      <button className={styles.closeBtn} onClick={onClose}>
        ✕
      </button>
      <div className={styles.header}>Shot & Angle Info</div>
      <div className={styles.infoTable}>
        {(() => {
          // Prepare shot data
          const shots = [
            { label: "Down-the-line shot", value: lenDownLine },
            { label: "Cross-court shot", value: lenCross },
            { label: "Medium shot (bisector)", value: lenBisector },
          ];
          // Find min, max
          const values = shots.map((s) => s.value);
          const min = Math.min(...values);
          const max = Math.max(...values);
          // Render rows with color
          return shots.map((s, i) => (
            <div className={styles.row} key={s.label}>
              <span className={styles.label}>{s.label}:</span>
              <span
                className={styles.value}
                style={
                  s.value === max
                    ? { color: "green" }
                    : s.value === min
                    ? { color: "red" }
                    : {}
                }
              >
                {s.value.toFixed(2)} m
              </span>
            </div>
          ));
        })()}
        <div className={styles.row}>
          <span className={styles.label}>Difference (Longest - Shortest):</span>
          <span className={styles.value}>
            {Math.abs(
              Math.max(lenDownLine, lenCross, lenBisector) -
                Math.min(lenDownLine, lenCross, lenBisector)
            ).toFixed(2)}{" "}
            m
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Player 1 → Player 2:</span>
          <span className={styles.value}>{lenP2.toFixed(2)} m</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Angle between shots:</span>
          <span className={styles.value}>{angleDeg.toFixed(2)}°</span>
        </div>
      </div>
    </div>
  );
};

export default ShotInfoPanel;
