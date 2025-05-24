/**
 * Comment Count Handler
 * Extension for dynamically updating comment counts with proper page IDs
 */

// Function to extend CommentsManager - execute immediately
(function() {
    // This function will try to extend the CommentsManager or set it up to be extended once available
    function extendCommentsManager() {
        // Check if the CommentsManager class exists
        if (typeof CommentsManager !== 'undefined') {
            // Create and add the initCommentCount method to the CommentsManager prototype
        CommentsManager.prototype.initCommentCount = function() {
            // Get the comment count element
            const commentCountEl = document.querySelector('.comment-count');
            if (!commentCountEl) return;
            
            // Ensure the page ID is set from the thread element if available
            if (!commentCountEl.hasAttribute('data-cusdis-count-page-id') && this.cusdisThread) {
                const pageId = this.cusdisThread.getAttribute('data-page-id');
                if (pageId) {
                    commentCountEl.setAttribute('data-cusdis-count-page-id', pageId);
                    console.log('Comment count initialized with page ID:', pageId);
                }
            }
            
            // Check if the Cusdis count script is loaded
            if (!window.CUSDIS_DOCUMENT_COUNTER) {
                console.log('Cusdis counter not loaded yet, trying to reload count script');
                // Get URL params to extract artwork ID if needed
                const urlParams = new URLSearchParams(window.location.search);
                const artworkId = urlParams.get('id');
                
                if (artworkId && !commentCountEl.hasAttribute('data-cusdis-count-page-id')) {
                    commentCountEl.setAttribute('data-cusdis-count-page-id', artworkId);
                    console.log('Set comment count page ID from URL:', artworkId);
                }
                
                // Reload the counter script
                setTimeout(() => {
                    if (typeof window.CUSDIS_DOCUMENT_COUNTER === 'undefined') {
                        const script = document.createElement('script');
                        script.defer = true;
                        script.dataset.host = "https://cusdis.com";
                        script.dataset.appId = "07595cb9-c787-4433-bcca-2bbeba084f03";
                        script.src = "https://cusdis.com/js/cusdis-count.umd.js";
                        document.body.appendChild(script);                        console.log('Reloaded Cusdis count script');
                    }
                }, 1000);
            }
        };
        
        console.log('Comment count functionality added to CommentsManager');
        
        // Try to find any existing CommentsManager instances and add the method
        const existingInstances = window._commentsManagerInstances || [];
        existingInstances.forEach(instance => {
            if (instance && !instance.initCommentCount) {
                instance.initCommentCount = CommentsManager.prototype.initCommentCount;
                console.log('Added initCommentCount to existing instance');
            }
        });
        
        return true;
    } else {
        // If CommentsManager isn't available yet, check again later
        setTimeout(extendCommentsManager, 100);
        return false;
    }
}

// Try to extend immediately
if (!extendCommentsManager()) {
    // If not successful, try again when DOM is loaded
    document.addEventListener('DOMContentLoaded', extendCommentsManager);
}

// Also try when window is fully loaded (last resort)
window.addEventListener('load', extendCommentsManager);
})();
