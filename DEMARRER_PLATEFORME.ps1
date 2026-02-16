# Script de démarrage de la plateforme MALAO
# Exécutez ce script depuis le répertoire racine du projet

Write-Host "`n🚀 DEMARRAGE DE LA PLATEFORME MALAO`n" -ForegroundColor Cyan

# Aller dans le répertoire du projet
$projectPath = "C:\xampp\htdocs\malao"
Set-Location $projectPath

Write-Host "📁 Repertoire: $projectPath`n" -ForegroundColor Yellow

# Vérifier si le backend tourne déjà
Write-Host "1️⃣ Verification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Backend deja demarre!`n" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "   ⚠️  Backend non demarre" -ForegroundColor Yellow
    Write-Host "   🔄 Demarrage du backend dans une nouvelle fenetre...`n" -ForegroundColor Cyan
    
    # Démarrer le backend dans une nouvelle fenêtre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\backend'; npm run dev" -WindowStyle Normal
    $backendRunning = $false
    
    Write-Host "   ⏳ Attendez 10-15 secondes que le backend demarre..." -ForegroundColor Yellow
    Write-Host "   👀 Regardez la nouvelle fenetre PowerShell qui vient de s'ouvrir" -ForegroundColor Cyan
    Write-Host "   ✅ Vous devriez voir: 'Connected to PostgreSQL database' et 'running on port 5000'`n" -ForegroundColor Green
}

# Vérifier si le frontend tourne déjà
Write-Host "2️⃣ Verification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Frontend deja demarre!`n" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "   ⚠️  Frontend non demarre" -ForegroundColor Yellow
    Write-Host "   🔄 Demarrage du frontend dans une nouvelle fenetre...`n" -ForegroundColor Cyan
    
    # Démarrer le frontend dans une nouvelle fenêtre
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\frontend'; npm run dev" -WindowStyle Normal
    $frontendRunning = $false
    
    Write-Host "   ⏳ Attendez 10-15 secondes que le frontend demarre...`n" -ForegroundColor Yellow
}

# Si le backend tourne, créer l'admin
if ($backendRunning) {
    Write-Host "3️⃣ Creation de l'utilisateur admin..." -ForegroundColor Yellow
    
    $body = @{
        email = "admin@malao.sn"
        password = "admin123"
        first_name = "Admin"
        last_name = "MALAO"
        role = "admin"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Admin cree avec succes!`n" -ForegroundColor Green
    } catch {
        $errorMessage = $_.ErrorDetails.Message
        if ($errorMessage -like "*déjà utilisé*" -or $errorMessage -like "*already*" -or $errorMessage -like "*exists*") {
            Write-Host "   ℹ️  L'admin existe deja`n" -ForegroundColor Cyan
        } else {
            Write-Host "   ⚠️  Erreur: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   💡 Le backend peut etre encore en cours de demarrage. Reessayez dans quelques secondes.`n" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "3️⃣ ⏭️  Passe - Backend en cours de demarrage`n" -ForegroundColor Gray
    Write-Host "   💡 Une fois le backend demarre, executez ce script a nouveau pour creer l'admin" -ForegroundColor Yellow
    Write-Host "   Ou executez: .\create-admin.ps1`n" -ForegroundColor Cyan
}

# Résumé
Write-Host "📋 RESUME:" -ForegroundColor Cyan
Write-Host "   Backend:   $(if ($backendRunning) { '✅ Demarre' } else { '⏳ En cours de demarrage (verifiez la fenetre PowerShell)' })" -ForegroundColor $(if ($backendRunning) { 'Green' } else { 'Yellow' })
Write-Host "   Frontend:  $(if ($frontendRunning) { '✅ Demarre' } else { '⏳ En cours de demarrage (verifiez la fenetre PowerShell)' })" -ForegroundColor $(if ($frontendRunning) { 'Green' } else { 'Yellow' })
Write-Host ""

if ($backendRunning -and $frontendRunning) {
    Write-Host "🎉 Tout est pret!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Site public:  http://localhost:3000" -ForegroundColor White
    Write-Host "🔐 Connexion:    http://localhost:3000/login" -ForegroundColor White
    Write-Host "   Email:    admin@malao.sn" -ForegroundColor Cyan
    Write-Host "   Password: admin123" -ForegroundColor Cyan
} else {
    Write-Host "⏳ Attendez que les services demarrent (10-15 secondes)" -ForegroundColor Yellow
    Write-Host "   Puis ouvrez: http://localhost:3000/login" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Si le backend affiche des erreurs de connexion a la base de donnees:" -ForegroundColor Yellow
    Write-Host "   1. Verifiez que PostgreSQL est demarre (via XAMPP ou autre)" -ForegroundColor White
    Write-Host "   2. Verifiez que la base 'malao_production' existe" -ForegroundColor White
    Write-Host '   3. Verifiez les variables d''environnement dans backend/.env' -ForegroundColor White
}

Write-Host ""

