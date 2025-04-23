import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppDispatch, RootState } from './store';
import { loadUser } from './store/slices/authSlice';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import StoreOwnerLayout from './layouts/StoreOwnerLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UserStores from './pages/user/Stores';
import UserStoreDetails from './pages/user/StoreDetails';

// Store Owner Pages
import StoreOwnerDashboard from './pages/storeOwner/Dashboard';
import StoreOwnerProfile from './pages/storeOwner/Profile';
import StoreOwnerStores from './pages/storeOwner/Stores';

// Shared Components
import NotFound from './pages/NotFound';
import Loading from './components/common/Loading';

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// ProtectedRoute component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" />;
      case 'store_owner':
        return <Navigate to="/store-owner/dashboard" />;
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  const getHomeRoute = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'store_owner':
        return '/store-owner/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Home route redirect */}
        <Route path="/" element={<Navigate to={getHomeRoute()} />} />

        {/* Auth routes */}
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <AdminStores />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* User routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserLayout>
                <UserDashboard />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserLayout>
                <UserProfile />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserLayout>
                <UserStores />
              </UserLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stores/:id"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserLayout>
                <UserStoreDetails />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        {/* Store Owner routes */}
        <Route
          path="/store-owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerLayout>
                <StoreOwnerDashboard />
              </StoreOwnerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner/profile"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerLayout>
                <StoreOwnerProfile />
              </StoreOwnerLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/store-owner/stores"
          element={
            <ProtectedRoute allowedRoles={['store_owner']}>
              <StoreOwnerLayout>
                <StoreOwnerStores />
              </StoreOwnerLayout>
            </ProtectedRoute>
          }
        />

        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App; 