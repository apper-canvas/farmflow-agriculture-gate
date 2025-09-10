import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  locations: [],
  movements: [],
  batches: [],
  loading: {
    items: false,
    locations: false,
    movements: false,
    batches: false
  },
  error: {
    items: null,
    locations: null,
    movements: null,
    batches: null
  },
  filters: {
    itemType: '',
    location: '',
    lowStock: false
  },
  currentStock: {},
  alerts: {
    lowStock: [],
    expiringBatches: []
  }
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Items
    setItems: (state, action) => {
      state.items = action.payload;
      state.loading.items = false;
      state.error.items = null;
    },
    setItemsLoading: (state, action) => {
      state.loading.items = action.payload;
    },
    setItemsError: (state, action) => {
      state.error.items = action.payload;
      state.loading.items = false;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.Id === action.payload.Id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.Id !== action.payload);
    },
    
    // Locations
    setLocations: (state, action) => {
      state.locations = action.payload;
      state.loading.locations = false;
      state.error.locations = null;
    },
    setLocationsLoading: (state, action) => {
      state.loading.locations = action.payload;
    },
    setLocationsError: (state, action) => {
      state.error.locations = action.payload;
      state.loading.locations = false;
    },
    addLocation: (state, action) => {
      state.locations.push(action.payload);
    },
    updateLocation: (state, action) => {
      const index = state.locations.findIndex(loc => loc.Id === action.payload.Id);
      if (index !== -1) {
        state.locations[index] = action.payload;
      }
    },
    removeLocation: (state, action) => {
      state.locations = state.locations.filter(loc => loc.Id !== action.payload);
    },
    
    // Movements
    setMovements: (state, action) => {
      state.movements = action.payload;
      state.loading.movements = false;
      state.error.movements = null;
    },
    setMovementsLoading: (state, action) => {
      state.loading.movements = action.payload;
    },
    setMovementsError: (state, action) => {
      state.error.movements = action.payload;
      state.loading.movements = false;
    },
    addMovement: (state, action) => {
      state.movements.unshift(action.payload);
    },
    
    // Batches
    setBatches: (state, action) => {
      state.batches = action.payload;
      state.loading.batches = false;
      state.error.batches = null;
    },
    setBatchesLoading: (state, action) => {
      state.loading.batches = action.payload;
    },
    setBatchesError: (state, action) => {
      state.error.batches = action.payload;
      state.loading.batches = false;
    },
    addBatch: (state, action) => {
      state.batches.push(action.payload);
    },
    updateBatch: (state, action) => {
      const index = state.batches.findIndex(batch => batch.Id === action.payload.Id);
      if (index !== -1) {
        state.batches[index] = action.payload;
      }
    },
    removeBatch: (state, action) => {
      state.batches = state.batches.filter(batch => batch.Id !== action.payload);
    },
    
    // Filters and alerts
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentStock: (state, action) => {
      state.currentStock = action.payload;
    },
    setAlerts: (state, action) => {
      state.alerts = { ...state.alerts, ...action.payload };
    },
    
    // Clear all
    clearInventoryData: (state) => {
      return initialState;
    }
  },
});

export const {
  setItems, setItemsLoading, setItemsError, addItem, updateItem, removeItem,
  setLocations, setLocationsLoading, setLocationsError, addLocation, updateLocation, removeLocation,
  setMovements, setMovementsLoading, setMovementsError, addMovement,
  setBatches, setBatchesLoading, setBatchesError, addBatch, updateBatch, removeBatch,
  setFilters, setCurrentStock, setAlerts, clearInventoryData
} = inventorySlice.actions;

export default inventorySlice.reducer;