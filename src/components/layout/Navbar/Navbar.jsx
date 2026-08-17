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
  const dropdownRef = useRef(null);

  // Detect if we're on a dashboard page to show the RA in search
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

  const handleSelect = (raNumber) => {
    setSearchQuery("");
    setShowDropdown(false);
    navigate(`/dashboard/${raNumber}`);
  };

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-5 h-[52px] border-b"
      style={{
        backgroundColor: Brand.theme.colors.header,
        borderColor: "#e5e7eb",
      }}
    >
      {/* Left: Logo */}
      <Link to="/reservations" className="flex items-center shrink-0 transition-opacity hover:opacity-80 active:scale-95">
        <img
          src={Brand.assets.logo}
          alt={Brand.strings.appName}
          className="w-auto object-contain"
          style={{ height: Brand.assets.logoHeight || "auto", width: Brand.assets.logoWidth || "auto" }}
        />
      </Link>

      {/* Center: Search Box with RA badge */}
      <div className="relative flex-1 max-w-md mx-6" ref={dropdownRef}>
        <div className="relative flex items-center">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: showDropdown ? Brand.theme.colors.primary : undefined }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            placeholder={currentRA || "Search RA number or customer..."}
            className="w-full pl-9 pr-16 py-2 text-[13px] border rounded-lg focus:outline-none transition-all duration-200"
            style={{
              borderColor: showDropdown ? Brand.theme.colors.primary : "#e5e7eb",
              backgroundColor: "#fff",
              color: Brand.theme.colors.text.primary,
              boxShadow: showDropdown ? `0 0 0 3px ${Brand.theme.colors.primary}10` : "none",
            }}
          />
          {/* RA Badge */}
          {currentRA && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold rounded uppercase transition-transform hover:scale-110"
              style={{ backgroundColor: Brand.theme.colors.primary, color: "#fff" }}
            >
              RA
            </span>
          )}
        </div>

        {showDropdown && (
          <div
            className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border shadow-lg overflow-hidden animate-fade-in"
            style={{
              backgroundColor: "#fff",
              borderColor: "#e5e7eb",
            }}
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
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform group-hover:scale-110"
                      style={{ backgroundColor: Brand.theme.colors.primary + "12", color: Brand.theme.colors.primary }}
                    >
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <span className="text-[13px] font-medium block transition-colors group-hover:text-black" style={{ color: Brand.theme.colors.text.primary }}>
                        {r.name}
                      </span>
                      <span className="text-[11px]" style={{ color: Brand.theme.colors.primary }}>
                        {r.ra}
                      </span>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold transition-shadow group-hover:shadow-sm"
                    style={{
                      backgroundColor: r.status === "open" ? "#ecfdf5" : "#f3f4f6",
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

      {/* Right: Display / Modify tabs + icons */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Display / Modify toggle */}
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden mr-3">
          <button
            onClick={() => setActiveMode("display")}
            className="px-3.5 py-1.5 text-[12px] font-medium transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: activeMode === "display" ? Brand.theme.colors.text.primary : "transparent",
              color: activeMode === "display" ? "#fff" : Brand.theme.colors.text.secondary,
            }}
          >
            Display
          </button>
          <button
            onClick={() => setActiveMode("modify")}
            className="px-3.5 py-1.5 text-[12px] font-medium transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: activeMode === "modify" ? Brand.theme.colors.text.primary : "transparent",
              color: activeMode === "modify" ? "#fff" : Brand.theme.colors.text.secondary,
            }}
          >
            Modify
          </button>
        </div>

        {/* KK button */}
        <button className="btn-outline-hover w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600">
          KK
        </button>

        {/* Settings icon */}
        <button className="icon-spin w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all active:scale-90">
          <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Sign Out */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="btn-press ml-2 px-3.5 py-1.5 text-[12px] font-medium rounded-lg"
          style={{
            backgroundColor: Brand.theme.colors.primary,
            color: "#fff",
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
