import axios from 'axios';
import { APP_VERSION, VERSION_JSON_URL } from '../config/appVersion';

export type RemoteAppVersion = {
  version: string;
  apk_url: string;
  force_download: boolean;
  website_link?: string;
};

export type AppUpdateInfo = {
  currentVersion: string;
  remoteVersion: string;
  apkUrl: string;
  forceDownload: boolean;
  websiteLink: string | null;
};

function parseVersionParts(version: string): number[] {
  return version
    .trim()
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .filter(Boolean)
    .map(part => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
}

/** Returns true when remote is strictly newer than current. */
export function isRemoteVersionNewer(
  currentVersion: string,
  remoteVersion: string,
): boolean {
  const current = parseVersionParts(currentVersion);
  const remote = parseVersionParts(remoteVersion);
  const length = Math.max(current.length, remote.length);

  for (let i = 0; i < length; i += 1) {
    const a = current[i] ?? 0;
    const b = remote[i] ?? 0;
    if (b > a) {
      return true;
    }
    if (b < a) {
      return false;
    }
  }

  return false;
}

function normalizeRemote(data: unknown): RemoteAppVersion | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const version = typeof record.version === 'string' ? record.version.trim() : '';
  const apkUrl =
    typeof record.apk_url === 'string' ? record.apk_url.trim() : '';

  if (!version || !apkUrl) {
    return null;
  }

  return {
    version,
    apk_url: apkUrl,
    force_download: record.force_download === true,
    website_link:
      typeof record.website_link === 'string' && record.website_link.trim()
        ? record.website_link.trim()
        : undefined,
  };
}

export async function fetchAppUpdateInfo(
  currentVersion: string = APP_VERSION,
): Promise<AppUpdateInfo | null> {
  const response = await axios.get(VERSION_JSON_URL, {
    timeout: 12000,
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  const remote = normalizeRemote(response.data);
  if (!remote) {
    return null;
  }

  if (!isRemoteVersionNewer(currentVersion, remote.version)) {
    return null;
  }

  return {
    currentVersion,
    remoteVersion: remote.version,
    apkUrl: remote.apk_url,
    forceDownload: remote.force_download,
    websiteLink: remote.website_link ?? null,
  };
}
