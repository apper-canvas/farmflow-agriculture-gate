import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import StatCard from '@/components/molecules/StatCard';
import ApperIcon from '@/components/ApperIcon';
import { batchService } from '@/services/api/batchService';
import { inventoryItemService } from '@/services/api/inventoryItemService';
import { storageLocationService } from '@/services/api/storageLocationService';

const BatchTracking = () => {
  const [batches, setBatches] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total_batches: 0,
    expired_count: 0,
    expiring_soon_count: 0,
    total_value: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    itemId: '',
    supplier: '',
    expirationStatus: ''
  });
  
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    item_id: '',
    batch_number: '',
    supplier: '',
    purchase_date: '',
    expiration_date: '',
    quantity_received: '',
    unit_cost: '',
    location_id: '',
    quality_grade: '',
    certifications: '',
    storage_conditions: '',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadBatchesData();
    loadInventoryItems();
    loadLocations();
  }, []);

  // Filter batches when filters change
  useEffect(() => {
    loadBatchesData();
  }, [filters]);

  const loadBatchesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToApply = {};
      if (filters.itemId) filtersToApply.itemId = parseInt(filters.itemId);
      if (filters.supplier) filtersToApply.supplier = filters.supplier;
      if (filters.expirationStatus) filtersToApply.expirationStatus = filters.expirationStatus;
      
      const [batchesData, summaryData] = await Promise.all([
        batchService.getAllBatches(filtersToApply),
        batchService.getBatchSummary()
      ]);
      
      // Apply search filter locally
      let filteredBatches = batchesData;
      if (filters.search) {
        filteredBatches = batchesData.filter(batch =>
          batch.item_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          batch.batch_number.toLowerCase().includes(filters.search.toLowerCase()) ||
          batch.supplier.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setBatches(filteredBatches);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading batches:', error);
      setError('Failed to load batch data');
      toast.error('Failed to load batch data');
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryItems = async () => {
    try {
      const data = await inventoryItemService.getAllItems();
      setInventoryItems(data);
    } catch (error) {
      console.error('Error loading inventory items:', error);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await storageLocationService.getAllLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleAddBatch = () => {
    setEditingBatch(null);
    setFormData({
      item_id: '',
      batch_number: '',
      supplier: '',
      purchase_date: new Date().toISOString().split('T')[0],
      expiration_date: '',
      quantity_received: '',
      unit_cost: '',
      location_id: '',
      quality_grade: '',
      certifications: '',
      storage_conditions: '',
      notes: ''
    });
    setShowBatchForm(true);
  };

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setFormData({
      item_id: batch.item_id.toString(),
      batch_number: batch.batch_number,
      supplier: batch.supplier,
      purchase_date: batch.purchase_date,
      expiration_date: batch.expiration_date || '',
      quantity_received: batch.quantity_received.toString(),
      unit_cost: batch.unit_cost.toString(),
      location_id: batch.location_id ? batch.location_id.toString() : '',
      quality_grade: batch.quality_grade,
      certifications: batch.certifications,
      storage_conditions: batch.storage_conditions,
      notes: batch.notes
    });
    setShowBatchForm(true);
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) return;

    try {
      await batchService.deleteBatch(batchId);
      toast.success('Batch deleted successfully');
      loadBatchesData();
    } catch (error) {
      console.error('Error deleting batch:', error);
      toast.error('Failed to delete batch');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.quantity_received) {
      toast.error('Item and quantity are required');
      return;
    }

    try {
      const selectedItem = inventoryItems.find(item => item.Id === parseInt(formData.item_id));
      const selectedLocation = locations.find(loc => loc.Id === parseInt(formData.location_id));
      
      const batchData = {
        ...formData,
        item_id: parseInt(formData.item_id),
        item_name: selectedItem?.item_name_c || selectedItem?.Name || '',
        quantity_received: parseInt(formData.quantity_received),
        unit_cost: parseFloat(formData.unit_cost) || 0,
        total_cost: parseInt(formData.quantity_received) * (parseFloat(formData.unit_cost) || 0),
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        location_name: selectedLocation?.location_name_c || '',
        unit_of_measure: selectedItem?.unit_of_measure_c || ''
      };

      if (editingBatch) {
        await batchService.updateBatch(editingBatch.Id, batchData);
        toast.success('Batch updated successfully');
      } else {
        await batchService.createBatch(batchData);
        toast.success('Batch created successfully');
      }
      
      setShowBatchForm(false);
      loadBatchesData();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error('Failed to save batch');
    }
  };

  const getBatchExpirationStatus = (batch) => {
    if (!batch.expiration_date) {
      return { status: 'No Expiry', variant: 'default', icon: 'Calendar' };
    }
    
    const now = new Date();
    const expDate = new Date(batch.expiration_date);
    const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', variant: 'error', icon: 'AlertTriangle' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'Expiring Soon', variant: 'warning', icon: 'AlertCircle' };
    } else {
      return { status: 'Good', variant: 'success', icon: 'CheckCircle' };
    }
  };

  const formatDaysUntilExpiry = (expiration_date) => {
    if (!expiration_date) return null;
    
    const now = new Date();
    const expDate = new Date(expiration_date);
    const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    } else if (daysUntilExpiry === 0) {
      return 'Expires today';
    } else if (daysUntilExpiry === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${daysUntilExpiry} days`;
    }
  };

  if (loading && batches.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Batch Tracking</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="stat" />
        </div>
        <SkeletonLoader count={6} type="card" />
      </div>
    );
  }

  if (error && batches.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Batch Data"
          message={error}
          onRetry={loadBatchesData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor inventory batches, expiration dates, and quality control</p>
        </div>
        <Button
          onClick={handleAddBatch}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Batch
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="Package"
          title="Active Batches"
          value={summary.total_batches}
          subtitle="tracked batches"
          color="primary"
        />
        <StatCard
          icon="AlertTriangle"
          title="Expired"
          value={summary.expired_count}
          subtitle="need attention"
          color="error"
        />
        <StatCard
          icon="AlertCircle"
          title="Expiring Soon"
          value={summary.expiring_soon_count}
          subtitle="within 30 days"
          color="warning"
        />
        <StatCard
          icon="DollarSign"
          title="Total Batch Value"
          value={`$${summary.total_value.toLocaleString()}`}
          subtitle="current inventory"
          color="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search batches..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            icon="Search"
          />
          
          <Select
            placeholder="Filter by item"
            value={filters.itemId}
            onChange={(e) => setFilters({...filters, itemId: e.target.value})}
            options={[
              { value: '', label: 'All Items' },
              ...inventoryItems.map(item => ({
                value: item.Id.toString(),
                label: item.item_name_c || item.Name
              }))
            ]}
          />
          
          <Input
            placeholder="Filter by supplier"
            value={filters.supplier}
            onChange={(e) => setFilters({...filters, supplier: e.target.value})}
            icon="Truck"
          />
          
          <Select
            placeholder="Expiration status"
            value={filters.expirationStatus}
            onChange={(e) => setFilters({...filters, expirationStatus: e.target.value})}
            options={[
              { value: '', label: 'All Status' },
              { value: 'expired', label: 'Expired' },
              { value: 'expiring_soon', label: 'Expiring Soon' },
              { value: 'good', label: 'Good' }
            ]}
          />
        </div>
      </Card>

      {/* Batches Grid */}
      {batches.length === 0 ? (
        <EmptyState
          icon="Package"
          title="No batches found"
          description="Start tracking your inventory batches to monitor quality and expiration dates."
          actionLabel="Add First Batch"
          onAction={handleAddBatch}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {batches.map((batch, index) => {
            const expirationStatus = getBatchExpirationStatus(batch);
            const daysUntilExpiry = formatDaysUntilExpiry(batch.expiration_date);
            
            return (
              <motion.div
                key={batch.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card hover className="h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {batch.item_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Batch: {batch.batch_number}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Edit"
                          onClick={() => handleEditBatch(batch)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Trash2"
                          onClick={() => handleDeleteBatch(batch.Id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </div>

                    {/* Expiration Status */}
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={expirationStatus.variant}
                        icon={expirationStatus.icon}
                        size="sm"
                      >
                        {expirationStatus.status}
                      </Badge>
                      {daysUntilExpiry && (
                        <span className="text-xs text-gray-500">
                          {daysUntilExpiry}
                        </span>
                      )}
                    </div>

                    {/* Batch Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">
                          {batch.quantity_remaining}/{batch.quantity_received} {batch.unit_of_measure}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Supplier:</span>
                        <p className="font-medium truncate">{batch.supplier || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Purchase Date:</span>
                        <p className="font-medium">
                          {new Date(batch.purchase_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Unit Cost:</span>
                        <p className="font-medium">${batch.unit_cost?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    {/* Expiration Date */}
                    {batch.expiration_date && (
                      <div className="text-sm">
                        <span className="text-gray-500">Expires:</span>
                        <p className="font-medium">
                          {new Date(batch.expiration_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Quality Information */}
                    {(batch.quality_grade || batch.certifications) && (
                      <div className="text-sm space-y-1">
                        {batch.quality_grade && (
                          <p><span className="text-gray-500">Grade:</span> {batch.quality_grade}</p>
                        )}
                        {batch.certifications && (
                          <div className="flex flex-wrap gap-1">
                            {batch.certifications.split(',').map((cert, idx) => (
                              <Badge key={idx} variant="info" size="xs">
                                {cert.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Location */}
                    {batch.location_name && (
                      <div className="text-sm">
                        <span className="text-gray-500">Location:</span>
                        <p className="font-medium">{batch.location_name}</p>
                      </div>
                    )}

                    {/* Total Value */}
                    <div className="pt-2 border-t text-sm">
                      <span className="text-gray-500">Remaining Value:</span>
                      <p className="font-semibold">
                        ${(batch.quantity_remaining * batch.unit_cost).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Batch Form Modal */}
      {showBatchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">
              {editingBatch ? 'Edit Batch' : 'Add New Batch'}
            </h2>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Inventory Item"
                  value={formData.item_id}
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  required
                  options={inventoryItems.map(item => ({
                    value: item.Id.toString(),
                    label: `${item.item_name_c || item.Name} (${item.unit_of_measure_c})`
                  }))}
                />
                
                <Input
                  label="Batch Number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Enter supplier name"
                />
                
                <Input
                  label="Purchase Date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Expiration Date"
                  type="date"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                />
                
                <Input
                  label="Quantity Received"
                  type="number"
                  value={formData.quantity_received}
                  onChange={(e) => setFormData({...formData, quantity_received: e.target.value})}
                  required
                  placeholder="Enter quantity"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Unit Cost"
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                  placeholder="Enter unit cost"
                />
                
                <Select
                  label="Storage Location"
                  value={formData.location_id}
                  onChange={(e) => setFormData({...formData, location_id: e.target.value})}
                  options={[
                    { value: '', label: 'No specific location' },
                    ...locations.map(loc => ({
                      value: loc.Id.toString(),
                      label: `${loc.location_name_c} (${loc.location_type_c})`
                    }))
                  ]}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quality Grade"
                  value={formData.quality_grade}
                  onChange={(e) => setFormData({...formData, quality_grade: e.target.value})}
                  placeholder="Premium, Standard, etc."
                />
                
                <Input
                  label="Certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                  placeholder="Organic, Non-GMO, etc."
                />
              </div>
              
              <Input
                label="Storage Conditions"
                value={formData.storage_conditions}
                onChange={(e) => setFormData({...formData, storage_conditions: e.target.value})}
                placeholder="Temperature, humidity requirements"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Additional notes about this batch..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBatchForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBatch ? 'Update Batch' : 'Create Batch'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BatchTracking;