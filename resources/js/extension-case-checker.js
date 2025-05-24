/**
 * Extension Case Checker
 * This script helps identify case sensitivity issues in image file extensions
 * which can cause problems on GitHub Pages (case-sensitive) vs local development (case-insensitive)
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Running extension case checker...');
    
    // Only run this on local environment for development
    if (!window.location.hostname.includes('github.io')) {
        checkExtensionConsistency();
    }
});

/**
 * Check consistency of file extensions in the project
 * This helps identify potential case sensitivity issues before deployment
 */
function checkExtensionConsistency() {
    console.log('Checking for case-sensitivity issues in image paths...');
    
    // Collect all image elements
    const images = document.querySelectorAll('img');
    const inconsistentImages = [];
    
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (!src) return;
        
        // Check if this is a local image
        if (!src.startsWith('http') && !src.startsWith('data:')) {
            // Check extension case
            const match = src.match(/\.([a-zA-Z0-9]+)$/);
            
            if (match && match[1]) {
                const ext = match[1];
                
                // If extension is mixed case or uppercase, it could cause problems
                if (ext !== ext.toLowerCase() || ext !== ext.toUpperCase()) {
                    inconsistentImages.push({
                        element: img,
                        src: src,
                        extension: ext
                    });
                    
                    // Add visual indication for debugging
                    img.style.border = '3px solid red';
                    img.title = 'Case sensitivity warning: ' + src;
                    
                    console.warn(`Case sensitivity issue detected: ${src}`);
                    console.warn(`Recommendation: Use consistent lowercase extensions for all images`);
                }
            }
        }
    });
    
    if (inconsistentImages.length > 0) {
        console.warn(`Found ${inconsistentImages.length} images with potential case sensitivity issues`);
        console.table(inconsistentImages.map(item => ({
            src: item.src,
            extension: item.extension
        })));
        
        // Add a visual warning to the page during development
        const warning = document.createElement('div');
        warning.style.position = 'fixed';
        warning.style.bottom = '10px';
        warning.style.right = '10px';
        warning.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        warning.style.color = 'white';
        warning.style.padding = '10px';
        warning.style.borderRadius = '5px';
        warning.style.zIndex = '9999';
        warning.innerHTML = `⚠️ Warning: ${inconsistentImages.length} images have case sensitivity issues.<br>Check console for details.`;
        
        document.body.appendChild(warning);
    } else {
        console.log('✅ No case sensitivity issues found in image paths');
    }
}
