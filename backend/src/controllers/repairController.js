import * as repairModel from '../models/repairModel.js';
import { notifyTechnicians, sendPaymentConfirmationEmail } from '../services/notificationService.js';
import { registerClient, broadcastStatusUpdate } from '../services/sseService.js';
import { getUserById } from '../models/userModel.js';

export const createRepairBooking = async (req, res) => {
  try {
    const {
      deviceName, issueDescription, city, preferredDate,
      contactName, contactPhone, contactEmail, address,
    } = req.body;

    if (!deviceName || !issueDescription || !city || !preferredDate || !contactName || !contactPhone || !contactEmail) {
      return res.status(400).json({ message: 'Please complete all required booking details' });
    }

    if (!/^\d{10}$/.test(contactPhone)) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }

    const booking = await repairModel.createRepair({
      userId: req.user.id, deviceName, issueDescription, city,
      preferredDate, contactName, contactPhone, contactEmail, address,
    });

    notifyTechnicians(booking).catch(err => console.error('Notification failed:', err));

    res.status(201).json({ message: 'Repair booked successfully', repair: booking });
  } catch (error) {
    console.error('Error creating repair booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedRepair = await repairModel.updateRepairStatus(id, status);
    if (!updatedRepair) {
      return res.status(404).json({ message: 'Repair not found' });
    }

    broadcastStatusUpdate(id, status);

    if (status === 'completed') {
      const customer = await getUserById(updatedRepair.user_id);
      if (customer) {
        sendPaymentConfirmationEmail(customer.email, customer.first_name, updatedRepair)
          .catch(err => console.error('Payment confirmation email failed:', err));
      }
    }

    res.json({ message: 'Status updated successfully', repair: updatedRepair });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const subscribeToUpdates = async (req, res) => {
  const { id } = req.params;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  registerClient(id, res);
  res.write('data: {"connected": true}\n\n');
};

export const getRepairDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const repair = await repairModel.getRepairById(id);
    if (!repair) return res.status(404).json({ message: 'Repair request not found' });
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