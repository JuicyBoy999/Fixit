import * as technicianModel from '../models/technicianModel.js';

export const listTechnicians = async (_req, res) => {
  try {
    const technicians = await technicianModel.getTechnicians();
    res.json({ technicians });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getTechnicianProfile = async (req, res) => {
  try {
    const technician = await technicianModel.getTechnicianById(req.params.id);

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    res.json({ technician });
  } catch (error) {
    console.error('Error fetching technician profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
