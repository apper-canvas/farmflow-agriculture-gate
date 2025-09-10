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
import { stockMovementService } from '@/services/api/stockMovementService';
import { inventoryItemService } from '@/services/api/inventoryItemService';
import { storageLocationService } from '@/services/api/storageLocationService';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    total_movements: 0,
    stock_in_count: 0,
    stock_out_count: 0,
    total_value_in: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    itemId: '',
    startDate: '',
    endDate: ''
  });
  
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: 'stock_in',
    quantity: '',
    unit_cost: '',
    reason: '',
    reference_number: '',
    location_id: '',
    batch_number: '',
    supplier: '',
    notes: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadMovementsData();
    loadInventoryItems();
    loadLocations();
  }, []);

  // Filter movements when filters change
  useEffect(() => {
    loadMovementsData();
  }, [filters]);

  const loadMovementsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filtersToApply = {};
      if (filters.type) filtersToApply.type = filters.type;
      if (filters.itemId) filtersToApply.itemId = parseInt(filters.itemId);
      if (filters.startDate) filtersToApply.startDate = filters.startDate;
      if (filters.endDate) filtersToApply.endDate = filters.endDate;
      
      const [movementsData, summaryData] = await Promise.all([
        stockMovementService.getAllMovements(filtersToApply),
        stockMovementService.getMovementSummary(filters.startDate, filters.endDate)
      ]);
      
      // Apply search filter locally
      let filteredMovements = movementsData;
      if (filters.search) {
        filteredMovements = movementsData.filter(movement =>
          movement.item_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          movement.reason.toLowerCase().includes(filters.search.toLowerCase()) ||
          movement.reference_number.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setMovements(filteredMovements);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading stock movements:', error);
      setError('Failed to load stock movements');
      toast.error('Failed to load stock movements');
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

  const handleAddMovement = () => {
    setFormData({
      item_id: '',
      movement_type: 'stock_in',
      quantity: '',
      unit_cost: '',
      reason: '',
      reference_number: '',
      location_id: '',
      batch_number: '',
      supplier: '',
      notes: ''
    });
    setShowMovementForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item_id || !formData.quantity) {
      toast.error('Item and quantity are required');
      return;
    }

    try {
      const selectedItem = inventoryItems.find(item => item.Id === parseInt(formData.item_id));
      const selectedLocation = locations.find(loc => loc.Id === parseInt(formData.location_id));
      
      const movementData = {
        ...formData,
        item_id: parseInt(formData.item_id),
        item_name: selectedItem?.item_name_c || selectedItem?.Name || '',
        quantity: parseInt(formData.quantity),
        unit_cost: parseFloat(formData.unit_cost) || 0,
        total_cost: parseInt(formData.quantity) * (parseFloat(formData.unit_cost) || 0),
        location_id: formData.location_id ? parseInt(formData.location_id) : null,
        location_name: selectedLocation?.location_name_c || '',
        unit_of_measure: selectedItem?.unit_of_measure_c || '',
        movement_date: new Date().toISOString()
      };

      await stockMovementService.createMovement(movementData);
      toast.success('Stock movement recorded successfully');
      setShowMovementForm(false);
      loadMovementsData();
    } catch (error) {
      console.error('Error creating stock movement:', error);
      toast.error('Failed to record stock movement');
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'stock_in': return 'TrendingUp';
      case 'stock_out': return 'TrendingDown';
      case 'adjustment': return 'RotateCw';
      default: return 'Package';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'stock_in': return 'success';
      case 'stock_out': return 'error';
      case 'adjustment': return 'info';
      default: return 'default';
    }
  };

  const formatMovementType = (type) => {
    switch (type) {
      case 'stock_in': return 'Stock In';
      case 'stock_out': return 'Stock Out';
      case 'adjustment': return 'Adjustment';
      default: return type;
    }
  };

  if (loading && movements.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="stat" />
        </div>
        <SkeletonLoader count={8} type="list" />
      </div>
    );
  }

  if (error && movements.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Stock Movements"
          message={error}
          onRetry={loadMovementsData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600 mt-1">Track inventory inflows, outflows, and adjustments</p>
        </div>
        <Button
          onClick={handleAddMovement}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Record Movement
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="Package"
          title="Total Movements"
          value={summary.total_movements}
          subtitle="all time"
          color="primary"
        />
        <StatCard
          icon="TrendingUp"
          title="Stock In"
          value={summary.stock_in_count}
          subtitle="movements"
          color="success"
        />
        <StatCard
          icon="TrendingDown"
          title="Stock Out"
          value={summary.stock_out_count}
          subtitle="movements"
          color="error"
        />
        <StatCard
          icon="DollarSign"
          title="Total Value In"
          value={`$${summary.total_value_in.toLocaleString()}`}
          subtitle="inventory value"
          color="accent"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Input
            placeholder="Search movements..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            icon="Search"
          />
          
          <Select
            placeholder="Movement type"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            options={[
              { value: '', label: 'All Types' },
              { value: 'stock_in', label: 'Stock In' },
              { value: 'stock_out', label: 'Stock Out' },
              { value: 'adjustment', label: 'Adjustment' }
            ]}
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
            type="date"
            placeholder="Start date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
          
          <Input
            type="date"
            placeholder="End date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
      </Card>

      {/* Movements List */}
      {movements.length === 0 ? (
        <EmptyState
          icon="TrendingUp"
          title="No stock movements found"
          description="Start tracking your inventory movements by recording your first transaction."
          actionLabel="Record First Movement"
          onAction={handleAddMovement}
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Item</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement, index) => (
                  <motion.tr
                    key={movement.Id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <Badge
                        variant={getMovementColor(movement.movement_type)}
                        icon={getMovementIcon(movement.movement_type)}
                        size="sm"
                      >
                        {formatMovementType(movement.movement_type)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{movement.item_name}</p>
                        {movement.location_name && (
                          <p className="text-xs text-gray-500">{movement.location_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        movement.movement_type === 'stock_out' ? 'text-error' : 'text-success'
                      }`}>
                        {movement.movement_type === 'stock_out' ? '-' : '+'}
                        {movement.quantity} {movement.unit_of_measure}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm">
                          {new Date(movement.movement_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(movement.movement_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{movement.reason}</p>
                      {movement.batch_number && (
                        <p className="text-xs text-gray-500">Batch: {movement.batch_number}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm">{movement.reference_number || '-'}</p>
                      {movement.supplier && (
                        <p className="text-xs text-gray-500">{movement.supplier}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-sm">
                        ${movement.total_cost?.toFixed(2) || '0.00'}
                      </p>
                      {movement.unit_cost > 0 && (
                        <p className="text-xs text-gray-500">
                          ${movement.unit_cost.toFixed(2)}/unit
                        </p>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Movement Form Modal */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto"
          >
            <h2 className="text-lg font-semibold mb-4">Record Stock Movement</h2>
            
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
                
                <Select
                  label="Movement Type"
                  value={formData.movement_type}
                  onChange={(e) => setFormData({...formData, movement_type: e.target.value})}
                  required
                  options={[
                    { value: 'stock_in', label: 'Stock In' },
                    { value: 'stock_out', label: 'Stock Out' },
                    { value: 'adjustment', label: 'Adjustment' }
                  ]}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                  placeholder="Enter quantity"
                />
                
                <Input
                  label="Unit Cost"
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({...formData, unit_cost: e.target.value})}
                  placeholder="Enter unit cost"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Reference Number"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({...formData, reference_number: e.target.value})}
                  placeholder="PO number, task ID, etc."
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
                  label="Batch Number"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                  placeholder="Enter batch/lot number"
                />
                
                <Input
                  label="Supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Enter supplier name"
                />
              </div>
              
              <Input
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                placeholder="Why is this movement happening?"
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
                  placeholder="Additional notes..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMovementForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Record Movement
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StockMovements;