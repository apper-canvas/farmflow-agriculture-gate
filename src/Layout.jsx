import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-primary hover:bg-surface-100 rounded-lg transition-colors"
          >
            <ApperIcon name="Menu" size={24} />
          </button>

          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ApperIcon name="Sprout" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-display font-bold text-primary">FarmFlow</h1>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
              <ApperIcon name="MapPin" size={16} />
              <span>Main Farm</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-surface-200 z-40">
          <nav className="h-full overflow-y-auto p-4">
            <div className="space-y-2">
              {routeArray.map((route) => (
                <NavLink
                  key={route.id}
                  to={route.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white border-l-4 border-l-accent'
                        : 'text-gray-600 hover:bg-surface-100 hover:text-primary'
                    }`
                  }
                >
                  <ApperIcon name={route.icon} size={20} />
                  <span>{route.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={backdropVariants}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="h-16 px-4 flex items-center justify-between border-b border-surface-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <ApperIcon name="Sprout" size={20} className="text-white" />
                      </div>
                      <h1 className="text-xl font-display font-bold text-primary">FarmFlow</h1>
                    </div>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                  <nav className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {routeArray.map((route) => (
                        <NavLink
                          key={route.id}
                          to={route.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive
                                ? 'bg-primary text-white border-l-4 border-l-accent'
                                : 'text-gray-600 hover:bg-surface-100 hover:text-primary'
                            }`
                          }
                        >
                          <ApperIcon name={route.icon} size={20} />
                          <span>{route.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  </nav>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;