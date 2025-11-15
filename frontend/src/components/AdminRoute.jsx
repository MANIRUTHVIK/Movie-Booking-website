import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
