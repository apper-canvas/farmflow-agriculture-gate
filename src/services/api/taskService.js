import { toast } from 'react-toastify';

const taskService = {
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
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "priority" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ],
        orderBy: [{ fieldName: "due_date", sorttype: "ASC" }]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
      return response.data.map(task => ({
        Id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        completed: task.completed,
        priority: task.priority
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "priority" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ]
      };

      const response = await apperClient.getRecordById('task', parseInt(id, 10), params);

      if (!response || !response.data) {
        return null;
      }

      // Transform data to match UI expectations
      const task = response.data;
      return {
        Id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        completed: task.completed,
        priority: task.priority
      };
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
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
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "priority" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ],
        where: [
          {
            FieldName: "farm_id",
            Operator: "EqualTo",
            Values: [parseInt(farmId, 10)]
          }
        ]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
      return response.data.map(task => ({
        Id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        completed: task.completed,
        priority: task.priority
      }));
    } catch (error) {
      console.error('Error fetching tasks by farm ID:', error);
      throw error;
    }
  },

  async getPending() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "due_date" } },
          { field: { Name: "completed" } },
          { field: { Name: "priority" } },
          { field: { Name: "farm_id" } },
          { field: { Name: "crop_id" } }
        ],
        where: [
          {
            FieldName: "completed",
            Operator: "EqualTo",
            Values: [false]
          }
        ]
      };

      const response = await apperClient.fetchRecords('task', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform data to match UI expectations
      return response.data.map(task => ({
        Id: task.Id,
        farmId: task.farm_id,
        cropId: task.crop_id,
        title: task.title,
        type: task.type,
        dueDate: task.due_date,
        completed: task.completed,
        priority: task.priority
      }));
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Name: taskData.title,
          title: taskData.title,
          type: taskData.type,
          due_date: taskData.dueDate,
          completed: false,
          priority: taskData.priority,
          farm_id: parseInt(taskData.farmId, 10),
          crop_id: taskData.cropId ? parseInt(taskData.cropId, 10) : null
        }]
      };

      const response = await apperClient.createRecord('task', params);

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
          const task = successfulRecords[0].data;
          return {
            Id: task.Id,
            farmId: task.farm_id,
            cropId: task.crop_id,
            title: task.title,
            type: task.type,
            dueDate: task.due_date,
            completed: task.completed,
            priority: task.priority
          };
        }
      }

      throw new Error('Failed to create task');
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  async update(id, taskData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id, 10),
          Name: taskData.title,
          title: taskData.title,
          type: taskData.type,
          due_date: taskData.dueDate,
          completed: taskData.completed,
          priority: taskData.priority,
          farm_id: parseInt(taskData.farmId, 10),
          crop_id: taskData.cropId ? parseInt(taskData.cropId, 10) : null
        }]
      };

      const response = await apperClient.updateRecord('task', params);

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
          const task = successfulUpdates[0].data;
          return {
            Id: task.Id,
            farmId: task.farm_id,
            cropId: task.crop_id,
            title: task.title,
            type: task.type,
            dueDate: task.due_date,
            completed: task.completed,
            priority: task.priority
          };
        }
      }

      throw new Error('Failed to update task');
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  async toggleComplete(id) {
    try {
      // First get the current task
      const currentTask = await this.getById(id);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Update with toggled completion status
      return await this.update(id, {
        ...currentTask,
        completed: !currentTask.completed
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
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

      const response = await apperClient.deleteRecord('task', params);

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
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

export default taskService;