import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Layout from './Layout';
import { routeArray } from './config/routes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {routeArray.map(route => (
            <Route
              key={route.id}
              path={route.path}
              element={<route.component />}
            />
          ))}
          <Route path="*" element={<div className="flex items-center justify-center h-full text-gray-500">Page not found</div>} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-[9999]"
        toastClassName="bg-white border-l-4 border-l-primary shadow-lg"
        bodyClassName="text-gray-800"
        progressClassName="bg-primary"
      />
    </BrowserRouter>
  );
}

export default App;