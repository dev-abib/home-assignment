$urls = @(
    "https://home-assignment-smoky.vercel.app/",
    "https://home-assignment-smoky.vercel.app/chat",
    "https://home-assignment-smoky.vercel.app/login",
    "https://home-assignment-smoky.vercel.app/docs",
    "https://home-assignment-smoky.vercel.app/openapi.json",
    "https://frontend-task-chatapp.onrender.com/health"
)

foreach ($u in $urls) {
    $code = (curl.exe -s -o NUL -w "%{http_code}" $u)
    Write-Host "[HTTP $code] $u"
}
