import budgetTheme from "./theme";
import budgetFeatures from "./features";
import budgetApi from "./api";
import budgetStrings from "./strings";

import logo from "./assets/logo.png";
import logoLight from "./assets/logo-light.svg";
import favicon from "./assets/favicon.svg";
import placeholder from "./assets/placeholder.svg";
import loginBackground from "./assets/login.png";

/** @type {import('../types').BrandConfig} */
const budgetConfig = {
  id: "budget",
  name: "Budget",
  theme: budgetTheme,
  features: budgetFeatures,
  api: budgetApi,
  strings: budgetStrings,
  assets: {
    logo,
    logoLight,
    favicon,
    loginBackground,
    placeholder,
    logoHeight: "",
    logoWidth: "9rem",
  },
};

export default budgetConfig;
