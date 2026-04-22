import { BattleScreen } from "./screens/BattleScreen";
import { ChapterMapScreen } from "./screens/ChapterMapScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { StageScreen } from "./screens/StageScreen";
import { useAppStore } from "./store/useAppStore";
import "./App.css";

function App() {
  const screen = useAppStore((s) => s.screen);

  return (
    <>
      {screen === "home" ? <HomeScreen /> : null}
      {screen === "chapter" ? <ChapterMapScreen /> : null}
      {screen === "stage" ? <StageScreen /> : null}
      {screen === "battle" ? <BattleScreen /> : null}
      {screen === "result" ? <ResultScreen /> : null}
    </>
  );
}

export default App;
