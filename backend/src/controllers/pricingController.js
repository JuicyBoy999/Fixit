import { pricingConfig } from '../config/pricing.js';

export const getEstimate = async (req, res) => {
  try {
    const { deviceType } = req.query;

    if (!deviceType) {
      return res.status(400).json({ message: 'Device type is required for estimate' });
    }

    const multiplier = pricingConfig.deviceLabourMultipliers[deviceType] || 1.0;
    const labourCost = pricingConfig.baseLabourRate * multiplier;
    const callOutFee = pricingConfig.callOutFee;
    const partsEstimate = pricingConfig.partEstimates[deviceType] || 'Varies';
    
    const subtotal = labourCost + callOutFee;

    res.json({
      estimate: {
        deviceType,
        items: [
          { label: 'Labour Fee', amount: labourCost, type: 'fixed' },
          { label: 'Call-out Fee', amount: callOutFee, type: 'fixed' },
          { label: 'Parts & Components', amount: partsEstimate, type: 'variable' }
        ],
        subtotal,
        totalNote: 'Total excludes variable part costs'
      }
    });
  } catch (error) {
    console.error('Error calculating estimate:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
