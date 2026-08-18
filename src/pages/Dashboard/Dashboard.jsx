import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Brand from "../../brands";
import rentalService from "../../services/rentalService";

/* ─── Helpers ─── */
function getCurrentStep(timeline) {
  return timeline.find((s) => s.current) || null;
}

/* ═══════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

const StatusBadge = ({ status }) => {
  const isOpen = status === "open";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: isOpen ? "#ecfdf5" : "#f3f4f6",
        color: isOpen ? "#059669" : "#6b7280",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: isOpen ? "#10b981" : "#9ca3af" }}
      />
      {isOpen ? "Open" : "Closed"}
    </span>
  );
};

const TagBadge = ({ label, color = "#10b981" }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-default transition-all hover:scale-105 hover:shadow-sm"
    style={{
      backgroundColor: color + "0a",
      color,
      border: `1px solid ${color}20`,
    }}
  >
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    {label}
  </span>
);

const SectionCard = ({ title, icon, editLabel = "Edit", children }) => (
  <div className="card-hover w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
    <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-gray-400">{icon}</span>
        <h3
          className="text-[13px] font-semibold uppercase tracking-wide"
          style={{ color: Brand.theme.colors.text.primary }}
        >
          {title}
        </h3>
      </div>
      <button
        className="btn-outline-hover text-[12px] font-medium flex items-center gap-1 px-2.5 py-1 rounded-md"
        style={{ color: Brand.theme.colors.primary }}
      >
        {editLabel}
        <svg
          className="w-3 h-3 transition-transform group-hover:translate-x-0.5"
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
      </button>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Field = ({ label, value, bold = false }) => (
  <div className="mb-4 last:mb-0">
    <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">
      {label}
    </div>
    <div
      className={`text-[13px] leading-tight ${bold ? "font-semibold" : "font-medium"}`}
      style={{ color: Brand.theme.colors.text.primary }}
    >
      {value || "—"}
    </div>
  </div>
);

const RatePill = ({ label, value }) => (
  <div className="flex flex-col items-center px-5 py-2.5 rounded-lg bg-gray-50/80 border border-gray-100 transition-all hover:bg-gray-100/80 hover:border-gray-200 hover:scale-105 cursor-default">
    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
      {label}
    </span>
    <span
      className="text-sm font-bold mt-0.5"
      style={{ color: Brand.theme.colors.text.primary }}
    >
      {value}
    </span>
  </div>
);

const NoteRow = ({ who, text }) => (
  <div className="flex gap-4 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap shrink-0 pt-0.5">
      {who}
    </span>
    <span
      className="text-[13px] leading-relaxed"
      style={{ color: Brand.theme.colors.text.primary }}
    >
      {text}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════ */

