const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'inventory_item_c';

export const inventoryItemService = {
  // Get all inventory items
  async getAllItems(filters = {}) {
    try {
      await delay(300);
      
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "item_name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_of_measure_c"}},
          {"field": {"Name": "purchase_price_c"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "low_stock_threshold_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "ModifiedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      // Add filters if provided
      if (filters.search) {
        params.where = [{
          "FieldName": "item_name_c",
          "Operator": "Contains", 
          "Values": [filters.search]
        }];
      }

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch inventory items');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching inventory items:', error?.response?.data?.message || error);
      throw error;
    }
  },

  // Get inventory item by ID
  async getItemById(itemId) {
    try {
      await delay(200);
      
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "item_name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "unit_of_measure_c"}},
          {"field": {"Name": "purchase_price_c"}},
          {"field": {"Name": "sku_c"}},
          {"field": {"Name": "low_stock_threshold_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, itemId, params);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch inventory item');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching inventory item ${itemId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  // Create new inventory item
  async createItem(itemData) {
    try {
      await delay(400);
      
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const payload = {
        records: [{
          Name: itemData.Name || itemData.item_name_c || '',
          Tags: itemData.Tags || '',
          item_name_c: itemData.item_name_c || '',
          description_c: itemData.description_c || '',
          unit_of_measure_c: itemData.unit_of_measure_c || '',
          purchase_price_c: itemData.purchase_price_c || 0,
          sku_c: itemData.sku_c || '',
          low_stock_threshold_c: itemData.low_stock_threshold_c || 0
        }]
      };

      const response = await apperClient.createRecord(tableName, payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create inventory item');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create inventory item:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to create inventory item';
          throw new Error(errorMessage);
        }
        
        return successful[0]?.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating inventory item:', error?.response?.data?.message || error);
      throw error;
    }
  },

  // Update inventory item
  async updateItem(itemId, itemData) {
    try {
      await delay(400);
      
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const payload = {
        records: [{
          Id: itemId,
          Name: itemData.Name || itemData.item_name_c || '',
          Tags: itemData.Tags || '',
          item_name_c: itemData.item_name_c || '',
          description_c: itemData.description_c || '',
          unit_of_measure_c: itemData.unit_of_measure_c || '',
          purchase_price_c: itemData.purchase_price_c || 0,
          sku_c: itemData.sku_c || '',
          low_stock_threshold_c: itemData.low_stock_threshold_c || 0
        }]
      };

      const response = await apperClient.updateRecord(tableName, payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update inventory item');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update inventory item:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to update inventory item';
          throw new Error(errorMessage);
        }
        
        return successful[0]?.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating inventory item ${itemId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  // Delete inventory item
  async deleteItem(itemId) {
    try {
      await delay(300);
      
      const apperClient = getApperClient();
      
      const params = { 
        RecordIds: Array.isArray(itemId) ? itemId : [itemId]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete inventory item');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete inventory items:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to delete inventory item';
          throw new Error(errorMessage);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting inventory item:', error?.response?.data?.message || error);
      throw error;
    }
  }
};