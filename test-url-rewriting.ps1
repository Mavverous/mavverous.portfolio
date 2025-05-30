# Test URL Rewriting
# This script simulates how URLs will work on production server

# Start a simple HTTP server with URL rewriting support
# Requires Node.js to be installed

# Check if http-server is installed
if (-not (npm list -g | Select-String -Pattern "http-server")) {
    Write-Host "Installing http-server..."
    npm install -g http-server
}

# Get the current directory
$currentDir = Get-Location

# Create a temporary folder for the test
$tempDir = Join-Path $env:TEMP "MavverousTest"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy .htaccess to the temp directory
Copy-Item -Path ".htaccess" -Destination $tempDir

# Start the server with URL rewriting
Write-Host "Starting test server with URL rewriting..."
Write-Host "Access your site at http://localhost:8080"
Write-Host "Press Ctrl+C to stop the server"
Set-Location $tempDir
http-server $currentDir -p 8080 --proxy http://localhost:8080? -c-1

# Return to original directory
Set-Location $currentDir
