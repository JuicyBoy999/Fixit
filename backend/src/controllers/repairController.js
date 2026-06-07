import * as repairModel from '../models/repairModel.js';

export const createRepairBooking = async (req, res) => {
  try {
    const {
      deviceName,
      issueDescription,
      city,
      preferredDate,
      contactName,
      contactPhone,
      contactEmail,
      address,
    } = req.body;

    if (!deviceName || !issueDescription || !city || !preferredDate || !contactName || !contactPhone || !contactEmail) {
      return res.status(400).json({ message: 'Please complete all required booking details' });
    }

    if (!/^\d{10}$/.test(contactPhone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const booking = await repairModel.createRepair({
      userId: req.user.id,
      deviceName,
      issueDescription,
      city,
      preferredDate,
      contactName,
      contactPhone,
      contactEmail,
      address,
    });

    res.status(201).json({
      message: 'Repair booked successfully',
      repair: booking,
    });
  } catch (error) {
    console.error('Error creating repair booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRepairHistory = async (req, res) => {
  try {
    const repairs = await repairModel.getRepairsByUserId(req.user.id);
    res.json({ repairs });
  } catch (error) {
    console.error('Error fetching repair history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
