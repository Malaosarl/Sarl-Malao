# Script pour tester la connexion a la base de donnees
Write-Host "`nTest de connexion a la base de donnees..." -ForegroundColor Yellow
Write-Host ""

# Essayer de se connecter a PostgreSQL
try {
    $env:PGPASSWORD = "postgres"  # Changez si votre mot de passe est different
    $result = & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d malao_production -c "SELECT COUNT(*) FROM users;" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connexion reussie!" -ForegroundColor Green
        Write-Host "La table 'users' existe." -ForegroundColor Green
    } else {
        Write-Host "Erreur: $result" -ForegroundColor Red
        Write-Host ""
        Write-Host "La table 'users' n'existe probablement pas." -ForegroundColor Yellow
        Write-Host "Vous devez executer le fichier schema.sql dans pgAdmin." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Impossible de se connecter a PostgreSQL." -ForegroundColor Red
    Write-Host "Verifiez que PostgreSQL est demarre." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Essayez de vous connecter manuellement:" -ForegroundColor Cyan
    Write-Host '  cd "C:\Program Files\PostgreSQL\17\bin"' -ForegroundColor White
    Write-Host '  .\psql.exe -U postgres -d malao_production' -ForegroundColor White
}

Write-Host ""






