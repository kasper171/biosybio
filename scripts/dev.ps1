# Biosy - desenvolvimento local (npm run dev)
# Uso:
#   cd "C:\Users\MAE DO SS\Desktop\Byosy"
#   powershell -ExecutionPolicy Bypass -File .\scripts\dev.ps1
#
# Edite o codigo no Cursor; o site recarrega em http://localhost:8080
# Quando terminar, faca deploy UMA vez: .\scripts\deploy.ps1 -Message "feat: ..."

param(
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

function Fail {
  param([string]$Message)
  Write-Host "ERRO: $Message" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "========== Biosy - modo desenvolvimento ==========" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "package.json")) {
  Fail "package.json nao encontrado. Rode dentro da pasta Byosy."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js nao instalado. Instale Node 22 LTS: https://nodejs.org"
}

$nodeVer = (node -v) -replace "^v", ""
$nodeMajor = [int]($nodeVer.Split(".")[0])
if ($nodeMajor -lt 22) {
  Write-Host "AVISO: Node v$nodeVer (recomendado >= 22.12). Dev local pode funcionar; a Vercel usa Node 22." -ForegroundColor Yellow
}

if (-not (Test-Path ".env")) {
  Write-Host "AVISO: arquivo .env nao encontrado." -ForegroundColor Yellow
  Write-Host "       Copie .env.example para .env e preencha as chaves do Supabase." -ForegroundColor Yellow
  if (Test-Path ".env.example") {
    Write-Host "       copy .env.example .env" -ForegroundColor Cyan
  }
  Write-Host ""
}

if (-not $SkipInstall) {
  $needsInstall = -not (
    (Test-Path "node_modules\vite\package.json") -and
    (Test-Path "node_modules\@lovable.dev\vite-tanstack-config\package.json")
  )
  if ($needsInstall) {
    Write-Host "Instalando dependencias (npm install)..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) { Fail "npm install falhou." }
  }
}

Write-Host "Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Write-Host "  Local:   http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Pare com Ctrl+C" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Deploy so quando estiver pronto (1x, amanha se quota da Vercel estourou):" -ForegroundColor Yellow
Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1 -Message "feat: descricao"' -ForegroundColor Yellow
Write-Host ""

npm run dev
