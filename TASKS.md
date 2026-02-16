# 📌 Tâches restantes – Répartition Toi / Bmass

Ce fichier sert à répartir le travail entre toi et Bmass. **Backend** = surtout Bmass, **Frontend** = surtout toi (ajustable). Une première étape est de **valider l’état réel** du projet avant de coder.

---

## ✅ À valider d’abord (audit rapide)

| Tâche | Responsable |
|-------|-------------|
| Vérifier les pages frontend dans `frontend/src/pages` | Toi |
| Vérifier la page cartographie `/app/map` et Mapbox | Toi |
| Vérifier l’export PDF/Excel et les notifications (backend + frontend) | Bmass |
| Vérifier la PWA (manifest + service worker) | Bmass |
| Vérifier les scripts DB (schema, seed, migrations) | Bmass |

---

## 🧩 Backend / Base de données

| Tâche | Responsable |
|-------|-------------|
| Écrire les scripts de migration (si absents) | Bmass |
| Écrire les scripts de seed (données de test) | Bmass |
| Ajouter une doc API (Swagger/OpenAPI) | Toi |
| Tester les endpoints (Postman/Insomnia) et documenter | Toi |

---

## 🎨 Frontend

| Tâche | Responsable |
|-------|-------------|
| Finaliser les pages modules si incomplètes | Toi |
| Finaliser le dashboard (KPIs / graphes réels) | Toi |
| Finaliser la cartographie (UI + données réelles) | Toi |

---

## 🔐 Sécurité / Permissions

| Tâche | Responsable |
|-------|-------------|
| Compléter le RBAC (permissions granulaires) | Bmass |
| Mettre en place les workflows de validation | Bmass |

---

## 🏢 Multi‑entités

| Tâche | Responsable |
|-------|-------------|
| Créer l’interface admin multi‑entités | Toi |

---

## 🔌 IoT

| Tâche | Responsable |
|-------|-------------|
| Module habitat animalier (intégration matérielle) | Bmass |

---

## 🧪 Qualité / Tests

| Tâche | Responsable |
|-------|-------------|
| Tests unitaires | Toi |
| Tests d’intégration | Bmass |
| Tests E2E | Bmass |

---

## 🆕 Nouvelles fonctionnalités (cahier des charges)

### Production interne (identifiants, rôles, formulations)

| Tâche | Backend | Frontend |
|-------|---------|----------|
| Identifiants par rôle (Malao-PROD-XXX, Malao-RPROD-XX, etc.) | Bmass | Toi |
| Choix type de production (bétail, volaille, piscicole) et sous-types (ruminant, embauche, laitière, démarrage, croissance, finition, etc.) | Bmass | Toi |
| Intégration des formulations (Excel / référentiel) et lien formulation → production | Bmass | Toi |
| Pesée + démarrage processus et mise à jour stock / coûts automatique | Bmass | Toi |

### Base fournisseurs et clients

| Tâche | Backend | Frontend |
|-------|---------|----------|
| Base fournisseurs (CRUD, suivi achats) | Bmass | Toi |
| Base clients (profil, suivi SAV) | Bmass | Toi |

### Interface client & QR code

| Tâche | Backend | Frontend |
|-------|---------|----------|
| Génération / gestion QR code par produit (ex. sac Ripase) | Bmass | Toi |
| Page ou app « scan QR » : infos produit, usage, tableau de bord client | Bmass | Toi |
| Prise de rendez-vous / contact vétérinaire depuis le parcours client | Bmass | Toi |
| Notation du service / vétérinaire | Bmass | Toi |

### Portails par profil (client, expert agrobusiness, utilisateur)

| Tâche | Backend | Frontend |
|-------|---------|----------|
| Client : profil, gestock produit acheté, suivi activité, ventes, dashboard, accès réseau | Bmass | Toi |
| Expert agrobusiness : profil, offres, calendrier RDV, dashboard, réseau | Bmass | Toi |
| Utilisateur (étudiant, particulier) : profil, accès offres/services, dashboard, réseau | Bmass | Toi |

### Côté MALAO (admin / direction)

| Tâche | Backend | Frontend |
|-------|---------|----------|
| Mise en ligne produits et infos | Bmass | Toi |
| Réseau, formations en ligne, sensibilisation (langues nationales) | Bmass | Toi |
| Calendrier partagé, RDV, suivi après-vente | Bmass | Toi |
| Opérations en ligne (ex. opération Tabaski) | Bmass | Toi |

---

## 📋 Workflow recommandé

- **1 tâche = 1 branche** (ex. `feat/qr-code`, `feat/formulations`).
- Chacun pousse sa branche et ouvre une **Pull Request** vers `main`.
- Après l’audit, **cocher** dans ce fichier ce qui est fait et **prioriser** (ordre des sprints/jalons).

---

## 🧾 Notes

- Sources projet : anciennes docs (DEVELOPPEMENT_STATUS, RECAP_DEVELOPPEMENT, ETAT_PROJET_COMPLET) – à confronter à l’état actuel du code.
- Repo : **https://github.com/Malaosarl/Malaosarl-Malao.git**
