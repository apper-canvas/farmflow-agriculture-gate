import { toast } from 'react-toastify';

const farmService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
fields: [
          { field: { Name: "Name" } },
          { field: { Name: "location" } },
          { field: { Name: "size" } },
          { field: { Name: "size_unit" } },
          { field: { Name: "created_at" } },
          { field: { Name: "directions" } }
        ],
        orderBy: [{ fieldName: "created_at", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords('farm', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
return response.data.map(farm => ({
        Id: farm.Id,
        name: farm.Name,
        location: farm.location,
        size: farm.size,
        sizeUnit: farm.size_unit,
        createdAt: farm.created_at,
        directions: farm.directions
      }));
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
fields: [
          { field: { Name: "Name" } },
          { field: { Name: "location" } },
          { field: { Name: "size" } },
          { field: { Name: "size_unit" } },
          { field: { Name: "created_at" } },
          { field: { Name: "directions" } }
        ]
      };

      const response = await apperClient.getRecordById('farm', parseInt(id, 10), params);

      if (!response || !response.data) {
        return null;
      }

      // Transform data to match UI expectations
      const farm = response.data;
return {
        Id: farm.Id,
        name: farm.Name,
        location: farm.location,
        size: farm.size,
        sizeUnit: farm.size_unit,
        createdAt: farm.created_at,
        directions: farm.directions
      };
    } catch (error) {
      console.error(`Error fetching farm with ID ${id}:`, error);
      throw error;
    }
  },

  async create(farmData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
records: [{
          Name: farmData.name,
          location: farmData.location,
          size: farmData.size,
          size_unit: farmData.sizeUnit,
          created_at: new Date().toISOString(),
          directions: farmData.directions
        }]
      };

      const response = await apperClient.createRecord('farm', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);

        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulRecords.length > 0) {
          const farm = successfulRecords[0].data;
return {
            Id: farm.Id,
            name: farm.Name,
            location: farm.location,
            size: farm.size,
            sizeUnit: farm.size_unit,
            createdAt: farm.created_at,
            directions: farm.directions
          };
        }
      }

      throw new Error('Failed to create farm');
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  },

  async update(id, farmData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
records: [{
          Id: parseInt(id, 10),
          Name: farmData.name,
          location: farmData.location,
          size: farmData.size,
          size_unit: farmData.sizeUnit,
          directions: farmData.directions
        }]
      };

      const response = await apperClient.updateRecord('farm', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);

        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }

        if (successfulUpdates.length > 0) {
          const farm = successfulUpdates[0].data;
return {
            Id: farm.Id,
            name: farm.Name,
            location: farm.location,
            size: farm.size,
            sizeUnit: farm.size_unit,
            createdAt: farm.created_at,
            directions: farm.directions
          };
        }
      }

      throw new Error('Failed to update farm');
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id, 10)]
      };

      const response = await apperClient.deleteRecord('farm', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);

        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        return successfulDeletions.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }
};

export default farmService;