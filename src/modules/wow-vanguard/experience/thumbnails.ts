// The existing public Focus boundary allows 60 reads/minute. Background image
// lookups use at most 40, leaving capacity for deliberate Focus interactions.
export function createVanguardThumbnailLookup(
  read: (seatId: string) => Promise<string | null>,
  clock = Date.now,
) {
  const cached = new Map<string, { url: string | null; expiresAt: number }>();
  let reads: number[] = [];
  return async (seatId: string) => {
    const now = clock();
    const previous = cached.get(seatId);
    if (previous && previous.expiresAt > now) return previous.url;
    reads = reads.filter((time) => time > now - 60000);
    if (reads.length >= 40) return null;
    reads.push(now);
    const url = await read(seatId);
    cached.delete(seatId);
    cached.set(seatId, { url, expiresAt: now + 60000 });
    if (cached.size > 128) cached.delete(cached.keys().next().value!);
    return url;
  };
}
