/** @type {import('../types').ApiConfig} */
const budgetApi = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.budget.com/v1",
  timeout: 12000,
  endpoints: {
    auth: "/auth",
    users: "/users",
    bookings: "/reservations",
    vehicles: "/cars",
    payments: "/payments",
  },
};

export default budgetApi;
