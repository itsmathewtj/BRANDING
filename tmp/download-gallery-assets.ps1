$ErrorActionPreference = 'Stop'
$root = (Resolve-Path '.').Path
$data = Get-Content tmp\product-galleries.json -Raw | ConvertFrom-Json
$lookup = @{}
$queue = @()
foreach ($slugProp in $data.PSObject.Properties) {
  foreach ($group in $slugProp.Value) {
    foreach ($item in $group.items) {
      $source = [string]$item.source
      if (-not $lookup.ContainsKey($source)) {
        $digest = [BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes($source))).Replace('-','').Substring(0,16).ToLowerInvariant()
        $extension = [IO.Path]::GetExtension($source)
        $relative = 'products/gallery/' + $digest + $extension
        $lookup[$source] = $relative
        $newPath = Join-Path $root ('img\' + $relative.Replace('/','\'))
        $oldPath = Join-Path $root ('img\' + ('products/gallery/' + $digest).Replace('/','\'))
        if ((Test-Path $oldPath) -and -not (Test-Path $newPath)) { Move-Item -LiteralPath $oldPath -Destination $newPath }
        $queue += [pscustomobject]@{ url=('https://spog-api.spogprint.com' + $source); path=$newPath; local=$relative }
      }
      $item | Add-Member -NotePropertyName local -NotePropertyValue $lookup[$source] -Force
    }
  }
}
New-Item -ItemType Directory -Force -Path 'img\products\gallery' | Out-Null
$queue | ConvertTo-Json -Depth 5 | Set-Content tmp\gallery-download-queue.json -Encoding UTF8
$data | ConvertTo-Json -Depth 10 | Set-Content tmp\product-galleries-local.json -Encoding UTF8
"images_to_fetch=$($queue.Count)"
Add-Type -AssemblyName System.Net.Http
Add-Type -ReferencedAssemblies System.Net.Http -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
public static class GalleryAssetDownloader {
    private static readonly HttpClient Client = new HttpClient(new HttpClientHandler { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate, MaxConnectionsPerServer = 24 }) { Timeout = TimeSpan.FromSeconds(60) };
    public static string[] Download(string[] urls, string[] paths, int parallelism) {
        var errors = new ConcurrentBag<string>();
        Parallel.For(0, urls.Length, new ParallelOptions { MaxDegreeOfParallelism = parallelism }, i => {
            if (File.Exists(paths[i]) && new FileInfo(paths[i]).Length > 1000) return;
            Exception last = null;
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    using (var response = Client.GetAsync(urls[i]).GetAwaiter().GetResult()) {
                        response.EnsureSuccessStatusCode();
                        var bytes = response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult();
                        if (bytes.Length < 1000) throw new Exception("Image response was unexpectedly small");
                        Directory.CreateDirectory(Path.GetDirectoryName(paths[i]));
                        File.WriteAllBytes(paths[i], bytes);
                    }
                    return;
                } catch (Exception ex) { last = ex; Thread.Sleep(400 * attempt); }
            }
            errors.Add(urls[i] + " => " + (last == null ? "download failed" : last.Message));
        });
        return errors.ToArray();
    }
}
'@
$q = Get-Content tmp\gallery-download-queue.json -Raw | ConvertFrom-Json
$errors = [GalleryAssetDownloader]::Download([string[]]@($q | ForEach-Object {$_.url}), [string[]]@($q | ForEach-Object {$_.path}), 20)
"downloaded=$((Get-ChildItem img\products\gallery -File).Count) errors=$($errors.Count)"
$errors | Set-Content tmp\gallery-download-errors.txt
