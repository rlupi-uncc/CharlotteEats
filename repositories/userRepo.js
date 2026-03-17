// repositories/userRepo.js
const User = require("../models/User");

/**
 * Create a user.
 * Password will be hashed by UserSchema pre("save") hook.
 * Returns user WITHOUT password.
 */
async function createUser(data) {
  const user = new User(data);
  await user.save();
  return user.toJSON(); // your toJSON transform strips password
}

/**
 * Used by auth/login to fetch user INCLUDING password hash.
 * (Needed to comparePassword.)
 */
async function findUserByEmail(email) {
  return User.findOne({ email }).exec(); // returns full doc (includes password)
}

/**
 * If you log in with username, this is the one you want.
 */
async function findUserByUsername(username) {
  return User.findOne({ username }).exec(); // includes password
}

/**
 * Return safe user (no password) by id.
 */
async function findUserById(id) {
  return User.findById(id).select("-password").lean().exec();
}

/**
 * Return all users safely (no passwords).
 */
async function findAllUsers() {
  return User.find().select("-password").lean().exec();
}

/**
 * Update user safely.
 * IMPORTANT: uses findById + save so pre("save") runs (password hashing).
 * Returns safe user (no password) or null if not found.
 */
async function updateUser(id, updates) {
  const user = await User.findById(id);
  if (!user) return null;

  // Only allow updating fields you actually want editable
  if (updates.username !== undefined) user.username = updates.username;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.password !== undefined) user.password = updates.password; // triggers re-hash on save
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.profilePicture !== undefined) user.profilePicture = updates.profilePicture;
  if (updates.balance !== undefined) user.balance = updates.balance;

  await user.save();
  return user.toJSON();
}

/**
 * Delete user. Returns safe deleted user or null if not found.
 */
async function removeUser(id) {
  const deleted = await User.findByIdAndDelete(id).select("-password").lean().exec();
  return deleted; // null if not found
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
  findAllUsers,
  updateUser,
  removeUser,
};