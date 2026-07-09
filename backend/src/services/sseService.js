// Simple in-memory client manager for SSE
// In production with multiple instances, this would use Redis pub/sub
const clients = new Map();

/**
 * Register a client for status updates on a specific repair ID.
 */
export const registerClient = (repairId, res) => {
  if (!clients.has(repairId)) {
    clients.set(repairId, []);
  }
  clients.get(repairId).push(res);

  // Remove client when connection closes
  res.on('close', () => {
    const repairClients = clients.get(repairId);
    if (repairClients) {
      const filtered = repairClients.filter(client => client !== res);
      if (filtered.length === 0) {
        clients.delete(repairId);
      } else {
        clients.set(repairId, filtered);
      }
    }
  });
};

/**
 * Broadcast a status update to all clients watching a repair ID.
 */
export const broadcastStatusUpdate = (repairId, status) => {
  const repairClients = clients.get(repairId);
  if (repairClients) {
    const data = JSON.stringify({ repairId, status, timestamp: new Date() });
    repairClients.forEach(res => {
      res.write(`data: ${data}\n\n`);
    });
  }
};
