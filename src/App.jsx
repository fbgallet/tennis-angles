import "./App.css";
import TennisCourt from "./components/TennisCourt";

function App() {
  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ fontSize: 20, margin: "10px 0" }}>
        Tennis Angles Theory Visualizer
      </h3>
      <TennisCourt />
    </div>
  );
}

export default App;
