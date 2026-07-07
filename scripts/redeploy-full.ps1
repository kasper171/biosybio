# Biosy - redeploy completo a partir do PC (Windows PowerShell)
# Uso:
#   cd "C:\Users\MAE DO SS\Desktop\Byosy"
#   powershell -ExecutionPolicy Bypass -File .\scripts\redeploy-full.ps1
#
# Se der EPERM no npm (arquivo em uso), feche o "npm run dev" e rode de novo.
# Ou pule o build local (a Vercel faz o build na nuvem):
#   powershell -ExecutionPolicy Bypass -File .\scripts\redeploy-full.ps1 -SkipLocalBuild

param(
  [switch]$SkipLocalBuild,
  [switch]$ForceReinstall
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $ProjectRoot

function Write-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Number,
    [Parameter(Mandatory = $true)]
    [string]$Message
  )
  Write-Host ""
  Write-Host "========== [$Number] $Message ==========" -ForegroundColor Cyan
}

function Fail {
  param([string]$Message)
  Write-Host "ERRO: $Message" -ForegroundColor Red
  exit 1
}

function Invoke-Npm {
  param([string[]]$Args)
  & npm @Args
  return $LASTEXITCODE
}

function Test-NodeModulesReady {
  return (Test-Path "node_modules\vite\package.json") -and (Test-Path "node_modules\@tanstack\react-start\package.json")
}

Write-Step -Number "1" -Message "Verificando pasta do projeto"
if (-not (Test-Path "package.json")) {
  Fail "package.json nao encontrado. Rode este script dentro da pasta Byosy."
}

Write-Step -Number "2" -Message "Verificando Node.js e npm"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js nao instalado. Instale Node 22 LTS: https://nodejs.org"
}
$nodeVer = (node -v) -replace "^v", ""
$nodeMajor = [int]($nodeVer.Split(".")[0])
if ($nodeMajor -lt 22) {
  Write-Host "AVISO: Node local e v$nodeVer. O projeto pede >= 22.12." -ForegroundColor Yellow
  if (-not $SkipLocalBuild) {
    Write-Host "      Recomendado: -SkipLocalBuild (a Vercel usa Node 22 no servidor)." -ForegroundColor Yellow
  }
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail "npm nao encontrado."
}
Write-Host "Node: $(node -v) | npm: $(npm -v)" -ForegroundColor Green

Write-Step -Number "3" -Message "Verificando Git"
if (-not (Test-Path ".git")) {
  Fail "Pasta .git nao encontrada. Inicialize o Git ou clone o repo do GitHub."
}
$branch = (git branch --show-current).Trim()
if (-not $branch) { $branch = "main" }
Write-Host "Branch atual: $branch" -ForegroundColor Green

$status = git status --porcelain
if ($status) {
  Write-Host "Arquivos com alteracao (serao enviados no commit):" -ForegroundColor Yellow
  git status --short
} else {
  Write-Host "Nenhuma alteracao local pendente." -ForegroundColor Green
}

