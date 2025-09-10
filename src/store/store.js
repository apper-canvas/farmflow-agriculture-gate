import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import inventoryReducer from './inventorySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    inventory: inventoryReducer,
  },
});