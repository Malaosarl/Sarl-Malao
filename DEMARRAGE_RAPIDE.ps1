# Script de démarrage rapide MALAO Production System
# Ce script vérifie et démarre tout automatiquement

Write-Host "`n🚀 DEMARRAGE RAPIDE - MALAO Production System`n" -ForegroundColor Cyan

# Vérifier si le backend tourne
Write-Host "1️⃣ Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Backend est demarre!" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "   ⚠️  Backend n'est pas demarre" -ForegroundColor Yellow
    Write-Host "   💡 Dans un terminal, executez: cd backend; npm run dev" -ForegroundColor White
    $backendRunning = $false
}

Write-Host ""

# Vérifier si le frontend tourne
Write-Host "2️⃣ Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Frontend est demarre!" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "   ⚠️  Frontend n'est pas demarre" -ForegroundColor Yellow
    Write-Host "   💡 Dans un terminal, executez: cd frontend; npm run dev" -ForegroundColor White
    $frontendRunning = $false
}

Write-Host ""

# Créer l'admin si backend tourne
if ($backendRunning) {
    Write-Host "3️⃣ Creation de l'admin..." -ForegroundColor Yellow
    
    $body = @{
        email = "admin@malao.sn"
        password = "admin123"
        first_name = "Admin"
        last_name = "MALAO"
        role = "admin"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        Write-Host "   ✅ Admin cree avec succes!" -ForegroundColor Green
    } catch {
        if ($_.ErrorDetails.Message -like "*déjà utilisé*" -or $_.ErrorDetails.Message -like "*already*") {
            Write-Host "   ℹ️  Admin existe deja" -ForegroundColor Cyan
        } else {
            Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "3️⃣ ⏭️  Passe - Backend non demarre" -ForegroundColor Gray
}

Write-Host ""

# Résumé
Write-Host "📋 RESUME:" -ForegroundColor Cyan
Write-Host "   Backend:   $(if ($backendRunning) { '✅ Demarre' } else { '❌ Non demarre → cd backend; npm run dev' })" -ForegroundColor $(if ($backendRunning) { 'Green' } else { 'Red' })
Write-Host "   Frontend:  $(if ($frontendRunning) { '✅ Demarre' } else { '❌ Non demarre → cd frontend; npm run dev' })" -ForegroundColor $(if ($frontendRunning) { 'Green' } else { 'Red' })
Write-Host ""

if ($backendRunning -and $frontendRunning) {
    Write-Host "🎉 Tout est pret!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Site public:  http://localhost:3000" -ForegroundColor White
    Write-Host "🔐 Connexion:    http://localhost:3000/login" -ForegroundColor White
    Write-Host "   Email:    admin@malao.sn" -ForegroundColor Cyan
    Write-Host "   Password: admin123" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Demarrez les services manquants ci-dessus" -ForegroundColor Yellow
}

Write-Host ""

