import stockMovementsData from '../mockData/stockMovements.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockMovements = [...stockMovementsData];

export const stockMovementService = {
  // Get all stock movements
  async getAllMovements(filters = {}) {
    try {
      await delay(300);
      
      let filteredMovements = [...mockMovements];
      
      // Apply filters
      if (filters.itemId) {
        filteredMovements = filteredMovements.filter(m => m.item_id === filters.itemId);
      }
      
      if (filters.type) {
        filteredMovements = filteredMovements.filter(m => m.movement_type === filters.type);
      }
      
      if (filters.startDate) {
        filteredMovements = filteredMovements.filter(m => 
          new Date(m.movement_date) >= new Date(filters.startDate)
        );
      }
      
      if (filters.endDate) {
        filteredMovements = filteredMovements.filter(m => 
          new Date(m.movement_date) <= new Date(filters.endDate)
        );
      }

      // Sort by date descending
      filteredMovements.sort((a, b) => new Date(b.movement_date) - new Date(a.movement_date));
      
      return filteredMovements;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  },

  // Get movements by item ID
  async getMovementsByItem(itemId) {
    try {
      await delay(200);
      
      const movements = mockMovements.filter(m => m.item_id === itemId);
      movements.sort((a, b) => new Date(b.movement_date) - new Date(a.movement_date));
      
      return movements;
    } catch (error) {
      console.error(`Error fetching movements for item ${itemId}:`, error);
      throw error;
    }
  },

  // Create new stock movement
  async createMovement(movementData) {
    try {
      await delay(400);
      
      const newMovement = {
        Id: Date.now(),
        item_id: movementData.item_id,
        item_name: movementData.item_name,
        movement_type: movementData.movement_type, // 'stock_in', 'stock_out', 'adjustment'
        quantity: parseInt(movementData.quantity),
        unit_of_measure: movementData.unit_of_measure,
        movement_date: movementData.movement_date || new Date().toISOString(),
        reason: movementData.reason || '',
        reference_number: movementData.reference_number || '',
        location_id: movementData.location_id,
        location_name: movementData.location_name || '',
        batch_number: movementData.batch_number || '',
        supplier: movementData.supplier || '',
        unit_cost: parseFloat(movementData.unit_cost || 0),
        total_cost: parseFloat(movementData.total_cost || 0),
        notes: movementData.notes || '',
        created_by: 'Current User', // Would be from auth context
        created_at: new Date().toISOString()
      };

      // Add to beginning of array for latest-first ordering
      mockMovements.unshift(newMovement);
      
      return newMovement;
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  },

  // Get current stock for an item
  async getCurrentStock(itemId) {
    try {
      await delay(200);
      
      const movements = mockMovements.filter(m => m.item_id === itemId);
      
      let currentStock = 0;
      let totalCost = 0;
      
      movements.forEach(movement => {
        if (movement.movement_type === 'stock_in') {
          currentStock += movement.quantity;
          totalCost += movement.total_cost || 0;
        } else if (movement.movement_type === 'stock_out') {
          currentStock -= movement.quantity;
        } else if (movement.movement_type === 'adjustment') {
          // Adjustment can be positive or negative
          currentStock += movement.quantity;
        }
      });
      
      const avgCost = currentStock > 0 ? totalCost / currentStock : 0;
      
      return {
        item_id: itemId,
        current_quantity: Math.max(0, currentStock), // Ensure non-negative
        average_cost: avgCost,
        total_value: currentStock * avgCost,
        last_movement_date: movements.length > 0 ? movements[0].movement_date : null
      };
    } catch (error) {
      console.error(`Error calculating current stock for item ${itemId}:`, error);
      throw error;
    }
  },

  // Get stock levels for all items
  async getAllStockLevels() {
    try {
      await delay(300);
      
      // Get unique item IDs from movements
      const uniqueItemIds = [...new Set(mockMovements.map(m => m.item_id))];
      
      const stockLevels = {};
      
      for (const itemId of uniqueItemIds) {
        stockLevels[itemId] = await this.getCurrentStock(itemId);
      }
      
      return stockLevels;
    } catch (error) {
      console.error('Error calculating all stock levels:', error);
      throw error;
    }
  },

  // Get low stock items (requires threshold from inventory items)
  async getLowStockItems(inventoryItems) {
    try {
      await delay(200);
      
      const stockLevels = await this.getAllStockLevels();
      const lowStockItems = [];
      
      inventoryItems.forEach(item => {
        const stock = stockLevels[item.Id];
        const threshold = item.low_stock_threshold_c || 0;
        
        if (stock && stock.current_quantity <= threshold) {
          lowStockItems.push({
            ...item,
            current_quantity: stock.current_quantity,
            threshold: threshold,
            shortage: threshold - stock.current_quantity
          });
        }
      });
      
      return lowStockItems;
    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw error;
    }
  },

  // Get movement summary by date range
  async getMovementSummary(startDate, endDate) {
    try {
      await delay(300);
      
      let movements = [...mockMovements];
      
      if (startDate) {
        movements = movements.filter(m => new Date(m.movement_date) >= new Date(startDate));
      }
      
      if (endDate) {
        movements = movements.filter(m => new Date(m.movement_date) <= new Date(endDate));
      }
      
      const summary = {
        total_movements: movements.length,
        stock_in_count: movements.filter(m => m.movement_type === 'stock_in').length,
        stock_out_count: movements.filter(m => m.movement_type === 'stock_out').length,
        adjustment_count: movements.filter(m => m.movement_type === 'adjustment').length,
        total_value_in: movements
          .filter(m => m.movement_type === 'stock_in')
          .reduce((sum, m) => sum + (m.total_cost || 0), 0),
        total_value_out: movements
          .filter(m => m.movement_type === 'stock_out')
          .reduce((sum, m) => sum + (m.total_cost || 0), 0)
      };
      
      return summary;
    } catch (error) {
      console.error('Error getting movement summary:', error);
      throw error;
    }
  }
};