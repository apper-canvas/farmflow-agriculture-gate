import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import StatCard from '@/components/molecules/StatCard';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { inventoryItemService } from '@/services/api/inventoryItemService';
import { storageLocationService } from '@/services/api/storageLocationService';
import { stockMovementService } from '@/services/api/stockMovementService';
import { batchService } from '@/services/api/batchService';
import {
  setItems, setItemsLoading, setItemsError,
  setLocations, setCurrentStock, setAlerts
} from '@/store/inventorySlice';

const Inventory = () => {
  const dispatch = useDispatch();
  const { items, locations, loading, error, currentStock, alerts } = useSelector(state => state.inventory);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalValue: 0,
    recentMovements: 0
  });

  // Load initial data
  useEffect(() => {
    loadInventoryData();
  }, []);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku_c?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stock = currentStock[item.Id] || { current_quantity: 0 };
    const isLowStock = stock.current_quantity <= (item.low_stock_threshold_c || 0);
    
    return matchesSearch && 
           (filterType === '' || item.unit_of_measure_c === filterType) &&
           (!showLowStock || isLowStock);
  });

  const loadInventoryData = async () => {
    try {
      dispatch(setItemsLoading(true));
      
      // Load items, locations, stock levels, and recent movements in parallel
      const [itemsData, locationsData, stockData, movementsData] = await Promise.all([
        inventoryItemService.getAllItems(),
        storageLocationService.getAllLocations(),
        stockMovementService.getAllStockLevels(),
        stockMovementService.getAllMovements({ limit: 10 })
      ]);

      dispatch(setItems(itemsData));
      dispatch(setLocations(locationsData));
      dispatch(setCurrentStock(stockData));
      setRecentMovements(movementsData.slice(0, 5));

      // Calculate statistics
      const lowStockItems = await stockMovementService.getLowStockItems(itemsData);
      const expiringBatches = await batchService.getExpiringBatches(30);
      
      dispatch(setAlerts({
        lowStock: lowStockItems,
        expiringBatches: expiringBatches
      }));

      setStats({
        totalItems: itemsData.length,
        lowStockItems: lowStockItems.length,
        totalValue: Object.values(stockData).reduce((sum, stock) => sum + stock.total_value, 0),
        recentMovements: movementsData.length
      });

    } catch (error) {
      console.error('Error loading inventory data:', error);
      dispatch(setItemsError(error.message));
      toast.error('Failed to load inventory data');
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      await inventoryItemService.deleteItem(itemId);
      toast.success('Inventory item deleted successfully');
      loadInventoryData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error('Failed to delete inventory item');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await inventoryItemService.updateItem(editingItem.Id, formData);
        toast.success('Inventory item updated successfully');
      } else {
        await inventoryItemService.createItem(formData);
        toast.success('Inventory item created successfully');
      }
      setShowItemForm(false);
      loadInventoryData();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error('Failed to save inventory item');
    }
  };

  const getStockStatus = (item) => {
    const stock = currentStock[item.Id] || { current_quantity: 0 };
    const threshold = item.low_stock_threshold_c || 0;
    
    if (stock.current_quantity === 0) {
      return { status: 'Out of Stock', variant: 'error', icon: 'AlertTriangle' };
    } else if (stock.current_quantity <= threshold) {
      return { status: 'Low Stock', variant: 'warning', icon: 'AlertCircle' };
    } else {
      return { status: 'In Stock', variant: 'success', icon: 'CheckCircle' };
    }
  };

  if (loading.items && items.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="stat" />
        </div>
        <SkeletonLoader count={6} type="card" />
      </div>
    );
  }

  if (error.items && items.length === 0) {
    return (
      <div className="p-6">
        <ErrorState
          title="Failed to Load Inventory"
          message={error.items}
          onRetry={loadInventoryData}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track and manage your farm supplies and equipment</p>
        </div>
        <Button
          onClick={handleAddItem}
          icon="Plus"
          className="w-full sm:w-auto"
        >
          Add Inventory Item
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="Box"
          title="Total Items"
          value={stats.totalItems}
          subtitle="inventory items"
          color="primary"
        />
        <StatCard
          icon="AlertTriangle"
          title="Low Stock Alerts"
          value={stats.lowStockItems}
          subtitle="items need attention"
          color="warning"
        />
        <StatCard
          icon="DollarSign"
          title="Total Inventory Value"
          value={`$${stats.totalValue.toLocaleString()}`}
          subtitle="current valuation"
          color="success"
        />
        <StatCard
          icon="TrendingUp"
          title="Recent Movements"
          value={stats.recentMovements}
          subtitle="this month"
          color="accent"
        />
      </div>

      {/* Alerts */}
      {(alerts.lowStock.length > 0 || alerts.expiringBatches.length > 0) && (
        <Card className="border-l-4 border-l-warning">
          <div className="flex items-start space-x-3">
            <ApperIcon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Inventory Alerts</h3>
              <div className="mt-2 space-y-1">
                {alerts.lowStock.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{alerts.lowStock.length} items</span> are running low on stock
                  </p>
                )}
                {alerts.expiringBatches.length > 0 && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{alerts.expiringBatches.length} batches</span> are expiring within 30 days
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon="Search"
          />
          <Select
            placeholder="Filter by unit"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: '', label: 'All Units' },
              { value: 'kg', label: 'Kilograms' },
              { value: 'lbs', label: 'Pounds' },
              { value: 'liters', label: 'Liters' },
              { value: 'gallons', label: 'Gallons' },
              { value: 'units', label: 'Units' }
            ]}
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="lowStock" className="text-sm text-gray-700">
              Show only low stock
            </label>
          </div>
        </div>
      </Card>

      {/* Inventory Items */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon="Box"
          title="No inventory items found"
          description="Start managing your farm inventory by adding your first item."
          actionLabel="Add First Item"
          onAction={handleAddItem}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const stock = currentStock[item.Id] || { current_quantity: 0, average_cost: 0 };
            const stockStatus = getStockStatus(item);
            
            return (
              <motion.div
                key={item.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card hover className="h-full">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.item_name_c || item.Name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{item.sku_c}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Edit"
                          onClick={() => handleEditItem(item)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Trash2"
                          onClick={() => handleDeleteItem(item.Id)}
                          className="text-error hover:text-error"
                        />
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={stockStatus.variant}
                        icon={stockStatus.icon}
                        size="sm"
                      >
                        {stockStatus.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {stock.current_quantity} {item.unit_of_measure_c}
                      </span>
                    </div>

                    {/* Stock Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Current Stock:</span>
                        <p className="font-medium">{stock.current_quantity} {item.unit_of_measure_c}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Threshold:</span>
                        <p className="font-medium">{item.low_stock_threshold_c || 0} {item.unit_of_measure_c}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Cost:</span>
                        <p className="font-medium">${stock.average_cost?.toFixed(2) || '0.00'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Value:</span>
                        <p className="font-medium">${(stock.current_quantity * stock.average_cost)?.toFixed(2) || '0.00'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description_c && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description_c}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        icon="TrendingUp"
                      >
                        Stock In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        icon="TrendingDown"
                      >
                        Stock Out
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent Movements */}
      {recentMovements.length > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h2>
            <Button variant="ghost" size="sm" icon="ArrowRight">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentMovements.map((movement) => (
              <div key={movement.Id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    movement.movement_type === 'stock_in' 
                      ? 'bg-success/10 text-success' 
                      : movement.movement_type === 'stock_out'
                      ? 'bg-error/10 text-error'
                      : 'bg-info/10 text-info'
                  }`}>
                    <ApperIcon 
                      name={movement.movement_type === 'stock_in' ? 'TrendingUp' : movement.movement_type === 'stock_out' ? 'TrendingDown' : 'RotateCw'} 
                      size={16} 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{movement.item_name}</p>
                    <p className="text-xs text-gray-500">{movement.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {movement.movement_type === 'stock_out' ? '-' : '+'}{movement.quantity} {movement.unit_of_measure}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(movement.movement_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Item Form Modal (would be implemented as a separate component) */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            <p className="text-gray-600 mb-4">
              Item form would be implemented here with all required fields.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowItemForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowItemForm(false)}>
                Save Item
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;