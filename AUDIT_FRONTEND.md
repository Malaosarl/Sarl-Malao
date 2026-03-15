# Audit frontend – Pages et cartographie

**Date :** 25 février 2025  
**Contexte :** Validation de l’état réel du projet (TASKS.md – « À valider d’abord »).

---

## 1. Pages frontend (`frontend/src/pages`)

### 1.1 Inventaire des pages

| Page | Fichier | Route | État |
|------|---------|--------|------|
| **Public** | | | |
| Accueil | `public/HomePage.tsx` | `/` | OK – contenu statique (directions, services) |
| À propos | `public/AboutPage.tsx` | `/about` | À vérifier contenu |
| Services | `public/ServicesPage.tsx` | `/services` | OK – liste directions/services |
| Contact | `public/ContactPage.tsx` | `/contact` | À vérifier formulaire |
| **Auth** | | | |
| Connexion | `auth/LoginPage.tsx` | `/login` | OK – formulaire + redirect |
| Mot de passe oublié | `auth/ForgotPasswordPage.tsx` | `/forgot-password` | OK |
| **App (protégées)** | | | |
| Tableau de bord | `dashboard/DashboardPage.tsx` | `/app/dashboard` | OK – appelle `/dashboard`, `/production/planning`, `/production/kpis` |
| Production | `production/ProductionPage.tsx` | `/app/production` | OK – commandes, formules |
| Stocks | `inventory/InventoryPage.tsx` | `/app/inventory` | OK – `/inventory` |
| Ventes | `sales/SalesPage.tsx` | `/app/sales` | OK – `/sales/orders`, `/sales/quotes` |
| Qualité | `quality/QualityPage.tsx` | `/app/quality` | OK |
| Agropôle | `agropole/AgropolePage.tsx` | `/app/agropole` | OK – sites, parcelles, onglets |
| Maintenance | `maintenance/MaintenancePage.tsx` | `/app/maintenance` | OK |
| Livraisons | `delivery/DeliveryPage.tsx` | `/app/delivery` | OK |
| Coûts | `costs/CostsPage.tsx` | `/app/costs` | OK |
| **Cartographie** | `map/MapPage.tsx` | `/app/map` | OK – voir section 2 |

### 1.2 Points d’attention

- **Paramètres** : Le menu (`Layout.tsx`) contient un lien vers `/app/settings`, mais **aucune route ni page Settings** n’existe dans `App.tsx`. Clic = redirection vers `/` (route `*`). À créer ou retirer du menu.
- **API** : Les pages s’appuient sur `frontend/src/lib/api.ts` (baseURL `VITE_API_URL` ou `http://localhost:5000/api/v1`). Pas de token injecté dans les headers (à confirmer si l’auth est gérée par cookie ou autre).
- **Layout** : Toutes les routes `/app/*` passent par `ProtectedRoute` et le `Layout` (sidebar avec logo, menu, déconnexion).

---

## 2. Page cartographie (`/app/map`) et Mapbox

### 2.1 Stack technique

- **Libs** : `mapbox-gl` (^3.0.1), `react-map-gl` (^7.1.7), `@types/mapbox-gl` (dev).
- **Style** : `mapbox://styles/mapbox/streets-v12`.
- **Token** : `import.meta.env.VITE_MAPBOX_TOKEN` (obligatoire pour afficher la carte).

### 2.2 Comportement actuel

- **Données** : Chargement des sites (`GET /api/v1/agropole/sites`) et parcelles (`GET /api/v1/agropole/parcels`).
- **Filtres** : Boutons « Tout », « Sites », « Parcelles » pour filtrer les marqueurs.
- **Carte** : Centrée par défaut sur Dakar (lng -15.1185, lat 15.3950, zoom 12). Marqueurs avec icônes (site = usine, parcelle = pousse, etc.) et popup au clic.
- **Légende** : Sites, parcelles, entrepôts, points de livraison (les 2 derniers non alimentés par l’API pour l’instant).

### 2.3 Schéma base de données (alignement)

- `agropole_sites` : `latitude`, `longitude`, `location_name` (pas `location`).
- `agropole_parcels` : `latitude`, `longitude`. Les parcelles renvoyées par l’API ont `current_crop_name` (jointure), pas `current_crop`.

### 2.4 Corrections effectuées dans le code

- **Sites** : utilisation de `site.location_name` (au lieu de `site.location`) pour la description des marqueurs/popup.
- **Parcelles** : utilisation de `parcel.current_crop_name` pour la description et le détail dans la popup (au lieu de `current_crop`).
- **UX** : ajout d’un état de chargement et d’un message d’erreur si les appels API échouent ou si le token Mapbox est manquant.

### 2.5 À faire côté projet

- **Fichier d’exemple d’env** : Créer un `.env.example` dans `frontend/` avec au minimum :
  - `VITE_API_URL=http://localhost:5000/api/v1`
  - `VITE_MAPBOX_TOKEN=your_mapbox_public_token`
- **Token Mapbox** : Sans `VITE_MAPBOX_TOKEN`, la carte ne s’affichera pas. Documenter dans le README ou la doc projet où obtenir et configurer le token.
- **Données réelles** : S’assurer que les sites/parcelles en base ont des `latitude` / `longitude` renseignés ; sinon tous les points tombent sur la valeur par défaut (Dakar).

---

## 3. Synthèse

| Élément | Statut |
|--------|--------|
| Pages listées dans `frontend/src/pages` | Toutes présentes et branchées dans le routeur |
| Route `/app/map` | OK, protégée, utilisée par MapPage |
| Mapbox (dépendances + usage) | OK |
| Alignement API / schéma (sites, parcelles) | Corrigé (location_name, current_crop_name) |
| États chargement / erreur sur la carte | Corrigé |
| Page ou route Paramètres | Manquante (lien dans le menu uniquement) |
| Variables d’environnement (dont Mapbox) | À documenter (`.env.example` + README) |

Une fois les corrections appliquées et le `.env.example` (et éventuellement la page Paramètres) en place, l’audit frontend « pages + map » peut être considéré comme fait. Les prochaines étapes indiquées dans TASKS.md (finaliser modules, dashboard, cartographie avec données réelles) peuvent s’appuyer sur ce rapport.
