import React from "react";
import "./App.css";

function App() {
  const [ws, setWs] = React.useState<WebSocket | null>(null);

  React.useEffect(() => {
    var ws = new WebSocket("ws://localhost:5000/");
    ws.onopen = () => {
      console.log("Connected");
    };
    ws.onmessage = (event) => {
      console.log(event.data);
    };
    ws.onclose = () => {
      console.log("Disconnected");
    };
    setWs(ws);
    return () => {
      ws.close();
    };
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (ws) {
      ws.send(event.target.value);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <input type="text" onChange={handleInput} />
      </header>
    </div>
  );
}

export default App;
