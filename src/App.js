import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WaitingRoom from "./components/WaitingRoom1";
import Header from "./components/Header";
import Footer from "./components/footer1";

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
