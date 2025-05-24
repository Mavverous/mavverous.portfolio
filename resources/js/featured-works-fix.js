/**
 * Featured Works Loading Fix
 * 
 * This script adds a loading spinner and better error handling for the featured works section.
 * It also implements retry functionality and provides a visual loading state.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the featured works container
    const featuredWorksContainer = document.getElementById('featured-works-container');
    
    if (!featuredWorksContainer) {
        console.error('Featured works container not found');
        return;
    }
    
    // Add loading spinner immediately
    showLoadingSpinner();
    
    // Add retry button listener to the document
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'retry-featured-works') {
            e.preventDefault();
            console.log('Retrying featured works load');
            retryLoadingFeaturedWorks();
        }
    });
    
    /**
     * Show loading spinner in the featured works container
     */
    function showLoadingSpinner() {
        featuredWorksContainer.innerHTML = `
            <div class="col-12 text-center py-5" id="featured-works-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading recent works...</p>
            </div>
        `;
    }
    
    /**
     * Retry loading the featured works
     */
    function retryLoadingFeaturedWorks() {
        // Show loading state
        showLoadingSpinner();
        
        // Create a new script element to force reload the featured-works.js
        const oldScript = document.querySelector('script[src*="featured-works.js"]');
        if (oldScript) {
            // Remove the old script
            oldScript.parentNode.removeChild(oldScript);
            
            // Create and add a new script with a cache-busting parameter
            const newScript = document.createElement('script');
            newScript.src = `${oldScript.src.split('?')[0]}?_=${Date.now()}`; // Add cache-busting
            document.body.appendChild(newScript);
            
            console.log('Reloaded featured-works.js script with cache busting');
        } else {
            console.error('Could not find featured-works.js script to reload');
            showError('Could not reload featured works script. Please refresh the page.');
        }
    }
    
    /**
     * Show error message in the featured works container
     */
    function showError(message) {
        featuredWorksContainer.innerHTML = `
            <div class="col-12 text-center py-4">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
                <button id="retry-featured-works" class="btn btn-primary mt-3">
                    <i class="fas fa-sync-alt me-2"></i> Retry Loading
                </button>
            </div>
        `;
    }
    
    // Implement a safety timeout - if featured works don't load in 10 seconds, show retry button
    const safetyTimeout = setTimeout(() => {
        // Check if loading spinner is still visible
        const loadingElement = document.getElementById('featured-works-loading');
        if (loadingElement) {
            console.warn('Featured works loading timeout exceeded');
            showError('Featured works are taking too long to load. Please try again.');
        }
    }, 10000); // 10-second timeout
    
    // Expose these functions globally so they can be called from featured-works.js
    window.featuredWorksHelpers = {
        showLoadingSpinner,
        showError,
        clearSafetyTimeout: () => clearTimeout(safetyTimeout)
    };
});
