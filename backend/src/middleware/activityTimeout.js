let sessions = new Map();

module.exports = (req, res, next) => {
  const userId = req.user.id;
  const now = Date.now();
  const timeout = 15 * 60 * 1000; 

  if (!sessions.has(userId)) {
    sessions.set(userId, now);
  } else {
    const lastActivity = sessions.get(userId);
    if (now - lastActivity > timeout) {
      sessions.delete(userId);
      return res.status(440).json({ message: 'Session expired due to inactivity' });
    }
    sessions.set(userId, now);
  }
  next();
};
