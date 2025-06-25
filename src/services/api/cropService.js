import { toast } from "react-toastify";
import React from "react";

const cropService = {
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
          { field: { Name: "crop_type" } },
          { field: { Name: "field" } },
          { field: { Name: "planting_date" } },
          { field: { Name: "expected_harvest" } },
          { field: { Name: "quantity" } },
          { field: { Name: "status" } },
          { field: { Name: "farm_id" } }
        ],
        orderBy: [{ fieldName: "planting_date", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords('crop', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
return response.data.map(crop => ({
        Id: crop.Id,
        name: crop.Name,
        farmId: crop.farm_id,
        cropType: crop.crop_type,
        field: crop.field,
        plantingDate: crop.planting_date,
        expectedHarvest: crop.expected_harvest,
        quantity: crop.quantity,
        status: crop.status
      }));
    } catch (error) {
      console.error('Error fetching crops:', error);
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
          { field: { Name: "crop_type" } },
          { field: { Name: "field" } },
          { field: { Name: "planting_date" } },
          { field: { Name: "expected_harvest" } },
          { field: { Name: "quantity" } },
          { field: { Name: "status" } },
          { field: { Name: "farm_id" } }
        ]
      };

      const response = await apperClient.getRecordById('crop', parseInt(id, 10), params);

      if (!response || !response.data) {
        return null;
      }

      // Transform data to match UI expectations
const crop = response.data;
      return {
        Id: crop.Id,
        name: crop.Name,
        farmId: crop.farm_id,
        cropType: crop.crop_type,
        field: crop.field,
        plantingDate: crop.planting_date,
        expectedHarvest: crop.expected_harvest,
        quantity: crop.quantity,
        status: crop.status
      };
    } catch (error) {
      console.error(`Error fetching crop with ID ${id}:`, error);
      throw error;
    }
  },

  async getByFarmId(farmId) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "crop_type" } },
          { field: { Name: "field" } },
          { field: { Name: "planting_date" } },
          { field: { Name: "expected_harvest" } },
          { field: { Name: "quantity" } },
          { field: { Name: "status" } },
          { field: { Name: "farm_id" } }
        ],
        where: [
          {
            FieldName: "farm_id",
            Operator: "EqualTo",
            Values: [parseInt(farmId, 10)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('crop', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
return response.data.map(crop => ({
        Id: crop.Id,
        name: crop.Name,
        farmId: crop.farm_id,
        cropType: crop.crop_type,
        field: crop.field,
        plantingDate: crop.planting_date,
        expectedHarvest: crop.expected_harvest,
        quantity: crop.quantity,
        status: crop.status
      }));
    } catch (error) {
      console.error('Error fetching crops by farm ID:', error);
      throw error;
    }
  },

  async create(cropData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
records: [{
          Name: cropData.name,
          crop_type: cropData.cropType,
          field: cropData.field,
          planting_date: cropData.plantingDate,
          expected_harvest: cropData.expectedHarvest,
          quantity: cropData.quantity,
          status: cropData.status,
          farm_id: parseInt(cropData.farmId, 10)
        }]
      };

      const response = await apperClient.createRecord('crop', params);

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
          const crop = successfulRecords[0].data;
return {
            Id: crop.Id,
            name: crop.Name,
            farmId: crop.farm_id,
            cropType: crop.crop_type,
            field: crop.field,
            plantingDate: crop.planting_date,
            expectedHarvest: crop.expected_harvest,
            quantity: crop.quantity,
            status: crop.status
          };
        }
      }

      throw new Error('Failed to create crop');
    } catch (error) {
      console.error('Error creating crop:', error);
      throw error;
    }
  },

  async update(id, cropData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
records: [{
          Id: parseInt(id, 10),
          Name: cropData.name,
          crop_type: cropData.cropType,
          field: cropData.field,
          planting_date: cropData.plantingDate,
          expected_harvest: cropData.expectedHarvest,
          quantity: cropData.quantity,
          status: cropData.status,
          farm_id: parseInt(cropData.farmId, 10)
        }]
      };

      const response = await apperClient.updateRecord('crop', params);

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
          const crop = successfulUpdates[0].data;
          return {
            Id: crop.Id,
            name: crop.Name,
            farmId: crop.farm_id,
            cropType: crop.crop_type,
            field: crop.field,
            plantingDate: crop.planting_date,
            expectedHarvest: crop.expected_harvest,
            quantity: crop.quantity,
            status: crop.status
          };
        }
      }

      throw new Error('Failed to update crop');
    } catch (error) {
      console.error('Error updating crop:', error);
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

      const response = await apperClient.deleteRecord('crop', params);

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
      console.error('Error deleting crop:', error);
      throw error;
    }
  }
};

export default cropService;