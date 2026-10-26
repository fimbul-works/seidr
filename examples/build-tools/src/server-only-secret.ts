/**
 * Server-only secret module containing sensitive credentials and DB calls.
 * This file and its identifiers MUST NEVER appear in any client/browser bundle.
 */
export const SERVER_SECRET_DATABASE_KEY = "super-secret-server-db-key-12345";

export function loadServerDatabaseData(): string {
  return "SERVER_DATA_FROM_DB";
}
