import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Homepage from "./pages/Homepage";
import Authpage from "./pages/Authpage";
import Adminpage from "./pages/Adminpage";
import ShowsPage from "./pages/ShowsPage";
import BookingPage from "./pages/BookingPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Authpage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Homepage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/shows/:movieId"
            element={
              <ProtectedRoute>
                <ShowsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/booking"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Adminpage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
