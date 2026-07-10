const clients = new Map();

export const registerClient = (repairId, res) => {
  if (!clients.has(repairId)) {
    clients.set(repairId, []);
  }
  clients.get(repairId).push(res);

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

export const broadcastStatusUpdate = (repairId, status) => {
  const repairClients = clients.get(repairId);
  if (repairClients) {
    const data = JSON.stringify({ repairId, status, timestamp: new Date() });
    repairClients.forEach(res => {
      res.write(`data: ${data}\n\n`);
    });
  }
};
