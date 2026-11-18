$ErrorActionPreference = 'Stop'
$slugs = @('books','magazines','notebook','note-pads','certificates','menus','folders','calendar','diary','business-cards','envelopes','catalogues','letterhead','flyers','brochures','door-hangers','tent-cards','stickers','stamp','soft-case-boxes','hard-case-boxes','paper-bags','lanyards','t-shirts','pens','mug','ramadan-products','invitations','wedding-invitations','inauguration-invitations','roll-up-banner','canvas')
$result = [ordered]@{}
foreach ($slug in $slugs) {
  $file = "tmp\spog-pages\$slug.html"
  if (-not (Test-Path $file)) { continue }
  $data = (Get-Content $file -Raw).Replace('\"','"')
  $groups = @()
  $heads = [regex]::Matches($data,'"PageDefineLayoutId":"[^"]*","Heading":"([^"]+)"')
  if ($heads.Count -gt 0) {
    for ($i=0; $i -lt $heads.Count; $i++) {
      $start = $heads[$i].Index
      $end = if ($i + 1 -lt $heads.Count) { $heads[$i + 1].Index } else { $data.Length }
      $chunk = $data.Substring($start,$end-$start)
      $images = [regex]::Matches($chunk,'"ProductCoverImage":"(/media/PageDefine/productimage/[^"]+)"')
      $title = $heads[$i].Groups[1].Value
      if ($images.Count -gt 0 -and $title -notmatch '^Why Choose Spog Print') {
        $items = @()
        foreach ($image in $images) { if ($items.source -notcontains $image.Groups[1].Value) { $items += [pscustomobject]@{ source=$image.Groups[1].Value; name=$title } } }
        if ($items.Count -gt 0) { $groups += [pscustomobject]@{ heading=$title; mode='gallery'; items=$items } }
      }
    }
  }
  if ($groups.Count -eq 0) {
    $subcats = @{}
    $sm = [regex]::Matches($data,'"CategoryId":"([^"]+)","RefId":"[^"]+","CategoryName":"([^"]+)".{0,300}?"OrderNo":(\d+)')
    foreach ($s in $sm) { $subcats[$s.Groups[1].Value] = [pscustomobject]@{ heading=$s.Groups[2].Value; order=[int]$s.Groups[3].Value; items=@() } }
    $pm = [regex]::Matches($data,'"ProductName":"([^"]+)"\s*,\s*"ProductCoverImage":"([^"]+)".{0,700}?"SubCategory":"([^"]+)"')
    foreach ($p in $pm) {
      $categoryId = $p.Groups[3].Value
      if ($subcats.ContainsKey($categoryId) -and $p.Groups[2].Value -match '^/media/') {
        $subcats[$categoryId].items += [pscustomobject]@{ source=$p.Groups[2].Value; name=$p.Groups[1].Value }
      }
    }
    $groups = @($subcats.Values | Sort-Object order | Where-Object { $_.items.Count -gt 0 } | ForEach-Object { [pscustomobject]@{ heading=$_.heading; mode='products'; items=$_.items } })
  }
  $result[$slug] = $groups
}
$result | ConvertTo-Json -Depth 10 | Set-Content tmp\product-galleries.json -Encoding UTF8
foreach ($slug in $result.Keys) { $groups=$result[$slug]; $count=0; foreach($g in $groups){$count += $g.items.Count}; "$slug`: $($groups.Count) groups / $count images" }
