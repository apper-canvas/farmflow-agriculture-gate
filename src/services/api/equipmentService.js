import equipmentData from '../mockData/equipment.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock service for equipment management
export const equipmentService = {
  // Get all equipment
  async getAllEquipment(filters = {}) {
    try {
      await delay(300);
      
      let filteredData = [...equipmentData];
      
      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(item => 
          item.name?.toLowerCase().includes(searchTerm) ||
          item.model?.toLowerCase().includes(searchTerm) ||
          item.manufacturer?.toLowerCase().includes(searchTerm) ||
          item.serial_number?.toLowerCase().includes(searchTerm) ||
          item.equipment_type?.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply equipment type filter
      if (filters.equipmentType) {
        filteredData = filteredData.filter(item => 
          item.equipment_type === filters.equipmentType
        );
      }
      
      // Apply maintenance status filter
      if (filters.maintenanceStatus) {
        filteredData = filteredData.filter(item => 
          item.maintenance_status === filters.maintenanceStatus
        );
      }
      
      // Apply status filter
      if (filters.status) {
        filteredData = filteredData.filter(item => 
          item.status === filters.status
        );
      }
      
      return filteredData;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  // Get equipment by ID
  async getEquipmentById(equipmentId) {
    try {
      await delay(200);
      
      const equipment = equipmentData.find(item => item.Id === parseInt(equipmentId));
      
      if (!equipment) {
        throw new Error('Equipment not found');
      }
      
      return equipment;
    } catch (error) {
      console.error(`Error fetching equipment ${equipmentId}:`, error);
      throw error;
    }
  },

  // Create new equipment
  async createEquipment(equipmentData) {
    try {
      await delay(400);
      
      // Generate new ID
      const maxId = Math.max(...equipmentData.map(item => item.Id), 0);
      const newEquipment = {
        ...equipmentData,
        Id: maxId + 1,
        purchase_date: new Date().toISOString().split('T')[0],
        last_maintenance: null,
        next_maintenance: null,
        hours_operated: 0
      };
      
      // In a real app, this would persist to database
      return newEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
  },

  // Update equipment
  async updateEquipment(equipmentId, updatedData) {
    try {
      await delay(400);
      
      const existingEquipment = equipmentData.find(item => item.Id === parseInt(equipmentId));
      
      if (!existingEquipment) {
        throw new Error('Equipment not found');
      }
      
      const updatedEquipment = {
        ...existingEquipment,
        ...updatedData,
        Id: parseInt(equipmentId) // Ensure ID doesn't change
      };
      
      // In a real app, this would persist to database
      return updatedEquipment;
    } catch (error) {
      console.error(`Error updating equipment ${equipmentId}:`, error);
      throw error;
    }
  },

  // Delete equipment
  async deleteEquipment(equipmentId) {
    try {
      await delay(300);
      
      const equipmentIndex = equipmentData.findIndex(item => item.Id === parseInt(equipmentId));
      
      if (equipmentIndex === -1) {
        throw new Error('Equipment not found');
      }
      
      // In a real app, this would delete from database
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  },

  // Get equipment statistics
  async getEquipmentStats() {
    try {
      await delay(250);
      
      const totalEquipment = equipmentData.length;
      const activeEquipment = equipmentData.filter(item => item.status === 'Active').length;
      const maintenanceDue = equipmentData.filter(item => item.maintenance_status === 'Maintenance Due').length;
      const totalValue = equipmentData.reduce((sum, item) => sum + (item.current_value || 0), 0);
      
      return {
        totalEquipment,
        activeEquipment,
        maintenanceDue,
        totalValue
      };
    } catch (error) {
      console.error('Error fetching equipment stats:', error);
      throw error;
    }
  },

  // Get equipment types for filtering
  getEquipmentTypes() {
    const types = [...new Set(equipmentData.map(item => item.equipment_type))];
    return types.sort();
  },

  // Get maintenance statuses for filtering
  getMaintenanceStatuses() {
    const statuses = [...new Set(equipmentData.map(item => item.maintenance_status))];
    return statuses.sort();
  }
};