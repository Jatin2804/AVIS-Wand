/**
 * @typedef {Object} BrandTheme
 * @property {Object} colors
 * @property {string} colors.primary - Main brand color
 * @property {string} colors.primaryHover - Primary hover state
 * @property {string} colors.secondary - Secondary brand color
 * @property {string} colors.secondaryHover - Secondary hover state
 * @property {string} colors.accent - Accent/highlight color
 * @property {string} colors.success - Success state color
 * @property {string} colors.warning - Warning state color
 * @property {string} colors.danger - Danger/error state color
 * @property {string} colors.background - Page background
 * @property {string} colors.surface - Card/container surface
 * @property {Object} colors.text
 * @property {string} colors.text.primary - Primary text color
 * @property {string} colors.text.secondary - Secondary text color
 * @property {string} colors.text.muted - Muted/placeholder text
 * @property {string} colors.text.inverse - Text on dark backgrounds
 * @property {Object} typography
 * @property {string} typography.fontFamily - Primary font stack
 * @property {string} typography.headingFontFamily - Heading font stack
 * @property {Object} typography.fontSize
 * @property {string} typography.fontSize.xs
 * @property {string} typography.fontSize.sm
 * @property {string} typography.fontSize.base
 * @property {string} typography.fontSize.lg
 * @property {string} typography.fontSize.xl
 * @property {string} typography.fontSize.xxl
 * @property {string} typography.fontSize.xxxl
 * @property {Object} spacing
 * @property {string} spacing.xs
 * @property {string} spacing.sm
 * @property {string} spacing.md
 * @property {string} spacing.lg
 * @property {string} spacing.xl
 * @property {string} spacing.xxl
 * @property {Object} borderRadius
 * @property {string} borderRadius.sm
 * @property {string} borderRadius.md
 * @property {string} borderRadius.lg
 * @property {string} borderRadius.full
 */

/**
 * @typedef {Object} FeatureFlags
 * @property {boolean} rewards - Rewards/loyalty points program
 * @property {boolean} promotions - Promotional offers section
 * @property {boolean} payments - Online payment processing
 * @property {boolean} chat - Live chat support
 * @property {boolean} coupons - Coupon/discount code support
 * @property {boolean} loyalty - Loyalty tier program
 * @property {boolean} darkMode - Dark mode toggle
 * @property {boolean} notifications - Push/in-app notifications
 * @property {boolean} multiLanguage - Multi-language support
 * @property {boolean} analytics - Analytics tracking
 */

/**
 * @typedef {Object} ApiConfig
 * @property {string} baseUrl - API base URL
 * @property {number} timeout - Request timeout in ms
 * @property {Object} endpoints
 * @property {string} endpoints.auth - Auth endpoint path
 * @property {string} endpoints.users - Users endpoint path
 * @property {string} endpoints.bookings - Bookings endpoint path
 * @property {string} endpoints.vehicles - Vehicles endpoint path
 * @property {string} endpoints.payments - Payments endpoint path
 */

/**
 * @typedef {Object} BrandStrings
 * @property {string} appName - Display name of the application
 * @property {string} tagline - Brand tagline
 * @property {string} welcomeMessage - Welcome/greeting message
 * @property {string} loginTitle - Login page title
 * @property {string} loginSubtitle - Login page subtitle
 * @property {string} dashboardTitle - Dashboard page title
 * @property {string} footerText - Footer copyright/info text
 * @property {string} supportEmail - Customer support email
 * @property {string} supportPhone - Customer support phone
 * @property {Object} errors
 * @property {string} errors.generic - Generic error message
 * @property {string} errors.network - Network error message
 * @property {string} errors.unauthorized - Unauthorized error message
 */

/**
 * @typedef {Object} BrandAssets
 * @property {string} logo - Path to primary logo
 * @property {string} logoLight - Path to light/white version of logo
 * @property {string} favicon - Path to favicon
 * @property {string} loginBackground - Path to login page background
 * @property {string} placeholder - Path to placeholder/empty state image
 */

/**
 * @typedef {Object} BrandConfig
 * @property {string} id - Unique brand identifier (e.g., "avis", "budget")
 * @property {string} name - Display name of the brand
 * @property {BrandTheme} theme - Brand theme configuration
 * @property {FeatureFlags} features - Feature flag toggles
 * @property {ApiConfig} api - API configuration
 * @property {BrandStrings} strings - UI strings and copy
 * @property {BrandAssets} assets - Brand asset paths
 */

export {};
