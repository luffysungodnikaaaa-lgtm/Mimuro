import axios from 'axios';

/**
 * Private backend base URLs are not included in this public review repo.
 * Point these at your own API when running a private build.
 */
const PRIVATE_API_BASE =
  process.env.MIMURO_API_BASE_URL ?? 'https://YOUR_PRIVATE_API.example';
const PRIVATE_SCHEDULE_BASE =
  process.env.MIMURO_SCHEDULE_API_BASE_URL ??
  'https://YOUR_PRIVATE_SCHEDULE_API.example';

export const client = axios.create({
  baseURL: PRIVATE_API_BASE,
});

export const scheduleClient = axios.create({
  baseURL: PRIVATE_SCHEDULE_BASE,
});
