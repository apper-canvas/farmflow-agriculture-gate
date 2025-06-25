import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import EmptyState from '@/components/molecules/EmptyState';
import CropForm from '@/components/organisms/CropForm';
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';

const CropCard = ({ crop, farm, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'planted': return 'info';
      case 'growing': return 'success';
      case 'harvested': return 'warning';
      default: return 'default';
    }
  };

  const getCropIcon = (cropType) => {
    switch (cropType.toLowerCase()) {
      case 'corn': return 'Wheat';
      case 'wheat': return 'Wheat';
      case 'soybeans': return 'Sprout';
      case 'tomatoes': return 'Apple';
      case 'lettuce': return 'Leaf';
      case 'carrots': return 'Carrot';
      case 'potatoes': return 'Cookie';
      default: return 'Sprout';
    }
  };

  const daysToHarvest = differenceInDays(new Date(crop.expectedHarvest), new Date());
  const isOverdue = daysToHarvest < 0 && crop.status !== 'harvested';
  const harvestText = isOverdue 
    ? `${Math.abs(daysToHarvest)} days overdue`
    : `${daysToHarvest} days to harvest`;

  const cardMotion = {
    whileHover: { scale: 1.02, y: -4 },
    transition: { duration: 0.2 }
  };

  return (
    <motion.div {...cardMotion}>
      <Card className="hover:shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <ApperIcon name={getCropIcon(crop.cropType)} size={24} className="text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{crop.cropType}</h3>
              <p className="text-sm text-gray-600">{crop.field}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon="Edit"
              onClick={() => onEdit?.(crop)}
              className="text-gray-400 hover:text-primary"
            />
            <Button
              variant="ghost"
              size="sm"
              icon="Trash2"
              onClick={() => onDelete?.(crop)}
              className="text-gray-400 hover:text-error"
            />
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Farm</span>
            <span className="text-sm font-medium text-gray-900">{farm?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Quantity</span>
            <span className="text-sm font-medium text-gray-900">{crop.quantity} acres</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Planted</span>
            <span className="text-sm font-medium text-gray-900">
              {format(new Date(crop.plantingDate), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <Badge variant={getStatusColor(crop.status)} size="sm">
              {crop.status}
            </Badge>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon 
                name={isOverdue ? "AlertTriangle" : "Calendar"} 
                size={14} 
                className={isOverdue ? "text-error" : "text-gray-500"} 
              />
              <span className={`text-sm ${isOverdue ? "text-error font-medium" : "text-gray-600"}`}>
                {harvestText}
              </span>
            </div>
            {crop.status !== 'harvested' && (
              <Button variant="outline" size="sm">
                {crop.status === 'planted' ? 'Mark Growing' : 'Mark Harvested'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [farmFilter, setFarmFilter] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'harvested', label: 'Harvested' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);

      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = () => {
    setEditingCrop(null);
    setShowForm(true);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDeleteCrop = async (crop) => {
    if (!confirm(`Are you sure you want to delete ${crop.cropType} from ${crop.field}?`)) {
      return;
    }

    try {
      await cropService.delete(crop.Id);
      setCrops(prev => prev.filter(c => c.Id !== crop.Id));
      toast.success('Crop deleted successfully');
    } catch (error) {
      toast.error('Failed to delete crop');
    }
  };

  const handleSubmitForm = async (cropData) => {
    if (editingCrop) {
      const updatedCrop = await cropService.update(editingCrop.Id, cropData);
      setCrops(prev => prev.map(c => c.Id === editingCrop.Id ? updatedCrop : c));
    } else {
      const newCrop = await cropService.create(cropData);
      setCrops(prev => [...prev, newCrop]);
    }
    setShowForm(false);
    setEditingCrop(null);
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.cropType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crop.field.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    const matchesFarm = farmFilter === 'all' || crop.farmId === parseInt(farmFilter, 10);
    
    return matchesSearch && matchesStatus && matchesFarm;
  });

  const farmOptions = [
    { value: 'all', label: 'All Farms' },
    ...farms.map(farm => ({ value: farm.Id.toString(), label: farm.name }))
  ];

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
          title="Failed to Load Crops"
          message={error}
          onRetry={loadData}
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
          <h1 className="text-2xl font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600">Track your planted crops and harvest schedules</p>
        </div>
        <Button
          onClick={handleAddCrop}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Crop
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Search crops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon="Search"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={statusOptions}
        />
        <Select
          value={farmFilter}
          onChange={(e) => setFarmFilter(e.target.value)}
          options={farmOptions}
        />
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          icon="Sprout"
          title={crops.length === 0 ? 'No crops yet' : 'No crops found'}
          description={
            crops.length === 0
              ? 'Start by planting your first crop to track growth and harvest schedules.'
              : 'Try adjusting your search and filter criteria.'
          }
          actionLabel={crops.length === 0 ? 'Plant Your First Crop' : undefined}
          onAction={crops.length === 0 ? handleAddCrop : undefined}
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCrops.map((crop) => {
            const farm = farms.find(f => f.Id === crop.farmId);
            return (
              <motion.div key={crop.Id} variants={itemVariants}>
                <CropCard
                  crop={crop}
                  farm={farm}
                  onEdit={handleEditCrop}
                  onDelete={handleDeleteCrop}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Crop Form Modal */}
      <CropForm
        crop={editingCrop}
        isOpen={showForm}
        onSubmit={handleSubmitForm}
        onCancel={() => {
          setShowForm(false);
          setEditingCrop(null);
        }}
      />
    </motion.div>
  );
};

export default Crops;