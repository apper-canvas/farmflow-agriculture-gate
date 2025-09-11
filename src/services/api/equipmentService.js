// ApperClient-based equipment service for database integration
export const equipmentService = {
  // Get ApperClient instance
  getApperClient() {
    const { ApperClient } = window.ApperSDK;
    return new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  },

  // Get all equipment with filtering and pagination
  async getAllEquipment(filters = {}) {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      // Build query parameters
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "equipmentName_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "serialNumber_c"}},
          {"field": {"Name": "manufacturer_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "purchaseDate_c"}},
          {"field": {"Name": "cost_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "status_c"}}
        ],
        orderBy: [{"fieldName": "equipmentName_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 20, "offset": 0}
      };

      // Add search filter using whereGroups for multiple field search
      if (filters.search) {
        params.whereGroups = [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "equipmentName_c", "operator": "Contains", "values": [filters.search]},
                {"fieldName": "manufacturer_c", "operator": "Contains", "values": [filters.search]},
                {"fieldName": "model_c", "operator": "Contains", "values": [filters.search]},
                {"fieldName": "serialNumber_c", "operator": "Contains", "values": [filters.search]}
              ],
              "operator": "OR"
            }
          ]
        }];
      }

      // Add status filter
      if (filters.status) {
        const statusFilter = {"FieldName": "status_c", "Operator": "EqualTo", "Values": [filters.status], "Include": true};
        if (params.where) {
          params.where.push(statusFilter);
        } else {
          params.where = [statusFilter];
        }
      }

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  // Get equipment by ID
  async getEquipmentById(equipmentId) {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "equipmentName_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "serialNumber_c"}},
          {"field": {"Name": "manufacturer_c"}},
          {"field": {"Name": "model_c"}},
          {"field": {"Name": "purchaseDate_c"}},
          {"field": {"Name": "cost_c"}},
          {"field": {"Name": "location_c"}},
          {"field": {"Name": "status_c"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, parseInt(equipmentId), params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error('Equipment not found');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching equipment ${equipmentId}:`, error);
      throw error;
    }
  },

  // Create new equipment - only use Updateable fields
  async createEquipment(equipmentData) {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      // Only include Updateable fields according to database schema
      const params = {
        records: [{
          Name: equipmentData.equipmentName_c || '',
          Tags: equipmentData.Tags || '',
          equipmentName_c: equipmentData.equipmentName_c || '',
          description_c: equipmentData.description_c || '',
          serialNumber_c: equipmentData.serialNumber_c || '',
          manufacturer_c: equipmentData.manufacturer_c || '',
          model_c: equipmentData.model_c || '',
          purchaseDate_c: equipmentData.purchaseDate_c || null,
          cost_c: parseFloat(equipmentData.cost_c) || 0,
          location_c: equipmentData.location_c || '',
          status_c: equipmentData.status_c || 'Active'
        }]
      };

      const response = await apperClient.createRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create equipment:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel || 'Field'}: ${error.message || error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  // Update equipment - only use Updateable fields
  async updateEquipment(equipmentId, updatedData) {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      // Only include Updateable fields according to database schema
      const params = {
        records: [{
          Id: parseInt(equipmentId),
          Name: updatedData.equipmentName_c || '',
          Tags: updatedData.Tags || '',
          equipmentName_c: updatedData.equipmentName_c || '',
          description_c: updatedData.description_c || '',
          serialNumber_c: updatedData.serialNumber_c || '',
          manufacturer_c: updatedData.manufacturer_c || '',
          model_c: updatedData.model_c || '',
          purchaseDate_c: updatedData.purchaseDate_c || null,
          cost_c: parseFloat(updatedData.cost_c) || 0,
          location_c: updatedData.location_c || '',
          status_c: updatedData.status_c || 'Active'
        }]
      };

      const response = await apperClient.updateRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update equipment:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel || 'Field'}: ${error.message || error}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }

        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error(`Error updating equipment ${equipmentId}:`, error);
      throw error;
    }
  },

  // Delete equipment
  async deleteEquipment(equipmentId) {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      const params = {
        RecordIds: [parseInt(equipmentId)]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete equipment:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        return successful.length > 0;
      }

      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Get equipment statistics
  async getEquipmentStats() {
    try {
      const apperClient = this.getApperClient();
      const tableName = 'equipment_c';

      // Get total count
      const totalParams = {
        fields: [{"field": {"Name": "Id"}}],
        pagingInfo: {"limit": 1000, "offset": 0}
      };

      const totalResponse = await apperClient.fetchRecords(tableName, totalParams);
      
      if (!totalResponse.success) {
        console.error(totalResponse.message);
        return { totalEquipment: 0, activeEquipment: 0, totalValue: 0 };
      }

      const allEquipment = totalResponse.data || [];
      const totalEquipment = allEquipment.length;
      const activeEquipment = allEquipment.filter(item => item.status_c === 'Active').length;
      const totalValue = allEquipment.reduce((sum, item) => sum + (parseFloat(item.cost_c) || 0), 0);

      return {
        totalEquipment,
        activeEquipment,
        totalValue
      };
    } catch (error) {
      console.error('Error fetching equipment stats:', error);
      return { totalEquipment: 0, activeEquipment: 0, totalValue: 0 };
    }
  },

  // Get available status options from database schema
  getStatusOptions() {
    return ['Active', 'Inactive', 'Under Maintenance', 'Retired'];
  }
};