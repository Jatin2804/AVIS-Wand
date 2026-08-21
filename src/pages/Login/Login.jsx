import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../../brands";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.username === "lhr.user" && form.password === "Aug@2026") {
      localStorage.setItem("token", "authenticated");
      navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Brand Showcase */}
      <div
        className="hidden lg:flex lg:w-[55%] items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: Brand.theme.colors.hero }}
      >
        <img
          src={Brand.assets.loginBackground}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.3 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${Brand.theme.colors.hero}ee 0%, ${Brand.theme.colors.primary}88 100%)`,
          }}
        />
        <div className="relative z-10 text-center px-16 max-w-lg">
          <img
            src={Brand.assets.logo}
            alt={Brand.strings.appName}
            className="mx-auto mb-10 w-auto"
            style={{ height: "4rem", filter: "brightness(0) invert(1)" }}
          />
          <h2
            className="text-4xl font-bold mb-4 leading-tight"
            style={{ color: "#ffffff" }}
          >
            {Brand.strings.tagline}
          </h2>
          <p className="text-lg opacity-80" style={{ color: "#ffffff" }}>
            {Brand.strings.welcomeMessage}
          </p>
          <div className="mt-10 flex justify-center gap-2">
            <div className="w-8 h-1 rounded-full bg-white opacity-90" />
            <div className="w-8 h-1 rounded-full bg-white opacity-40" />
            <div className="w-8 h-1 rounded-full bg-white opacity-40" />
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div
        className="flex w-full lg:w-[45%] items-center justify-center px-8"
        style={{ backgroundColor: Brand.theme.colors.background }}
      >
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-10 lg:mb-12">
            <img
              src={Brand.assets.logo}
              alt={Brand.strings.appName}
              className="w-auto"
              style={{
                height: Brand.assets.logoHeight || "3rem",
                width: Brand.assets.logoWidth || "auto",
              }}
            />
          </div>

          <div className="text-center mb-8">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              {Brand.strings.loginTitle}
            </h1>
            <p
              className="text-sm"
              style={{ color: Brand.theme.colors.text.muted }}
            >
              {Brand.strings.loginSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1.5"
                style={{ color: Brand.theme.colors.text.secondary }}
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all"
                style={{
                  borderColor: error ? Brand.theme.colors.danger : "#e5e7eb",
                  backgroundColor: "var(--bg-input)",
                  color: Brand.theme.colors.text.primary,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = Brand.theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${Brand.theme.colors.primary}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error
                    ? Brand.theme.colors.danger
                    : "#e5e7eb";
                  e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: Brand.theme.colors.text.secondary }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all"
                style={{
                  borderColor: error ? Brand.theme.colors.danger : "#e5e7eb",
                  backgroundColor: "var(--bg-input)",
                  color: Brand.theme.colors.text.primary,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = Brand.theme.colors.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${Brand.theme.colors.primary}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error
                    ? Brand.theme.colors.danger
                    : "#e5e7eb";
                  e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
                }}
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
                style={{
                  backgroundColor: Brand.theme.colors.danger + "10",
                  color: Brand.theme.colors.danger,
                }}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold rounded-xl transition-all hover:opacity-90"
              style={{
                backgroundColor: Brand.theme.colors.primary,
                color: Brand.theme.colors.text.inverse,
                boxShadow: `0 4px 12px ${Brand.theme.colors.primary}30`,
              }}
            >
              Sign In
            </button>
          </form>

          <p
            className="mt-10 text-center text-xs"
            style={{ color: Brand.theme.colors.text.muted }}
          >
            {Brand.strings.footerText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
