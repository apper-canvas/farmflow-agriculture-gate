import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { equipmentService } from "@/services/api/equipmentService";
import { addEquipment, removeEquipment, setEquipment, setEquipmentError, setEquipmentLoading, setEquipmentStats, updateEquipment } from "@/store/equipmentSlice";
import ApperIcon from "@/components/ApperIcon";
import ErrorState from "@/components/molecules/ErrorState";
import StatCard from "@/components/molecules/StatCard";
import EmptyState from "@/components/molecules/EmptyState";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Equipment = () => {
  const dispatch = useDispatch();
  const { items, loading, error, stats } = useSelector(state => state.equipment || {
    items: [],
    loading: { items: false },
    error: { items: null },
    stats: { totalEquipment: 0, activeEquipment: 0, maintenanceDue: 0, totalValue: 0 }
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    equipment_type: '',
    serial_number: '',
    purchase_price: '',
    current_value: '',
    status: 'Active',
    maintenance_status: 'Up to Date',
    fuel_type: '',
    location: '',
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    loadEquipmentData();
    loadEquipmentTypes();
  }, []);

  const loadEquipmentData = async () => {
    dispatch(setEquipmentLoading(true));
    
    try {
      const [equipmentData, statsData] = await Promise.all([
        equipmentService.getAllEquipment(),
        equipmentService.getEquipmentStats()
      ]);

      dispatch(setEquipment(equipmentData));
      dispatch(setEquipmentStats(statsData));
    } catch (error) {
      console.error('Error loading equipment data:', error);
      dispatch(setEquipmentError(error.message || 'Failed to load equipment data'));
      toast.error('Failed to load equipment data');
    } finally {
      dispatch(setEquipmentLoading(false));
    }
  };

  const loadEquipmentTypes = async () => {
    try {
      const types = equipmentService.getEquipmentTypes();
      setEquipmentTypes(types);
    } catch (error) {
      console.error('Error loading equipment types:', error);
    }
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setFormData({
      name: '',
      model: '',
      manufacturer: '',
      equipment_type: '',
      serial_number: '',
      purchase_price: '',
      current_value: '',
      status: 'Active',
      maintenance_status: 'Up to Date',
      fuel_type: '',
      location: '',
      notes: ''
    });
    setShowEquipmentForm(true);
  };

const handleEditEquipment = (equipment) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name || '',
      model: equipment.model || '',
      manufacturer: equipment.manufacturer || '',
      equipment_type: equipment.equipment_type || '',
      serial_number: equipment.serial_number || '',
      purchase_price: equipment.purchase_price || '',
      current_value: equipment.current_value || '',
      status: equipment.status || 'Active',
      maintenance_status: equipment.maintenance_status || 'Up to Date',
      fuel_type: equipment.fuel_type || '',
      location: equipment.location || '',
      notes: equipment.notes || ''
    });
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await equipmentService.deleteEquipment(equipmentId);
      
      // Update Redux state
      dispatch(removeEquipment(equipmentId));
      toast.success('Equipment deleted successfully');
      
      // Reload stats
      const statsData = await equipmentService.getEquipmentStats();
      dispatch(setEquipmentStats(statsData));
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error(error.message || 'Failed to delete equipment');
    }
  };

const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (editingEquipment) {
        // Update existing equipment
        result = await equipmentService.updateEquipment(editingEquipment.Id, {
          ...formData,
          purchase_price: parseFloat(formData.purchase_price) || 0,
          current_value: parseFloat(formData.current_value) || 0
        });
        
        // Update Redux state
        dispatch(updateEquipment(result));
        toast.success('Equipment updated successfully');
      } else {
        // Create new equipment
        result = await equipmentService.createEquipment({
          ...formData,
          purchase_price: parseFloat(formData.purchase_price) || 0,
          current_value: parseFloat(formData.current_value) || 0
        });
        
        // Update Redux state
        dispatch(addEquipment(result));
        toast.success('Equipment created successfully');
      }

      setShowEquipmentForm(false);
      setEditingEquipment(null);
      
      // Reload stats
      const statsData = await equipmentService.getEquipmentStats();
      dispatch(setEquipmentStats(statsData));
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast.error(error.message || 'Failed to save equipment');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getMaintenanceStatus = (equipment) => {
    const status = equipment.maintenance_status;
    if (status === 'Maintenance Due') {
      return { color: 'warning', label: 'Maintenance Due' };
    } else if (status === 'In Service') {
      return { color: 'error', label: 'In Service' };
    } else {
      return { color: 'success', label: 'Up to Date' };
    }
  };

  const getOperationalStatus = (equipment) => {
    const status = equipment.status;
    if (status === 'Under Repair') {
      return { color: 'error', label: 'Under Repair' };
    } else if (status === 'Inactive') {
      return { color: 'warning', label: 'Inactive' };
    } else {
      return { color: 'success', label: 'Active' };
    }
  };

