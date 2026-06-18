import { upsertServiceArea, getServiceArea } from '../models/serviceAreaModel.js';

export const saveServiceArea = async (req, res) => {
  try {
    const technicianId = req.user?.id;
    if (!technicianId) return res.status(401).json({ error: 'Unauthorized' });

    const { baseLocation, radius } = req.body;
    if (!baseLocation || !radius) {
      return res.status(400).json({ error: 'baseLocation and radius are required' });
    }

    const area = await upsertServiceArea(technicianId, baseLocation, radius);
    res.json({ success: true, area });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const fetchServiceArea = async (req, res) => {
  try {
    const technicianId = req.user?.id;
    if (!technicianId) return res.status(401).json({ error: 'Unauthorized' });

    const area = await getServiceArea(technicianId);
    res.json({ area: area || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};