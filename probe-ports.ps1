$ports = 3000,3001,3002
foreach ($p in $ports) {
  try {
    $r = Invoke-WebRequest -Uri ("http://localhost:$p/") -UseBasicParsing -TimeoutSec 2
    Write-Output ("port $p: UP (Status " + $r.StatusCode + ")")
  } catch {
    Write-Output ("port $p: DOWN")
  }
}
