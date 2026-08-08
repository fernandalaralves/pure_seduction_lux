const argon2 = require('argon2');

// Centralizing the hashing algorithm here means it only needs to change in
// one place if it's ever upgraded again in the future.
//
// Argon2id (the default/recommended variant - resistant to both GPU cracking
// and side-channel attacks) with parameters in line with OWASP's current
// guidance for interactive login forms.
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // ~19 MB
  timeCost: 2,
  parallelism: 1,
};

/** Hashes a plain-text password. The returned string embeds the algorithm,
 * version and parameters, so verifyPassword doesn't need them passed back in. */
async function hashPassword(plainPassword) {
  return argon2.hash(plainPassword, ARGON2_OPTIONS);
}

/** Verifies a plain-text password against a stored hash. */
async function verifyPassword(hash, plainPassword) {
  try {
    return await argon2.verify(hash, plainPassword);
  } catch (err) {
    // argon2.verify throws if the hash string is malformed/unrecognized
    // (e.g. leftover legacy hashes) - treat that as "does not match" rather
    // than crashing the request.
    return false;
  }
}

module.exports = { hashPassword, verifyPassword };
