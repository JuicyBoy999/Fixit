require('dotenv').config();
const express = require('express');
const cors = require('cors');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => res.json({ message: 'server works' }));
const resetRoutes = require('./routes/resetRoutes');
app.use('/api/auth', resetRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
console.log('Admin routes registered');
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));