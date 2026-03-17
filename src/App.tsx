import './App.css';
import { HUD } from './components/HUD';
import { StoneCanvas } from './components/StoneCanvas';
import { ToolSlot } from './components/ToolSlot';
import { UpgradePanel } from './components/UpgradePanel';

function App() {
  return (
    <div className="app-shell">
      <HUD />
      <div className="scene-board">
        <StoneCanvas />
        <div className="dashboard">
          <ToolSlot />
          <UpgradePanel />
        </div>
      </div>
    </div>
  );
}

export default App;
