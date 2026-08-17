import avisTheme from "./theme";
import avisFeatures from "./features";
import avisApi from "./api";
import avisStrings from "./strings";

import logo from "./assets/logo.png";
import logoLight from "./assets/logo-light.svg";
import favicon from "./assets/favicon.svg";
import placeholder from "./assets/placeholder.svg";
import loginBackground from "./assets/login.png";

/** @type {import('../types').BrandConfig} */
const avisConfig = {
  id: "avis",
  name: "Avis",
  theme: avisTheme,
  features: avisFeatures,
  api: avisApi,
  strings: avisStrings,
  assets: {
    logo,
    logoLight,
    favicon,
    loginBackground,
    placeholder,
    logoHeight: "2.5rem",
  },
};

export default avisConfig;
