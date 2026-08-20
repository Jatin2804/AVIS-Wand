import axiosInstance from "../api/axiosInstance";

/**
 * WAND API Service
 * Makes real API calls to the WAND backend via the proxy.
 * The proxy injects session cookies for authentication.
 */
const wandService = {
  /**
   * Display/fetch a rental by RA number
   * This is the main endpoint that returns full rental data.
   */
  async displayRental(raNo = "724717980") {
    const params = new URLSearchParams({
      raNo,
      wizardNo: "",
      discountNo: "",
      haveCustInfo: "false",
      "fromCache ": "false",
    });

    const response = await axiosInstance.post(
      "/rental?brand=Avis&brandCode=A&agentId=14246&selectedModule=DISPLAY-RENTAL&stationMnemonic=LHR",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }
    );
    return response.data;
  },

  /**
   * Reset rental (initialize blank form)
   */
  async resetRental() {
    const response = await axiosInstance.post(
      "/rental/resetRental?brand=Avis&brandCode=A&agentId=14246&selectedModule=&stationMnemonic=LHR"
    );
    return response.data;
  },

  /**
   * Search rentals by various criteria (RA number, reservation number, name, etc.)
   */
  async searchRental(searchString) {
    const params = new URLSearchParams({
      searchString,
      wizardNo: "",
      discountNo: "",
      closed: "false",
      raNo: "",
      mva: "",
      name: "",
      phone: "",
      resNo: "",
      claimNo: "",
      ccNumber: "",
      expressNo: "",
    });

    const response = await axiosInstance.post(
      "/rental?brand=Avis&brandCode=A&agentId=14246&selectedModule=DISPLAY-RENTAL&stationMnemonic=LHR",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
      }
    );
    return response.data;
  },
};

export default wandService;
