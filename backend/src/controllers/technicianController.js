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

export const getMyTechnicianProfile = async (req, res) => {
  try {
    const technician = await technicianModel.getTechnicianByUserId(req.user.id);
    if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
    res.json({ technician });
  } catch (error) {
    console.error('Error fetching own technician profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMyTechnicianProfile = async (req, res) => {
  try {
    const { title, bio, skills, years_experience, hourly_rate } = req.body;
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : undefined;

    const technician = await technicianModel.updateTechnicianProfileByUserId(req.user.id, {
      title, bio, skills: skillsArray, years_experience, hourly_rate,
    });
    if (!technician) return res.status(404).json({ message: 'Technician profile not found' });
    res.json({ technician });
  } catch (error) {
    console.error('Error updating own technician profile:', error);
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
