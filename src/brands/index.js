/**
 * Brand Loader
 *
 * Resolves the active brand configuration at build time using the VITE_BRAND
 * environment variable. The rest of the application imports from this single
 * entry point without knowing which brand is active.
 *
 * Usage:
 *   import Brand from "@/brands";
 *   Brand.theme.colors.primary
 *   Brand.strings.appName
 *   Brand.features.loyalty
 *
 * ──────────────────────────────────────────────────────────────────────────
 * DEPLOYMENT / CI-CD GUIDE
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Each brand is built as a separate artifact from the same codebase.
 * The only difference is the VITE_BRAND env variable passed at build time.
 *
 * Example CI pipeline (GitHub Actions):
 *
 *   jobs:
 *     build-avis:
 *       steps:
 *         - run: npm ci
 *         - run: npm run build:avis
 *         - uses: actions/upload-artifact@v4
 *           with: { name: avis-dist, path: dist/ }
 *
 *     build-budget:
 *       steps:
 *         - run: npm ci
 *         - run: npm run build:budget
 *         - uses: actions/upload-artifact@v4
 *           with: { name: budget-dist, path: dist/ }
 *
 * Each artifact gets deployed to its respective domain/CDN:
 *   - avis-dist   → avis.com
 *   - budget-dist → budget.com
 *
 * For Docker:
 *   docker build --build-arg VITE_BRAND=avis -t app-avis .
 *   docker build --build-arg VITE_BRAND=budget -t app-budget .
 *
 * ──────────────────────────────────────────────────────────────────────────
 */

import avisConfig from "./avis/config";
import budgetConfig from "./budget/config";

/**
 * Brand registry — add new brands here.
 * Adding a new brand requires:
 *   1. Create brands/<newBrand>/ folder with config, theme, strings, features, api, assets
 *   2. Import the config here
 *   3. Add it to this registry
 *   4. Create .env.<newBrand> file
 *   5. Add scripts to package.json
 *
 * No existing business logic needs to change.
 */
const brandRegistry = {
  avis: avisConfig,
  budget: budgetConfig,
};

/**
 * Resolve the active brand from the VITE_BRAND environment variable.
 * Falls back to "avis" if not set or invalid.
 */
function getBrandConfig() {
  const brandId = import.meta.env.VITE_BRAND || "avis";
  const config = brandRegistry[brandId];

  if (!config) {
    console.warn(
      `[Brand] Unknown brand "${brandId}". Available brands: ${Object.keys(brandRegistry).join(", ")}. Falling back to "avis".`
    );
    return brandRegistry.avis;
  }

  return config;
}

/** @type {import('./types').BrandConfig} */
const Brand = getBrandConfig();

export default Brand;

// Named exports for convenience
export const { theme, features, api, strings, assets } = Brand;
export { getBrandConfig, brandRegistry };
