import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import "./Homepage.css";

const Homepage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    filterMovies();
  }, [searchQuery, genreFilter, movies]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/movies");
      setMovies(response.data.movies || []);
      setFilteredMovies(response.data.movies || []);
    } catch (error) {
      console.error("Failed to fetch movies:", error);
      setError("Failed to load movies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterMovies = () => {
    let filtered = movies;

    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(
        (movie) => movie.genre?.toLowerCase() === genreFilter.toLowerCase()
      );
    }

    setFilteredMovies(filtered);
  };

  const genres = [...new Set(movies.map((m) => m.genre).filter(Boolean))];

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading movies..." />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Now Showing</h1>
          <p className="page-subtitle">Book your favorite movies</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="genre-filters">
            <button
              className={`filter-btn ${!genreFilter ? "active" : ""}`}
              onClick={() => setGenreFilter("")}
            >
              All
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`filter-btn ${
                  genreFilter === genre ? "active" : ""
                }`}
                onClick={() => setGenreFilter(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <div className="movies-grid">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))
          ) : (
            <div className="no-results">
              <p>No movies found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Homepage;
