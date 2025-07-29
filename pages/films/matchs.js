import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import BottomNavigation from "../../components/BottomNavigation";

export default function FilmsMatchs() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [matchedMovies, setMatchedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const TMDB_BASE_URL = "https://image.tmdb.org/t/p";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userId");
      if (!stored || stored.trim() === "") {
        router.replace("/login");
      } else {
        setUserId(stored);
        fetchMatchedMovies();
      }
    }
  }, [router]);

  // Fonction utilitaire pour afficher une notification
  function showToast(message, color = "#d0488f") {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }

  // Fonction utilitaire pour afficher le nom d'utilisateur
  function displayUserName(userId) {
    if (userId === "victor") return "Victor";
    if (userId === "alyssia") return "Alyssia";
    return userId;
  }

  // Récupérer les films matchés
  async function fetchMatchedMovies() {
    setLoading(true);

    try {
      // Récupérer tous les films swipés à droite par les deux utilisateurs
      const { data: swipes, error: swipesError } = await supabase
        .from("movie_swipes")
        .select(
          `
          movie_id,
          action,
          user_id,
          movies (
            id,
            title,
            overview,
            poster_path,
            release_date,
            vote_average,
            genre_ids
          )
        `
        )
        .eq("action", "right");

      if (swipesError) {
        console.error("Erreur fetchMatchedMovies:", swipesError);
        setMatchedMovies([]);
        setLoading(false);
        return;
      }

      if (!swipes || swipes.length === 0) {
        setMatchedMovies([]);
        setLoading(false);
        return;
      }

      // Grouper par film et vérifier les matchs
      const movieGroups = {};
      swipes.forEach((swipe) => {
        if (swipe.movies && !movieGroups[swipe.movie_id]) {
          movieGroups[swipe.movie_id] = {
            movie: swipe.movies,
            users: [],
          };
        }
        if (movieGroups[swipe.movie_id]) {
          movieGroups[swipe.movie_id].users.push(swipe.user_id);
        }
      });

      // Filtrer les films avec les deux utilisateurs
      const matched = Object.values(movieGroups)
        .filter((group) => group.users.length === 2)
        .map((group) => group.movie);

      // Récupérer les statuts "vu" pour chaque film
      const { data: watchedMovies, error: watchedError } = await supabase
        .from("movie_watched")
        .select("movie_id")
        .eq("user_id", userId);

      if (watchedError) {
        console.error("Erreur récupération films vus:", watchedError);
      }

      const watchedMovieIds = watchedMovies?.map((w) => w.movie_id) || [];

      // Ajouter le statut "vu" à chaque film
      const moviesWithWatchedStatus = matched.map((movie) => ({
        ...movie,
        is_watched: watchedMovieIds.includes(movie.id),
      }));

      setMatchedMovies(moviesWithWatchedStatus);
    } catch (error) {
      console.error("Erreur fetchMatchedMovies:", error);
      setMatchedMovies([]);
    }

    setLoading(false);
  }

  // Marquer un film comme vu
  async function markAsWatched(movieId) {
    const { error } = await supabase.from("movie_watched").upsert(
      {
        user_id: userId,
        movie_id: movieId,
        watched_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,movie_id",
      }
    );

    if (error) {
      console.error("Erreur markAsWatched:", error);
      showToast("Erreur lors du marquage", "red");
      return;
    }

    showToast("Film marqué comme vu ! 👀");

    // Mettre à jour l'état local
    setMatchedMovies((prev) =>
      prev.map((movie) =>
        movie.id === movieId ? { ...movie, is_watched: true } : movie
      )
    );
  }

  // Obtenir l'URL de l'image TMDB
  function getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `${TMDB_BASE_URL}/${size}${path}`;
  }

  // Obtenir les genres
  function getGenres(genreIds) {
    if (!genreIds || !Array.isArray(genreIds)) return [];

    const genreMap = {
      28: "Action",
      12: "Aventure",
      16: "Animation",
      35: "Comédie",
      80: "Crime",
      99: "Documentaire",
      18: "Drame",
      10751: "Famille",
      14: "Fantasy",
      36: "Histoire",
      27: "Horreur",
      10402: "Musique",
      9648: "Mystère",
      10749: "Romance",
      878: "Science-Fiction",
      10770: "Téléfilm",
      53: "Thriller",
      10752: "Guerre",
      37: "Western",
    };

    return genreIds.map((id) => genreMap[id]).filter(Boolean);
  }

  return (
    <div className="matchs-container">
      {/* Header */}
      <div className="matchs-header">
        <div className="header-content">
          <div className="header-icon">💕</div>
          <h1 className="header-title">Matchs Films</h1>
          <p className="header-subtitle">Vos films en commun</p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="matchs-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-icon">💕</div>
            <h3 className="loading-title">Chargement des matchs...</h3>
          </div>
        ) : matchedMovies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3 className="empty-title">Aucun match pour le moment</h3>
            <p className="empty-subtitle">
              Continuez à swiper pour découvrir vos films en commun !
            </p>
            <button
              className="back-button"
              onClick={() => router.push("/films")}
            >
              Retour aux films
            </button>
          </div>
        ) : (
          <div className="matchs-grid">
            {matchedMovies.map((movie) => (
              <div key={movie.id} className="match-card">
                <div className="match-image-container">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="match-poster"
                    onError={(e) => {
                      e.target.src = "/placeholder-movie.jpg";
                    }}
                  />
                  {movie.is_watched && (
                    <div className="watched-badge">
                      <span className="watched-icon">👀</span>
                    </div>
                  )}
                </div>

                <div className="match-info">
                  <h3 className="match-title">{movie.title}</h3>

                  <div className="match-genres">
                    {getGenres(movie.genre_ids)
                      .slice(0, 2)
                      .map((genre, index) => (
                        <span key={index} className="genre-tag">
                          {genre}
                        </span>
                      ))}
                  </div>

                  {movie.release_date && (
                    <p className="match-year">
                      {movie.release_date.split("-")[0]}
                    </p>
                  )}

                  {movie.vote_average && (
                    <div className="match-rating">
                      <span className="rating-star">⭐</span>
                      <span className="rating-score">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}

                  {movie.overview && (
                    <p className="match-overview">
                      {movie.overview.length > 100
                        ? `${movie.overview.substring(0, 100)}...`
                        : movie.overview}
                    </p>
                  )}

                  {!movie.is_watched && (
                    <button
                      className="watch-button"
                      onClick={() => markAsWatched(movie.id)}
                    >
                      <span className="watch-icon">👀</span>
                      <span className="watch-text">Marquer comme vu</span>
                    </button>
                  )}

                  {movie.is_watched && (
                    <div className="watched-status">
                      <span className="watched-text">✅ Vu</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="toast" style={{ color: toast.color }}>
          {toast.message}
        </div>
      )}

      <BottomNavigation activePage="films" />

      <style jsx>{`
        .matchs-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .matchs-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.8);
          padding: 24px 24px 20px 24px;
          text-align: center;
          box-shadow: 0 2px 20px rgba(255, 214, 239, 0.3);
        }

        .header-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .header-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .header-title {
          color: #d0488f;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          color: #b86fa5;
          font-size: 14px;
          margin: 0;
          font-weight: 500;
        }

        .matchs-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          margin-top: 24px;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 48px 24px;
        }

        .loading-icon,
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .loading-title,
        .empty-title {
          color: #d0488f;
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .empty-subtitle {
          color: #b86fa5;
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .back-button {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
        }

        .matchs-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }

        .match-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(255, 200, 220, 0.15);
          transition: all 0.3s ease;
        }

        .match-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 200, 220, 0.25);
        }

        .match-image-container {
          position: relative;
          width: 100%;
          height: 200px;
        }

        .match-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .watched-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(76, 175, 80, 0.9);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .watched-icon {
          font-size: 16px;
        }

        .match-info {
          padding: 20px;
        }

        .match-title {
          color: #d0488f;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .match-genres {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .genre-tag {
          background: #ffeef8;
          color: #d0488f;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .match-year {
          color: #b86fa5;
          font-size: 12px;
          margin: 0 0 8px 0;
        }

        .match-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }

        .rating-star {
          font-size: 14px;
        }

        .rating-score {
          color: #b86fa5;
          font-size: 12px;
          font-weight: 600;
        }

        .match-overview {
          color: #666;
          font-size: 13px;
          line-height: 1.4;
          margin: 0 0 16px 0;
        }

        .watch-button {
          width: 100%;
          padding: 12px 16px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .watch-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .watch-icon {
          font-size: 16px;
        }

        .watch-text {
          font-size: 14px;
        }

        .watched-status {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 16px;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 12px;
        }

        .watched-text {
          color: #4caf50;
          font-weight: 600;
          font-size: 14px;
        }

        .toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #ffebee;
          border: 1.5px solid #ffcdd2;
          border-radius: 12px;
          padding: 12px 32px;
          font-weight: 600;
          font-size: 17px;
          box-shadow: 0 4px 16px rgba(255, 200, 220, 0.4);
          z-index: 2000;
          animation: slideInDown 0.3s ease-out;
        }

        @keyframes slideInDown {
          from {
            transform: translateX(-50%) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
