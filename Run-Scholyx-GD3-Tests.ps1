$ErrorActionPreference='Stop'
$root='D:\360ExtremeBrowserDownload\Scholyx_V3_GiaiDoan3_Backend_Foundation'
if (!(Test-Path (Join-Path $root 'node_modules\@playwright\test'))) { throw 'STOP: Playwright is not installed in project root' }
Set-Location $root
Write-Host 'GD3 SAFE READ-ONLY PLAYWRIGHT SUITE' -ForegroundColor Cyan
Write-Host 'No registration, demo transaction, grant, refund, or database write is performed by this suite.'
Write-Host 'If test credentials are absent, authenticated groups are SKIPPED (not PASS).'
& npx.cmd playwright test --config=tests/gd3/playwright.config.ts --workers=1
$exitCode=$LASTEXITCODE
Write-Host "Playwright exit code: $exitCode"
Write-Host 'Report: playwright-report-gd3 (use npx.cmd playwright show-report playwright-report-gd3 --port 9324)'
exit $exitCode
