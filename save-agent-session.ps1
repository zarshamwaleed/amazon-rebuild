param(
  [Parameter(Mandatory=$true)][string]$Topic,
  [Parameter(Mandatory=$true)][string]$PromptFile,
  [Parameter(Mandatory=$true)][string]$ResponseFile
)

$stamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$base = ".agent-logs\$stamp-$Topic"

if (-not (Test-Path $PromptFile)) {
  Write-Host "Prompt file not found: $PromptFile" -ForegroundColor Red
  exit 1
}
if (-not (Test-Path $ResponseFile)) {
  Write-Host "Response file not found: $ResponseFile" -ForegroundColor Red
  exit 1
}

$prompt = Get-Content $PromptFile -Raw
$response = Get-Content $ResponseFile -Raw

$meta = @"
# Agent Session — $Topic

**Timestamp:** $(Get-Date -Format o)
**Model:** DeepSeek V3 (chat.deepseek.com)
**Tool:** DeepSeek Free — web chat
**Capture Method:** Manual protocol (browser UI has no auto-export)
**Session:** Avenzo redesign

---

## Prompt Sent

$prompt

---

## DeepSeek Response

$response
"@

$meta | Out-File -FilePath "$base.md" -Encoding utf8 -NoNewline
Write-Host ""
Write-Host "Saved:" -ForegroundColor Green
Write-Host "  $base.md"
Write-Host ""
Get-ChildItem .agent-logs -Force | Select-Object Name, Length | Format-Table -AutoSize