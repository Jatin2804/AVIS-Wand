import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../../brands";
import wandService from "../../services/wandService";

const Reservations = () => {
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await wandService.displayRental("724717980");
        setRental(data?.rentalData || null);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] flex items-center justify-center"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Fetching rental data from WAND API...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="bg-white rounded-xl border border-red-100 p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            API Connection Failed
          </h3>
          <p className="text-xs text-gray-500 mb-3">{error}</p>
          <p className="text-xs text-gray-400">
            Make sure the proxy is running:{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded">
              TARGET=uat node proxy-server-internet.cjs
            </code>
          </p>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div
        className="min-h-[calc(100vh-56px)] flex items-center justify-center"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <p className="text-sm text-gray-500">No rental data returned</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)]"
      style={{ backgroundColor: "#f9fafb" }}
    >
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-lg font-bold"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              Reservations
            </h1>
            <p className="text-[12px] mt-0.5 text-gray-500">
              {rental.rentingStationMnemonic} —{" "}
              {rental.rentingStationName?.trim()}
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-50 text-green-600 font-medium border border-green-100">
            Live API
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 animate-fade-in">
        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100">
            <h2
              className="text-[13px] font-semibold"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              Active Rentals
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr
                  className="border-b border-gray-50"
                  style={{ backgroundColor: "#fafbfc" }}
                >
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Customer
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    RA Number
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Vehicle
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Station
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className="row-hover border-b border-gray-50 cursor-pointer group"
                  onClick={() => navigate(`/dashboard/${rental.raNum}`)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor: Brand.theme.colors.primary + "0a",
                          color: Brand.theme.colors.primary,
                        }}
                      >
                        {rental.firstName?.[0]}
                        {rental.lastName?.[0]}
                      </div>
                      <div>
                        <span
                          className="text-[13px] font-medium block"
                          style={{ color: Brand.theme.colors.text.primary }}
                        >
                          {rental.fullName}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {rental.company}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="font-mono text-[12px] px-2 py-0.5 rounded bg-gray-50 border border-gray-100"
                      style={{ color: Brand.theme.colors.text.secondary }}
                    >
                      {rental.raNum}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">
                    {rental.year} {rental.color} {rental.make} {rental.model}
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-gray-500">
                    {rental.checkOutStationMnemonic} →{" "}
                    {rental.checkInStationMnemonic}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: rental.rentalAlive
                          ? "#ecfdf5"
                          : "#f9fafb",
                        color: rental.rentalAlive ? "#059669" : "#6b7280",
                      }}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${rental.rentalAlive ? "pulse-dot" : ""}`}
                        style={{
                          backgroundColor: rental.rentalAlive
                            ? "#10b981"
                            : "#9ca3af",
                        }}
                      />
                      {rental.rentalAlive ? "Active" : "Closed"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservations;
