import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../../brands";
import rentalService from "../../services/rentalService";

const Reservations = () => {
  const navigate = useNavigate();
  const allRentals = rentalService.getAll();
  const [filter, setFilter] = useState("all");

  const filteredRentals =
    filter === "all"
      ? allRentals
      : allRentals.filter((r) => r.status === filter);

  const totalCount = allRentals.length;
  const activeCount = allRentals.filter((r) => r.status === "open").length;
  const closedCount = allRentals.filter((r) => r.status === "closed").length;

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
              View and manage all rental agreements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 mr-2">
              {filteredRentals.length} results
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 animate-fade-in">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <button
            onClick={() => setFilter("all")}
            className="card-hover bg-white rounded-xl p-4 border text-left"
            style={{
              borderColor:
                filter === "all"
                  ? Brand.theme.colors.primary + "40"
                  : "#f3f4f6",
              boxShadow:
                filter === "all"
                  ? `0 0 0 1px ${Brand.theme.colors.primary}20`
                  : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Total
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: Brand.theme.colors.text.primary }}
                >
                  {totalCount}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: Brand.theme.colors.primary + "08" }}
              >
                <svg
                  className="w-4.5 h-4.5"
                  style={{ color: Brand.theme.colors.primary }}
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
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilter("open")}
            className="card-hover bg-white rounded-xl p-4 border text-left"
            style={{
              borderColor: filter === "open" ? "#10b98140" : "#f3f4f6",
              boxShadow:
                filter === "open"
                  ? "0 0 0 1px #10b98120"
                  : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Active
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: "#059669" }}
                >
                  {activeCount}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <svg
                  className="w-4.5 h-4.5"
                  style={{ color: "#059669" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          <button
            onClick={() => setFilter("closed")}
            className="card-hover bg-white rounded-xl p-4 border text-left"
            style={{
              borderColor: filter === "closed" ? "#6b728040" : "#f3f4f6",
              boxShadow:
                filter === "closed"
                  ? "0 0 0 1px #6b728020"
                  : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Closed
                </p>
                <p
                  className="text-xl font-bold mt-1"
                  style={{ color: "#6b7280" }}
                >
                  {closedCount}
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#f3f4f6" }}
              >
                <svg
                  className="w-4.5 h-4.5"
                  style={{ color: "#6b7280" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Table Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2
              className="text-[13px] font-semibold"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              {filter === "all"
                ? "All Agreements"
                : filter === "open"
                  ? "Active Agreements"
                  : "Closed Agreements"}
            </h2>
            <div className="flex items-center gap-1">
              {["all", "open", "closed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="btn-outline-hover px-3 py-1.5 text-[11px] font-medium rounded-md capitalize"
                  style={{
                    backgroundColor:
                      filter === f
                        ? Brand.theme.colors.primary + "0a"
                        : "transparent",
                    color:
                      filter === f ? Brand.theme.colors.primary : "#9ca3af",
                  }}
                >
                  {f === "all" ? "All" : f === "open" ? "Active" : "Closed"}
                </button>
              ))}
            </div>
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
                    Checkout
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Return
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRentals.map((r, index) => (
                  <tr
                    key={r.ra}
                    className="row-hover border-b border-gray-50 last:border-b-0 cursor-pointer group"
                    onClick={() => navigate(`/dashboard/${r.ra}`)}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-transform group-hover:scale-110"
                          style={{
                            backgroundColor: Brand.theme.colors.primary + "0a",
                            color: Brand.theme.colors.primary,
                          }}
                        >
                          {r.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span
                          className="text-[13px] font-medium transition-colors group-hover:text-black"
                          style={{ color: Brand.theme.colors.text.primary }}
                        >
                          {r.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="font-mono text-[12px] px-2 py-0.5 rounded bg-gray-50 border border-gray-100 transition-all group-hover:bg-gray-100 group-hover:border-gray-200"
                        style={{ color: Brand.theme.colors.text.secondary }}
                      >
                        {r.ra}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">
                      {r.checkout}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500">
                      {r.return}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all group-hover:shadow-sm"
                        style={{
                          backgroundColor:
                            r.status === "open" ? "#ecfdf5" : "#f9fafb",
                          color: r.status === "open" ? "#059669" : "#6b7280",
                        }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${r.status === "open" ? "pulse-dot" : ""}`}
                          style={{
                            backgroundColor:
                              r.status === "open" ? "#10b981" : "#9ca3af",
                          }}
                        />
                        {r.status === "open" ? "Active" : "Closed"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <svg
                        className="w-4 h-4 text-gray-300 transition-all group-hover:text-gray-600 group-hover:translate-x-0.5"
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
                ))}
              </tbody>
            </table>
          </div>

          {filteredRentals.length === 0 && (
            <div className="px-5 py-12 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-gray-300"
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
              </div>
              <p className="text-[13px] text-gray-500">No agreements found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reservations;
