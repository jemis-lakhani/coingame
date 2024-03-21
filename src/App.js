import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom";
import GameBoard from "./components/GameBoard";
import { SocketProvider } from "./context/SocketContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./components/HomePage";

function App() {
  return (
    <>
      <SocketProvider>
        <div className="flex flex-col">
          <Header></Header>
          <div
            className="flex flex-col gap-1 h-full bg-neutral-100"
            style={{ height: "calc(100vh - 104px)" }}
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
      </SocketProvider>
    </>
  );
}

export default App;
