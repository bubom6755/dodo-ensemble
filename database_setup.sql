-- Table pour les plannings hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_plannings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'work' CHECK (status IN ('work', 'rest', 'remote')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, day_of_week)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_weekly_plannings_user_id ON weekly_plannings(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plannings_day_of_week ON weekly_plannings(day_of_week);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_weekly_plannings_updated_at
    BEFORE UPDATE ON weekly_plannings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table pour les événements
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time TIME,
    location VARCHAR(255),
    is_mystery BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_is_mystery ON events(is_mystery);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Si la table events existe déjà, ajouter la colonne is_mystery
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_mystery BOOLEAN DEFAULT FALSE;

-- Table pour les histoires/souvenirs
CREATE TABLE IF NOT EXISTS stories (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'moment' CHECK (category IN ('moment', 'voyage', 'anniversaire', 'surprise', 'quotidien', 'autre')),
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_stories_date ON stories(date);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_stories_updated_at
    BEFORE UPDATE ON stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table pour les boîtes à secrets
CREATE TABLE IF NOT EXISTS secrets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    unlock_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'surprise' CHECK (category IN ('surprise', 'confession', 'projet', 'souvenir', 'message', 'autre')),
    user_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_secrets_unlock_date ON secrets(unlock_date);
CREATE INDEX IF NOT EXISTS idx_secrets_user_id ON secrets(user_id);
CREATE INDEX IF NOT EXISTS idx_secrets_category ON secrets(category);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_secrets_updated_at
    BEFORE UPDATE ON secrets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table pour les milestones de l'histoire d'amour
CREATE TABLE IF NOT EXISTS milestones (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    icon VARCHAR(10) NOT NULL DEFAULT '💕',
    type VARCHAR(50) NOT NULL DEFAULT 'milestone' CHECK (type IN ('milestone', 'anniversary', 'special')),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_milestones_date ON milestones(date);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(type);
CREATE INDEX IF NOT EXISTS idx_milestones_active ON milestones(is_active);
CREATE INDEX IF NOT EXISTS idx_milestones_sort_order ON milestones(sort_order);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_milestones_updated_at
    BEFORE UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Table pour les boîtes à secrets (nouvelle structure)
CREATE TABLE IF NOT EXISTS secret_box (
    id SERIAL PRIMARY KEY,
    author_id VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    unlock_type VARCHAR(20) NOT NULL CHECK (unlock_type IN ('manual', 'date')),
    unlock_date DATE,
    unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_secret_box_author_id ON secret_box(author_id);
CREATE INDEX IF NOT EXISTS idx_secret_box_recipient_id ON secret_box(recipient_id);
CREATE INDEX IF NOT EXISTS idx_secret_box_unlock_date ON secret_box(unlock_date);
CREATE INDEX IF NOT EXISTS idx_secret_box_unlocked ON secret_box(unlocked);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_secret_box_updated_at
    BEFORE UPDATE ON secret_box
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insérer les milestones par défaut
INSERT INTO milestones (title, description, date, icon, type, sort_order) VALUES
('Première rencontre', 'Le jour où nos regards se sont croisés pour la première fois...', '2023-01-15', '👀', 'milestone', 1),
('Premier rendez-vous', 'Notre premier vrai rendez-vous, le début de quelque chose de beau...', '2023-02-14', '💕', 'milestone', 2),
('Premier baiser', 'Un moment magique qui a changé tout...', '2023-03-20', '💋', 'milestone', 3),
('Couple officiel', 'Le jour où nous avons décidé d''être ensemble...', '2023-04-10', '💑', 'milestone', 4),
('Premier voyage ensemble', 'Notre première aventure en duo...', '2023-07-15', '✈️', 'milestone', 5),
('Premier anniversaire', 'Une année ensemble, pleine de bonheur...', '2024-04-10', '🎂', 'anniversary', 6)
ON CONFLICT DO NOTHING;

-- Table pour les films
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  original_title VARCHAR(255),
  overview TEXT,
  poster_path VARCHAR(255),
  backdrop_path VARCHAR(255),
  release_date DATE,
  vote_average DECIMAL(3,1),
  genre_ids INTEGER[],
  added_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les swipes de films
CREATE TABLE IF NOT EXISTS movie_swipes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  action VARCHAR(10) NOT NULL CHECK (action IN ('left', 'right')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Table pour les films vus
CREATE TABLE IF NOT EXISTS movie_watched (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_movie_swipes_user_id ON movie_swipes(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_swipes_movie_id ON movie_swipes(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_swipes_action ON movie_swipes(action);
CREATE INDEX IF NOT EXISTS idx_movie_watched_user_id ON movie_watched(user_id);
CREATE INDEX IF NOT EXISTS idx_movie_watched_movie_id ON movie_watched(movie_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_added_by ON movies(added_by);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour movies
CREATE TRIGGER update_movies_updated_at BEFORE UPDATE ON movies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
