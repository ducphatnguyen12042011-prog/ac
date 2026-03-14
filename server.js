$ApiUrl = "https://ac-afqu.onrender.com/report"
$CheckInterval = 60

while($true) {
    try {
        # Lấy tất cả tiến trình nhưng ưu tiên những cái có cửa sổ trước
        $Procs = Get-Process | Select-Object Name
        
        $Body = @{
            pc_name = $env:COMPUTERNAME
            user = $env:USERNAME
            processes = $Procs
        } | ConvertTo-Json -Compress

        Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $Body -ContentType "application/json"
        Write-Host "OK: Da gui bao cao gon gang!" -ForegroundColor Green
    }
    catch {
        Write-Host "Server dang ngu, dang thu lai..." -ForegroundColor Yellow
    }
    Start-Sleep -Seconds $CheckInterval
}