if ($SkipLocalBuild) {
  Write-Host ""
  Write-Host "Modo -SkipLocalBuild: pulando npm install e build local." -ForegroundColor Yellow
  Write-Host "A Vercel vai compilar o projeto no servidor com Node 22." -ForegroundColor Yellow
} else {
  Write-Step -Number "4" -Message "Limpando cache de build local"
  if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue }
  if (Test-Path ".output") { Remove-Item -Recurse -Force ".output" -ErrorAction SilentlyContinue }
  if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue }
  Write-Host "Cache local limpo." -ForegroundColor Green

  Write-Step -Number "5" -Message "Instalando dependencias"
  Write-Host "Dica: feche qualquer terminal com 'npm run dev' antes deste passo." -ForegroundColor Yellow

  $installOk = $false

  if ($ForceReinstall -and (Test-Path "package-lock.json")) {
    Write-Host "Tentando npm ci (reinstalacao limpa)..." -ForegroundColor Cyan
    $code = Invoke-Npm -Args @("ci")
    if ($code -eq 0) { $installOk = $true }
  }

  if (-not $installOk) {
    Write-Host "Usando npm install (nao apaga node_modules inteiro - evita EPERM no Windows)..." -ForegroundColor Cyan
    $code = Invoke-Npm -Args @("install")
    if ($code -eq 0) { $installOk = $true }
  }

  if (-not $installOk) {
    if (Test-NodeModulesReady) {
      Write-Host "AVISO: npm falhou mas node_modules parece OK. Continuando para o build..." -ForegroundColor Yellow
    } else {
      Write-Host ""
      Write-Host "npm falhou (arquivo em uso / EPERM). Faca isto:" -ForegroundColor Red
      Write-Host "  1. Feche TODOS os terminais com npm run dev / vite" -ForegroundColor Red
      Write-Host "  2. Feche e reabra o Cursor se precisar" -ForegroundColor Red
      Write-Host "  3. Rode de novo COM build na Vercel:" -ForegroundColor Red
      Write-Host '     powershell -ExecutionPolicy Bypass -File .\scripts\redeploy-full.ps1 -SkipLocalBuild' -ForegroundColor Red
      Fail "Dependencias nao instaladas."
    }
  }

  Write-Step -Number "6" -Message "Build de producao local"
  $buildCode = Invoke-Npm -Args @("run", "build")
  if ($buildCode -ne 0) {
    Write-Host ""
    Write-Host "Build local falhou. Voce ainda pode fazer deploy so com push (Vercel compila):" -ForegroundColor Yellow
    Write-Host '  powershell -ExecutionPolicy Bypass -File .\scripts\redeploy-full.ps1 -SkipLocalBuild' -ForegroundColor Yellow
    Fail "npm run build falhou."
  }
  Write-Host "Build local OK." -ForegroundColor Green
}

Write-Step -Number "7" -Message "Commit e push para o GitHub"
git add -A
git reset HEAD -- .env .env.* vercel-env-import.txt 2>$null
$stillDirty = git status --porcelain
if ($stillDirty) {
  $msg = "deploy: redeploy completo $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  git commit -m $msg
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Nada novo para commitar ou commit cancelado." -ForegroundColor Yellow
  } else {
    Write-Host "Commit criado: $msg" -ForegroundColor Green
  }
} else {
  Write-Host "Nada para commitar." -ForegroundColor Green
}

Write-Host "Enviando para origin/$branch ..." -ForegroundColor Cyan
git push -u origin $branch
if ($LASTEXITCODE -ne 0) { Fail "git push falhou. Verifique login no GitHub." }
Write-Host "Push concluido." -ForegroundColor Green

Write-Step -Number "8" -Message "Deploy na Vercel em producao com rebuild forcado"
Write-Host "Usando: npx vercel deploy --prod --force --yes" -ForegroundColor Cyan
Write-Host "Na primeira vez pode pedir login no navegador (conta Vercel)." -ForegroundColor Yellow

npx --yes vercel@latest deploy --prod --force --yes
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Deploy via CLI falhou. O push no GitHub pode ter disparado deploy automatico:" -ForegroundColor Yellow
  Write-Host "https://vercel.com/dashboard" -ForegroundColor Yellow
  Fail "vercel deploy falhou."
}

Write-Step -Number "9" -Message "Checklist pos-deploy"
$checklist = @'
DEPLOY CONCLUIDO.

Confira na Vercel (Settings -> Environment Variables) se existem TODAS:
  * VITE_SUPABASE_URL
  * VITE_SUPABASE_PUBLISHABLE_KEY
  * SUPABASE_URL
  * SUPABASE_PUBLISHABLE_KEY
  * SUPABASE_SERVICE_ROLE_KEY
  * VITE_TURNSTILE_SITE_KEY (remova para cadastro SEM Cloudflare)
  * TURNSTILE_SECRET_KEY (remova junto se desligar Turnstile)

Migracoes SQL no Supabase se ainda nao rodou:
  * supabase/migrations/20260707010000_username_min_2_chars.sql
  * supabase/migrations/20260707020000_default_card_centered_600x400.sql
  * supabase/migrations/20260707030000_connection_unique_constraints.sql

Teste: https://www.byosy.bio/auth?mode=signup
'@
Write-Host $checklist -ForegroundColor Green
