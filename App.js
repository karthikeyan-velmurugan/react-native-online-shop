import React, { useState } from "react";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import { AppLoading } from "expo";
import * as Font from "expo-font";
import ReduxThunk from "redux-thunk";
import * as Notifications from "expo-notifications";
//import { composeWithDevTools } from "redux-devtools-extension";

import productsReducer from "./store/reducers/products";
import cartReducer from "./store/reducers/cart";
import orderReducer from "./store/reducers/orders";
import authReducer from "./store/reducers/Auth";
//import ShopNavigator from "./navigation/ShopNavigator";
import AppNavigator from "./navigation/AppNavigator";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return { shouldShowAlert: true };
  },
});

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: orderReducer,
  auth: authReducer,
});

const store = createStore(rootReducer, applyMiddleware(ReduxThunk));
//const store = createStore(rootReducer, composeWithDevTools());

const fetchFonts = () => {
  return Font.loadAsync({
    "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
    "open-sans-bold": require("./assets/fonts/OpenSans-Bold.ttf"),
  });
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);

  if (!fontLoaded) {
    return (
      <AppLoading
        startAsync={fetchFonts}
        onFinish={() => {
          setFontLoaded(true);
        }}
      />
    );
  }
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
