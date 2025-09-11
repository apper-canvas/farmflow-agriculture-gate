import Equipment from "@/components/pages/Equipment";
import React from "react";
import Finance from "@/components/pages/Finance";
import Inventory from "@/components/pages/Inventory";
import BatchTracking from "@/components/pages/BatchTracking";
import StockMovements from "@/components/pages/StockMovements";
import Dashboard from "@/components/pages/Dashboard";
import Crops from "@/components/pages/Crops";
import Weather from "@/components/pages/Weather";
import Farms from "@/components/pages/Farms";
import Tasks from "@/components/pages/Tasks";
import StorageLocations from "@/components/pages/StorageLocations";

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'MapPin',
    component: Farms
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Sprout',
    component: Crops
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    path: '/finance',
    icon: 'DollarSign',
    component: Finance
  },
weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'Cloud',
    component: Weather
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    path: '/inventory',
    icon: 'Box',
    component: Inventory
  },
  storageLocations: {
    id: 'storage-locations',
    label: 'Storage Locations',
    path: '/inventory/locations',
    icon: 'Warehouse',
    component: StorageLocations
  },
  stockMovements: {
    id: 'stock-movements',
    label: 'Stock Movements',
    path: '/inventory/movements',
    icon: 'TrendingUp',
    component: StockMovements
  },
batchTracking: {
    id: 'batch-tracking',
    label: 'Batch Tracking',
    path: '/inventory/batches',
    icon: 'Package',
    component: BatchTracking
  },
  equipment: {
    id: 'equipment',
    label: 'Equipment',
    path: '/equipment',
    icon: 'Wrench',
    component: Equipment
  }
};

export const routeArray = Object.values(routes);