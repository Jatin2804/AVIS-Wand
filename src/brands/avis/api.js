/** @type {import('../types').ApiConfig} */
const avisApi = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.avis.com/v1",
  timeout: 15000,
  endpoints: {
    auth: "/auth",
    users: "/users",
    bookings: "/bookings",
    vehicles: "/vehicles",
    payments: "/payments",
  },
};

export default avisApi;
