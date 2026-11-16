export function createVirtualClock(initialTime = Date.now()) {
  let currentTime = Number(initialTime);
  const listeners = new Set();

  if (!Number.isFinite(currentTime)) {
    throw new TypeError('The virtual clock requires a finite initial timestamp.');
  }

  function notify(previousTime) {
    const change = {
      now: currentTime,
      previous: previousTime,
      elapsed: currentTime - previousTime,
    };
    listeners.forEach((listener) => listener(change));
    return new Date(currentTime).toISOString();
  }

  return Object.freeze({
    now: () => new Date(currentTime).toISOString(),
    timestamp: () => currentTime,
    advanceBy(milliseconds) {
      const amount = Number(milliseconds);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new TypeError('Clock advancement must be a positive finite number of milliseconds.');
      }
      const previousTime = currentTime;
      currentTime += amount;
      return notify(previousTime);
    },
    advanceTo(value) {
      const timestamp = value instanceof Date ? value.getTime() : Number(value);
      if (!Number.isFinite(timestamp) || timestamp <= currentTime) {
        throw new TypeError('The target time must be a finite timestamp after the current time.');
      }
      const previousTime = currentTime;
      currentTime = timestamp;
      return notify(previousTime);
    },
    reset(value = Date.now()) {
      const timestamp = value instanceof Date ? value.getTime() : Number(value);
      if (!Number.isFinite(timestamp)) {
        throw new TypeError('The virtual clock reset time must be a finite timestamp.');
      }
      currentTime = timestamp;
      return new Date(currentTime).toISOString();
    },
    subscribe(listener) {
      if (typeof listener !== 'function') throw new TypeError('A clock listener is required.');
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export const virtualClock = createVirtualClock();
