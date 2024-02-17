import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <div className="App">
        <Header></Header>
        <Router>
          <Routes>
            <Route path="/" exact element={<WaitingRoom />} />
          </Routes>
        </Router>
        <Footer></Footer>
      </div>
    </>
  );
}

export default App;
