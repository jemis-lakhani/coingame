import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom";
import GameBoard from "./components/GameBoard";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./components/HomePage";

function App() {
  return (
    <>
      <div className="flex flex-col">
        <Header></Header>
        <div
          className="flex flex-col justify-center space-y-10 h-auto bg-neutral-100"
          style={{
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <Router>
            <Routes>
              <Route path="/" exact element={<Home />} />
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
