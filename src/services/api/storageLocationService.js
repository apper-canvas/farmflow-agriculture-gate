const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const tableName = 'storage_location_c';

export const storageLocationService = {
  // Get all storage locations
  async getAllLocations(filters = {}) {
    try {
      await delay(300);
      
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "location_name_c"}},
          {"field": {"Name": "location_description_c"}},
          {"field": {"Name": "location_type_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "location_name_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      // Add filters if provided
      const whereConditions = [];
      
      if (filters.search) {
        whereConditions.push({
          "FieldName": "location_name_c",
          "Operator": "Contains", 
          "Values": [filters.search]
        });
      }
      
      if (filters.type) {
        whereConditions.push({
          "FieldName": "location_type_c",
          "Operator": "ExactMatch", 
          "Values": [filters.type]
        });
      }
      
      if (whereConditions.length > 0) {
        params.where = whereConditions;
      }

      const response = await apperClient.fetchRecords(tableName, params);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch storage locations');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching storage locations:', error?.response?.data?.message || error);
      throw error;
    }
  },

  // Get storage location by ID
  async getLocationById(locationId) {
    try {
      await delay(200);
      
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "location_name_c"}},
          {"field": {"Name": "location_description_c"}},
          {"field": {"Name": "location_type_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await apperClient.getRecordById(tableName, locationId, params);

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to fetch storage location');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching storage location ${locationId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  // Create new storage location
  async createLocation(locationData) {
    try {
      await delay(400);
      
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const payload = {
        records: [{
          Name: locationData.Name || locationData.location_name_c || '',
          Tags: locationData.Tags || '',
          location_name_c: locationData.location_name_c || '',
          location_description_c: locationData.location_description_c || '',
          location_type_c: locationData.location_type_c || ''
        }]
      };

      const response = await apperClient.createRecord(tableName, payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create storage location');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create storage location:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to create storage location';
          throw new Error(errorMessage);
        }
        
        return successful[0]?.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating storage location:', error?.response?.data?.message || error);
      throw error;
    }
  },

  // Update storage location
  async updateLocation(locationId, locationData) {
    try {
      await delay(400);
      
      const apperClient = getApperClient();
      
      // Only include Updateable fields
      const payload = {
        records: [{
          Id: locationId,
          Name: locationData.Name || locationData.location_name_c || '',
          Tags: locationData.Tags || '',
          location_name_c: locationData.location_name_c || '',
          location_description_c: locationData.location_description_c || '',
          location_type_c: locationData.location_type_c || ''
        }]
      };

      const response = await apperClient.updateRecord(tableName, payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update storage location');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update storage location:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to update storage location';
          throw new Error(errorMessage);
        }
        
        return successful[0]?.data;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating storage location ${locationId}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  // Delete storage location
  async deleteLocation(locationId) {
    try {
      await delay(300);
      
      const apperClient = getApperClient();
      
      const params = { 
        RecordIds: Array.isArray(locationId) ? locationId : [locationId]
      };

      const response = await apperClient.deleteRecord(tableName, params);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete storage location');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete storage locations:`, failed);
          const errorMessage = failed[0]?.message || 'Failed to delete storage location';
          throw new Error(errorMessage);
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting storage location:', error?.response?.data?.message || error);
      throw error;
    }
  },

  // Get locations by type
  async getLocationsByType(locationType) {
    try {
      return await this.getAllLocations({ type: locationType });
    } catch (error) {
      console.error(`Error fetching ${locationType} locations:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};