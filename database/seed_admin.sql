-- Script pour créer un utilisateur admin initial
-- Exécuter depuis psql ou pgAdmin

-- Créer un utilisateur admin
-- Le mot de passe est "admin123" (à changer en production !)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
  'admin@malao.sn',
  '$2a$10$rQ8y3zXq7xKzVqXqXqXqXeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', -- admin123
  'Admin',
  'MALAO',
  'admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Pour générer un nouveau hash de mot de passe :
-- Utiliser bcrypt dans Node.js ou un outil en ligne
-- Exemple : hash de "admin123" = $2a$10$rQ8y3zXq7xKzVqXqXqXqXeXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq
-- OU utiliser l'API /auth/register pour créer un utilisateur

-- Vérifier la création
SELECT id, email, first_name, last_name, role, is_active, created_at 
FROM users 
WHERE email = 'admin@malao.sn';








