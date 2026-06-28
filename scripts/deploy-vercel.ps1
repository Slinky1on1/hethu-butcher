# Run after: vercel login
# Usage: powershell -ExecutionPolicy Bypass -File scripts/deploy-vercel.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path .env)) {
  Write-Error ".env not found"
}

# Load .env (simple key=value)
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
  $i = $_.IndexOf('=')
  if ($i -lt 1) { return }
  $k = $_.Substring(0, $i).Trim()
  $v = $_.Substring($i + 1).Trim().Trim('"')
  Set-Item -Path "env:$k" -Value $v
}

# Production app URL — update after first deploy if Vercel assigns a different domain
if (-not $env:NEXT_PUBLIC_APP_URL -or $env:NEXT_PUBLIC_APP_URL -like "*localhost*") {
  $env:NEXT_PUBLIC_APP_URL = "https://hethu-butcher.vercel.app"
}

$vars = @(
  "OWNER_PIN",
  "SESSION_SECRET",
  "NEXT_PUBLIC_BUSINESS_NAME",
  "NEXT_PUBLIC_BUSINESS_PHONE",
  "NEXT_PUBLIC_WHATSAPP",
  "NEXT_PUBLIC_BANK_NAME",
  "NEXT_PUBLIC_BANK_ACCOUNT_NAME",
  "NEXT_PUBLIC_BANK_ACCOUNT_NUMBER",
  "NEXT_PUBLIC_BANK_BRANCH",
  "NEXT_PUBLIC_APP_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET"
)

Write-Host "Linking Vercel project (hethu-butcher)..."
vercel link --yes --project hethu-butcher

Write-Host "Setting environment variables on Vercel..."
foreach ($name in $vars) {
  $val = (Get-Item "env:$name" -ErrorAction SilentlyContinue).Value
  if (-not $val) {
    Write-Warning "Skipping $name (not in .env)"
    continue
  }
  Write-Host "  $name"
  $val | vercel env add $name production --force 2>$null
  $val | vercel env add $name preview --force 2>$null
}

Write-Host "Deploying to production..."
vercel deploy --prod --yes

Write-Host ""
Write-Host "Done! Open your Vercel dashboard for the live URL."
Write-Host "Update NEXT_PUBLIC_APP_URL to match, then redeploy if the domain differs."
