/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} [role]
 * @property {string} [avatar]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UsersState
 * @property {User[]} list
 * @property {User|null} selectedUser
 * @property {boolean} loading
 * @property {string|null} error
 */

export {};
