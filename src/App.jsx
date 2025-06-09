import "./App.css";
import TennisCourtRefactored from "./components/TennisCourtRefactored";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: 24 }}>
      <h3 style={{ fontSize: 20, margin: "16px 0" }}>
        Tennis Angle Theory Visualizer (Refactored)
      </h3>
      <TennisCourtRefactored />
      <div
        style={{
          background: "rgba(255,255,255,0.8)",
          padding: 8,
          borderRadius: 4,
          fontSize: 14,
          margin: "24px auto 0 auto",
          maxWidth: 400,
        }}
      >
        <b>Drag any dot to move it:</b>
        <br />
        <span style={{ color: "blue" }}>Blue: Player 1</span>
        <br />
        <span style={{ color: "purple" }}>Purple: Player 2</span>
        <br />
        <span style={{ color: "red" }}>Red: Shot endpoints</span>
        <br />
        <span style={{ color: "green" }}>Green: Player 2 (optimal)</span>
      </div>
    </div>
  );
}

export default App;
