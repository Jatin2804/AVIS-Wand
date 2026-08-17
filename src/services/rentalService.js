import rentals, { rentalSummaries } from "../data/rentals";

const rentalService = {
  /**
   * Get all rental summaries (for search listing)
   */
  getAll() {
    return rentalSummaries;
  },

  /**
   * Get full rental detail by RA number
   * @param {string} raNumber - e.g. "RA-2024-001542"
   * @returns {object|null}
   */
  getByRaNumber(raNumber) {
    return rentals.find((r) => r.raNumber === raNumber) || null;
  },

  /**
   * Search rentals by query (matches RA number or customer name)
   * @param {string} query
   * @returns {Array}
   */
  search(query) {
    if (!query || !query.trim()) return rentalSummaries;

    const q = query.toLowerCase().trim();
    return rentalSummaries.filter(
      (r) =>
        r.ra.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
    );
  },
};

export default rentalService;
