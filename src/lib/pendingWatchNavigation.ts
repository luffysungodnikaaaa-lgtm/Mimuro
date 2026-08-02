type PendingWatch = {
  id: string;
  episode: number;
};

let pending: PendingWatch | null = null;

export function setPendingWatchNavigation(id: string, episode: number) {
  if (!id) {
    return;
  }
  pending = { id, episode: episode > 0 ? episode : 1 };
}

export function consumePendingWatchNavigation(): PendingWatch | null {
  const next = pending;
  pending = null;
  return next;
}
