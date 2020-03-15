if (!process.env.BACKEND_URL) {
  throw new Error('Can not build frontend without BACKEND_URL environment variable');
}
export const environment = {
  production: true,
  backend: process.env.BACKEND_URL,
};
