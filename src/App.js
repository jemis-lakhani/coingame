import { useEffect, useState } from "react";
import "./App.css";
import io from "socket.io-client";
import Header from "./components/header";
import Footer from "./components/footer";
import WaitingRoom from "./components/waitingRoom";
import Entry from "./components/entry";
const socket = io.connect("http://localhost:5000");

function App() {
  const [message, setMessage] = useState("");
  const [recievedMessage, setRecievedMessage] = useState("");

  const sendMessage = () => {
    socket.emit("send_message", { message });
  };

  useEffect(() => {
    socket.on("recieive_message", (data) => {
      setRecievedMessage(data.message);
    });
  }, [socket]);

  return (
    <>
      <Header></Header>
      <WaitingRoom></WaitingRoom>
      {/* <Entry></Entry> */}
      <Footer></Footer>
    </>
  );
}

export default App;
