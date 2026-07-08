# Biosy - publicar na Vercel (1 push = 1 deploy)
# Uso:
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1 -Message "feat: minha mudanca"
#   powershell -ExecutionPolicy Bypass -File .\scripts\deploy.ps1 -Message "fix: bug X" -SkipLocalBuild
#
# NAO rode varias vezes seguidas - limite Hobby: 100 deploys/24h.

param(
  [Parameter(Mandatory = $true)]
  [string]$Message,
  [switch]$SkipLocalBuild,
  [switch]$ForceReinstall,
  [switch]$VercelCli,
  [string]$VercelProjectName = "biosybio"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$deployArgs = @(
  "-ExecutionPolicy", "Bypass",
  "-File", (Join-Path $scriptDir "redeploy-full.ps1"),
  "-Deploy",
  "-Message", $Message
)
if ($SkipLocalBuild) { $deployArgs += "-SkipLocalBuild" }
if ($ForceReinstall) { $deployArgs += "-ForceReinstall" }
if ($VercelCli) { $deployArgs += "-VercelCli" }
if ($VercelProjectName) { $deployArgs += "-VercelProjectName", $VercelProjectName }

& powershell @deployArgs
