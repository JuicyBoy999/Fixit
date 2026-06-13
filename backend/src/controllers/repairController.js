import * as repairModel from '../models/repairModel.js';
import { notifyTechnicians } from '../services/notificationService.js';

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

    // Notify matching technicians in the background
    // We don't await here to keep the response fast for the user
    notifyTechnicians(booking).catch(err => console.error('Notification failed:', err));

    res.status(201).json({
      message: 'Repair booked successfully',
      repair: booking,
    });
  } catch (error) {
    console.error('Error creating repair booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getRepairDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const repair = await repairModel.getRepairById(id);
    
    if (!repair) {
      return res.status(404).json({ message: 'Repair request not found' });
    }

    // Security: Only the owner, an admin, or potentially a technician (later) can view
    // For now, let's allow it if they have a valid token (authMiddleware is already used in routes)
    res.json({ repair });
  } catch (error) {
    console.error('Error fetching repair details:', error);
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
