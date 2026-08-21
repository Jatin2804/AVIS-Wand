import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store";
import Brand from "./brands";
import App from "./App.jsx";
import "./styles/style.css";

// Apply brand font family to the document
document.documentElement.style.fontFamily = Brand.theme.typography.fontFamily;

// Set document title from brand config
document.title = Brand.strings.appName;

// Initialize theme from localStorage (default to dark)
const savedTheme = localStorage.getItem("theme") || "dark";
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
