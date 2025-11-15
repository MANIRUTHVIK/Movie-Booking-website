import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="movie-card fade-in">
      <div className="movie-card-content">
        <h3 className="movie-title">{movie.title}</h3>
        <p className="movie-description">
          {movie.description || "No description available"}
        </p>
        <div className="movie-details">
          {movie.duration && (
            <span className="detail-badge">{movie.duration} min</span>
          )}
          {movie.language && (
            <span className="detail-badge">{movie.language}</span>
          )}
          {movie.genre && <span className="detail-badge">{movie.genre}</span>}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(`/shows/${movie._id}`)}
        >
          Book Tickets
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
