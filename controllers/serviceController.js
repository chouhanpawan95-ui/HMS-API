// controllers/serviceController.js
const Service = require('../models/service');

// Helper: generate next serviceId
async function generateNextServiceId() {
  const lastService = await Service.findOne({ serviceId: { $regex: '^S\\d+$' } }).sort({ serviceId: -1 }).lean();
  let nextId = 'S0001';
  if (lastService && lastService.serviceId) {
    const lastNumber = parseInt(lastService.serviceId.replace(/^S/, ''), 10) || 0;
    const newNumber = (lastNumber + 1).toString().padStart(4, '0');
    nextId = `S${newNumber}`;
  } else {
    const all = await Service.find({ serviceId: { $regex: '^S\\d+$' } }).select('serviceId').lean();
    if (all.length) {
      let max = 0;
      all.forEach(s => {
        const n = parseInt((s.serviceId || '').replace(/^S/, ''), 10) || 0;
        if (n > max) max = n;
      });
      const newNumber = (max + 1).toString().padStart(4, '0');
      nextId = `S${newNumber}`;
    }
  }
  return nextId;
}

// Create new service
exports.createService = async (req, res) => {
  try {
    const data = req.body;
    console.log('Creating service with data:', data);
    
    if (!data.serviceId) {
      try {
        data.serviceId = await generateNextServiceId();
        console.log('Generated serviceId:', data.serviceId);
      } catch (genErr) {
        console.error('Error generating serviceId:', genErr);
        return res.status(500).json({ message: 'Error generating serviceId', error: genErr.message });
      }
    }
    
    const existing = await Service.findOne({ serviceId: data.serviceId });
    if (existing) {
      return res.status(409).json({ message: 'serviceId already exists' });
    }
    
    const service = new Service(data);
    const validationError = service.validateSync();
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(validationError.errors).map(err => err.message)
      });
    }
    
    const savedService = await service.save();
    console.log('Service saved:', savedService);
    return res.status(201).json(savedService);
  } catch (err) {
    console.error('Error creating service:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(err.errors).map(error => error.message)
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key error', error: err.message });
    }
    return res.status(500).json({ message: 'Server error while creating service', error: err.message });
  }
};

// Get all services with optional search
exports.getServices = async (req, res) => {
  try {
    const { page = 1, limit = 25, q } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { serviceId: new RegExp(q, 'i') },
          { FK_CategoryId: new RegExp(q, 'i') },
        { ServiceName: new RegExp(q, 'i') },
        { ServiceCode: new RegExp(q, 'i') }
      ];
    }
    console.log('Fetching services with filter:', filter);
    
    const services = await Service.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    
    const total = await Service.countDocuments(filter);
    console.log(`Found ${services.length} services out of ${total} total`);
    
    return res.json({ data: services, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('Error fetching services:', err);
    return res.status(500).json({ message: 'Error fetching services', error: err.message });
  }
};

// Get next serviceId
exports.getNextServiceId = async (req, res) => {
  try {
    const nextId = await generateNextServiceId();
    return res.json({ serviceId: nextId });
  } catch (err) {
    console.error('Error getting next serviceId:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get service by id
exports.getServiceById = async (req, res) => {
  try {
    const query = /^[0-9a-fA-F]{24}$/.test(req.params.id)
      ? { _id: req.params.id }
      : { serviceId: req.params.id };
    const service = await Service.findOne(query);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    return res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const service = (await Service.findById(id)) || (await Service.findOne({ serviceId: id }));
    if (!service) return res.status(404).json({ message: 'Service not found' });
    Object.assign(service, data);
    await service.save();
    return res.json(service);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = (await Service.findByIdAndDelete(id)) || (await Service.findOneAndDelete({ serviceId: id }));
    if (!service) return res.status(404).json({ message: 'Service not found' });
    return res.json({ message: 'Deleted', id: service._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};
