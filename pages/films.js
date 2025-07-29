import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BottomNavigation from "../components/BottomNavigation";

export default function Films() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [movies, setMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedMovie, setMatchedMovie] = useState(null);
  const [toast, setToast] = useState(null);

  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const searchTimeoutRef = useRef(null);

  const TMDB_API_KEY = "412d289d13a5da399d1488cbef5e32db"; // Clé publique TMDB
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("userId");
      if (!stored || stored.trim() === "") {
        router.replace("/login");
      } else {
        setUserId(stored);
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

  // Récupérer les films depuis la base de données
  async function fetchMovies() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        // Filtrer les films déjà swipés par l'utilisateur
        const { data: swipes, error: swipesError } = await supabase
          .from("movie_swipes")
          .select("movie_id")
          .eq("user_id", userId);

        if (swipesError) {
          console.error("Erreur récupération swipes:", swipesError);
          setMovies(data); // Afficher tous les films en cas d'erreur
        } else {
          const swipedMovieIds = swipes?.map((swipe) => swipe.movie_id) || [];
          const unswipedMovies = data.filter(
            (movie) => !swipedMovieIds.includes(movie.id)
          );

          // Séparer les films par utilisateur qui les a ajoutés
          const otherUserId = userId === "victor" ? "alyssia" : "victor";
          const partnerMovies = unswipedMovies.filter(
            (movie) => movie.added_by === otherUserId
          );
          const ownMovies = unswipedMovies.filter(
            (movie) => movie.added_by === userId
          );
          const systemMovies = unswipedMovies.filter(
            (movie) => movie.added_by === "system"
          );

          // Prendre les 5 premiers films du partenaire
          const priorityMovies = partnerMovies.slice(0, 5);

          // Ajouter les films restants (partenaire + propres + système)
          const remainingPartnerMovies = partnerMovies.slice(5);
          const allRemainingMovies = [
            ...remainingPartnerMovies,
            ...ownMovies,
            ...systemMovies,
          ];

          // Mélanger aléatoirement les films restants
          const shuffledRemaining = allRemainingMovies.sort(
            () => Math.random() - 0.5
          );

          // Combiner : films prioritaires + films restants mélangés
          const finalMovieList = [...priorityMovies, ...shuffledRemaining];

          setMovies(finalMovieList);
        }
      } else {
        console.error("Erreur fetchMovies:", error);
        setMovies([]);
      }
    } catch (error) {
      console.error("Erreur fetchMovies:", error);
      setMovies([]);
    }
    setLoading(false);
  }

  // Récupérer des films aléatoires de TMDB
  async function fetchRandomMovies() {
    setLoading(true);

    const genres = {
      "Science-Fiction": 878,
      Romance: 10749,
      Comédie: 35,
      Drame: 18,
      Aventure: 12,
      Action: 28,
    };

    const currentYear = new Date().getFullYear();
    const startYear = 1998;

    try {
      // Récupérer des films populaires de chaque genre
      const allMovies = [];

      for (const [genreName, genreId] of Object.entries(genres)) {
        // Récupérer 2 films par genre pour avoir une bonne variété
        for (let page = 1; page <= 3; page++) {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${currentYear}-12-31&sort_by=popularity.desc&page=${page}&language=fr-FR`
          );
          const data = await response.json();

          if (data.results) {
            // Filtrer les films qui ont un poster et une description
            const validMovies = data.results.filter(
              (movie) =>
                movie.poster_path &&
                movie.overview &&
                movie.overview.length > 50
            );
            allMovies.push(...validMovies);
          }
        }
      }

      // Mélanger aléatoirement les films
      const shuffledMovies = allMovies.sort(() => Math.random() - 0.5);

      // Prendre les 50 premiers films uniques
      const uniqueMovies = [];
      const seenIds = new Set();

      for (const movie of shuffledMovies) {
        if (!seenIds.has(movie.id) && uniqueMovies.length < 50) {
          seenIds.add(movie.id);
          uniqueMovies.push(movie);
        }
      }

      // Vérifier quels films sont déjà dans la base de données
      const existingMovies = await supabase
        .from("movies")
        .select("tmdb_id")
        .in(
          "tmdb_id",
          uniqueMovies.map((m) => m.id)
        );

      const existingIds = new Set(
        existingMovies.data?.map((m) => m.tmdb_id) || []
      );

      // Ajouter seulement les nouveaux films
      const newMovies = uniqueMovies.filter(
        (movie) => !existingIds.has(movie.id)
      );

      if (newMovies.length > 0) {
        // Ajouter les nouveaux films à la base de données
        const moviesToInsert = newMovies.map((movie) => ({
          tmdb_id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids,
          added_by: "system",
        }));

        const { error: insertError } = await supabase
          .from("movies")
          .insert(moviesToInsert);

        if (insertError) {
          console.error("Erreur insertion films:", insertError);
        }
      }

      // Recharger les films depuis la base de données
      await fetchMovies();
    } catch (error) {
      console.error("Erreur fetchRandomMovies:", error);
      showToast("Erreur lors du chargement des films", "red");
    }

    setLoading(false);
  }

  // Charger des films aléatoires au démarrage si aucun film n'existe
  useEffect(() => {
    if (userId) {
      checkAndLoadRandomMovies();
    }
  }, [userId]);

  // Nettoyer le timeout de recherche quand le composant se démonte
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  async function checkAndLoadRandomMovies() {
    const { data, error } = await supabase.from("movies").select("id").limit(1);

    if (!error && (!data || data.length === 0)) {
      // Aucun film dans la base, charger des films aléatoires
      await fetchRandomMovies();
    } else {
      // Des films existent déjà, les charger normalement
      fetchMovies();
    }
  }

  // Rechercher des films sur TMDB
  async function searchMovies(query) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&language=fr-FR&page=1`
      );
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results.slice(0, 10)); // Limiter à 10 résultats
      }
    } catch (error) {
      console.error("Erreur recherche TMDB:", error);
      showToast("Erreur lors de la recherche", "red");
    }
    setSearching(false);
  }

  // Gérer la saisie de recherche avec délai
  function handleSearchInput(value) {
    setSearchQuery(value);

    // Annuler le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Si le champ est vide, vider les résultats
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    // Créer un nouveau timeout de 300ms
    searchTimeoutRef.current = setTimeout(() => {
      searchMovies(value);
    }, 300);
  }

  // Ajouter un film à la base de données
  async function addMovie(tmdbMovie) {
    const movieData = {
      tmdb_id: tmdbMovie.id,
      title: tmdbMovie.title,
      original_title: tmdbMovie.original_title,
      overview: tmdbMovie.overview,
      poster_path: tmdbMovie.poster_path,
      backdrop_path: tmdbMovie.backdrop_path,
      release_date: tmdbMovie.release_date,
      vote_average: tmdbMovie.vote_average,
      genre_ids: tmdbMovie.genre_ids,
      added_by: userId,
    };

    const { data, error } = await supabase
      .from("movies")
      .insert(movieData)
      .select()
      .single();

    if (!error && data) {
      showToast("Film ajouté avec succès ! 🎬");
      setShowAddModal(false);
      setSearchQuery("");
      setSearchResults([]);
      fetchMovies(); // Recharger les films
    } else {
      console.error("Erreur addMovie:", error);
      showToast("Erreur lors de l'ajout du film", "red");
    }
  }

  // Gérer le swipe
  async function handleSwipe(action) {
    if (currentMovieIndex >= movies.length) return;

    const movie = movies[currentMovieIndex];

    // Sauvegarder le swipe avec upsert pour éviter les doublons
    const { error } = await supabase.from("movie_swipes").upsert(
      {
        user_id: userId,
        movie_id: movie.id,
        action: action,
      },
      {
        onConflict: "user_id,movie_id",
      }
    );

    if (error) {
      console.error("Erreur saveSwipe:", error);
      showToast("Erreur lors du swipe", "red");
      return;
    }

    // Vérifier si c'est un match
    if (action === "right") {
      const { data: partnerSwipe } = await supabase
        .from("movie_swipes")
        .select("action")
        .eq("user_id", userId === "victor" ? "alyssia" : "victor")
        .eq("movie_id", movie.id)
        .eq("action", "right")
        .maybeSingle(); // Utiliser maybeSingle au lieu de single

      if (partnerSwipe) {
        // C'est un match !
        setMatchedMovie(movie);
        setShowMatchModal(true);
      }
    }

    // Passer au film suivant
    setCurrentMovieIndex((prev) => prev + 1);
  }

  // Gestion du swipe tactile
  function handleTouchStart(e) {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  }

  function handleTouchMove(e) {
    if (!isDragging.current) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;

    if (cardRef.current) {
      cardRef.current.style.transform = `translateX(${deltaX}px) rotate(${
        deltaX * 0.1
      }deg)`;
      cardRef.current.style.opacity = Math.max(0.5, 1 - Math.abs(deltaX) / 200);
    }
  }

  function handleTouchEnd() {
    if (!isDragging.current) return;

    const deltaX = currentX.current - startX.current;
    const threshold = 100;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        handleSwipe("right");
      } else {
        handleSwipe("left");
      }
    }

    // Reset card position
    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.opacity = "";
    }

    isDragging.current = false;
  }

  // Obtenir l'URL de l'image TMDB
  function getImageUrl(path, size = "w500") {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
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

  const currentMovie = movies[currentMovieIndex];

  return (
    <div className="films-container">
      {/* Header */}
      <div className="films-header">
        <div className="header-content">
          <div className="header-icon">🎬</div>
          <h1 className="header-title">Films</h1>
          <p className="header-subtitle">
            Découvrez et partagez vos films préférés
          </p>
        </div>
      </div>

      {/* Bouton d'ajout flottant */}
      <button
        className="add-movie-button"
        onClick={() => setShowAddModal(true)}
      >
        <div className="add-button-content">
          <span className="add-icon">+</span>
        </div>
      </button>

      {/* Bouton des matchs flottant */}
      <button
        className="matches-button"
        onClick={() => router.push("/films/matchs")}
      >
        <div className="matches-button-content">
          <span className="matches-icon">💕</span>
        </div>
      </button>

      {/* Contenu principal */}
      <div className="films-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-icon">🎬</div>
            <h3 className="loading-title">Chargement des films...</h3>
          </div>
        ) : movies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎭</div>
            <h3 className="empty-title">Aucun film disponible</h3>
            <p className="empty-subtitle">
              Découvrez des films aléatoires ou ajoutez vos préférés !
            </p>
            <div className="priority-info">
              <span className="priority-icon">💝</span>
              <span className="priority-text">
                Les films ajoutés par{" "}
                {displayUserName(userId === "victor" ? "alyssia" : "victor")}{" "}
                apparaîtront en priorité
              </span>
            </div>
            <div className="empty-actions">
              <button
                className="random-movies-button"
                onClick={fetchRandomMovies}
                disabled={loading}
              >
                {loading ? "🔄" : "🎲"} Films aléatoires
              </button>
              <button
                className="add-first-button"
                onClick={() => setShowAddModal(true)}
              >
                Ajouter un film
              </button>
            </div>
          </div>
        ) : currentMovieIndex >= movies.length ? (
          <div className="finished-state">
            <div className="finished-icon">🎉</div>
            <h3 className="finished-title">Vous avez vu tous les films !</h3>
            <p className="finished-subtitle">
              Ajoutez de nouveaux films ou vérifiez vos matchs
            </p>
            <div className="finished-actions">
              <button
                className="action-button"
                onClick={() => setShowAddModal(true)}
              >
                Ajouter des films
              </button>
              <button
                className="action-button secondary"
                onClick={() => router.push("/films/matchs")}
              >
                Voir les matchs
              </button>
              <button
                className="action-button random"
                onClick={fetchRandomMovies}
                disabled={loading}
              >
                {loading ? "🔄" : "🎲"} Films aléatoires
              </button>
            </div>
          </div>
        ) : (
          <div className="swipe-container">
            {/* Carte du film */}
            <div
              ref={cardRef}
              className="movie-card"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Indicateur pour les films ajoutés par le partenaire */}
              {currentMovie.added_by !== userId &&
                currentMovie.added_by !== "system" && (
                  <div className="partner-indicator">
                    <span className="partner-icon">💝</span>
                    <span className="partner-text">
                      Ajouté par {displayUserName(currentMovie.added_by)}
                    </span>
                  </div>
                )}

              <div className="movie-image-container">
                <img
                  src={getImageUrl(currentMovie.poster_path)}
                  alt={currentMovie.title}
                  className="movie-poster"
                  onError={(e) => {
                    e.target.src = "/placeholder-movie.jpg";
                  }}
                />
                <div className="movie-overlay">
                  <div className="movie-info">
                    <h2 className="movie-title">{currentMovie.title}</h2>
                    <div className="movie-genres">
                      {getGenres(currentMovie.genre_ids)
                        .slice(0, 3)
                        .map((genre, index) => (
                          <span key={index} className="genre-tag">
                            {genre}
                          </span>
                        ))}
                    </div>
                    <p className="movie-overview">
                      {currentMovie.overview?.length > 150
                        ? `${currentMovie.overview.substring(0, 150)}...`
                        : currentMovie.overview}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons de swipe */}
            <div className="swipe-buttons">
              <button
                className="swipe-button left"
                onClick={() => handleSwipe("left")}
              >
                <span className="swipe-icon">❌</span>
              </button>
              <button
                className="swipe-button right"
                onClick={() => handleSwipe("right")}
              >
                <span className="swipe-icon">❤️</span>
              </button>
            </div>

            {/* Indicateur de progression */}
            <div className="progress-indicator">
              <span className="progress-text">
                {currentMovieIndex + 1} / {movies.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="toast" style={{ color: toast.color }}>
          {toast.message}
        </div>
      )}

      {/* Modal d'ajout de film */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon">🎬</div>
              <h2 className="modal-title">Ajouter un film</h2>
            </div>

            <div className="modal-content">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Rechercher un film..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="search-input"
                />
                {searching && (
                  <div className="search-loading">
                    <span className="loading-spinner">🔄</span>
                  </div>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h3 className="results-title">Résultats :</h3>
                  {searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="search-result-item"
                      onClick={() => addMovie(movie)}
                    >
                      <img
                        src={getImageUrl(movie.poster_path, "w92")}
                        alt={movie.title}
                        className="result-poster"
                        onError={(e) => {
                          e.target.src = "/placeholder-movie.jpg";
                        }}
                      />
                      <div className="result-info">
                        <h4 className="result-title">{movie.title}</h4>
                        <p className="result-year">
                          {movie.release_date?.split("-")[0]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowAddModal(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de match */}
      {showMatchModal && matchedMovie && (
        <div className="modal-overlay" onClick={() => setShowMatchModal(false)}>
          <div
            className="modal-container match-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header match-header">
              <div className="modal-icon">💕</div>
              <h2 className="modal-title">MATCH !</h2>
            </div>

            <div className="modal-content">
              <div className="match-movie">
                <img
                  src={getImageUrl(matchedMovie.poster_path)}
                  alt={matchedMovie.title}
                  className="match-poster"
                  onError={(e) => {
                    e.target.src = "/placeholder-movie.jpg";
                  }}
                />
                <h3 className="match-movie-title">{matchedMovie.title}</h3>
                <p className="match-message">
                  Vous et{" "}
                  {displayUserName(userId === "victor" ? "alyssia" : "victor")}{" "}
                  avez tous les deux aimé ce film !
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="submit-button"
                onClick={() => {
                  setShowMatchModal(false);
                  router.push("/films/matchs");
                }}
              >
                Voir tous les matchs
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation activePage="films" />

      <style jsx>{`
        .films-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff0fa 0%, #ffeef8 100%);
          position: relative;
          overflow: hidden;
          font-family: "SF Pro Display", -apple-system, BlinkMacSystemFont,
            sans-serif;
          padding-bottom: 100px;
        }

        .films-header {
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

        .add-movie-button {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 64, 129, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .add-movie-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 64, 129, 0.6);
        }

        .add-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .add-icon {
          color: white;
          font-size: 24px;
          font-weight: 700;
        }

        .matches-button {
          position: fixed;
          bottom: 100px;
          left: 24px;
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(255, 64, 129, 0.4);
          transition: all 0.3s ease;
          z-index: 100;
        }

        .matches-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 64, 129, 0.6);
        }

        .matches-button-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .matches-icon {
          color: white;
          font-size: 24px;
          font-weight: 700;
        }

        .films-content {
          max-width: 400px;
          margin: 0 auto;
          padding: 0 16px;
          margin-top: 24px;
        }

        .loading-state,
        .empty-state,
        .finished-state {
          text-align: center;
          padding: 48px 24px;
        }

        .loading-icon,
        .empty-icon,
        .finished-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .loading-title,
        .empty-title,
        .finished-title {
          color: #d0488f;
          font-size: 18px;
          margin: 0 0 8px 0;
        }

        .empty-subtitle,
        .finished-subtitle {
          color: #b86fa5;
          font-size: 14px;
          margin: 0 0 24px 0;
        }

        .empty-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }

        .random-movies-button {
          padding: 12px 24px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
        }

        .random-movies-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
        }

        .random-movies-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .add-first-button,
        .action-button {
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

        .action-button.secondary {
          background: rgba(255, 255, 255, 0.9);
          color: #d0488f;
          border: 1px solid #ffd6ef;
        }

        .action-button.random {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
        }

        .action-button.random:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(76, 175, 80, 0.6);
        }

        .action-button.random:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .finished-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .swipe-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          padding: 16px;
        }

        .movie-card {
          width: 100%;
          max-width: 320px;
          height: 480px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(255, 200, 220, 0.3);
          background: white;
          transition: all 0.3s ease;
          cursor: grab;
          position: relative;
        }

        .movie-card:active {
          cursor: grabbing;
        }

        .movie-image-container {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .movie-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .movie-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 24px 16px 16px 16px;
          color: white;
        }

        .movie-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .movie-genres {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .genre-tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .movie-overview {
          font-size: 13px;
          line-height: 1.4;
          margin: 0;
          opacity: 0.9;
        }

        .swipe-buttons {
          display: flex;
          gap: 24px;
        }

        .swipe-button {
          width: 64px;
          height: 64px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .swipe-button.left {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          box-shadow: 0 4px 16px rgba(255, 107, 107, 0.4);
        }

        .swipe-button.right {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4);
        }

        .swipe-button:hover {
          transform: scale(1.1);
        }

        .swipe-icon {
          font-size: 24px;
        }

        .progress-indicator {
          text-align: center;
        }

        .progress-text {
          color: #b86fa5;
          font-size: 14px;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.25);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.3s ease-out;
        }

        .modal-container {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(184, 111, 165, 0.3);
          max-width: 400px;
          width: 90%;
          max-height: 90vh;
          overflow: hidden;
          animation: modalFadeIn 0.3s ease-out;
        }

        .modal-container.match-modal {
          max-width: 350px;
        }

        .modal-header {
          background: linear-gradient(90deg, #ffeef8 0%, #fff 100%);
          padding: 24px 24px 16px 24px;
          border-bottom: 1px solid #f3d6e7;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modal-header.match-header {
          background: linear-gradient(90deg, #ffe8f5 0%, #fff 100%);
        }

        .modal-icon {
          font-size: 28px;
          color: #d0488f;
        }

        .modal-title {
          color: #d0488f;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
        }

        .modal-content {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
        }

        .search-container {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #ffd6ef;
          border-radius: 12px;
          font-size: 16px;
          background: #fff8fc;
          color: #4a4a4a;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #ff80ab;
          box-shadow: 0 0 0 3px rgba(255, 128, 171, 0.1);
        }

        .search-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .loading-spinner {
          font-size: 20px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .search-results {
          margin-top: 20px;
        }

        .results-title {
          color: #d0488f;
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .search-result-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .search-result-item:hover {
          background: #fff0fa;
          border-color: #ffd6ef;
        }

        .result-poster {
          width: 48px;
          height: 72px;
          object-fit: cover;
          border-radius: 8px;
        }

        .result-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .result-title {
          color: #4a4a4a;
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .result-year {
          color: #b86fa5;
          font-size: 12px;
          margin: 0;
        }

        .match-movie {
          text-align: center;
        }

        .match-poster {
          width: 120px;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(255, 200, 220, 0.3);
        }

        .match-movie-title {
          color: #d0488f;
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .match-message {
          color: #b86fa5;
          font-size: 14px;
          line-height: 1.4;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #f3d6e7;
        }

        .cancel-button {
          flex: 1;
          padding: 12px 20px;
          border: 1px solid #ffd6ef;
          border-radius: 12px;
          background: #fff;
          color: #b86fa5;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button:hover {
          background: #fff0fa;
          color: #d0488f;
        }

        .submit-button {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff80ab 0%, #ff4081 100%);
          color: white;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 64, 129, 0.4);
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
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

        /* Styles pour l'indicateur de partenaire */
        .partner-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .partner-icon {
          font-size: 16px;
        }

        .partner-text {
          color: white;
        }

        /* Styles pour l'indicateur de priorité */
        .priority-info {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          background: rgba(255, 182, 219, 0.2);
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          color: #d0488f;
          border: 1px solid rgba(255, 182, 219, 0.3);
        }

        .priority-icon {
          font-size: 20px;
        }

        .priority-text {
          color: #d0488f;
        }
      `}</style>
    </div>
  );
}
