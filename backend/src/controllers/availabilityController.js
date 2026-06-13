
import {
  getWorkingHours,
  upsertWorkingHours,
  getUnavailableDates,
  addUnavailableDate,
  removeUnavailableDate,
  getSlotsForDate,
  getTechniciansWithAvailability
} from '../models/availabilityModel.js';

export const fetchWorkingHours = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const hours = await getWorkingHours(technicianId);
    return res.status(200).json({ hours });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};


export const saveWorkingHours = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { schedule } = req.body;

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return res.status(400).json({ message: 'schedule array is required' });
    }

    const saved = [];
    for (const { dayOfWeek, startTime, endTime, isActive } of schedule) {
      if (dayOfWeek === undefined || !startTime || !endTime) {
        return res.status(400).json({ message: 'Each entry needs dayOfWeek, startTime, endTime' });
      }
      const row = await upsertWorkingHours(technicianId, dayOfWeek, startTime, endTime, isActive ?? true);
      saved.push(row);
    }

    return res.status(200).json({ message: 'Working hours saved', hours: saved });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};


export const fetchUnavailableDates = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const dates = await getUnavailableDates(technicianId);
    return res.status(200).json({ dates });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};

export const blockDate = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { date, reason } = req.body;

    if (!date) return res.status(400).json({ message: 'date is required (YYYY-MM-DD)' });

    const row = await addUnavailableDate(technicianId, date, reason);
    if (!row) return res.status(409).json({ message: 'Date already blocked' });

    return res.status(201).json({ message: 'Date blocked', entry: row });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};

export const unblockDate = async (req, res) => {
  try {
    const { technicianId, date } = req.params;
    const row = await removeUnavailableDate(technicianId, date);
    if (!row) return res.status(404).json({ message: 'No block found for that date' });
    return res.status(200).json({ message: 'Date unblocked' });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};


export const fetchSlots = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const { date } = req.query;

    if (!date) return res.status(400).json({ message: 'date query param required (YYYY-MM-DD)' });

    const slots = await getSlotsForDate(technicianId, date);
    return res.status(200).json({ date, slots });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};
export const fetchTechnicians = async (req, res) => {
  try {
    const technicians = await getTechniciansWithAvailability();
    return res.status(200).json({ technicians });
  } catch (e) {
    res.status(500).json({ message: 'Something went wrong', error: e.message });
  }
};