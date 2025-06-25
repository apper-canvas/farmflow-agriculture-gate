import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import farmService from '@/services/api/farmService';

const CropForm = ({ crop, onSubmit, onCancel, isOpen }) => {
const [formData, setFormData] = useState({
    farmId: '',
    name: '',
    cropType: '',
    field: '',
    plantingDate: '',
    expectedHarvest: '',
    quantity: '',
    status: 'planted'
  });
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const cropTypes = [
    { value: 'Corn', label: 'Corn' },
    { value: 'Wheat', label: 'Wheat' },
    { value: 'Soybeans', label: 'Soybeans' },
    { value: 'Tomatoes', label: 'Tomatoes' },
    { value: 'Lettuce', label: 'Lettuce' },
    { value: 'Carrots', label: 'Carrots' },
    { value: 'Potatoes', label: 'Potatoes' },
    { value: 'Rice', label: 'Rice' }
  ];

  const statusOptions = [
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'harvested', label: 'Harvested' }
  ];

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const farmsData = await farmService.getAll();
        setFarms(farmsData);
      } catch (error) {
        toast.error('Failed to load farms');
      }
    };
    
    if (isOpen) {
      loadFarms();
    }
  }, [isOpen]);

  useEffect(() => {
if (crop) {
      setFormData({
        farmId: crop.farmId?.toString() || '',
        name: crop.name || '',
        cropType: crop.cropType || '',
        field: crop.field || '',
        plantingDate: crop.plantingDate ? format(new Date(crop.plantingDate), 'yyyy-MM-dd') : '',
        expectedHarvest: crop.expectedHarvest ? format(new Date(crop.expectedHarvest), 'yyyy-MM-dd') : '',
        quantity: crop.quantity?.toString() || '',
        status: crop.status || 'planted'
      });
    } else {
      setFormData({
        farmId: '',
        name: '',
        cropType: '',
        field: '',
        plantingDate: '',
        expectedHarvest: '',
        quantity: '',
        status: 'planted'
      });
    }
    setErrors({});
  }, [crop, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
if (!formData.farmId) newErrors.farmId = 'Farm is required';
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.cropType) newErrors.cropType = 'Crop type is required';
    if (!formData.field) newErrors.field = 'Field is required';
    if (!formData.plantingDate) newErrors.plantingDate = 'Planting date is required';
    if (!formData.expectedHarvest) newErrors.expectedHarvest = 'Expected harvest date is required';
    if (!formData.quantity || isNaN(formData.quantity) || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (formData.plantingDate && formData.expectedHarvest) {
      const plantingDate = new Date(formData.plantingDate);
      const harvestDate = new Date(formData.expectedHarvest);
      if (harvestDate <= plantingDate) {
        newErrors.expectedHarvest = 'Harvest date must be after planting date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const cropData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        quantity: parseFloat(formData.quantity),
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvest: new Date(formData.expectedHarvest).toISOString()
      };

      await onSubmit(cropData);
      toast.success(crop ? 'Crop updated successfully' : 'Crop added successfully');
    } catch (error) {
      toast.error('Failed to save crop');
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {crop ? 'Edit Crop' : 'Add New Crop'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

<form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Farm"
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              options={farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))}
              error={errors.farmId}
              required
            />

            <Input
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Spring Corn 2024, Greenhouse Tomatoes"
              error={errors.name}
              required
            />

            <Select
              label="Crop Type"
              name="cropType"
              value={formData.cropType}
              onChange={handleChange}
              options={cropTypes}
              error={errors.cropType}
              required
            />
            <Input
              label="Field"
              name="field"
              value={formData.field}
              onChange={handleChange}
              placeholder="e.g., North Field, Greenhouse A"
              error={errors.field}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Planting Date"
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
                error={errors.plantingDate}
                required
              />

              <Input
                label="Expected Harvest"
                type="date"
                name="expectedHarvest"
                value={formData.expectedHarvest}
                onChange={handleChange}
                error={errors.expectedHarvest}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity (acres)"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="0.1"
                error={errors.quantity}
                required
              />

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-surface-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={crop ? 'Save' : 'Plus'}
              >
                {crop ? 'Update Crop' : 'Add Crop'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CropForm;