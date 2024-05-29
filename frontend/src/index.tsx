import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";
import { TextColor } from "./constants";

const root = ReactDOM.createRoot(
 document.getElementById("root") as HTMLElement
);

root.render(
 <div style={{ color: TextColor }}>
  <div
   style={{
    textAlign: "center",
    fontWeight: "normal",
   }}
   className="fixed bottom-0 left-0 w-full bg-neutral-color background-accent"
  >
   Extremely alpha version. Expect frequent outages and
   broken stuff.
  </div>
  <Provider store={store}>
   <BrowserRouter>
    <App />
   </BrowserRouter>
  </Provider>
 </div>
);
