import jwt from 'jsonwebtoken';
import { getUserById } from '../models/userModel.js';

export default async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Account not found' });
    }

    if (user.status === 'suspended' || user.status === 'deactivated') {
      return res.status(403).json({ message: 'Account access has been suspended. Contact FixIt support for assistance.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
