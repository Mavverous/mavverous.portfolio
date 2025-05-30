# URL and File Extension Normalizer for Mavverous Portfolio
# 
# This script has two functions:
# 1. Normalizes file extensions for GitHub Pages compatibility
# 2. Handles HTML links to support clean URLs without .html extensions

# Check for administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

# PART 1: FILE EXTENSION NORMALIZATION
# This normalizes image file extensions to lowercase
$imageTypes = "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.svg", "*.PNG", "*.JPG", "*.JPEG", "*.GIF", "*.WEBP", "*.SVG"
$imagesFolder = "resources\images\"
$renamedFiles = @()

# Find all image files
$files = Get-ChildItem -Path $imagesFolder -Include $imageTypes -Recurse

Write-Host "Found $($files.Count) image files."

foreach ($file in $files) {
    # Check if extension has uppercase letters
    $extension = $file.Extension
    $lowercaseExt = $extension.ToLower()
    
    if ($extension -ne $lowercaseExt) {
        $newName = $file.BaseName + $lowercaseExt
        $newPath = Join-Path -Path $file.Directory.FullName -ChildPath $newName
        
        Write-Host "Renaming: $($file.Name) -> $newName"
        
        try {
            Rename-Item -Path $file.FullName -NewName $newName -Force
            $renamedFiles += @{
                OldName = $file.Name
                NewName = $newName
                Path = $file.Directory.FullName
            }
        }
        catch {
            Write-Host "Error renaming file $($file.Name): $_" -ForegroundColor Red
        }
    }
}

# Report results
if ($renamedFiles.Count -gt 0) {
    Write-Host "`nRenamed $($renamedFiles.Count) files:" -ForegroundColor Green
    $renamedFiles | ForEach-Object {
        Write-Host "  - $($_.OldName) -> $($_.NewName) in $($_.Path)"
    }
    
    Write-Host "`nIMPORTANT: Make sure to update your GitHub repository with these changes!"
    Write-Host "Run 'git add .' to add renamed files to your next commit."
} else {    Write-Host "`nNo files needed renaming. All image extensions are already lowercase." -ForegroundColor Green
}

# PART 2: GitHub Pages Configuration
function Create-GithubPagesConfig {
    Write-Host "`n=== Configuring GitHub Pages For Clean URLs ===" -ForegroundColor Cyan
    
    # Create or update _config.yml file for GitHub Pages
    $configContent = @"
# GitHub Pages Configuration
permalink: pretty
"@

    Set-Content -Path "_config.yml" -Value $configContent
    Write-Host "Created _config.yml for GitHub Pages with clean URLs configuration" -ForegroundColor Green
    
    # Create .nojekyll file to bypass Jekyll processing
    $null > ".nojekyll"
    Write-Host "Created .nojekyll file to bypass Jekyll processing" -ForegroundColor Green
}

# PART 3: HTML Link Processing
function Update-HtmlLinks {
    param (
        [string]$mode # "add" or "remove" .html extensions
    )
    
    Write-Host "`n=== Processing HTML Links ($mode .html extensions) ===" -ForegroundColor Cyan
    
    # Get all HTML files
    $htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse
    $modifiedFiles = @()
    
    foreach ($file in $htmlFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $originalContent = $content
        
        if ($mode -eq "add") {
            # Add .html extension to links without it (for local testing)
            $content = $content -replace '(href="[^"]*?/[^"/.#?]+)(")', '$1.html$2'
        }
        elseif ($mode -eq "remove") {
            # Remove .html extension from links (for GitHub Pages)
            $content = $content -replace '(href="[^"]+)\.html(")', '$1$2'
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content
            $modifiedFiles += $file.Name
        }
    }
    
    if ($modifiedFiles.Count -gt 0) {
        Write-Host "Modified links in $($modifiedFiles.Count) files:" -ForegroundColor Green
        $modifiedFiles | ForEach-Object { Write-Host "  - $_" }
    } else {
        Write-Host "No HTML files needed link modifications." -ForegroundColor Yellow
    }
}

# Main Menu
function Show-Menu {
    Write-Host "`n========== Mavverous Portfolio URL Tool ==========" -ForegroundColor Cyan
    Write-Host "1: Normalize image file extensions (lowercase)" -ForegroundColor White
    Write-Host "2: Prepare for GitHub Pages (clean URLs)" -ForegroundColor White
    Write-Host "3: Prepare for local testing (with .html extensions)" -ForegroundColor White
    Write-Host "4: Exit" -ForegroundColor White
    Write-Host "=================================================" -ForegroundColor Cyan
    
    $choice = Read-Host "Enter your choice"
    
    switch ($choice) {
        "1" {
            # Already processed by the existing file scan
            Write-Host "File extension normalization complete!" -ForegroundColor Green
            Show-Menu
        }
        "2" {
            Create-GithubPagesConfig
            Update-HtmlLinks -mode "remove"
            Write-Host "`nSite is ready for GitHub Pages with clean URLs!" -ForegroundColor Green
            Show-Menu
        }
        "3" {
            Update-HtmlLinks -mode "add"
            Write-Host "`nSite is ready for local testing with .html extensions!" -ForegroundColor Green
            Show-Menu
        }
        "4" {
            Write-Host "Exiting..." -ForegroundColor Yellow
            return
        }
        default {
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
            Show-Menu
        }
    }
}

Write-Host "`nDone normalizing image file extensions."
# Run the menu after processing files
Show-Menu