// Filter equipment based on search and filters
  const filteredEquipment = items.filter(equipment => {
    const matchesSearch = !searchTerm || 
      equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || equipment.equipment_type === filterType;
    const matchesStatus = !filterStatus || equipment.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading.items) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <SkeletonLoader className="w-32 h-10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-24" />
          ))}
        </div>
        <SkeletonLoader className="h-96" />
      </div>
    );
  }

  if (error.items) {
    return <ErrorState message={error.items} onRetry={loadEquipmentData} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <p className="text-gray-600 mt-1">Track and manage farm equipment, machinery, and maintenance schedules</p>
        </div>
        <Button onClick={handleAddEquipment} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Equipment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Equipment Types</option>
            {equipmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Repair">Under Repair</option>
            <option value="Inactive">Inactive</option>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('');
                setFilterStatus('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="Wrench"
          title="Total Equipment"
          value={stats.totalEquipment}
          subtitle="pieces of equipment"
          color="primary"
        />
        <StatCard
          icon="CheckCircle"
          title="Active Equipment"
          value={stats.activeEquipment}
          subtitle="currently operational"
          color="success"
        />
        <StatCard
          icon="AlertTriangle"
          title="Maintenance Due"
          value={stats.maintenanceDue}
          subtitle="requires attention"
          color="warning"
        />
        <StatCard
          icon="DollarSign"
          title="Total Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="current valuation"
          color="accent"
        />
      </div>

      {/* Equipment List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Equipment Inventory</h2>
        </div>

        {filteredEquipment.length === 0 ? (
          <EmptyState
            icon="Wrench"
            title="No equipment found"
            description="Start by adding your first piece of equipment to track machinery and maintenance."
            action={
              <Button onClick={handleAddEquipment} className="flex items-center gap-2">
                <ApperIcon name="Plus" size={16} />
                Add First Equipment
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maintenance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
{filteredEquipment.map((equipment) => {
                  const maintenanceStatus = getMaintenanceStatus(equipment);
                  const operationalStatus = getOperationalStatus(equipment);
                  
                  return (
                    <motion.tr
                      key={equipment.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {equipment.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {equipment.manufacturer} {equipment.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{equipment.equipment_type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={operationalStatus.color}>
                          {operationalStatus.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={maintenanceStatus.color}>
                          {maintenanceStatus.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          ${(equipment.current_value || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">{equipment.location || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEquipment(equipment)}
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEquipment(equipment.Id)}
                            className="text-error hover:text-error-dark"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Equipment Form Modal */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Equipment Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
                <Select
                  label="Equipment Type"
                  value={formData.equipment_type}
                  onChange={(e) => handleFormChange('equipment_type', e.target.value)}
                  required
                >
                  <option value="">Select Type</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                <Input
                  label="Manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleFormChange('manufacturer', e.target.value)}
                  required
                />
                <Input
                  label="Model"
                  value={formData.model}
                  onChange={(e) => handleFormChange('model', e.target.value)}
                  required
                />
                <Input
                  label="Serial Number"
                  value={formData.serial_number}
                  onChange={(e) => handleFormChange('serial_number', e.target.value)}
                />
                <Input
                  label="Purchase Price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => handleFormChange('purchase_price', e.target.value)}
                />
                <Input
                  label="Current Value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => handleFormChange('current_value', e.target.value)}
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Inactive">Inactive</option>
                </Select>
                <Select
                  label="Maintenance Status"
                  value={formData.maintenance_status}
                  onChange={(e) => handleFormChange('maintenance_status', e.target.value)}
                >
                  <option value="Up to Date">Up to Date</option>
                  <option value="Maintenance Due">Maintenance Due</option>
                  <option value="In Service">In Service</option>
                </Select>
                <Input
                  label="Fuel Type"
                  value={formData.fuel_type}
                  onChange={(e) => handleFormChange('fuel_type', e.target.value)}
                />
                <Input
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEquipmentForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEquipment ? 'Update Equipment' : 'Create Equipment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Equipment;