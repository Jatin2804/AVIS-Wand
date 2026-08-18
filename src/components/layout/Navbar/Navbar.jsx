import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Brand from "../../../brands";
import rentalService from "../../../services/rentalService";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const [activeMode, setActiveMode] = useState("display");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);

  const dashboardMatch = location.pathname.match(/\/dashboard\/(.+)/);
  const currentRA = dashboardMatch ? dashboardMatch[1] : null;

  useEffect(() => {
    if (searchQuery.trim()) {
      setResults(rentalService.search(searchQuery));
      setShowDropdown(true);
    } else {
      setResults([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleSelect = (raNumber) => {
    setSearchQuery("");
    setShowDropdown(false);
    navigate(`/dashboard/${raNumber}`);
  };

  return (
    <>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-5 h-[56px] border-b bg-white"
        style={{ borderColor: "#e5e7eb" }}
      >
        {/* Left: Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden w-8 h-8 flex items-center justify-center text-gray-600 rounded-md hover:bg-gray-100"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link
            to="/reservations"
            className="flex items-center shrink-0 transition-opacity hover:opacity-80"
          >
            <img
              src={Brand.assets.logo}
              alt={Brand.strings.appName}
              className="w-auto object-contain"
              style={{
                height: Brand.assets.logoHeight || "auto",
                width: Brand.assets.logoWidth || "auto",
              }}
            />
          </Link>
        </div>

        {/* Center: Search Box — hidden on mobile */}
        <div
          className="relative flex-1 max-w-md mx-4 hidden sm:block"
          ref={dropdownRef}
        >
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{
                color: showDropdown ? Brand.theme.colors.primary : undefined,
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              placeholder={currentRA || "Search RA number or customer..."}
              className="w-full pl-9 pr-16 py-2 text-[13px] border rounded-lg focus:outline-none"
              style={{
                borderColor: showDropdown
                  ? Brand.theme.colors.primary
                  : "#e5e7eb",
                backgroundColor: "#fff",
                color: Brand.theme.colors.text.primary,
                boxShadow: showDropdown
                  ? `0 0 0 3px ${Brand.theme.colors.primary}10`
                  : "none",
              }}
            />
            {currentRA && (
              <span
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded uppercase"
                style={{
                  backgroundColor: Brand.theme.colors.primary,
                  color: "#fff",
                }}
              >
                RA
              </span>
            )}
          </div>

          {showDropdown && (
            <div
              className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border shadow-lg overflow-hidden animate-fade-in bg-white"
              style={{ borderColor: "#e5e7eb" }}
            >
              {results.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-gray-500">
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                results.map((r) => (
                  <div
                    key={r.ra}
                    className="row-hover px-4 py-2.5 cursor-pointer border-b last:border-b-0 flex items-center justify-between group"
                    style={{ borderColor: "#f3f4f6" }}
                    onClick={() => handleSelect(r.ra)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                        style={{
                          backgroundColor: Brand.theme.colors.primary + "12",
                          color: Brand.theme.colors.primary,
                        }}
                      >
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <span
                          className="text-[13px] font-medium block"
                          style={{ color: Brand.theme.colors.text.primary }}
                        >
                          {r.name}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: Brand.theme.colors.primary }}
                        >
                          {r.ra}
                        </span>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor:
                          r.status === "open" ? "#ecfdf5" : "#f3f4f6",
                        color: r.status === "open" ? "#059669" : "#6b7280",
                      }}
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right: Desktop buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Display / Modify toggle */}
          <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveMode("display")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium"
              style={{
                backgroundColor:
                  activeMode === "display"
                    ? Brand.theme.colors.text.primary
                    : "transparent",
                color:
                  activeMode === "display"
                    ? "#fff"
                    : Brand.theme.colors.text.secondary,
              }}
            >
              Display
            </button>
            <button
              onClick={() => setActiveMode("modify")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[12px] sm:text-[13px] font-medium"
              style={{
                backgroundColor:
                  activeMode === "modify"
                    ? Brand.theme.colors.text.primary
                    : "transparent",
                color:
                  activeMode === "modify"
                    ? "#fff"
                    : Brand.theme.colors.text.secondary,
              }}
            >
              Modify
            </button>
          </div>

          {/* Actions button */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Actions
            <span className="text-[11px] font-bold bg-gray-100 px-1.5 py-0.5 rounded">
              KK
            </span>
          </button>

          {/* Help icon */}
          <button className="hidden sm:flex w-9 h-9 rounded-lg border border-gray-300 items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.228 9c.549-1.065 2.01-1.83 3.772-1.83 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
              />
              <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
            </svg>
          </button>

          {/* Theme toggle */}
          <button className="hidden sm:flex w-9 h-9 rounded-lg border border-gray-300 items-center justify-center text-gray-500 hover:bg-gray-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
              />
            </svg>
          </button>

          {/* Sign Out — hidden on mobile (available in sidebar) */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="btn-press hidden sm:block ml-1 px-4 py-2 text-[13px] font-medium rounded-lg"
            style={{
              backgroundColor: Brand.theme.colors.primary,
              color: "#fff",
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* ═══ MOBILE SIDEBAR ═══ */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar panel */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-xl flex flex-col animate-fade-in">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-4 h-[56px] border-b border-gray-200">
              <img
                src={Brand.assets.logo}
                alt={Brand.strings.appName}
                className="w-auto object-contain"
                style={{
                  height: Brand.assets.logoHeight || "auto",
                  width: Brand.assets.logoWidth || "auto",
                }}
              />
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 rounded-md hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search RA or customer..."
                className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none"
                style={{ color: Brand.theme.colors.text.primary }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Mode
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMode("display")}
                    className="flex-1 py-2 text-[13px] font-medium rounded-lg text-center"
                    style={{
                      backgroundColor:
                        activeMode === "display"
                          ? Brand.theme.colors.text.primary
                          : "#f3f4f6",
                      color:
                        activeMode === "display"
                          ? "#fff"
                          : Brand.theme.colors.text.secondary,
                    }}
                  >
                    Display
                  </button>
                  <button
                    onClick={() => setActiveMode("modify")}
                    className="flex-1 py-2 text-[13px] font-medium rounded-lg text-center"
                    style={{
                      backgroundColor:
                        activeMode === "modify"
                          ? Brand.theme.colors.text.primary
                          : "#f3f4f6",
                      color:
                        activeMode === "modify"
                          ? "#fff"
                          : Brand.theme.colors.text.secondary,
                    }}
                  >
                    Modify
                  </button>
                </div>
              </div>

              <div className="px-4 py-2 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Navigation
                </p>
                <button
                  onClick={() => {
                    navigate("/reservations");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Reservations
                </button>
              </div>

              <div className="px-4 py-2 mt-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Actions
                </p>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.228 9c.549-1.065 2.01-1.83 3.772-1.83 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01"
                    />
                    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                  </svg>
                  Help
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium text-gray-700 rounded-lg hover:bg-gray-50">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                    />
                  </svg>
                  Theme
                </button>
              </div>
            </div>

            {/* Sign Out at bottom */}
            <div className="px-4 py-4 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                  setSidebarOpen(false);
                }}
                className="w-full py-2.5 text-[13px] font-semibold rounded-lg text-center"
                style={{
                  backgroundColor: Brand.theme.colors.primary,
                  color: "#fff",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
