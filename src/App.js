import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Entry from "./components/Entry";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <>
      <div className="App">
        <Header></Header>
        <div
          className="flex flex-col gap-1"
          style={{ minHeight: "calc(100vh - 112px)" }}
        >
          <Router>
            <Routes>
              <Route path="/" exact element={<Entry />} />
              <Route path="/waiting-room" exact element={<WaitingRoom />} />
              <Route path="/gameboard" exact element={<GameBoard />} />
            </Routes>
          </Router>
        </div>
        <Footer></Footer>
      </div>
    </>
  );
}

export default App;
