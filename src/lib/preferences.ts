import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTO_NEXT_KEY = 'preferences:autoNext';
const PREFERRED_SERVER_KEY = 'preferences:preferredServer';

export type PreferredServer = {
  typeKey: string;
  serverName: string;
};

export async function getAutoNext(): Promise<boolean> {
  const value = await AsyncStorage.getItem(AUTO_NEXT_KEY);
  return value === 'true';
}

export async function setAutoNext(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(AUTO_NEXT_KEY, enabled ? 'true' : 'false');
}

export async function getPreferredServer(): Promise<PreferredServer | null> {
  const value = await AsyncStorage.getItem(PREFERRED_SERVER_KEY);
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as PreferredServer;
    if (
      typeof parsed?.typeKey === 'string' &&
      typeof parsed?.serverName === 'string' &&
      parsed.typeKey.trim() &&
      parsed.serverName.trim()
    ) {
      return {
        typeKey: parsed.typeKey.trim().toLowerCase(),
        serverName: parsed.serverName,
      };
    }
  } catch {
    // Ignore invalid stored preference.
  }

  return null;
}

export async function setPreferredServer(
  preferred: PreferredServer,
): Promise<void> {
  await AsyncStorage.setItem(
    PREFERRED_SERVER_KEY,
    JSON.stringify({
      typeKey: preferred.typeKey.trim().toLowerCase(),
      serverName: preferred.serverName,
    }),
  );
}
