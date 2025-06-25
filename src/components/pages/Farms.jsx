import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import FarmCard from '@/components/organisms/FarmCard';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';
import taskService from '@/services/api/taskService';

const FarmForm = ({ farm, onSubmit, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    sizeUnit: 'acres'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const sizeUnits = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'sq ft', label: 'Square Feet' }
  ];

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || '',
        location: farm.location || '',
        size: farm.size?.toString() || '',
        sizeUnit: farm.sizeUnit || 'acres'
      });
    } else {
      setFormData({
        name: '',
        location: '',
        size: '',
        sizeUnit: 'acres'
      });
    }
    setErrors({});
  }, [farm, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Farm name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.size || isNaN(formData.size) || parseFloat(formData.size) <= 0) {
      newErrors.size = 'Valid size is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size)
      };

      await onSubmit(farmData);
      toast.success(farm ? 'Farm updated successfully' : 'Farm added successfully');
    } catch (error) {
      toast.error('Failed to save farm');
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
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {farm ? 'Edit Farm' : 'Add New Farm'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Farm Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Greenfield Farm"
              error={errors.name}
              required
            />

            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Valley County, Montana"
              error={errors.location}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Size"
                type="number"
                name="size"
                value={formData.size}
                onChange={handleChange}
                min="0"
                step="0.1"
                error={errors.size}
                required
              />

              <Select
                label="Unit"
                name="sizeUnit"
                value={formData.sizeUnit}
                onChange={handleChange}
                options={sizeUnits}
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
                icon={farm ? 'Save' : 'Plus'}
              >
                {farm ? 'Update Farm' : 'Add Farm'}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [farmStats, setFarmStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const [farmsData, cropsData, tasksData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll()
      ]);

      setFarms(farmsData);

      // Calculate stats for each farm
      const stats = {};
      farmsData.forEach(farm => {
        const farmCrops = cropsData.filter(c => c.farmId === farm.Id);
        const farmTasks = tasksData.filter(t => t.farmId === farm.Id && !t.completed);
        stats[farm.Id] = {
          cropCount: farmCrops.length,
          taskCount: farmTasks.length
        };
      });
      setFarmStats(stats);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = () => {
    setEditingFarm(null);
    setShowForm(true);
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setShowForm(true);
  };

  const handleDeleteFarm = async (farm) => {
    if (!confirm(`Are you sure you want to delete ${farm.name}? This will also delete all associated crops and tasks.`)) {
      return;
    }

    try {
      await farmService.delete(farm.Id);
      setFarms(prev => prev.filter(f => f.Id !== farm.Id));
      toast.success('Farm deleted successfully');
    } catch (error) {
      toast.error('Failed to delete farm');
    }
  };

  const handleSubmitForm = async (farmData) => {
    if (editingFarm) {
      const updatedFarm = await farmService.update(editingFarm.Id, farmData);
      setFarms(prev => prev.map(f => f.Id === editingFarm.Id ? updatedFarm : f));
    } else {
      const newFarm = await farmService.create(farmData);
      setFarms(prev => [...prev, newFarm]);
    }
    setShowForm(false);
    setEditingFarm(null);
  };

  const filteredFarms = farms.filter(farm =>
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonLoader type="card" className="h-8 w-48" />
          <SkeletonLoader type="card" className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonLoader type="card" count={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Farms"
          message={error}
          onRetry={loadFarms}
        />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600">Manage your farms and properties</p>
        </div>
        <Button
          onClick={handleAddFarm}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Farm
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search farms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="Search"
        />
      </div>

      {/* Farms Grid */}
      {filteredFarms.length === 0 ? (
        <EmptyState
          icon="MapPin"
          title={searchTerm ? 'No farms found' : 'No farms yet'}
          description={
            searchTerm 
              ? 'Try adjusting your search terms.' 
              : 'Add your first farm to start tracking your agricultural operations.'
          }
          actionLabel={!searchTerm ? 'Add Your First Farm' : undefined}
          onAction={!searchTerm ? handleAddFarm : undefined}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredFarms.map((farm) => (
            <motion.div key={farm.Id} variants={itemVariants}>
              <FarmCard
                farm={farm}
                cropCount={farmStats[farm.Id]?.cropCount || 0}
                taskCount={farmStats[farm.Id]?.taskCount || 0}
                onEdit={handleEditFarm}
                onDelete={handleDeleteFarm}
                onViewDetails={() => {
                  toast.info('Farm details view coming soon!');
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Farm Form Modal */}
      <FarmForm
        farm={editingFarm}
        isOpen={showForm}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setEditingFarm(null);
        }}
      />
    </motion.div>
  );
};

export default Farms;