import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Brand from "../../brands";
import wandService from "../../services/wandService";

/* ─── Helpers ─── */
function getCurrentStep(timeline) {
  return timeline.find((s) => s.current) || null;
}

/* ═══════════════════════════════════════════════════════
   REUSABLE SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

const TagBadge = ({ label, color = "#10b981" }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium cursor-default"
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

const SectionCard = ({ title, icon, children }) => (
  <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{icon}</span>
        <h3
          className="text-[13px] font-semibold uppercase tracking-wide"
          style={{ color: Brand.theme.colors.text.primary }}
        >
          {title}
        </h3>
      </div>
    </div>
    <div className="px-4 sm:px-6 py-4 sm:py-5">{children}</div>
  </div>
);

const Field = ({ label, value, bold = false, editable = false }) => (
  <div className="py-2">
    <div className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0.5">
      {label}
    </div>
    {editable ? (
      <input
        type="text"
        defaultValue={value || ""}
        className={`w-full text-[13px] leading-snug break-words px-2 py-1 border border-gray-200 rounded-md focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 ${bold ? "font-semibold" : "font-medium"}`}
        style={{ color: Brand.theme.colors.text.primary }}
      />
    ) : (
      <div
        className={`text-[13px] leading-snug break-words ${bold ? "font-semibold" : "font-medium"}`}
        style={{ color: Brand.theme.colors.text.primary }}
      >
        {value || "—"}
      </div>
    )}
  </div>
);

const RatePill = ({ label, value }) => (
  <div
    className="flex flex-col items-center px-4 py-2 rounded-lg border border-gray-100"
    style={{ backgroundColor: "var(--bg-surface)" }}
  >
    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
      {label}
    </span>
    <span
      className="text-sm font-bold mt-0.5"
      style={{ color: "var(--text-primary)" }}
    >
      {value}
    </span>
  </div>
);

const NoteRow = ({ who, text }) => (
  <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap shrink-0">
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
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(raNumber ? true : false);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeMode, setActiveMode] = useState("display");
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateData, setEstimateData] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  useEffect(() => {
    if (!raNumber) {
      setLoading(false);
      setRental(null);
      return;
    }

    // Parse currency values that may contain HTML entities like &#163; for £
    const parseCurrency = (val) => {
      if (!val) return 0;
      // Decode HTML entities (&#163; → £), then strip currency symbols and commas
      const decoded = val.replace(/&#\d+;/g, "").replace(/&amp;#\d+;/g, "");
      return parseFloat(decoded.replace(/[^0-9.]/g, "")) || 0;
    };

    setLoading(true);
    const fetchRental = async () => {
      try {
        const data = await wandService.displayRental(raNumber);
        if (data?.rentalData) {
          const r = data.rentalData;
          // Map WAND API response to the format Dashboard expects
          setRental({
            raNumber: r.raNum,
            status: r.rentalAlive ? "open" : "closed",
            references: {
              ra: r.raNum,
              wizard: r.wizardNumber,
              reservation: r.resNum,
              mva: r.mva,
            },
            customer: {
              fullName: r.fullName,
              company: r.company,
              licenceCountry: r.licenseCountry,
              licenceState: r.licenseState,
              licenceNumber: r.licenseNumber,
              dateOfBirth: r.dob,
              address1: r.addr1,
              address2: r.addr2,
              cityPost: r.addr3,
              phone: r.contact || "—",
              email: data.wizconMB?.emailAddress || "—",
              loyalty: r.preferredCustFlag ? "Preferred" : "",
              preferred: r.preferred,
              connectedCar: r.connectedCarsInd,
              freqTravel: "",
              partnerNumber: r.wizardNumber,
            },
            vehicle: {
              mva: r.mva,
              description: `${r.year} ${r.color} ${r.make} ${r.model}`,
              make: `${r.make} ${r.model}`,
              year: parseInt(r.year) || 0,
              colour: r.color,
              group: r.carGroup,
              mileageOut: parseInt(r.mileageOut) || 0,
              mileageIn: r.mileageIn ? parseInt(r.mileageIn) : null,
              fuelOut: `${r.fuelOut}/8`,
              fuelService: r.fuelSvc === "Y" ? "Yes" : "No",
              damaged: r.damageIndicator === "Y" ? "Yes" : "No",
              accidentReported:
                r.accidentReportIndicator === "Y" ? "Yes" : "No",
            },
            rental: {
              outStation: `${r.checkOutStationMnemonic} — ${r.checkOutStation?.trim()}`,
              inStation: `${r.checkInStationMnemonic} — ${r.checkInStation?.trim()}`,
              checkout: `${r.checkOutDate} ${r.checkOutTime || ""}`.trim(),
              return: `${r.checkInDate} ${r.checkInTime || ""}`.trim(),
              rateCode: r.rateCode,
              awd: r.awdCompanyName || "—",
              coupon: r.coupon || "—",
              remarks: r.remarks,
              commission: r.commission,
              tax: `${r.tax}%`,
              discount: r.discount,
              typeOfRental: r.rentalStatus || r.status,
            },
            payment: {
              method: r.mop,
              card: `${r.ccType} •••• ${r.cardNo?.slice(-4) || ""}`,
              authStatus: r.authOut === "YES" ? "Authorized" : "Pending",
            },
            rates: {
              daily: parseCurrency(r.daily),
              weekly: parseCurrency(r.weekly),
              freeMiles: data.qvData?.qvDiFreeMiles || "—",
            },
            charges: {
              csc: r.custServiceCert || "0.00",
              moneyOff: r.moneyOff || "0.00",
              couponAmount: "0.00",
              parking: r.parkingGarage || "0.00",
              childSeat: r.childSeat || "0.00",
              towing: r.towing || "0.00",
              accidentRepairs: r.accidentRepairs || "0.00",
              luggageRack: r.luggageRack || "0.00",
              others: r.other || "0.00",
            },
            totals: {
              amountDue: parseCurrency(r.amtDueRateAmt),
              estTotal: parseCurrency(r.totalChargesRateAmt),
              prepayment: 0,
            },
            timeline: [
              { key: "reserved", done: true, sub: "" },
              { key: "checkedOut", done: true, sub: r.checkOutDate },
              { key: "onRental", current: true, sub: r.status },
              { key: "return", sub: r.checkInDate },
              { key: "closed", sub: "—" },
            ],
            notes: [
              { who: "Remarks", text: r.remarks },
              { who: "Status", text: r.turnBackStatus },
            ],
          });
        }
      } catch (err) {
        console.error("Failed to fetch rental:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRental();
  }, [raNumber]);

  // Keyboard navigation for tabs (left/right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      const tabIds = [
        "overview",
        "customer",
        "vehicle",
        "rental",
        "payment",
        "adjustments",
        "protections",
        "miscCharges",
        "products",
      ];
      const currentIndex = tabIds.indexOf(activeTab);
      if (e.key === "ArrowRight" && currentIndex < tabIds.length - 1) {
        setActiveTab(tabIds[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        setActiveTab(tabIds[currentIndex - 1]);
      }
      // D key for Display, M key for Modify (only when not in input)
      if (e.key === "d" || e.key === "D") {
        setActiveMode("display");
      } else if (e.key === "m" || e.key === "M") {
        setActiveMode("modify");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    const handleModeChange = (e) => setActiveMode(e.detail);
    document.addEventListener("wandMode", handleModeChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wandMode", handleModeChange);
    };
  }, [activeTab]);

  const handleEstimate = async () => {
    setEstimateLoading(true);
    setShowEstimate(true);
    try {
      const data = await wandService.estimateTotal();
      setEstimateData(data);
    } catch (err) {
      console.error("Estimate error:", err);
    } finally {
      setEstimateLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[calc(100vh-64px)]"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading rental data...</p>
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "var(--bg-card)" }}
          >
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Display Rental
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {raNumber ? (
              <>
                No rental found for{" "}
                <span className="font-mono font-medium text-gray-700">
                  {raNumber}
                </span>
              </>
            ) : (
              "Search for a reservation in the search bar to begin"
            )}
          </p>
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
    { id: "adjustments", label: "Adjustments" },
    { id: "protections", label: "Protections" },
    { id: "miscCharges", label: "Misc Charges" },
    { id: "products", label: "Products" },
  ];

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex flex-col"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ═══ HEADER ═══ */}
      <div className="bg-white border-b border-gray-200">
        {/* Top row — Name + Timeline + Amount */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 shrink-0">
              <h1
                className="text-lg sm:text-xl font-bold truncate"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.customer.fullName}
              </h1>
              <div className="flex items-center gap-2.5 mt-1 flex-wrap">
                <span className="text-[12px] sm:text-[13px] font-mono text-gray-500">
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

            {/* Timeline — inline on desktop, hidden on mobile (shown below instead) */}
            <div className="hidden lg:flex flex-1 items-center justify-center mx-4 max-w-xl">
              <div className="flex items-center w-full">
                {rental.timeline.map((step, i) => (
                  <div
                    key={step.key}
                    className="flex items-center flex-1 last:flex-initial"
                  >
                    <div className="flex flex-col items-center">
                      {step.current ? (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center z-10 timeline-current"
                          style={{
                            backgroundColor: Brand.theme.colors.primary,
                          }}
                        >
                          <svg
                            className="w-3.5 h-3.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                          </svg>
                        </div>
                      ) : (
                        <div
                          className="w-2.5 h-2.5 rounded-full border-2"
                          style={{
                            backgroundColor: step.done ? "#4caf50" : "#fff",
                            borderColor: step.done ? "#4caf50" : "#d1d5db",
                          }}
                        />
                      )}
                      <span
                        className="text-[9px] mt-1 capitalize whitespace-nowrap font-medium"
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
                        className="text-[8px]"
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
                        className="flex-1 h-[2px] mx-1 -mt-4"
                        style={{
                          backgroundColor: step.done ? "#4caf50" : "#e5e7eb",
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-5 sm:gap-8 shrink-0">
              <div className="text-right">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium">
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
              <div className="text-right">
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                  Amount Due
                </div>
                <div
                  className="text-xl sm:text-2xl font-bold mt-0.5"
                  style={{ color: Brand.theme.colors.text.primary }}
                >
                  £{rental.totals.amountDue.toFixed(2)}
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-400">
                  Total{" "}
                  <span className="font-medium">
                    £{rental.totals.estTotal.toFixed(2)}
                  </span>{" "}
                  · Prepaid{" "}
                  <span className="font-medium">
                    £{rental.totals.prepayment.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* References row */}
        <div className="px-4 sm:px-6 py-2 border-t border-gray-100 flex flex-wrap items-center gap-3 sm:gap-5">
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
            WIZARD {rental.references.wizard}
          </span>
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
            RES {rental.references.reservation}
          </span>
          <span className="text-[10px] sm:text-[11px] text-gray-400 font-mono">
            MVA {rental.references.mva}
          </span>
        </div>

        {/* Quick Summary Strip */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                Customer
              </div>
              <div
                className="text-[12px] sm:text-[13px] font-semibold truncate"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.customer.fullName}
              </div>
              <div className="text-[11px] sm:text-[12px] text-gray-500 truncate">
                {rental.customer.phone}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {rental.customer.preferred && (
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium"
                    style={{ backgroundColor: "#10b98110", color: "#10b981" }}
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Preferred
                  </span>
                )}
                {rental.customer.company && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium"
                    style={{
                      backgroundColor: Brand.theme.colors.primary + "10",
                      color: Brand.theme.colors.primary,
                    }}
                  >
                    {rental.customer.company}
                  </span>
                )}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                Vehicle
              </div>
              <div
                className="text-[12px] sm:text-[13px] font-semibold truncate"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rental.vehicle.make}
              </div>
              <div className="text-[11px] sm:text-[12px] text-gray-500 truncate">
                {rental.vehicle.year} · {rental.vehicle.colour} ·{" "}
                {rental.vehicle.group}
              </div>
              {rental.customer.connectedCar && (
                <div className="mt-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-medium"
                    style={{ backgroundColor: "#3b82f610", color: "#3b82f6" }}
                  >
                    <svg
                      className="w-2.5 h-2.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Connected Car
                  </span>
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                Rental Period
              </div>
              <div
                className="text-[12px] sm:text-[13px] font-semibold truncate"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {rentalPeriodStart} → {rentalPeriodEnd}
              </div>
              <div className="text-[11px] sm:text-[12px] text-gray-500 truncate">
                {rental.rental.outStation.split("—")[0].trim()} →{" "}
                {rental.rental.inStation.split("—")[0].trim()}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                Payment
              </div>
              <div
                className="text-[12px] sm:text-[13px] font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                £{rental.totals.amountDue.toFixed(2)} due
              </div>
              <div className="text-[11px] sm:text-[12px] text-gray-500 truncate">
                {rental.payment.card}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline - mobile/tablet only (vertical stepper) */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-gray-100 block lg:hidden">
          <div className="text-[10px] uppercase tracking-widest text-gray-400 font-medium mb-3">
            Rental Progress
          </div>
          <div className="flex items-center gap-0">
            {rental.timeline.map((step, i) => (
              <div
                key={step.key}
                className="flex items-center flex-1 last:flex-0"
              >
                {/* Dot */}
                <div className="flex flex-col items-center">
                  {step.current ? (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center timeline-current"
                      style={{ backgroundColor: Brand.theme.colors.primary }}
                    >
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: step.done
                          ? "#4caf50"
                          : "var(--border-color)",
                      }}
                    />
                  )}
                  <span
                    className="text-[9px] mt-1 capitalize whitespace-nowrap font-medium"
                    style={{
                      color: step.current
                        ? Brand.theme.colors.primary
                        : step.done
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {step.key === "checkedOut"
                      ? "Out"
                      : step.key === "onRental"
                        ? "Rental"
                        : step.key}
                  </span>
                </div>
                {/* Line */}
                {i < rental.timeline.length - 1 && (
                  <div
                    className="flex-1 h-[2px] mx-1 -mt-3"
                    style={{
                      backgroundColor: step.done
                        ? "#4caf50"
                        : "var(--border-color)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              className="btn-press flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold rounded-lg"
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
            <button className="btn-outline-hover flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600">
              <svg
                className="w-3.5 h-3.5 hidden sm:block"
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
            <button
              onClick={handleEstimate}
              className="btn-outline-hover flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600"
            >
              Estimate
            </button>
            <button className="btn-outline-hover flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-medium rounded-lg border border-gray-200 text-gray-600 hidden sm:flex">
              Print
            </button>
            {/* Display / Modify toggle */}
            <div className="hidden sm:flex items-center ml-2">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveMode("display")}
                  className="px-3 py-1.5 text-[11px] sm:text-[12px] font-medium"
                  style={{
                    backgroundColor:
                      activeMode === "display"
                        ? Brand.theme.colors.primary
                        : "transparent",
                    color:
                      activeMode === "display"
                        ? "#fff"
                        : "var(--text-secondary)",
                  }}
                >
                  Display <span className="text-[9px] opacity-60">D</span>
                </button>
                <button
                  onClick={() => setActiveMode("modify")}
                  className="px-3 py-1.5 text-[11px] sm:text-[12px] font-medium"
                  style={{
                    backgroundColor:
                      activeMode === "modify"
                        ? Brand.theme.colors.primary
                        : "transparent",
                    color:
                      activeMode === "modify"
                        ? "#fff"
                        : "var(--text-secondary)",
                  }}
                >
                  Modify <span className="text-[9px] opacity-60">M</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="text-[11px] sm:text-[12px] font-medium text-gray-400 hover:text-gray-600">
              ··· Lifecycle
            </button>
            <button
              className="btn-outline-hover px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-[12px] font-semibold rounded-lg border"
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
          <div className="flex items-center gap-0 sm:gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-item relative px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-medium whitespace-nowrap ${activeTab === tab.id ? "active" : ""}`}
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
      <div className="flex-1 p-4 sm:p-6 pb-6 animate-fade-in" key={activeTab}>
        {activeTab === "overview" && (
          <OverviewTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "customer" && (
          <CustomerTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "vehicle" && (
          <VehicleTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "rental" && (
          <RentalRatesTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "payment" && (
          <PaymentTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "adjustments" && (
          <AdjustmentsTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "protections" && (
          <ProtectionsTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "miscCharges" && (
          <MiscChargesTab rental={rental} editable={activeMode === "modify"} />
        )}
        {activeTab === "products" && (
          <ProductsTab rental={rental} editable={activeMode === "modify"} />
        )}
      </div>

      {/* ═══ ESTIMATE TOTAL MODAL ═══ */}
      {showEstimate && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEstimate(false)}
          />
          <div className="relative bg-white rounded-t-xl sm:rounded-xl shadow-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between rounded-t-xl">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: Brand.theme.colors.text.primary }}
                >
                  Estimate Total
                </h2>
                {rental && (
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    RA# {rental.raNumber} · {rental.customer.fullName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowEstimate(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400"
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

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-auto">
              {estimateLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                  <span className="ml-3 text-sm text-gray-500">
                    Calculating estimate...
                  </span>
                </div>
              ) : estimateData?.dispormodMB ? (
                <div
                  className="overflow-x-auto rounded-lg border"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <table className="w-full text-[11px] sm:text-[12px] font-mono">
                    <tbody>
                      {(
                        estimateData.dispormodMB.outMessage ||
                        estimateData.dispormodMB.outString ||
                        ""
                      )
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, i) => {
                          const isHighlight =
                            /AMOUNT DUE|NET TIME \+ DISTANCE/i.test(line);
                          const isTotal = /TOTAL CHARGE|NET CHARGES/i.test(
                            line,
                          );
                          const parts = line
                            .split(/\s{3,}/)
                            .filter((p) => p.trim());
                          return (
                            <tr
                              key={i}
                              className={isHighlight ? "bg-green-50" : ""}
                              style={{
                                borderBottom: "1px solid var(--border-light)",
                              }}
                            >
                              {parts.length >= 2 ? (
                                <>
                                  <td
                                    className={`px-3 py-2 ${isHighlight ? "font-bold" : isTotal ? "font-semibold" : ""}`}
                                    style={{
                                      color: isHighlight
                                        ? "#059669"
                                        : "var(--text-primary)",
                                    }}
                                  >
                                    {parts.slice(0, -1).join("   ")}
                                  </td>
                                  <td
                                    className={`px-3 py-2 text-right whitespace-nowrap ${isHighlight ? "font-bold" : isTotal ? "font-semibold" : ""}`}
                                    style={{
                                      color: isHighlight
                                        ? "#059669"
                                        : "var(--text-primary)",
                                    }}
                                  >
                                    {parts[parts.length - 1]}
                                  </td>
                                </>
                              ) : (
                                <td
                                  colSpan={2}
                                  className={`px-3 py-2 ${isHighlight ? "font-bold" : isTotal ? "font-semibold" : ""}`}
                                  style={{
                                    color: isHighlight
                                      ? "#059669"
                                      : "var(--text-primary)",
                                  }}
                                >
                                  {line.trim()}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No estimate data available
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100 flex justify-end rounded-b-xl">
              <button
                onClick={() => setShowEstimate(false)}
                className="px-5 py-2.5 text-sm font-semibold rounded-lg text-white"
                style={{ backgroundColor: Brand.theme.colors.primary }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STICKY FOOTER ═══ */}
      <div
        className="sticky bottom-0 h-12 flex items-center justify-between px-4 sm:px-6 border-t z-40 bg-white shrink-0"
        style={{ borderColor: "#e5e7eb" }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-[12px] sm:text-[13px] font-mono text-gray-500">
            {rental.raNumber}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block" />
          <span
            className="text-[12px] sm:text-[13px] font-medium hidden sm:inline"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Due{" "}
            <span className="font-bold">
              £{rental.totals.amountDue.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="btn-outline-hover flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-gray-400 px-2 sm:px-2.5 py-1.5 rounded-md">
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
            <span className="hidden sm:inline">Note</span>
          </button>
          <button className="btn-outline-hover flex items-center gap-1.5 text-[11px] sm:text-[12px] font-medium text-gray-400 px-2 sm:px-2.5 py-1.5 rounded-md hidden sm:flex">
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
            className="btn-press flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-[12px] font-semibold rounded-lg"
            style={{
              backgroundColor: Brand.theme.colors.primary,
              color: "#fff",
            }}
          >
            <span className="hidden sm:inline">Continue </span>Check-in
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
   TAB: Overview — 2×2 grid on desktop, stacked on mobile
   ═══════════════════════════════════════════════════════ */
const OverviewTab = ({ rental, editable }) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field
            editable={editable}
            label="Name"
            value={rental.customer.fullName}
            bold
          />
          <Field
            editable={editable}
            label="Company"
            value={rental.customer.company}
          />
          <Field
            editable={editable}
            label="Phone"
            value={rental.customer.phone}
          />
          <Field
            editable={editable}
            label="Email"
            value={rental.customer.email}
          />
          <Field
            editable={editable}
            label="Licence"
            value={rental.customer.licenceNumber}
          />
          <Field
            label="Address"
            value={`${rental.customer.address1}, ${rental.customer.cityPost}`}
          />
        </div>
      </SectionCard>

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
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-50">
          <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
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
          <div className="min-w-0">
            <div
              className="text-[13px] font-semibold truncate"
              style={{ color: Brand.theme.colors.text.primary }}
            >
              {rental.vehicle.make}
            </div>
            <div className="text-[11px] text-gray-500">
              {rental.vehicle.year} · {rental.vehicle.colour} ·{" "}
              {rental.vehicle.group}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6">
          <Field editable={editable} label="MVA" value={rental.vehicle.mva} />
          <Field
            label="Mileage Out"
            value={rental.vehicle.mileageOut?.toLocaleString()}
          />
          <Field
            editable={editable}
            label="Fuel Out"
            value={rental.vehicle.fuelOut}
          />
          <Field
            editable={editable}
            label="Damaged"
            value={rental.vehicle.damaged}
          />
        </div>
      </SectionCard>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field
            editable={editable}
            label="Out Station"
            value={rental.rental.outStation}
          />
          <Field
            editable={editable}
            label="In Station"
            value={rental.rental.inStation}
          />
          <Field
            editable={editable}
            label="Checkout"
            value={rental.rental.checkout}
          />
          <Field
            editable={editable}
            label="Return"
            value={rental.rental.return}
          />
          <Field
            editable={editable}
            label="Rate Code"
            value={rental.rental.rateCode}
          />
          <Field editable={editable} label="AWD" value={rental.rental.awd} />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-50 flex-wrap">
          <RatePill label="Daily" value={`£${rental.rates.daily.toFixed(2)}`} />
          <RatePill
            label="Weekly"
            value={`£${rental.rates.weekly.toFixed(2)}`}
          />
          <RatePill label="Free Mi" value={rental.rates.freeMiles} />
        </div>
      </SectionCard>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field
            editable={editable}
            label="Method"
            value={rental.payment.method}
          />
          <Field editable={editable} label="Card" value={rental.payment.card} />
          <Field
            editable={editable}
            label="Auth Status"
            value={rental.payment.authStatus}
          />
        </div>
      </SectionCard>
    </div>

    {/* Adjustments + Protections/Coverages */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <SectionCard
        title="Adjustments"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        }
      >
        <div className="grid grid-cols-2 gap-x-6">
          <Field
            editable={editable}
            label="Free Day Cert (Exclusive)"
            value={rental.charges.csc}
          />
          <Field
            editable={editable}
            label="Money Off"
            value={rental.charges.moneyOff}
          />
          <Field editable={editable} label="Customer Loyalty" value="0.00" />
          <Field editable={editable} label="Loyalty" value="0.00" />
        </div>
      </SectionCard>

      <SectionCard
        title="Protections / Coverages"
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
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Type
                </th>
                <th className="text-right py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Selected
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  type: "Collision Damage Waiver",
                  selected: rental.rental?.rateCode ? "Yes" : "No",
                },
                { type: "Personal Accident Ins", selected: "No" },
                { type: "Additional Liability", selected: "Yes" },
                { type: "Theft Protection", selected: "Yes" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td
                    className="py-2.5 font-medium"
                    style={{ color: Brand.theme.colors.primary }}
                  >
                    {row.type}
                  </td>
                  <td className="py-2.5 text-right font-semibold">
                    {row.selected}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>

    {/* Miscellaneous Charges */}
    <SectionCard
      title="Miscellaneous Charges"
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6">
        <Field
          editable={editable}
          label="Air Conditioning"
          value={rental.charges.others}
        />
        <Field
          editable={editable}
          label="Parking Garage Storage"
          value={rental.charges.parking}
        />
        <Field editable={editable} label="Parking Fines" value="0.00" />
        <Field
          editable={editable}
          label="Accident Repairs"
          value={rental.charges.accidentRepairs}
        />
        <Field editable={editable} label="Cleaning/Maint" value="0.00" />
        <Field editable={editable} label="Under 25" value="0.00" />
        <Field editable={editable} label="Winter Service" value="0.00" />
        <Field editable={editable} label="PAI/Super PAI" value="0.00" />
        <Field editable={editable} label="Security Fee" value="0.00" />
        <Field editable={editable} label="Additional Driver" value="0.00" />
        <Field editable={editable} label="Keys" value="0.00" />
        <Field
          editable={editable}
          label="Towing"
          value={rental.charges.towing}
        />
        <Field editable={editable} label="Green Card Insurance" value="0.00" />
        <Field
          editable={editable}
          label="Other"
          value={rental.charges.others}
        />
        <Field editable={editable} label="Refuel Fee" value="0.00" />
        <Field
          editable={editable}
          label="Combination Of Charges"
          value="0.00"
        />
        <Field
          editable={editable}
          label="Ski/Luggage Racks"
          value={rental.charges.luggageRack}
        />
        <Field editable={editable} label="Collection Fee" value="0.00" />
        <Field editable={editable} label="Telephone/Car Phone" value="0.00" />
        <Field
          editable={editable}
          label="Child Seat"
          value={rental.charges.childSeat}
        />
        <Field editable={editable} label="Out Of Hours" value="0.00" />
        <Field editable={editable} label="Registration Fee" value="0.00" />
        <Field editable={editable} label="Tire/Wheel Damage" value="0.00" />
        <Field editable={editable} label="Handling Fee Cash" value="0.00" />
      </div>
    </SectionCard>

    {rental.notes && rental.notes.length > 0 && (
      <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex items-center gap-2">
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
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <h3
            className="text-[13px] font-semibold uppercase tracking-wide"
            style={{ color: Brand.theme.colors.text.primary }}
          >
            Notes & Remarks
          </h3>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          {rental.rental.remarks && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
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
   TAB: Customer — full width, 3 cols on desktop
   ═══════════════════════════════════════════════════════ */
const CustomerTab = ({ rental, editable }) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
      <Field
        editable={editable}
        label="Full Name"
        value={rental.customer.fullName}
        bold
      />
      <Field
        editable={editable}
        label="Company"
        value={rental.customer.company}
      />
      <Field editable={editable} label="Phone" value={rental.customer.phone} />
      <Field editable={editable} label="Email" value={rental.customer.email} />
      <Field
        editable={editable}
        label="Licence Country"
        value={rental.customer.licenceCountry}
      />
      <Field
        editable={editable}
        label="Licence State"
        value={rental.customer.licenceState}
      />
      <Field
        editable={editable}
        label="Licence Number"
        value={rental.customer.licenceNumber}
      />
      <Field
        editable={editable}
        label="Date of Birth"
        value={rental.customer.dateOfBirth}
      />
      <Field
        editable={editable}
        label="Address"
        value={rental.customer.address1}
      />
      <Field
        editable={editable}
        label="City/Post"
        value={rental.customer.cityPost}
      />
      <Field
        editable={editable}
        label="Loyalty"
        value={rental.customer.loyalty}
      />
      <Field
        editable={editable}
        label="Frequent Travel"
        value={rental.customer.freqTravel}
      />
      <Field
        editable={editable}
        label="Partner Number"
        value={rental.customer.partnerNumber}
      />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════════════════
   TAB: Vehicle — full width, 3 cols on desktop
   ═══════════════════════════════════════════════════════ */
const VehicleTab = ({ rental, editable }) => (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
      <Field
        editable={editable}
        label="Description"
        value={rental.vehicle.description}
        bold
      />
      <Field editable={editable} label="Make" value={rental.vehicle.make} />
      <Field editable={editable} label="Year" value={rental.vehicle.year} />
      <Field editable={editable} label="Colour" value={rental.vehicle.colour} />
      <Field editable={editable} label="Group" value={rental.vehicle.group} />
      <Field editable={editable} label="MVA" value={rental.vehicle.mva} />
      <Field
        label="Mileage Out"
        value={rental.vehicle.mileageOut?.toLocaleString()}
      />
      <Field
        label="Mileage In"
        value={rental.vehicle.mileageIn?.toLocaleString() || "—"}
      />
      <Field
        editable={editable}
        label="Fuel Out"
        value={rental.vehicle.fuelOut}
      />
      <Field
        editable={editable}
        label="Fuel Service"
        value={rental.vehicle.fuelService}
      />
      <Field
        editable={editable}
        label="Damaged"
        value={rental.vehicle.damaged}
      />
      <Field
        label="Accident Reported"
        value={rental.vehicle.accidentReported}
      />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════════════════
   TAB: Rental & Rates — full width
   ═══════════════════════════════════════════════════════ */
const RentalRatesTab = ({ rental, editable }) => (
  <div className="space-y-4 sm:space-y-6">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
        <Field
          editable={editable}
          label="Out Station"
          value={rental.rental.outStation}
        />
        <Field
          editable={editable}
          label="In Station"
          value={rental.rental.inStation}
        />
        <Field
          editable={editable}
          label="Checkout"
          value={rental.rental.checkout}
          bold
        />
        <Field
          editable={editable}
          label="Return"
          value={rental.rental.return}
          bold
        />
        <Field
          editable={editable}
          label="Rate Code"
          value={rental.rental.rateCode}
        />
        <Field editable={editable} label="AWD" value={rental.rental.awd} />
        <Field
          editable={editable}
          label="Coupon"
          value={rental.rental.coupon || "—"}
        />
        <Field
          editable={editable}
          label="Type of Rental"
          value={rental.rental.typeOfRental}
        />
        <Field
          editable={editable}
          label="Commission"
          value={rental.rental.commission}
        />
        <Field editable={editable} label="Tax" value={rental.rental.tax} />
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
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <RatePill label="Daily" value={`£${rental.rates.daily.toFixed(2)}`} />
        <RatePill label="Weekly" value={`£${rental.rates.weekly.toFixed(2)}`} />
        <RatePill label="Free Mi" value={rental.rates.freeMiles} />
      </div>
    </SectionCard>
  </div>
);

/* ═══════════════════════════════════════════════════════
   TAB: Payment — cards side by side on desktop
   ═══════════════════════════════════════════════════════ */
const PaymentTab = ({ rental, editable }) => (
  <div className="space-y-4 sm:space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <Field
            editable={editable}
            label="Method"
            value={rental.payment.method}
          />
          <Field
            editable={editable}
            label="Card"
            value={rental.payment.card}
            bold
          />
          <Field
            editable={editable}
            label="Auth Status"
            value={rental.payment.authStatus}
          />
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
        <div className="grid grid-cols-2 gap-x-6">
          <Field
            label="Estimated Total"
            value={`£${rental.totals.estTotal.toFixed(2)}`}
          />
          <Field
            label="Prepayment"
            value={`£${rental.totals.prepayment.toFixed(2)}`}
          />
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
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
            £{rental.totals.amountDue.toFixed(2)}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
        <Field
          editable={editable}
          label="CSC"
          value={`£${rental.charges.csc}`}
        />
        <Field
          editable={editable}
          label="Money Off"
          value={`£${rental.charges.moneyOff}`}
        />
        <Field
          label="Coupon Amount"
          value={`£${rental.charges.couponAmount}`}
        />
        <Field
          editable={editable}
          label="Parking"
          value={`£${rental.charges.parking}`}
        />
        <Field
          editable={editable}
          label="Child Seat"
          value={`£${rental.charges.childSeat}`}
        />
        <Field
          editable={editable}
          label="Towing"
          value={`£${rental.charges.towing}`}
        />
        <Field
          label="Accident Repairs"
          value={`£${rental.charges.accidentRepairs}`}
        />
        <Field
          editable={editable}
          label="Luggage Rack"
          value={`£${rental.charges.luggageRack}`}
        />
        <Field
          editable={editable}
          label="Others"
          value={`£${rental.charges.others}`}
        />
      </div>
    </SectionCard>
  </div>
);

export default Dashboard;

/* ═══════════════════════════════════════════════════════
   TAB: Adjustments
   ═══════════════════════════════════════════════════════ */
const AdjustmentsTab = ({ rental, editable }) => (
  <SectionCard
    title="Adjustments"
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
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6">
      <Field
        editable={editable}
        label="Free Day Cert (Exclusive Rate)"
        value={rental.charges.csc}
      />
      <Field editable={editable} label="Customer Empowerment" value="0.00" />
      <Field
        editable={editable}
        label="Money Off Certificate"
        value={rental.charges.moneyOff}
      />
      <Field editable={editable} label="Loyalty Certificate" value="0.00" />
      <Field
        editable={editable}
        label="Free Day Cert (Inclusive Rate)"
        value="0.00"
      />
      <Field editable={editable} label="Loyalty" value="0.00" />
      <Field editable={editable} label="Fuel Amt $" value="0.00" />
      <Field editable={editable} label="Other Amt $" value="0.00" />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════════════════
   TAB: Protections / Coverages
   ═══════════════════════════════════════════════════════ */
const ProtectionsTab = ({ rental }) => (
  <SectionCard
    title="Protections / Coverages"
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
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    }
  >
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Type
            </th>
            <th className="text-right py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Select
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            { type: "Collision Damage Waiver", selected: "Yes" },
            { type: "Personal Accident Ins", selected: "No" },
            { type: "Windscreen Cover", selected: "No" },
            { type: "Theft Protection", selected: "Yes" },
          ].map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td
                className="py-3 font-medium"
                style={{ color: Brand.theme.colors.primary }}
              >
                {row.type}
              </td>
              <td
                className="py-3 text-right font-semibold"
                style={{ color: Brand.theme.colors.text.primary }}
              >
                {row.selected}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════════════════
   TAB: Miscellaneous Charges
   ═══════════════════════════════════════════════════════ */
const MiscChargesTab = ({ rental, editable }) => (
  <SectionCard
    title="Miscellaneous Charges"
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6">
      <Field editable={editable} label="Air Conditioning" value="0.00" />
      <Field
        editable={editable}
        label="Parking Garage Storage"
        value={rental.charges.parking}
      />
      <Field editable={editable} label="Parking Fines/Citations" value="0.00" />
      <Field
        editable={editable}
        label="Accident Repairs"
        value={rental.charges.accidentRepairs}
      />
      <Field editable={editable} label="Cleaning/Maintenance" value="0.00" />
      <Field editable={editable} label="Under 25" value="0.00" />
      <Field editable={editable} label="Winter Service Fees" value="0.00" />
      <Field editable={editable} label="PAI/Super PAI" value="0.00" />
      <Field editable={editable} label="Security Fee" value="0.00" />
      <Field editable={editable} label="Additional Driver" value="0.00" />
      <Field editable={editable} label="Keys" value="0.00" />
      <Field editable={editable} label="Towing" value={rental.charges.towing} />
      <Field editable={editable} label="Green Card Insurance" value="0.00" />
      <Field editable={editable} label="Other" value={rental.charges.others} />
      <Field editable={editable} label="Refuel Fee" value="0.00" />
      <Field editable={editable} label="Combination Of Charges" value="0.00" />
      <Field
        editable={editable}
        label="Ski/Luggage Racks"
        value={rental.charges.luggageRack}
      />
      <Field editable={editable} label="Collection Fee" value="0.00" />
      <Field editable={editable} label="Telephone/Car Phone" value="0.00" />
      <Field
        editable={editable}
        label="Child Seat"
        value={rental.charges.childSeat}
      />
      <Field editable={editable} label="Out Of Hours" value="0.00" />
      <Field editable={editable} label="Registration Fee" value="0.00" />
      <Field editable={editable} label="Tire/Wheel Damage" value="0.00" />
      <Field editable={editable} label="Handling Fee Cash" value="0.00" />
      <Field editable={editable} label="Delivery/Pickup Fee" value="0.00" />
      <Field editable={editable} label="Misc Towing" value="0.00" />
      <Field editable={editable} label="Misc Other" value="0.00" />
      <Field editable={editable} label="Recovery Handling Fee" value="0.00" />
    </div>
  </SectionCard>
);

/* ═══════════════════════════════════════════════════════
   TAB: Additional Products
   ═══════════════════════════════════════════════════════ */
const ProductsTab = () => {
  const products = [
    { code: "ADF", desc: "FREE ADDITIONAL DRIVER" },
    { code: "CNP", desc: "CARBON NUETRAL PRODUCT" },
    { code: "FSK", desc: "SPEEDY CHECKOUT EXPERIENCE" },
    { code: "GPS", desc: "GLOBAL POSITIONING SYSTEM" },
    { code: "HOL", desc: "BRITAX STROLLER" },
    { code: "IXB", desc: "GROUP 0 ISOFIX CHILD SEAT BASE" },
    { code: "LOG", desc: "LOGISTIC FEE" },
    { code: "MAD", desc: "RAILWAY DELIVERY SERVICES" },
    { code: "MKV", desc: "ENGINE/CAR HEATER" },
    { code: "MPF", desc: "MARKET PRICE FUEL" },
    { code: "RSF", desc: "INCLUSIVE ROADSIDE ASSISTANCE" },
    { code: "RSN", desc: "ROADSIDE SAFETY NET" },
    { code: "SCS", desc: "SCANDINAVIAN GROUP CHILD SEAT" },
    { code: "SPD", desc: "TRAFFIC SAFETY DEVICE" },
    { code: "STK", desc: "HAND TRUCK" },
    { code: "TCT", desc: "TRAVEL COMPANION TABLET" },
    { code: "TVA", desc: "CARWASH" },
    { code: "VSF", desc: "AVIS SAFE DRIVE EUROPE" },
    { code: "VSS", desc: "AVIS SAFE DRIVE" },
    { code: "WFI", desc: "WIFI" },
    { code: "XLJ", desc: "EXTRA LIGHTS" },
  ];

  return (
    <SectionCard
      title="Additional Products"
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
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Product
              </th>
              <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Amount
              </th>
              <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Tracking Number
              </th>
              <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Daily
              </th>
              <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Weekly
              </th>
              <th className="text-center py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Max
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={i}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
              >
                <td className="py-2.5 font-medium text-gray-700">
                  {p.code} - {p.desc}
                </td>
                <td className="py-2.5 text-center text-gray-400">—</td>
                <td className="py-2.5 text-center text-gray-400">—</td>
                <td className="py-2.5 text-center text-gray-400">—</td>
                <td className="py-2.5 text-center text-gray-400">—</td>
                <td className="py-2.5 text-center text-gray-400">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
};
