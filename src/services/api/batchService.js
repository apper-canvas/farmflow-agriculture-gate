import batchesData from '../mockData/batches.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockBatches = [...batchesData];

export const batchService = {
  // Get all batches
  async getAllBatches(filters = {}) {
    try {
      await delay(300);
      
      let filteredBatches = [...mockBatches];
      
      // Apply filters
      if (filters.itemId) {
        filteredBatches = filteredBatches.filter(b => b.item_id === filters.itemId);
      }
      
      if (filters.supplier) {
        filteredBatches = filteredBatches.filter(b => 
          b.supplier.toLowerCase().includes(filters.supplier.toLowerCase())
        );
      }
      
      if (filters.expirationStatus) {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        
        if (filters.expirationStatus === 'expired') {
          filteredBatches = filteredBatches.filter(b => 
            b.expiration_date && new Date(b.expiration_date) < now
          );
        } else if (filters.expirationStatus === 'expiring_soon') {
          filteredBatches = filteredBatches.filter(b => 
            b.expiration_date && 
            new Date(b.expiration_date) >= now && 
            new Date(b.expiration_date) <= thirtyDaysFromNow
          );
        } else if (filters.expirationStatus === 'good') {
          filteredBatches = filteredBatches.filter(b => 
            !b.expiration_date || new Date(b.expiration_date) > thirtyDaysFromNow
          );
        }
      }

      // Sort by expiration date (earliest first for expired/expiring)
      filteredBatches.sort((a, b) => {
        if (!a.expiration_date && !b.expiration_date) return 0;
        if (!a.expiration_date) return 1;
        if (!b.expiration_date) return -1;
        return new Date(a.expiration_date) - new Date(b.expiration_date);
      });
      
      return filteredBatches;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Get batch by ID
  async getBatchById(batchId) {
    try {
      await delay(200);
      
      const batch = mockBatches.find(b => b.Id === batchId);
      
      if (!batch) {
        throw new Error('Batch not found');
      }
      
      return batch;
    } catch (error) {
      console.error(`Error fetching batch ${batchId}:`, error);
      throw error;
    }
  },

  // Get batches by item ID
  async getBatchesByItem(itemId) {
    try {
      await delay(200);
      
      const batches = mockBatches.filter(b => b.item_id === itemId);
      
      // Sort by expiration date (earliest first)
      batches.sort((a, b) => {
        if (!a.expiration_date && !b.expiration_date) return 0;
        if (!a.expiration_date) return 1;
        if (!b.expiration_date) return -1;
        return new Date(a.expiration_date) - new Date(b.expiration_date);
      });
      
      return batches;
    } catch (error) {
      console.error(`Error fetching batches for item ${itemId}:`, error);
      throw error;
    }
  },

  // Create new batch
  async createBatch(batchData) {
    try {
      await delay(400);
      
      const newBatch = {
        Id: Date.now(),
        item_id: batchData.item_id,
        item_name: batchData.item_name,
        batch_number: batchData.batch_number || `B${Date.now()}`,
        supplier: batchData.supplier || '',
        purchase_date: batchData.purchase_date || new Date().toISOString().split('T')[0],
        expiration_date: batchData.expiration_date || null,
        quantity_received: parseInt(batchData.quantity_received),
        quantity_remaining: parseInt(batchData.quantity_received), // Initially same as received
        unit_of_measure: batchData.unit_of_measure,
        unit_cost: parseFloat(batchData.unit_cost || 0),
        total_cost: parseFloat(batchData.total_cost || (batchData.quantity_received * batchData.unit_cost)),
        location_id: batchData.location_id,
        location_name: batchData.location_name || '',
        quality_grade: batchData.quality_grade || '',
        certifications: batchData.certifications || '',
        storage_conditions: batchData.storage_conditions || '',
        notes: batchData.notes || '',
        status: 'active', // active, expired, depleted
        created_by: 'Current User', // Would be from auth context
        created_at: new Date().toISOString()
      };

      mockBatches.push(newBatch);
      
      return newBatch;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update batch
  async updateBatch(batchId, batchData) {
    try {
      await delay(400);
      
      const batchIndex = mockBatches.findIndex(b => b.Id === batchId);
      
      if (batchIndex === -1) {
        throw new Error('Batch not found');
      }
      
      mockBatches[batchIndex] = {
        ...mockBatches[batchIndex],
        ...batchData,
        Id: batchId, // Ensure ID doesn't change
        modified_at: new Date().toISOString()
      };
      
      return mockBatches[batchIndex];
    } catch (error) {
      console.error(`Error updating batch ${batchId}:`, error);
      throw error;
    }
  },

  // Delete batch
  async deleteBatch(batchId) {
    try {
      await delay(300);
      
      const batchIndex = mockBatches.findIndex(b => b.Id === batchId);
      
      if (batchIndex === -1) {
        throw new Error('Batch not found');
      }
      
      mockBatches.splice(batchIndex, 1);
      
      return true;
    } catch (error) {
      console.error(`Error deleting batch ${batchId}:`, error);
      throw error;
    }
  },

  // Get expiring batches (within specified days)
  async getExpiringBatches(daysAhead = 30) {
    try {
      await delay(200);
      
      const now = new Date();
      const targetDate = new Date();
      targetDate.setDate(now.getDate() + daysAhead);
      
      const expiringBatches = mockBatches.filter(batch => {
        if (!batch.expiration_date) return false;
        
        const expDate = new Date(batch.expiration_date);
        return expDate >= now && expDate <= targetDate && batch.quantity_remaining > 0;
      });
      
      // Sort by expiration date (earliest first)
      expiringBatches.sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
      
      return expiringBatches;
    } catch (error) {
      console.error('Error fetching expiring batches:', error);
      throw error;
    }
  },

  // Get expired batches
  async getExpiredBatches() {
    try {
      await delay(200);
      
      const now = new Date();
      
      const expiredBatches = mockBatches.filter(batch => {
        if (!batch.expiration_date) return false;
        
        const expDate = new Date(batch.expiration_date);
        return expDate < now && batch.quantity_remaining > 0;
      });
      
      // Sort by expiration date (most recently expired first)
      expiredBatches.sort((a, b) => new Date(b.expiration_date) - new Date(a.expiration_date));
      
      return expiredBatches;
    } catch (error) {
      console.error('Error fetching expired batches:', error);
      throw error;
    }
  },

  // Update batch quantity (used when stock movements occur)
  async updateBatchQuantity(batchId, quantityUsed) {
    try {
      await delay(200);
      
      const batchIndex = mockBatches.findIndex(b => b.Id === batchId);
      
      if (batchIndex === -1) {
        throw new Error('Batch not found');
      }
      
      const batch = mockBatches[batchIndex];
      batch.quantity_remaining = Math.max(0, batch.quantity_remaining - quantityUsed);
      
      // Update status if depleted
      if (batch.quantity_remaining === 0) {
        batch.status = 'depleted';
      }
      
      batch.modified_at = new Date().toISOString();
      
      return batch;
    } catch (error) {
      console.error(`Error updating batch quantity ${batchId}:`, error);
      throw error;
    }
  },

  // Get batch summary statistics
  async getBatchSummary() {
    try {
      await delay(200);
      
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      const activeBatches = mockBatches.filter(b => b.quantity_remaining > 0);
      
      const summary = {
        total_batches: activeBatches.length,
        expired_count: activeBatches.filter(b => 
          b.expiration_date && new Date(b.expiration_date) < now
        ).length,
        expiring_soon_count: activeBatches.filter(b => 
          b.expiration_date && 
          new Date(b.expiration_date) >= now && 
          new Date(b.expiration_date) <= thirtyDaysFromNow
        ).length,
        total_value: activeBatches.reduce((sum, b) => 
          sum + (b.quantity_remaining * b.unit_cost), 0
        ),
        unique_suppliers: [...new Set(activeBatches.map(b => b.supplier))].length
      };
      
      return summary;
    } catch (error) {
      console.error('Error getting batch summary:', error);
      throw error;
    }
  }
};