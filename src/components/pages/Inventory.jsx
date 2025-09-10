import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { inventoryItemService } from "@/services/api/inventoryItemService";
import { storageLocationService } from "@/services/api/storageLocationService";
import { stockMovementService } from "@/services/api/stockMovementService";
import { batchService } from "@/services/api/batchService";
import { 
  setAlerts, 
  setCurrentStock, 
  setItems, 
  setItemsError, 
  setItemsLoading, 
  setLocations,
  updateItem,
  addItem
} from "@/store/inventorySlice";
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

const loadInventoryData = async () => {
    dispatch(setItemsLoading(true));
    
    try {
      const [itemsData, locationsData] = await Promise.all([
        inventoryItemService.getAllItems(),
        storageLocationService.getAllLocations()
      ]);

      dispatch(setItems(itemsData));
      dispatch(setLocations(locationsData));

      // Calculate basic statistics from the loaded items
      setStats({
        totalItems: itemsData.length,
        lowStockItems: 0, // Will be calculated when stock movement integration is added
        totalValue: itemsData.reduce((sum, item) => sum + (item.purchase_price_c || 0), 0),
        recentMovements: 0 // Will be populated when stock movements are integrated
      });

    } catch (error) {
      console.error('Error loading inventory data:', error);
      dispatch(setItemsError(error.message || 'Failed to load inventory data'));
      toast.error('Failed to load inventory data');
    } finally {
dispatch(setItemsLoading(false));
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
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryItemService.deleteItem(itemId);
      
      // Update Redux state
      dispatch(setItems(items.filter(item => item.Id !== itemId)));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      let result;
      
      if (editingItem) {
        // Update existing item
        result = await inventoryItemService.updateItem(editingItem.Id, {
          Name: formData.name,
          item_name_c: formData.name,
          description_c: formData.description || '',
          unit_of_measure_c: formData.unit_of_measure || '',
          purchase_price_c: parseFloat(formData.purchase_price) || 0,
          sku_c: formData.sku || '',
          low_stock_threshold_c: parseInt(formData.low_stock_threshold) || 0,
          Tags: formData.tags || ''
        });
        
        // Update Redux state
        dispatch(updateItem(result));
        toast.success('Item updated successfully');
      } else {
        // Create new item
        result = await inventoryItemService.createItem({
          Name: formData.name,
          item_name_c: formData.name,
          description_c: formData.description || '',
          unit_of_measure_c: formData.unit_of_measure || '',
          purchase_price_c: parseFloat(formData.purchase_price) || 0,
          sku_c: formData.sku || '',
          low_stock_threshold_c: parseInt(formData.low_stock_threshold) || 0,
          Tags: formData.tags || ''
        });
        
        // Update Redux state
        dispatch(addItem(result));
        toast.success('Item created successfully');
      }

      setShowItemForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Failed to save item');
    }
  };

  const getStockStatus = (item) => {
    const threshold = item.low_stock_threshold_c || 0;
    const currentStock = 0; // Will be calculated when stock movement integration is added
    
    if (currentStock === 0) {
      return { status: 'out-of-stock', color: 'error', label: 'Out of Stock' };
    } else if (currentStock <= threshold) {
      return { status: 'low-stock', color: 'warning', label: 'Low Stock' };
    } else {
      return { status: 'in-stock', color: 'success', label: 'In Stock' };
    }
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.item_name_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description_c?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filterType || item.unit_of_measure_c === filterType;
    
    return matchesSearch && matchesType;
});

  // Get unique unit types for filter dropdown
  const unitTypes = [...new Set(items.map(item => item.unit_of_measure_c).filter(Boolean))];

  if (loading.items) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
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
    return <ErrorState message={error.items} onRetry={loadInventoryData} />;
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your farm inventory items and stock levels</p>
        </div>
        <Button onClick={handleAddItem} className="flex items-center gap-2">
          <ApperIcon name="Plus" size={16} />
          Add Item
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full"
          >
            <option value="">All Units</option>
            {unitTypes.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </Select>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="lowStock" className="text-sm text-gray-700">
              Show low stock only
            </label>
          </div>
        </div>
      </Card>

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

      {/* Inventory Items List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inventory Items</h2>
        </div>

        {filteredItems.length === 0 ? (
          <EmptyState
            icon="Box"
            title="No inventory items found"
            description="Start by adding your first inventory item to track stock levels."
            action={
              <Button onClick={handleAddItem} className="flex items-center gap-2">
                <ApperIcon name="Plus" size={16} />
                Add First Item
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <motion.tr
                      key={item.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.item_name_c || item.Name}
                          </div>
                          {item.description_c && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description_c}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{item.sku_c || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{item.unit_of_measure_c || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          ${(item.purchase_price_c || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={stockStatus.color}>
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                          >
                            <ApperIcon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.Id)}
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

      {/* Item Form Modal - Implementation would go here */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            {/* Form implementation would go here */}
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowItemForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowItemForm(false)}>
                {editingItem ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
)}
    </motion.div>
  );
};

export default Inventory;