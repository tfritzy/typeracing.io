import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";
import { StoreProvider } from "./store/CustomProvider";
import { AppContext } from "./store/storeHooks";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <>
    <div className="text-text-primary">
      <StoreProvider store={store} context={AppContext}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreProvider>
    </div>
  </>
);
