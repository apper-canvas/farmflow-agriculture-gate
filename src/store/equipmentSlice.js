import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: {
    items: false,
  },
  error: {
    items: null,
  },
  filters: {
    equipmentType: '',
    maintenanceStatus: '',
    search: ''
  },
  stats: {
    totalEquipment: 0,
    activeEquipment: 0,
    maintenanceDue: 0,
    totalValue: 0
  },
  alerts: {
    maintenanceDue: [],
    breakdowns: []
  }
};

export const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    // Equipment items
    setEquipment: (state, action) => {
      state.items = action.payload;
      state.loading.items = false;
      state.error.items = null;
    },
    setEquipmentLoading: (state, action) => {
      state.loading.items = action.payload;
    },
    setEquipmentError: (state, action) => {
      state.error.items = action.payload;
      state.loading.items = false;
    },
    addEquipment: (state, action) => {
      state.items.push(action.payload);
    },
    updateEquipment: (state, action) => {
const index = state.items.findIndex(item => item.Id === action.payload.Id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeEquipment: (state, action) => {
      state.items = state.items.filter(item => item.Id !== action.payload);
    },
    
    // Filters and stats
    setEquipmentFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setEquipmentStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setEquipmentAlerts: (state, action) => {
      state.alerts = { ...state.alerts, ...action.payload };
    },
    
    // Clear all
    clearEquipmentData: (state) => {
      return initialState;
    }
  },
});

export const {
  setEquipment, setEquipmentLoading, setEquipmentError, addEquipment, updateEquipment, removeEquipment,
  setEquipmentFilters, setEquipmentStats, setEquipmentAlerts, clearEquipmentData
} = equipmentSlice.actions;

export default equipmentSlice.reducer;