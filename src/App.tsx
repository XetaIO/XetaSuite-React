import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { RequireAuth, RequireGuest } from './hooks/useRequireAuth';
import { ProtectedRoute } from './hooks/useProtectedRoute';
import AppLayout from './layout/AppLayout';
import SignIn from "./pages/Auth/SignIn";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Home from './pages/Dashboard/Home';
import { SuppliersPage, SupplierDetailPage } from './pages/Suppliers';
import { UnauthorizedPage } from './pages/Errors';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes (guest only) */}
          <Route
            path="/auth/login"
            element={
              <RequireGuest>
                <SignIn />
              </RequireGuest>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RequireGuest>
                <ForgotPassword />
              </RequireGuest>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RequireGuest>
                <ResetPassword />
              </RequireGuest>
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Suppliers - protected by supplier.viewAny permission */}
            <Route
              path="/suppliers"
              element={
                <ProtectedRoute permission="supplier.viewAny">
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/suppliers/:id"
              element={
                <ProtectedRoute permission="supplier.view">
                  <SupplierDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
