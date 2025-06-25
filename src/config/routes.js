import Dashboard from '@/components/pages/Dashboard';
import Farms from '@/components/pages/Farms';
import Crops from '@/components/pages/Crops';
import Tasks from '@/components/pages/Tasks';
import Finance from '@/components/pages/Finance';
import Weather from '@/components/pages/Weather';

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
  }
};

export const routeArray = Object.values(routes);