# Système de Gestion et de Suivi de Production - MALAO Company SARL

**Version 2.0 – Octobre 2025**

## Description

Plateforme web complète multi-modules pour la gestion de production industrielle d'aliments pour animaux, incluant :
- Site vitrine MALAO Company
- Dashboard de gestion de production
- Module Agropôle avec suivi des hectares
- Système de gestion des livraisons et véhicules
- Cartographie des sites de production
- Gestion des demandes de devis et commandes clients
- Suivi des cultures par hectare et par récolte
- Gestion des habitats animaliers automatisés

## Structure du Projet

```
malao/
├── backend/          # API Node.js/Express + TypeScript
├── frontend/         # Application React + TypeScript
├── database/         # Scripts de migration et schémas SQL
└── docs/             # Documentation complète
```

Pour plus de détails sur l'organisation, voir [STRUCTURE.md](./STRUCTURE.md)

## Technologies

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Redis (cache)
- JWT (authentification)
- Swagger (documentation API)

### Frontend
- React 18 + TypeScript
- Zustand (state management)
- TailwindCSS (styling)
- Recharts (graphiques)
- Mapbox (cartographie)
- PWA (Progressive Web App)

## Installation

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Redis (optionnel)
- npm ou yarn

### Étapes

1. Installer les dépendances :
```bash
npm run install:all
```

2. Configurer la base de données :
- Créer une base PostgreSQL nommée `malao_production`
- Configurer les variables d'environnement (voir `.env.example`)

3. Lancer le développement :
```bash
npm run dev
```

- Backend : http://localhost:5000
- Frontend : http://localhost:3000

## Modules Fonctionnels

1. **Production** : Planning, saisie temps réel, KPIs, formulation
2. **Qualité** : Contrôles, conformité, traçabilité
3. **Coûts et Rentabilité** : Coût par tonne, marges, budgets
4. **Ventes et Livraisons** : Devis, commandes, expéditions
5. **Stocks** : Gestion MP/PF, seuils, rotation
6. **Maintenance** : Assets, planification, KPIs
7. **Livraisons et Véhicules** : Parc, tournées, carburant
8. **Agropôle** : Sites, parcelles, cultures, récoltes
9. **Cartographie** : Cartes des sites, cultures, plans roulants
10. **Commercial** : Catalogue, devis, prospection
11. **Habitat Animalier** : IoT, monitoring, automatisation
12. **Multi-Entités** : Hiérarchie, consolidation

## Charte Graphique

- **Couleurs principales** :
  - Orange : #F47C20
  - Blanc : #FFFFFF
  - Vert : #4CAF50
- **Typographie** : AgrandirGrand / Montserrat Semi Bold

## Documentation

Toute la documentation se trouve dans le dossier `docs/` :
- **Installation** : `docs/INSTALLATION.md`
- **Base de données** : `docs/GUIDE_BASE_DONNEES.md`
- **Cahier des charges** : `docs/Cahier_des_charges_MALAO_Complete.md`
- **État du projet** : `docs/PROJET_STATUS.md`

Voir `docs/README.md` pour l'index complet de la documentation.

## Contacts

**MALAO COMPANY SARL**
- Linguère, Région de Louga, Sénégal
- +221 77 220 85 85
- contact@malaosarl.sn
- www.malao.sn

---

**Version 2.0 – Octobre 2025**

