/**
 * Runtime environment helper.
 *
 * In production (Docker), values come from window.env which is generated at
 * container startup by docker-entrypoint.sh from the container's environment.
 *
 * In local development (pnpm start), values fall back to process.env so that
 * the normal .env file still works.
 */
const env = {
  REACT_APP_API_URL:
    (window.env && window.env.REACT_APP_API_URL) ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:8000",
};

export default env;
