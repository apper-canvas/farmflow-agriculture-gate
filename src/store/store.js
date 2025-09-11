import { configureStore } from "@reduxjs/toolkit";
import equipmentReducer from "./equipmentSlice";
import userReducer from "./userSlice";
import inventoryReducer from "./inventorySlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    equipment: equipmentReducer,
    inventory: inventoryReducer,
  },
});

export default store;