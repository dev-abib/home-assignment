Write-Host "=== VALIDATING ALL LIVE DEPLOYED URLS ==="

$urls = @(
    "https://home-assignment-smoky.vercel.app/",
    "https://home-assignment-smoky.vercel.app/docs",
    "https://home-assignment-smoky.vercel.app/login",
    "https://home-assignment-smoky.vercel.app/chat",
    "https://home-assignment-smoky.vercel.app/openapi.json",
    "https://frontend-task-chatapp.onrender.com/health"
)

$passed = 0
foreach ($u in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $u -Method GET -UseBasicParsing -TimeoutSec 20
        Write-Host "[OK] HTTP $($res.StatusCode) : $u"
        $passed++
    } catch {
        Write-Host "[FAIL] $u"
    }
}

Write-Host "Verification Complete. $passed URLs Verified."
