-- Table pour les plannings hebdomadaires
CREATE TABLE IF NOT EXISTS weekly_plannings (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL, -- 'monday', 'tuesday', etc.
    start_time TIME,
    end_time TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'work', -- 'work', 'rest', 'remote', 'hidden'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, day_of_week)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_weekly_plannings_user_day ON weekly_plannings(user_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_weekly_plannings_status ON weekly_plannings(status);

-- Contrainte pour les statuts valides
ALTER TABLE weekly_plannings ADD CONSTRAINT check_status 
CHECK (status IN ('work', 'rest', 'remote', 'hidden'));

-- Contrainte pour les jours de la semaine valides
ALTER TABLE weekly_plannings ADD CONSTRAINT check_day_of_week 
CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'));

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

-- Données d'exemple (optionnel)
-- INSERT INTO weekly_plannings (user_id, day_of_week, start_time, end_time, status) VALUES
-- ('victor', 'monday', '09:00', '17:00', 'work'),
-- ('victor', 'tuesday', '09:00', '17:00', 'work'),
-- ('victor', 'wednesday', '09:00', '17:00', 'work'),
-- ('victor', 'thursday', '09:00', '17:00', 'work'),
-- ('victor', 'friday', '09:00', '17:00', 'work'),
-- ('victor', 'saturday', NULL, NULL, 'rest'),
-- ('victor', 'sunday', NULL, NULL, 'rest'),
-- ('alyssia', 'monday', '08:00', '16:00', 'work'),
-- ('alyssia', 'tuesday', '08:00', '16:00', 'work'),
-- ('alyssia', 'wednesday', '08:00', '16:00', 'work'),
-- ('alyssia', 'thursday', '08:00', '16:00', 'work'),
-- ('alyssia', 'friday', '08:00', '16:00', 'work'),
-- ('alyssia', 'saturday', NULL, NULL, 'rest'),
-- ('alyssia', 'sunday', NULL, NULL, 'rest'); 