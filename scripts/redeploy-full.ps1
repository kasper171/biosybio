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
  [switch]$ForceReinstall,
  # Deploy via Git push ja dispara build na Vercel. CLI manual consome quota (100/dia no plano Free).
  [switch]$VercelCli,
  [string]$VercelProjectName = "biosybio"
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

function Reset-StagedEnvSecrets {
  git reset HEAD -- .env 2>$null
  git reset HEAD -- vercel-env-import.txt 2>$null
  Get-ChildItem -Path . -Filter ".env.*" -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ne ".env.example" } |
    ForEach-Object { git reset HEAD -- $_.Name 2>$null }
}

function Get-GitHubRepoSlug {
  $remote = (git remote get-url origin 2>$null).Trim()
  if (-not $remote) { return $null }
  if ($remote -match "github\.com[:/](?<owner>[^/]+)/(?<repo>[^/.]+)") {
    return "$($Matches.owner)/$($Matches.repo)"
  }
  return $null
}

function Test-VercelRateLimited {
  param([string]$CommitSha)
  $repo = Get-GitHubRepoSlug
  if (-not $repo -or -not $CommitSha) { return $false }
  try {
    Start-Sleep -Seconds 5
    $uri = "https://api.github.com/repos/$repo/commits/$CommitSha/status"
    $status = Invoke-RestMethod -Uri $uri -Headers @{ "User-Agent" = "biosy-redeploy-script" }
    foreach ($entry in $status.statuses) {
      if ($entry.context -eq "Vercel" -and $entry.description -match "rate limit") {
        return $true
      }
    }
  } catch {
    Write-Host "AVISO: nao foi possivel verificar status da Vercel no GitHub." -ForegroundColor Yellow
  }
  return $false
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
Reset-StagedEnvSecrets
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

$headSha = (git rev-parse HEAD).Trim()
$vercelRateLimited = Test-VercelRateLimited -CommitSha $headSha

Write-Step -Number "8" -Message "Deploy na Vercel"
Write-Host "Acompanhe em: https://vercel.com/rodrigodiscord01-9846s-projects/biosybio" -ForegroundColor Cyan

if ($vercelRateLimited) {
  Write-Host ""
  Write-Host "BLOQUEIO DA VERCEL: limite diario de deploys atingido (plano Free, max 100/dia)." -ForegroundColor Red
  Write-Host "O push no GitHub foi feito (commit $headSha), mas a Vercel NAO vai compilar ate resetar a quota (~24h)." -ForegroundColor Yellow
  Write-Host "Producao continua no deploy anterior. Evite rodar redeploy varias vezes seguidas." -ForegroundColor Yellow
  Write-Host "Opcoes: aguardar 24h e redeploy, ou upgrade Pro em https://vercel.com/account/plan" -ForegroundColor Yellow
} else {
  Write-Host "O push no GitHub dispara deploy automatico (repo ligado na Vercel)." -ForegroundColor Green
}

if (-not $VercelCli) {
  if (-not $vercelRateLimited) {
    Write-Host ""
    Write-Host "CLI da Vercel omitido (economiza quota: max 100 deploys/dia no plano Free)." -ForegroundColor Yellow
    Write-Host "Para forcar deploy manual via CLI: adicione -VercelCli ao comando." -ForegroundColor Yellow
  }
} else {
  Write-Host ""
  Write-Host "Tentando deploy direto via CLI (projeto: $VercelProjectName)..." -ForegroundColor Cyan
  Write-Host "Na primeira vez pode pedir para linkar o projeto na conta Vercel." -ForegroundColor Yellow

  $vercelArgs = @("deploy", "--prod", "--force", "--yes")
  if (Test-Path ".vercel\project.json") {
    $vercelArgs += "--project", $VercelProjectName
  }

  $vercelOut = npx --yes vercel@latest @vercelArgs 2>&1 | Out-String
  Write-Host $vercelOut
  if ($LASTEXITCODE -ne 0) {
    if ($vercelOut -match "api-deployments-free-per-day") {
      Write-Host ""
      Write-Host "Limite diario de deploys da Vercel atingido (plano Free)." -ForegroundColor Yellow
      Write-Host "Nenhum deploy novo sera feito ate a quota resetar (~24h)." -ForegroundColor Yellow
    } else {
      Write-Host ""
      Write-Host "Deploy via CLI falhou, mas o PUSH NO GITHUB JA FOI FEITO." -ForegroundColor Yellow
    }
    Write-Host "Confira: https://vercel.com/rodrigodiscord01-9846s-projects/biosybio" -ForegroundColor Cyan
    Write-Host "Para linkar o CLI (opcional): npx vercel link --project $VercelProjectName" -ForegroundColor Cyan
  } else {
    Write-Host "Deploy via CLI concluido." -ForegroundColor Green
  }
}

Write-Step -Number "9" -Message "Checklist pos-deploy"
if ($vercelRateLimited) {
  $checklist = @'
PUSH OK, MAS DEPLOY BLOQUEADO PELA VERCEL (quota diaria).

O codigo esta no GitHub, mas www.byosy.bio ainda mostra o deploy anterior.
Amanha (apos reset da quota), rode de novo:
  powershell -ExecutionPolicy Bypass -File .\scripts\redeploy-full.ps1 -SkipLocalBuild

Ou no painel Vercel: Deployments -> Redeploy no ultimo commit (quando a quota liberar).

Migracoes SQL no Supabase (rode manualmente se ainda nao rodou):
  * supabase/migrations/20260707110000_social_icon_size_bloom.sql
  * supabase/migrations/20260707120000_social_icon_bloom_color.sql
'@
} else {
  $checklist = @'
DEPLOY CONCLUIDO.

Confira na Vercel (Settings -> Environment Variables) se existem TODAS:
  * VITE_SUPABASE_URL
  * VITE_SUPABASE_PUBLISHABLE_KEY
  * SUPABASE_URL
  * SUPABASE_PUBLISHABLE_KEY
  * SUPABASE_SERVICE_ROLE_KEY

Migracoes SQL no Supabase se ainda nao rodou:
  * supabase/migrations/20260707110000_social_icon_size_bloom.sql
  * supabase/migrations/20260707120000_social_icon_bloom_color.sql

Teste: https://www.byosy.bio/auth?mode=signup
'@
}
Write-Host $checklist -ForegroundColor Green
