-- Script de création de la base de données MALAO Production
-- À exécuter en tant qu'administrateur PostgreSQL (connexion à la base 'postgres')

-- Créer la base de données
CREATE DATABASE malao_production
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'French_France.1252'
    LC_CTYPE = 'French_France.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Commentaire sur la base
COMMENT ON DATABASE malao_production IS 'Base de données du système de gestion de production MALAO Company SARL - Version 2.0';








