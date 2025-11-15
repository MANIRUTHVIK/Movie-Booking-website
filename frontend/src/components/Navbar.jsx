import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/user/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/auth");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          MovieBook
        </Link>

        <div className="nav-links">
          {isAdmin() ? (
            <>
              <Link to="/admin" className="nav-link">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-nav">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                Movies
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={handleLogout} className="btn-nav">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
