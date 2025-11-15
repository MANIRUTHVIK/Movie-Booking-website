import { useState, useEffect } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import "./Adminpage.css";

const Adminpage = () => {
  const [activeTab, setActiveTab] = useState("movies");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Movies state
  const [movies, setMovies] = useState([]);
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    duration: "",
    language: "",
    genre: "",
  });
  const [editingMovie, setEditingMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);

  // Shows state
  const [shows, setShows] = useState([]);
  const [showForm, setShowForm] = useState({
    movie: "",
    date: "",
    time: "",
    screen: "1",
    price: "",
    seats: "",
  });
  const [editingShow, setEditingShow] = useState(null);
  const [showShowModal, setShowShowModal] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (activeTab === "movies") fetchMovies();
    if (activeTab === "shows") {
      fetchShows();
      fetchMovies();
    }
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  // Fetch functions
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/movies");
      setMovies(response.data.movies || []);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setError("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      setLoading(true);
      const response = await api.get("/shows");
      setShows(response.data.shows || []);
    } catch (error) {
      console.error("Failed to fetch shows:", error);
      setError("Failed to load shows");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Movie handlers
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, movieForm);
        setSuccess("Movie updated successfully");
      } else {
        await api.post("/movies", movieForm);
        setSuccess("Movie added successfully");
      }

      setShowMovieModal(false);
      resetMovieForm();
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.error || "Operation failed");
    }
  };

  const handleMovieDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      await api.delete(`/movies/${id}`);
      setSuccess("Movie deleted successfully");
      fetchMovies();
    } catch (error) {
      setError(error.response?.data?.error || "Delete failed");
    }
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: "",
      description: "",
      duration: "",
      language: "",
      genre: "",
    });
    setEditingMovie(null);
  };

  const openMovieModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setMovieForm({
        title: movie.title,
        description: movie.description || "",
        duration: movie.duration || "",
        language: movie.language || "",
        genre: movie.genre || "",
      });
    } else {
      resetMovieForm();
    }
    setShowMovieModal(true);
  };

  // Show handlers
  const handleShowSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const seatCount = parseInt(showForm.seats) || 50;
      const seatsArray = Array.from({ length: seatCount }, (_, i) => ({
        number: String(i + 1),
        isBooked: false,
      }));

      const payload = {
        movie: showForm.movie,
        date: showForm.date,
        time: showForm.time,
        screen: parseInt(showForm.screen),
        price: parseFloat(showForm.price),
        seats: seatsArray,
      };

      if (editingShow) {
        await api.put(`/shows/${editingShow._id}`, payload);
        setSuccess("Show updated successfully");
      } else {
        await api.post("/shows", payload);
        setSuccess("Show added successfully");
      }

      setShowShowModal(false);
      resetShowForm();
      fetchShows();
    } catch (error) {
      setError(error.response?.data?.error || "Operation failed");
    }
  };

  const handleShowDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this show?")) return;

    try {
      await api.delete(`/shows/${id}`);
      setSuccess("Show deleted successfully");
      fetchShows();
    } catch (error) {
      setError(error.response?.data?.error || "Delete failed");
    }
  };

  const resetShowForm = () => {
    setShowForm({
      movie: "",
      date: "",
      time: "",
      screen: "1",
      price: "",
      seats: "50",
    });
    setEditingShow(null);
  };

  const openShowModal = (show = null) => {
    if (show) {
      setEditingShow(show);
      setShowForm({
        movie: show.movie?._id || show.movie,
        date: show.date,
        time: show.time,
        screen: show.screen,
        price: show.price,
        seats: show.seats?.length || 50,
      });
    } else {
      resetShowForm();
    }
    setShowShowModal(true);
  };

  const handleUserDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/user/${id}`);
      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.error || "Delete failed");
    }
  };

  if (
    loading &&
    movies.length === 0 &&
    shows.length === 0 &&
    users.length === 0
  ) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading dashboard..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage movies, shows, and users</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "movies" ? "active" : ""}`}
            onClick={() => setActiveTab("movies")}
          >
            Movies
          </button>
          <button
            className={`tab-btn ${activeTab === "shows" ? "active" : ""}`}
            onClick={() => setActiveTab("shows")}
          >
            Shows
          </button>
          <button
            className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>
        </div>

        <div className="admin-content">
          {activeTab === "movies" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Movies</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => openMovieModal()}
                >
                  + Add Movie
                </button>
              </div>

              <div className="admin-table">
                {movies.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Language</th>
                        <th>Genre</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((movie) => (
                        <tr key={movie._id}>
                          <td>{movie.title}</td>
                          <td>
                            {movie.duration ? `${movie.duration} min` : "N/A"}
                          </td>
                          <td>{movie.language || "N/A"}</td>
                          <td>{movie.genre || "N/A"}</td>
                          <td>
                            <button
                              className="btn-action edit"
                              onClick={() => openMovieModal(movie)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action delete"
                              onClick={() => handleMovieDelete(movie._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-results">No movies found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "shows" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Shows</h2>
                <button
                  className="btn btn-primary"
                  onClick={() => openShowModal()}
                >
                  + Add Show
                </button>
              </div>

              <div className="admin-table">
                {shows.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Movie</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Screen</th>
                        <th>Price</th>
                        <th>Available Seats</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shows.map((show) => (
                        <tr key={show._id}>
                          <td>{show.movie?.title || "N/A"}</td>
                          <td>{show.date}</td>
                          <td>{show.time}</td>
                          <td>{show.screen}</td>
                          <td>${show.price}</td>
                          <td>
                            {show.seats?.filter((s) => !s.isBooked).length || 0}
                          </td>
                          <td>
                            <button
                              className="btn-action edit"
                              onClick={() => openShowModal(show)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action delete"
                              onClick={() => handleShowDelete(show._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-results">No shows found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="admin-section">
              <div className="section-header">
                <h2>Users</h2>
              </div>

              <div className="admin-table">
                {users.length > 0 ? (
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-action delete"
                              onClick={() => handleUserDelete(user._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-results">No users found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Movie Modal */}
        <Modal
          isOpen={showMovieModal}
          onClose={() => setShowMovieModal(false)}
          title={editingMovie ? "Edit Movie" : "Add New Movie"}
        >
          <form onSubmit={handleMovieSubmit} className="admin-form">
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={movieForm.title}
                onChange={(e) =>
                  setMovieForm({ ...movieForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={movieForm.description}
                onChange={(e) =>
                  setMovieForm({ ...movieForm, description: e.target.value })
                }
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={movieForm.duration}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, duration: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  value={movieForm.language}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, language: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Genre</label>
                <input
                  type="text"
                  value={movieForm.genre}
                  onChange={(e) =>
                    setMovieForm({ ...movieForm, genre: e.target.value })
                  }
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {editingMovie ? "Update Movie" : "Add Movie"}
            </button>
          </form>
        </Modal>

        {/* Show Modal */}
        <Modal
          isOpen={showShowModal}
          onClose={() => setShowShowModal(false)}
          title={editingShow ? "Edit Show" : "Add New Show"}
        >
          <form onSubmit={handleShowSubmit} className="admin-form">
            <div className="form-group">
              <label>Movie *</label>
              <select
                value={showForm.movie}
                onChange={(e) =>
                  setShowForm({ ...showForm, movie: e.target.value })
                }
                required
              >
                <option value="">Select a movie</option>
                {movies.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={showForm.date}
                  onChange={(e) =>
                    setShowForm({ ...showForm, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  value={showForm.time}
                  onChange={(e) =>
                    setShowForm({ ...showForm, time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Screen</label>
                <input
                  type="number"
                  value={showForm.screen}
                  onChange={(e) =>
                    setShowForm({ ...showForm, screen: e.target.value })
                  }
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  step="10"
                  min="0"
                  max="1000"
                  value={showForm.price}
                  onChange={(e) =>
                    setShowForm({ ...showForm, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Seats</label>
                <input
                  type="number"
                  value={showForm.seats}
                  onChange={(e) =>
                    setShowForm({ ...showForm, seats: e.target.value })
                  }
                  min="1"
                  max="500"
                  step="10"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              {editingShow ? "Update Show" : "Add Show"}
            </button>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Adminpage;
