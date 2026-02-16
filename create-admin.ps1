# Script PowerShell pour creer l'admin MALAO
# Executer apres avoir demarre le backend (npm run dev)

Write-Host "`nCreation de l'utilisateur admin..." -ForegroundColor Yellow
Write-Host ""

$body = @{
    email = "admin@malao.sn"
    password = "admin123"
    first_name = "Admin"
    last_name = "MALAO"
    role = "admin"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/v1/auth/register" -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "Admin cree avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Email: admin@malao.sn" -ForegroundColor Cyan
    Write-Host "Password: admin123" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous pouvez maintenant vous connecter sur:" -ForegroundColor Yellow
    Write-Host "http://localhost:3000/login" -ForegroundColor White
    
} catch {
    $errorMessage = $_.ErrorDetails.Message
    if ($errorMessage -like "*deja utilise*" -or $errorMessage -like "*already*") {
        Write-Host "L'admin existe deja!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Vous pouvez vous connecter avec:" -ForegroundColor Cyan
        Write-Host "Email: admin@malao.sn" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "URL: http://localhost:3000/login" -ForegroundColor White
    } else {
        Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Assurez-vous que:" -ForegroundColor Yellow
        Write-Host "   1. Le backend est demarre" -ForegroundColor White
        Write-Host "   2. Vous voyez les messages Connected et running on port 5000" -ForegroundColor White
    }
}

Write-Host ""
