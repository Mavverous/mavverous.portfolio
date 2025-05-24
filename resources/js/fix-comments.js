/**
 * Fix Comments Button
 * 
 * This script adds a button to fix comment loading issues by
 * directly fetching from the API and updating the UI.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure the page is fully loaded
    setTimeout(addFixCommentsButton, 2000);
});

/**
 * Add a "Fix Comments" button to the page
 */
function addFixCommentsButton() {
    // Create the button
    const fixButton = document.createElement('button');
    // Refresh Icon
    fixButton.textContent = '';
    fixButton.classList.add('btn', 'btn-sm', 'btn-secondary', 'mt-2', 'mb-3', 'fas', 'fa-sync');
    fixButton.style.marginLeft = '10px';
    
    // Find the comments title element to place the button next to it
    const commentsTitle = document.querySelector('.comments-section h3');
    if (commentsTitle) {
        commentsTitle.appendChild(fixButton);
        
        // Add click event
        fixButton.addEventListener('click', fixComments);
    }
}

/**
 * Fix the comments by directly fetching from the API and updating the UI
 */
async function fixComments() {
    // Show loading state
    const button = document.querySelector('.comments-section button');
    if (button) {
        const originalText = button.textContent;
        button.textContent = '';
        button.disabled = true;
        
        try {
            // Get necessary parameters
            const customComments = document.getElementById('custom_comments');
            const cusdisThread = document.getElementById('cusdis_thread');
            const urlParams = new URLSearchParams(window.location.search);
            
            // Get appId and pageId from available sources
            const appId = customComments?.getAttribute('data-app-id') || 
                         cusdisThread?.getAttribute('data-app-id');
            const pageId = customComments?.getAttribute('data-page-id') || 
                         cusdisThread?.getAttribute('data-page-id') || 
                         urlParams.get('id');
            
            if (!appId || !pageId) {
                console.error('Missing appId or pageId for fixing comments');
                alert('Error: Missing required parameters. Please try reloading the page.');
                return;
            }
            
            // Fetch comments directly
            const apiUrl = `https://cusdis.com/api/open/comments?appId=${appId}&pageId=${pageId}`;
            console.log('Directly fetching comments from:', apiUrl);
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            console.log('API response for fix:', data);
            
            // Extract comments from the nested structure
            let comments = [];
            
            if (data.data && data.data.data && Array.isArray(data.data.data)) {
                comments = data.data.data;
                console.log('Found comments in data.data.data:', comments.length);
            } else if (data.data && Array.isArray(data.data)) {
                comments = data.data;
                console.log('Found comments in data.data:', comments.length);
            } else {
                console.warn('Could not find comments in the API response');
            }
            
            if (comments.length > 0) {
                // If we found comments, update the UI
                console.log(`Found ${comments.length} comments, updating UI...`);
                
                // Update our custom UI if it exists
                if (window.customCommentsUIInstance) {
                    window.customCommentsUIInstance.comments = comments;
                    window.customCommentsUIInstance.renderComments();
                    
                    // Update comment counts
                    const countElements = document.querySelectorAll('.comments-count, .comment-count');
                    countElements.forEach(el => {
                        el.textContent = comments.length;
                    });
                    
                    console.log('Successfully updated comments UI');
                } else {
                    console.error('CustomCommentsUI instance not found');
                }
            } else {
                console.log('No comments found');
            }
        } catch (error) {
            console.error('Error fixing comments:', error);
        } finally {
            // Restore button state
            if (button) {
                button.textContent = originalText;
                button.disabled = false;
            }
        }
    }
}
