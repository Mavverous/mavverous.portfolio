/**
 * Custom Comments UI Integration
 * 
 * This script ensures that the custom comments UI correctly receives
 * page ID and other parameters from the ArtworkDetail class.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Observer to wait for data-page-id to be set in the cusdis_thread element
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-page-id') {
                const cusdisThread = document.getElementById('cusdis_thread');
                const customComments = document.getElementById('custom_comments');
                
                if (cusdisThread && customComments) {
                    // Copy attributes from cusdis_thread to custom_comments
                    const pageId = cusdisThread.getAttribute('data-page-id');
                    const pageUrl = cusdisThread.getAttribute('data-page-url');
                    const pageTitle = cusdisThread.getAttribute('data-page-title');
                    
                    if (pageId) {
                        customComments.setAttribute('data-page-id', pageId);
                        customComments.setAttribute('data-page-url', pageUrl || window.location.href);
                        customComments.setAttribute('data-page-title', pageTitle || document.title);
                        
                        console.log('Custom comments UI updated with page ID:', pageId);
                        
                        // If CustomCommentsUI instance exists on window, refresh it
                        if (window.customCommentsUIInstance) {
                            window.customCommentsUIInstance.pageId = pageId;
                            window.customCommentsUIInstance.pageUrl = pageUrl || window.location.href;
                            window.customCommentsUIInstance.pageTitle = pageTitle || document.title;
                            window.customCommentsUIInstance.fetchComments();
                        }
                    }
                }
            }
        });
    });
    
    // Start observing the cusdis_thread element
    const cusdisThread = document.getElementById('cusdis_thread');
    if (cusdisThread) {
        observer.observe(cusdisThread, { attributes: true });
    }
    
    // Fallback: Also try to get page ID directly from URL
    const urlParams = new URLSearchParams(window.location.search);
    const artworkId = urlParams.get('id');
    
    if (artworkId) {
        const customComments = document.getElementById('custom_comments');
        if (customComments && !customComments.getAttribute('data-page-id')) {
            customComments.setAttribute('data-page-id', artworkId);
            console.log('Set custom comments page ID from URL:', artworkId);
            
            // If CustomCommentsUI instance exists, update it
            if (window.customCommentsUIInstance) {
                window.customCommentsUIInstance.pageId = artworkId;
                window.customCommentsUIInstance.fetchComments();
            }
        }
    }
});
