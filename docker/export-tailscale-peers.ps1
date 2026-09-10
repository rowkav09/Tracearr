param([Parameter(Mandatory=$true)][string]$OutputDirectory, [switch]$Once)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
do {
    try {
        $start = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        $info = New-Object System.Diagnostics.ProcessStartInfo
        $info.FileName = 'C:\Program Files\Tailscale\tailscale.exe'
        $info.Arguments = 'status --json'
        $info.UseShellExecute = $false
        $info.CreateNoWindow = $true
        $info.RedirectStandardOutput = $true
        $info.RedirectStandardError = $true
        $proc = [System.Diagnostics.Process]::Start($info)
        $stdout = $proc.StandardOutput.ReadToEndAsync()
        $stderr = $proc.StandardError.ReadToEndAsync()
        if (-not $proc.WaitForExit(5000)) { $proc.Kill(); throw 'Tailscale status timed out' }
        if ($proc.ExitCode -ne 0) { throw 'Tailscale status unavailable' }
        $status = $stdout.Result | ConvertFrom-Json
        if ($status.BackendState -ne 'Running') { throw 'Tailscale is not running' }
        $peers = @{}
        foreach ($property in $status.Peer.PSObject.Properties) {
            $peer = $property.Value
            $peers[$property.Name] = @{
                TailscaleIPs = @($peer.TailscaleIPs)
                CurAddr = [string]$peer.CurAddr
                Relay = [string]$peer.Relay
                PeerRelay = [string]$peer.PeerRelay
                Online = [bool]$peer.Online
                Active = [bool]$peer.Active
            }
        }
        $json = @{ capturedAt = $start; status = @{ BackendState = 'Running'; Peer = $peers } } | ConvertTo-Json -Depth 8 -Compress
        $pending = Join-Path $OutputDirectory 'peers.pending'
        [System.IO.File]::WriteAllText($pending, $json, (New-Object System.Text.UTF8Encoding($false)))
        Move-Item -LiteralPath $pending -Destination (Join-Path $OutputDirectory 'peers.json') -Force
    } catch {
        # Leave the previous snapshot to expire; never invent a fresh timestamp.
        if ($Once) { throw }
    } finally {
        if ($proc) { $proc.Dispose(); $proc = $null }
    }
    if (-not $Once) { Start-Sleep -Seconds 15 }
} while (-not $Once)
