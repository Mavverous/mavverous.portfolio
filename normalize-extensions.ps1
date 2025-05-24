# File Extension Case Normalizer for GitHub Pages
# This script renames all image files to have lowercase extensions
# which helps prevent case sensitivity issues on GitHub Pages

# Run this script before deploying to GitHub Pages

# This script will:
# 1. Find all image files in the resources/images folder and its subfolders
# 2. Rename any files with uppercase extensions to lowercase
# 3. Print a report of renamed files

$imageTypes = "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.svg", "*.PNG", "*.JPG", "*.JPEG", "*.GIF", "*.WEBP", "*.SVG"
$imagesFolder = "resources\images\"
$renamedFiles = @()

Write-Host "Starting file extension case normalization..."
Write-Host "Looking for image files in $imagesFolder and its subfolders..."

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
} else {
    Write-Host "`nNo files needed renaming. All image extensions are already lowercase." -ForegroundColor Green
}

Write-Host "`nDone. Your image files are now optimized for GitHub Pages deployment."