const Dashboard = () => {
  const { raNumber } = useParams();
  const navigate = useNavigate();
  const rental = rentalService.getByRaNumber(raNumber);
  const [activeTab, setActiveTab] = useState("overview");

  if (!rental) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-8"
        style={{ backgroundColor: "#fafafa" }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: Brand.theme.colors.danger + "08" }}
          >
            <svg
              className="w-7 h-7"
              style={{ color: Brand.theme.colors.danger }}
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
          <h2
            className="text-lg font-semibold"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Rental Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            No rental agreement found for{" "}
            <span className="font-mono font-medium text-gray-700">
              {raNumber}
            </span>
          </p>
          <button
            onClick={() => navigate("/reservations")}
            className="mt-6 px-5 py-2.5 text-sm font-medium rounded-lg transition-all hover:shadow-md"
            style={{
              backgroundColor: Brand.theme.colors.primary,
              color: "#fff",
            }}
          >
            Back to Reservations
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep(rental.timeline);
  const rentalPeriodStart = rental.rental.checkout
    .split(" ")
    .slice(0, 3)
    .join(" ");
  const rentalPeriodEnd = rental.rental.return.split(" ").slice(0, 3).join(" ");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "customer", label: "Customer" },
    { id: "vehicle", label: "Vehicle" },
    { id: "rental", label: "Rental & Rates" },
    { id: "payment", label: "Payment" },
  ];

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex flex-col"
      style={{ backgroundColor: "#f9fafb" }}
    >
      {/* ═══ HEADER ═══ */}
      <div className="bg-white border-b border-gray-200">
        {/* Top row: Name/RA/Status on left, Current Rental + Amount on right */}
        <div className="px-4 sm:px-6 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.customer.fullName}
              </h1>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-[13px] font-mono text-gray-500">
                  {rental.raNumber}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${rental.status === "open" ? "pulse-dot" : ""}`}
                    style={{
                      backgroundColor:
                        rental.status === "open" ? "#4caf50" : "#9ca3af",
                    }}
                  />
                  <span
                    style={{
                      color: rental.status === "open" ? "#4caf50" : "#9ca3af",
                    }}
                  >
                    {rental.status === "open" ? "OPEN" : "CLOSED"}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex items-start gap-6 sm:gap-8">
              {/* Current Rental */}
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  Current Rental
                </div>
                {currentStep && (
                  <>
                    <div
                      className="text-sm font-bold mt-0.5"
                      style={{ color: Brand.theme.colors.primary }}
                    >
                      {currentStep.key === "onRental"
                        ? "On Rental"
                        : currentStep.key}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {currentStep.sub}
                    </div>
                  </>
                )}
              </div>
              {/* Amount Due */}
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  Amount Due
                </div>
                <div
                  className="text-2xl font-bold mt-0.5"
                  style={{ color: Brand.theme.colors.text.primary }}
                >
                  ${rental.totals.amountDue.toFixed(2)}
                </div>
                <div className="text-[11px] text-gray-400">
                  Total{" "}
                  <span className="font-medium">
                    ${rental.totals.estTotal.toFixed(2)}
                  </span>{" "}
                  · Prepaid{" "}
                  <span className="font-medium">
                    ${rental.totals.prepayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tags row + Reference IDs */}
        <div className="px-4 sm:px-6 py-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {rental.customer.preferred && (
              <TagBadge label="Preferred" color="#10b981" />
            )}
            {rental.customer.connectedCar && (
              <TagBadge label="Connected Car" color="#3b82f6" />
            )}
            {rental.customer.company && (
              <TagBadge
                label={rental.customer.company}
                color={Brand.theme.colors.primary}
              />
            )}
          </div>
          <div className="flex items-center gap-5">
            <span className="text-[11px] text-gray-400 font-mono">
              WIZARD {rental.references.wizard}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              RES {rental.references.reservation}
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              MVA {rental.references.mva}
            </span>
          </div>
        </div>

        {/* Quick Summary Strip with vertical dividers */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-gray-200">
            {/* Customer */}
            <div className="md:pr-6">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">
                Customer
              </div>
              <div
                className="text-[13px] font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.customer.fullName}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {rental.customer.phone}
              </div>
            </div>
            {/* Vehicle */}
            <div className="md:px-6">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">
                Vehicle
              </div>
              <div
                className="text-[13px] font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.vehicle.make}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {rental.vehicle.year} · {rental.vehicle.colour} ·{" "}
                {rental.vehicle.group}
              </div>
            </div>
            {/* Rental Period */}
            <div className="md:px-6">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">
                Rental Period
              </div>
              <div
                className="text-[13px] font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rentalPeriodStart} → {rentalPeriodEnd}
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {rental.rental.outStation.split("—")[0].trim()} →{" "}
                {rental.rental.inStation.split("—")[0].trim()}
              </div>
            </div>
            {/* Payment */}
            <div className="md:pl-6">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">
                Payment
              </div>
              <div
                className="text-[13px] font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                ${rental.totals.amountDue.toFixed(2)} due
              </div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {rental.payment.card}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-4 sm:px-6 py-5 border-t border-gray-100 hidden sm:block">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium text-center mb-4">
            Rental Progress
          </div>
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {rental.timeline.map((step, i) => (
              <div
                key={step.key}
                className="flex items-center flex-1 last:flex-initial"
              >
                <div className="flex flex-col items-center">
                  {/* Car icon for current step, dots for others */}
                  {step.current ? (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center z-10 timeline-current"
                      style={{ backgroundColor: Brand.theme.colors.primary }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: step.done ? "#4caf50" : "#fff",
                        borderColor: step.done ? "#4caf50" : "#d1d5db",
                      }}
                    />
                  )}
                  <span
                    className="text-[11px] mt-2 capitalize whitespace-nowrap font-medium"
                    style={{
                      color: step.current
                        ? Brand.theme.colors.primary
                        : step.done
                          ? "#374151"
                          : "#9ca3af",
                    }}
                  >
                    {step.key === "checkedOut"
                      ? "Checked Out"
                      : step.key === "onRental"
                        ? "On Rental"
                        : step.key}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{
                      color: step.current
                        ? Brand.theme.colors.primary
                        : "#9ca3af",
                    }}
                  >
                    {step.sub}
                  </span>
                </div>
                {i < rental.timeline.length - 1 && (
                  <div
                    className="flex-1 h-[2px] mx-2 -mt-5"
                    style={{
                      backgroundColor: step.done ? "#4caf50" : "#e5e7eb",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              className="btn-press flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg"
              style={{
                backgroundColor: Brand.theme.colors.primary,
                color: "#fff",
              }}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14"
                />
              </svg>
              Check-in
            </button>
            <button className="btn-outline-hover flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Exchange
            </button>
            <button className="btn-outline-hover flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Estimate
            </button>
            <button className="btn-outline-hover flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors">
              ··· Lifecycle
            </button>
            <button
              className="btn-outline-hover px-3.5 py-2 text-[12px] font-semibold rounded-lg border"
              style={{
                borderColor: Brand.theme.colors.primary + "40",
                color: Brand.theme.colors.primary,
              }}
            >
              Void
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 border-t border-gray-100 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item relative px-4 py-3 text-[13px] font-medium ${activeTab === tab.id ? "active" : ""}`}
                style={{
                  color:
                    activeTab === tab.id
                      ? Brand.theme.colors.primary
                      : "#6b7280",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ TAB CONTENT ═══ */}
      <div
        className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-10 py-5 pb-20 animate-fade-in min-w-0"
        key={activeTab}
      >
        {activeTab === "overview" && <OverviewTab rental={rental} />}
        {activeTab === "customer" && <CustomerTab rental={rental} />}
        {activeTab === "vehicle" && <VehicleTab rental={rental} />}
        {activeTab === "rental" && <RentalRatesTab rental={rental} />}
        {activeTab === "payment" && <PaymentTab rental={rental} />}
      </div>

      {/* ═══ STICKY FOOTER ═══ */}
      <div
        className="fixed bottom-0 left-0 right-0 h-12 flex items-center justify-between px-4 sm:px-6 border-t z-40"
        style={{ backgroundColor: "#fff", borderColor: "#e5e7eb" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-mono text-gray-500">
            {rental.raNumber}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span
            className="text-[13px] font-medium"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Due{" "}
            <span className="font-bold">
              ${rental.totals.amountDue.toFixed(2)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button className="btn-outline-hover flex items-center gap-1.5 text-[12px] font-medium text-gray-400 px-2.5 py-1.5 rounded-md">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Note
          </button>
          <button className="btn-outline-hover flex items-center gap-1.5 text-[12px] font-medium text-gray-400 px-2.5 py-1.5 rounded-md">
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
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            Split
          </button>
          <button
            className="btn-press flex items-center gap-1.5 px-5 py-2.5 text-[12px] font-semibold rounded-lg"
            style={{
              backgroundColor: Brand.theme.colors.primary,
              color: "#fff",
            }}
          >
            Continue Check-in
            <svg
              className="w-3.5 h-3.5"
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
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   TAB: Overview
   ═══════════════════════════════════════════════════════ */
const OverviewTab = ({ rental }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* CUSTOMER */}
      <SectionCard
        title="Customer"
        icon={
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Field label="Name" value={rental.customer.fullName} bold />
          <Field label="Company" value={rental.customer.company} />
          <Field label="Phone" value={rental.customer.phone} />
          <Field label="Email" value={rental.customer.email} />
          <Field label="Licence" value={rental.customer.licenceNumber} />
          <Field
            label="Address"
            value={`${rental.customer.address1}, ${rental.customer.cityPost}`}
          />
        </div>
      </SectionCard>

      {/* VEHICLE */}
      <SectionCard
        title="Vehicle"
        icon={
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
              d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h6l-2-5h-4"
            />
          </svg>
        }
      >
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-50">
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h6l-2-5h-4"
              />
            </svg>
          </div>
          <div>
            <div
              className="text-[13px] font-semibold"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              {rental.vehicle.make}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {rental.vehicle.year} · {rental.vehicle.colour} ·{" "}
              {rental.vehicle.group}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <Field label="MVA" value={rental.vehicle.mva} />
          <Field
            label="Mileage Out"
            value={rental.vehicle.mileageOut?.toLocaleString()}
          />
          <Field label="Fuel Out" value={rental.vehicle.fuelOut} />
          <Field label="Damaged" value={rental.vehicle.damaged} />
        </div>
      </SectionCard>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* RENTAL & RATES */}
      <SectionCard
        title="Rental & Rates"
        icon={
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Out Station" value={rental.rental.outStation} />
          <Field label="In Station" value={rental.rental.inStation} />
          <Field label="Checkout" value={rental.rental.checkout} />
          <Field label="Return" value={rental.rental.return} />
          <Field label="Rate Code" value={rental.rental.rateCode} />
          <Field label="AWD" value={rental.rental.awd} />
        </div>
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50 flex-wrap">
          <RatePill label="Daily" value={`$${rental.rates.daily.toFixed(2)}`} />
          <RatePill
            label="Weekly"
            value={`$${rental.rates.weekly.toFixed(2)}`}
          />
          <RatePill label="Free Mi" value={rental.rates.freeMiles} />
        </div>
      </SectionCard>

      {/* PAYMENT */}
      <SectionCard
        title="Payment"
        icon={
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Method" value={rental.payment.method} />
          <Field label="Card" value={rental.payment.card} />
          <Field label="Auth Status" value={rental.payment.authStatus} />
        </div>
      </SectionCard>
    </div>

    {/* NOTES & REMARKS */}
    {rental.notes && rental.notes.length > 0 && (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
          <span className="text-gray-400">
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
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </span>
          <h3
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Notes & Remarks
          </h3>
        </div>
        <div className="px-6 py-5">
          {rental.rental.remarks && (
            <div className="mb-4 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                {rental.rental.remarks}
              </span>
            </div>
          )}
          {rental.notes.map((note, i) => (
            <NoteRow key={i} who={note.who} text={note.text} />
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   TAB: Customer
   ═══════════════════════════════════════════════════════ */
const CustomerTab = ({ rental }) => (
  <div className="w-full">
    <SectionCard
      title="Customer Details"
      icon={
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
        <Field label="Full Name" value={rental.customer.fullName} bold />
        <Field label="Company" value={rental.customer.company} />
        <Field label="Phone" value={rental.customer.phone} />
        <Field label="Email" value={rental.customer.email} />
        <Field label="Licence Country" value={rental.customer.licenceCountry} />
        <Field label="Licence State" value={rental.customer.licenceState} />
        <Field label="Licence Number" value={rental.customer.licenceNumber} />
        <Field label="Date of Birth" value={rental.customer.dateOfBirth} />
        <Field label="Address" value={rental.customer.address1} />
        <Field label="City/Post" value={rental.customer.cityPost} />
        <Field label="Loyalty" value={rental.customer.loyalty} />
        <Field label="Frequent Travel" value={rental.customer.freqTravel} />
        <Field label="Partner Number" value={rental.customer.partnerNumber} />
      </div>
    </SectionCard>
  </div>
);

/* ═══════════════════════════════════════════════════════
   TAB: Vehicle
   ═══════════════════════════════════════════════════════ */
const VehicleTab = ({ rental }) => (
  <div className="w-full">
    <SectionCard
      title="Vehicle Details"
      icon={
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
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h6l-2-5h-4"
          />
        </svg>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
        <Field label="Description" value={rental.vehicle.description} bold />
        <Field label="Make" value={rental.vehicle.make} />
        <Field label="Year" value={rental.vehicle.year} />
        <Field label="Colour" value={rental.vehicle.colour} />
        <Field label="Group" value={rental.vehicle.group} />
        <Field label="MVA" value={rental.vehicle.mva} />
        <Field
          label="Mileage Out"
          value={rental.vehicle.mileageOut?.toLocaleString()}
        />
        <Field
          label="Mileage In"
          value={rental.vehicle.mileageIn?.toLocaleString() || "—"}
        />
        <Field label="Fuel Out" value={rental.vehicle.fuelOut} />
        <Field label="Fuel Service" value={rental.vehicle.fuelService} />
        <Field label="Damaged" value={rental.vehicle.damaged} />
        <Field
          label="Accident Reported"
          value={rental.vehicle.accidentReported}
        />
      </div>
    </SectionCard>
  </div>
);

/* ═══════════════════════════════════════════════════════
   TAB: Rental & Rates
   ═══════════════════════════════════════════════════════ */
const RentalRatesTab = ({ rental }) => (
  <div className="space-y-6">
    <SectionCard
      title="Rental Details"
      icon={
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
        <Field label="Out Station" value={rental.rental.outStation} />
        <Field label="In Station" value={rental.rental.inStation} />
        <Field label="Checkout" value={rental.rental.checkout} bold />
        <Field label="Return" value={rental.rental.return} bold />
        <Field label="Rate Code" value={rental.rental.rateCode} />
        <Field label="AWD" value={rental.rental.awd} />
        <Field label="Coupon" value={rental.rental.coupon || "—"} />
        <Field label="Type of Rental" value={rental.rental.typeOfRental} />
        <Field label="Commission" value={rental.rental.commission} />
        <Field label="Tax" value={rental.rental.tax} />
        <Field
          label="Discount"
          value={rental.rental.discount ? `${rental.rental.discount}%` : "—"}
        />
      </div>
    </SectionCard>

    <SectionCard
      title="Rates"
      icon={
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      }
    >
      <div className="flex items-center gap-3 flex-wrap">
        <RatePill label="Daily" value={`$${rental.rates.daily.toFixed(2)}`} />
        <RatePill label="Weekly" value={`$${rental.rates.weekly.toFixed(2)}`} />
        <RatePill label="Free Mi" value={rental.rates.freeMiles} />
      </div>
    </SectionCard>
  </div>
);

/* ═══════════════════════════════════════════════════════
   TAB: Payment
   ═══════════════════════════════════════════════════════ */
const PaymentTab = ({ rental }) => (
  <div className="space-y-6">
    {/* Payment + Totals side-by-side on desktop */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SectionCard
        title="Payment Details"
        icon={
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
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Field label="Method" value={rental.payment.method} />
          <Field label="Card" value={rental.payment.card} bold />
          <Field label="Auth Status" value={rental.payment.authStatus} />
        </div>
      </SectionCard>

      <SectionCard
        title="Totals"
        icon={
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
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Field
            label="Estimated Total"
            value={`$${rental.totals.estTotal.toFixed(2)}`}
          />
          <Field
            label="Prepayment"
            value={`$${rental.totals.prepayment.toFixed(2)}`}
          />
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span
            className="text-[13px] font-semibold"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Amount Due
          </span>
          <span
            className="text-xl font-bold"
            style={{ color: Brand.theme.colors.primary }}
          >
            ${rental.totals.amountDue.toFixed(2)}
          </span>
        </div>
      </SectionCard>
    </div>

    <SectionCard
      title="Additional Charges"
      icon={
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
            d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
          />
        </svg>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8">
        <Field label="CSC" value={`$${rental.charges.csc}`} />
        <Field label="Money Off" value={`$${rental.charges.moneyOff}`} />
        <Field
          label="Coupon Amount"
          value={`$${rental.charges.couponAmount}`}
        />
        <Field label="Parking" value={`$${rental.charges.parking}`} />
        <Field label="Child Seat" value={`$${rental.charges.childSeat}`} />
        <Field label="Towing" value={`$${rental.charges.towing}`} />
        <Field
          label="Accident Repairs"
          value={`$${rental.charges.accidentRepairs}`}
        />
        <Field label="Luggage Rack" value={`$${rental.charges.luggageRack}`} />
        <Field label="Others" value={`$${rental.charges.others}`} />
      </div>
    </SectionCard>
  </div>
);

export default Dashboard;
