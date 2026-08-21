$nodeDir = "C:\Users\ASUS\AppData\Local\Programs\nodejs"
$env:PATH = "$nodeDir;$env:PATH"

Write-Host "=== 1. Checking Node & NPM ==="
& "$nodeDir\node.exe" -v
& "$nodeDir\npm.cmd" -v

Write-Host "`n=== 2. Running Frontend TypeScript & Next.js Build ==="
Push-Location "$PSScriptRoot\..\frontend"
& "$nodeDir\npm.cmd" run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend build PASSED successfully!"
} else {
    Write-Host "Frontend build FAILED!"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n=== 3. Running Backend TypeScript Build ==="
Push-Location "$PSScriptRoot\..\backend"
& "$nodeDir\npm.cmd" run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend build PASSED successfully!"
} else {
    Write-Host "Backend build FAILED!"
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "`n=== [SUCCESS] ALL BUILDS PASSED WITH 0 ERRORS! ==="
