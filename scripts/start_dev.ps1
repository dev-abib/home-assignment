$nodeDir = "C:\Users\ASUS\AppData\Local\Programs\nodejs"
$env:PATH = "$nodeDir;$env:PATH"
Push-Location "$PSScriptRoot\..\frontend"
& "$nodeDir\npm.cmd" run dev
Pop-Location
