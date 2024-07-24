import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";
import HexagonGrid from "./HexBackground";

const root = ReactDOM.createRoot(
 document.getElementById("root") as HTMLElement
);

root.render(
 <>
  <div className="fixed left-0 top-">
   <HexagonGrid
    backgroundColor="#a7f3d0"
    hexagonColor="#0d1117"
    raceStartTime={10_000}
   />
  </div>
  <div className="text-text-primary">
   <Provider store={store}>
    <BrowserRouter>
     <App />
    </BrowserRouter>
   </Provider>
  </div>
 </>
);
