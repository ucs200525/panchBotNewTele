param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("prod", "test")]
    [string]$Env,

    [Parameter(Mandatory=$false)]
    [ValidateSet("frontend", "backend", "all")]
    [string]$Service = "all",

    [switch]$Prod
)

$argsList = @()
if ($Prod) {
    $argsList += "--prod"
}

function Deploy-Service($serviceName, $folderPath) {
    Write-Host "----------------------------------------"
    Write-Host "Deploying $serviceName to $Env environment..."
    Write-Host "----------------------------------------"
    
    $configFile = "$folderPath\.vercel\project-$Env.json"
    if (-not (Test-Path $configFile)) {
        Write-Error "Configuration file $configFile not found."
        return
    }

    # Ensure .vercel directory exists in the target folder
    if (-not (Test-Path "$folderPath\.vercel")) {
        New-Item -ItemType Directory -Path "$folderPath\.vercel" -Force | Out-Null
    }

    # Copy the config
    Copy-Item -Path $configFile -Destination "$folderPath\.vercel\project.json" -Force
    $projectName = (Get-Content $configFile | ConvertFrom-Json).projectName
    Write-Host "Linked to Vercel Project: $projectName"

    # Run Vercel deploy
    Push-Location $folderPath
    try {
        npx vercel @argsList
    } finally {
        Pop-Location
    }
}

if ($Service -eq "frontend" -or $Service -eq "all") {
    Deploy-Service "Frontend" "frontend"
}

if ($Service -eq "backend" -or $Service -eq "all") {
    Deploy-Service "Backend" "backend"
}
