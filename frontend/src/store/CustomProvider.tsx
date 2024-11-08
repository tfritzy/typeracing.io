import React, { createContext, useContext } from "react";
import { Provider } from "react-redux";
import { Store } from "@reduxjs/toolkit";

interface StoreProviderProps {
  store: Store;
  context: React.Context<any>;
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({
  store,
  context,
  children,
}) => (
  <Provider store={store} context={context}>
    {children}
  </Provider>
);
