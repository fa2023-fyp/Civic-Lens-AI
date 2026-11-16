const STORAGE_KEY = 'civiclens-mock-event-queue';

export function createEventQueue({
  now = () => new Date().toISOString(),
  initialEvents = [],
} = {}) {
  let n8nAvailable = true;
  const seededEvents = initialEvents.map((event, index) => ({
    id: `EVT-${String(index + 1).padStart(6, '0')}`,
    type: event.type,
    payload: JSON.parse(JSON.stringify(event.payload ?? {})),
    status: 'delivered',
    createdAt: event.createdAt ?? now(),
    deliveredAt: event.createdAt ?? now(),
    isSynthetic: true,
  }));
  const seededDeliveries = seededEvents.map((event) => ({
    id: `DEL-${event.id}`,
    eventId: event.id,
    eventType: event.type,
    deliveredAt: event.deliveredAt,
    status: 'delivered',
    isSynthetic: true,
  }));
  let sequence = seededEvents.length;
  let eventLog = JSON.parse(JSON.stringify(seededEvents));
  let deliveryLog = JSON.parse(JSON.stringify(seededDeliveries));

  if (typeof localStorage !== 'undefined') {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      const state = JSON.parse(persisted);
      if (
        state?.version !== 1 ||
        typeof state.n8nAvailable !== 'boolean' ||
        !Number.isInteger(state.sequence) ||
        !Array.isArray(state.events) ||
        !Array.isArray(state.deliveries)
      ) {
        throw new TypeError(
          'The persisted mock event queue has an unsupported shape. Use api.reset().',
        );
      }
      n8nAvailable = state.n8nAvailable;
      sequence = state.sequence;
      eventLog = state.events;
      deliveryLog = state.deliveries;
    } else {
      persist();
    }
  }

  function persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          n8nAvailable,
          sequence,
          events: eventLog,
          deliveries: deliveryLog,
        }),
      );
    }
  }

  function deliverPending() {
    const pending = eventLog.filter((event) => event.status === 'queued');
    pending.forEach((event) => {
      event.status = 'delivered';
      event.deliveredAt = now();
      deliveryLog.unshift({
        id: `DEL-${event.id}`,
        eventId: event.id,
        eventType: event.type,
        deliveredAt: event.deliveredAt,
        status: 'delivered',
      });
    });
    return pending.length;
  }

  return Object.freeze({
    publish(type, payload = {}) {
      if (typeof type !== 'string' || !type.trim()) {
        throw new TypeError('An event type is required.');
      }
      const event = {
        id: `EVT-${String(++sequence).padStart(6, '0')}`,
        type,
        payload: JSON.parse(JSON.stringify(payload)),
        status: n8nAvailable ? 'delivered' : 'queued',
        createdAt: now(),
        deliveredAt: null,
      };
      eventLog.unshift(event);
      if (n8nAvailable) {
        event.deliveredAt = now();
        deliveryLog.unshift({
          id: `DEL-${event.id}`,
          eventId: event.id,
          eventType: event.type,
          deliveredAt: event.deliveredAt,
          status: 'delivered',
        });
      }
      persist();
      return JSON.parse(JSON.stringify(event));
    },
    setAvailable(available) {
      n8nAvailable = Boolean(available);
      const delivered = n8nAvailable ? deliverPending() : 0;
      persist();
      return {
        available: n8nAvailable,
        queued: eventLog.filter((event) => event.status === 'queued').length,
        delivered,
      };
    },
    status() {
      return {
        n8nAvailable,
        state: n8nAvailable ? 'online' : 'down',
        queued: eventLog.filter((event) => event.status === 'queued').length,
        delivered: deliveryLog.length,
      };
    },
    listEvents() {
      return JSON.parse(JSON.stringify(eventLog));
    },
    listDeliveries() {
      return JSON.parse(JSON.stringify(deliveryLog));
    },
    templates() {
      return [
        {
          id: 'complaint-submitted',
          name: 'Complaint submitted',
          event: 'complaint.submitted',
          active: true,
        },
        { id: 'sla-warning', name: 'SLA warning', event: 'sla.warning', active: true },
        { id: 'sla-breach', name: 'SLA breach', event: 'sla.breach', active: true },
        {
          id: 'verification-timeout',
          name: 'Verification timeout',
          event: 'verification.timeout',
          active: true,
        },
      ];
    },
    reset() {
      n8nAvailable = true;
      sequence = seededEvents.length;
      eventLog = JSON.parse(JSON.stringify(seededEvents));
      deliveryLog = JSON.parse(JSON.stringify(seededDeliveries));
      persist();
    },
  });
}
