import { useState, useEffect } from "react";
import "./Authpage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Authpage = () => {
  const { login: authLogin } = useAuth();
  const [signup, setSignup] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    setError("");
    if (signup && !name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email address";
    if (!password) return "Password is required";
    if (password.length < 4)
      return "Password must be at least 4 characters long";
    return null;
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const clientError = validate();
    if (clientError) {
      setError(clientError);
      return;
    }

    setLoading(true);

    try {
      const url = signup
        ? "http://localhost:3000/auth/user/register"
        : "http://localhost:3000/auth/user/login";

      const payload = signup
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          body.error || body.message || `Request failed (${response.status})`;
        setError(message);
        return;
      }
      const token = body.token;
      const role = body.role || "user";

      if (token) {
        // Use AuthContext login function to update context state
        authLogin(token, role);
      }

      setSuccess(
        body.message ||
          (signup ? "Registration successful!" : "Login successful!")
      );

      setName("");
      setPassword("");
      setEmail("");

      // Navigate based on role
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 100);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box fade-in">
        {signup ? (
          <h2 className="title">Create Account</h2>
        ) : (
          <h2 className="title">Welcome Back</h2>
        )}

        {error && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form onSubmit={handleSubmit} className="form">
          {signup && (
            <>
              <label>Name</label>
              <input
                type="text"
                value={name}
                disabled={loading}
                onChange={(e) => setName(e.target.value)}
              />
            </>
          )}

          <label>Email</label>
          <input
            type="text"
            value={email}
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn primary" disabled={loading}>
            {loading
              ? signup
                ? "Signing up..."
                : "Logging in..."
              : signup
              ? "Sign up"
              : "Log in"}
          </button>
        </form>

        <button
          type="button"
          className="btn link"
          onClick={() => {
            setError("");
            setSuccess("");
            setSignup(!signup);
          }}
          disabled={loading}
        >
          {signup ? "Already have an account? Log in" : "Create a new account"}
        </button>
      </div>
    </div>
  );
};

export default Authpage;
