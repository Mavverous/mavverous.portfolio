/**
 * URL Extension Handler - Runtime solution for clean URLs
 * 
 * This script handles URLs without .html extensions for a cleaner site experience.
 * It works across all environments (Local and GitHub Pages).
 */

// Execute immediately to avoid flicker
(function() {
    // PART 1: REDIRECTS FOR CURRENT PAGE
    
    // Get current URL
    const currentURL = window.location.href;
    const path = window.location.pathname;
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';
    
    // For GitHub Pages (in production), handle clean URLs
    if (!isLocal) {
        // If accessed with .html extension, redirect to clean URL
        if (path.endsWith('.html')) {
            const cleanPath = path.slice(0, -5); // Remove .html
            console.log(`Redirecting from ${path} to ${cleanPath}`);
            window.history.replaceState(null, document.title, cleanPath + window.location.search + window.location.hash);
        }
    }
    
    // PART 2: FIX ALL INTERNAL LINKS
    document.addEventListener('DOMContentLoaded', function() {
        // Process all links in the document
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip links that aren't relevant
            if (!href || 
                href.startsWith('http') || 
                href.startsWith('#') || 
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.includes('?') ||
                href.endsWith('/') ||
                href.includes('#') ||
                href.includes('download')) {
                return;
            }                if (isLocal) {
                // For local development: ensure .html is present
                if (!href.endsWith('.html') && !href.includes('.')) {
                    const newHref = href + '.html';
                    link.setAttribute('href', newHref);
                    console.log(`Local environment: Added .html to ${href} → ${newHref}`);
                }
            } else {
                // For production: remove .html extensions
                if (href.endsWith('.html')) {
                    const newHref = href.slice(0, -5); // Remove .html
                    link.setAttribute('href', newHref);
                    console.log(`Production: Removed .html from ${href} → ${newHref}`);
                }
                
                // Fix for links that go to directories without trailing slash
                if (href.match(/\/[^\/\.]+$/) && !href.includes('.')) {
                    console.log(`Link potentially points to directory without trailing slash: ${href}`);
                }
            }
        });
    });
})();
