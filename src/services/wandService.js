import axiosInstance from "../api/axiosInstance";

/**
 * WAND API Service
 * Makes real API calls to the WAND backend via the proxy.
 */
const wandService = {
  /**
   * Display/fetch a rental by RA number
   */
  async displayRental(raNo = "724717980") {
    const params = new URLSearchParams({
      raNo,
      wizardNo: "",
      discountNo: "",
      haveCustInfo: "false",
      "fromCache ": "false",
    });

    const response = await axiosInstance.post("/rental", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  /**
   * Reset rental (initialize blank form)
   */
  async resetRental() {
    const response = await axiosInstance.post("/rental/resetRental");
    return response.data;
  },

  /**
   * Search rentals by various criteria
   */
  async searchRental(searchString) {
    const params = new URLSearchParams({
      searchString,
      wizardNo: "",
      discountNo: "",
      closed: "true",
      raNo: "",
      mva: "",
      name: "",
      phone: "",
      resNo: "",
      claimNo: "",
      ccNumber: "",
      expressNo: "",
    });

    const response = await axiosInstance.post("/rental", params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  /**
   * Get estimate total for the current rental
   */
  async estimateTotal() {
    const response = await axiosInstance.post(
      "/rental/estimateTotal",
      {},
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};

export default wandService;
