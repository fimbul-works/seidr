import { encodeBase62, randomString } from "./base62";
import { isServer } from "./environment/server";

/** Process ID (if available in Node.js environment) */
const PID = isServer() ? process.pid : null;

/**
 * Generates a timestamp component in base-62.
 */
const timestamp = () => encodeBase62(Date.now());

/**
 * Generates a process ID component in base-62 (or random if not available).
 */
const pid = () => (PID ? encodeBase62(PID) : randomString(3));

/**
 * Generates a unique identifier (UID).
 *
 * The UID is time-sorted and consists of three parts separated by hyphens:
 * - Timestamp: Time when the UID was created (sortable)
 * - Process ID: Process identifier (or random if not available)
 * - Random: High-entropy random component
 *
 * @returns {string} A unique identifier string (approximately 20 characters)
 */
export const uid = (): string => [timestamp(), pid(), randomString(8)].join("-");
