# Migrer la base malao_production (pgAdmin)

## 1. Exécuter le schéma (créer les tables)

1. Dans **pgAdmin**, dans l’arbre à gauche : **Servers** → **PostgreSQL 17** → **Databases** → clic droit sur **malao_production** → **Query Tool**.
2. Dans l’éditeur, va dans **File** → **Open** (ou Ctrl+O).
3. Ouvre le fichier :  
   `C:\xampp\htdocs\malao\database\schema_complete.sql`
4. Clique sur **Execute / Run** (icône play ou F5).
5. Vérifie en bas : pas d’erreur (éventuellement des messages “already exists” sont normaux si tu relances).

## 2. (Optionnel) Migrations additionnelles

Si le projet a des migrations dans `database/migrations/` :
- Ouvre chaque fichier `.sql` dans Query Tool **en étant connecté à la base malao_production**.
- Exécute (F5).

## 3. Créer l’utilisateur admin

**Option A – Script PowerShell (backend doit tourner sur le port 5000)**  
Dans PowerShell :

```powershell
cd C:\xampp\htdocs\malao
.\create-admin.ps1
```

**Option B – Depuis le backend**  
Dans un terminal, à la racine du projet :

```powershell
cd C:\xampp\htdocs\malao\backend
npm.cmd run create-admin
```

(ou `npx ts-node src/scripts/createAdmin.ts` si besoin)

## 4. Vérifier le fichier .env du backend

Le fichier `backend\.env` doit contenir au moins :

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=malao_production
DB_USER=postgres
DB_PASSWORD=ton_mot_de_passe_postgres
JWT_SECRET=malao-secret-key
```

Remplace `ton_mot_de_passe_postgres` par le vrai mot de passe de l’utilisateur `postgres`.

## 5. Redémarrer le backend

Après la migration et la création de l’admin :

```powershell
cd C:\xampp\htdocs\malao
npm.cmd run dev
```

Puis ouvre http://localhost:3000/login (ou le port indiqué par Vite) et connecte-toi avec **admin@malao.sn** / **admin123**.
