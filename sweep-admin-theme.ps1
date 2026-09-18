$adminDir = "src\features\admin"
$replacements = @(
  @{ old = 'bg-stone-950/95'; new = 'bg-surface/95' },
  @{ old = 'bg-stone-950/90'; new = 'bg-surface/90' },
  @{ old = 'bg-stone-950/80'; new = 'bg-surface/80' },
  @{ old = 'bg-stone-950/60'; new = 'bg-surface-sunken/60' },
  @{ old = 'bg-stone-950/50'; new = 'bg-surface-sunken/50' },
  @{ old = 'bg-stone-950/40'; new = 'bg-surface-sunken/40' },
  @{ old = 'bg-stone-950/30'; new = 'bg-surface-sunken/30' },
  @{ old = 'bg-stone-950/20'; new = 'bg-surface-sunken/20' },
  @{ old = 'bg-stone-950';    new = 'bg-surface' },
  @{ old = 'bg-stone-900/60'; new = 'bg-surface-raised/60' },
  @{ old = 'bg-stone-900/50'; new = 'bg-surface-raised/50' },
  @{ old = 'bg-stone-900/40'; new = 'bg-surface-raised/40' },
  @{ old = 'bg-stone-900';    new = 'bg-surface-raised' },
  @{ old = 'bg-stone-800';    new = 'bg-surface-raised' },
  @{ old = 'bg-stone-700';    new = 'bg-text-faint' },
  @{ old = 'text-stone-100';  new = 'text-text-primary' },
  @{ old = 'text-stone-200';  new = 'text-text-secondary' },
  @{ old = 'text-stone-300';  new = 'text-text-secondary' },
  @{ old = 'text-stone-400';  new = 'text-text-muted' },
  @{ old = 'text-stone-500';  new = 'text-text-faint' },
  @{ old = 'text-stone-600';  new = 'text-text-faint' },
  @{ old = 'text-stone-700';  new = 'text-text-faint' },
  @{ old = 'border-stone-800'; new = 'border-surface-border' },
  @{ old = 'border-stone-700'; new = 'border-surface-border' },
  @{ old = 'divide-stone-800'; new = 'divide-surface-border' }
)

$files = Get-ChildItem -Path $adminDir -Filter *.tsx
$totalChanges = 0

foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw
  $original = $content
  foreach ($r in $replacements) {
    $content = $content.Replace($r.old, $r.new)
  }
  if ($content -ne $original) {
    Set-Content -Path $file.FullName -Value $content -NoNewline
    $changes = ([regex]::Matches($original, 'bg-stone-|text-stone-|border-stone-|divide-stone-')).Count
    Write-Host "✅ Updated: $($file.Name) ($changes refs)"
    $totalChanges += $changes
  }
}

Write-Host ""
Write-Host "Total references updated: $totalChanges"