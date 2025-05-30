/**
 * Home Page URL Cleaner
 * 
 * This script specifically handles the homepage URL to ensure
 * '/index' and '/index.html' are cleaned to just '/'
 */

// Execute immediately (IIFE)
(function() {
    const path = window.location.pathname;
    
    // Check if we're at the root with 'index' or 'index.html'
    if (/\/(index(\.html)?)$/i.test(path)) {
        // Calculate the root path
        const rootPath = path.replace(/\/index(\.html)?$/i, '/');
        
        // Redirect to clean URL
        if (rootPath !== path) {
            console.log(`Home page cleaner: Redirecting from ${path} to ${rootPath}`);
            window.history.replaceState(null, document.title, rootPath + window.location.search + window.location.hash);
        }
    }
})();
