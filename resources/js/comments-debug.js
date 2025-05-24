/**
 * Comments Debug Tool
 * 
 * This file provides debugging functions to diagnose issues
 * with the Cusdis comments system and our custom UI implementation.
 */

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure all comments scripts are loaded
    setTimeout(debugComments, 2000);
});

/**
 * Debug the comments system
 */
function debugComments() {
    console.group('=== COMMENTS DEBUG INFORMATION ===');
    
    // Check elements existence
    const customComments = document.getElementById('custom_comments');
    const cusdisThread = document.getElementById('cusdis_thread');
    
    console.log('Custom comments container exists:', !!customComments);
    console.log('Cusdis thread container exists:', !!cusdisThread);
    
    // Get page ID from various sources
    const urlParams = new URLSearchParams(window.location.search);
    const urlPageId = urlParams.get('id');
    
    const customPageId = customComments?.getAttribute('data-page-id');
    const cusdisPageId = cusdisThread?.getAttribute('data-page-id');
    
    console.log('Page ID from URL:', urlPageId);
    console.log('Page ID from custom comments:', customPageId);
    console.log('Page ID from Cusdis thread:', cusdisPageId);
    
    // Check global variables
    console.log('Cusdis global object exists:', !!window.CUSDIS);
    console.log('Custom UI instance exists:', !!window.customCommentsUIInstance);
    
    // If custom UI exists, show its data
    if (window.customCommentsUIInstance) {
        const ui = window.customCommentsUIInstance;
        console.log('Custom UI page ID:', ui.pageId);
        console.log('Custom UI app ID:', ui.appId);
        console.log('Custom UI comments array:', ui.comments);
        console.log('Custom UI comments count:', Array.isArray(ui.comments) ? ui.comments.length : 'N/A');
    }
    
    // Check for hidden iframe that might have comments
    const iframe = cusdisThread?.querySelector('iframe');
    if (iframe) {
        console.log('Cusdis iframe exists:', !!iframe);
        console.log('Iframe is visible:', iframe.offsetHeight > 0);
        
        try {
            // Try to access iframe content if possible (might be blocked by CORS)
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            console.log('Could access iframe document:', !!iframeDoc);
            
            if (iframeDoc) {
                const commentItems = iframeDoc.querySelectorAll('.comment-item');
                console.log('Comments in iframe:', commentItems?.length);
            }
        } catch (e) {
            console.log('Could not access iframe content:', e.message);
        }
    }
    
    // Make direct API call to check for comments
    console.log('Making direct API call to check for comments...');
    
    // Get the app ID and page ID
    const appId = customComments?.getAttribute('data-app-id') || 
                 cusdisThread?.getAttribute('data-app-id');
    const pageId = customPageId || cusdisPageId || urlPageId;
    
    if (appId && pageId) {
        const apiUrl = `https://cusdis.com/api/open/comments?appId=${appId}&pageId=${pageId}`;
        
        fetch(apiUrl)
            .then(response => {
                console.log('API response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('API raw response:', data);
                  // Extract comments based on data structure
                let comments = [];
                
                // Handle different possible data structures
                if (Array.isArray(data)) {
                    comments = data;
                    console.log('Found comments in root array');
                } else if (data.data && data.data.data && Array.isArray(data.data.data)) {
                    // This matches the structure in the console log you shared
                    comments = data.data.data;
                    console.log('Found comments in data.data.data');
                } else if (data.data && Array.isArray(data.data)) {
                    comments = data.data;
                    console.log('Found comments in data.data');
                } else if (data.comments && Array.isArray(data.comments)) {
                    comments = data.comments;
                    console.log('Found comments in data.comments');
                } else if (data.approved && Array.isArray(data.approved)) {
                    comments = data.approved;
                    console.log('Found comments in data.approved');
                } else {
                    // Try to find any array that contains comment-like objects
                    const findCommentsArray = (obj, path = '') => {
                        if (!obj || typeof obj !== 'object') return null;
                        
                        for (const key in obj) {
                            const currentPath = path ? `${path}.${key}` : key;
                            
                            if (Array.isArray(obj[key]) && obj[key].length > 0 && 
                                (obj[key][0].content !== undefined || obj[key][0].by_nickname !== undefined)) {
                                console.log(`Found comments in ${currentPath}`);
                                return obj[key];
                            } else if (obj[key] && typeof obj[key] === 'object') {
                                const result = findCommentsArray(obj[key], currentPath);
                                if (result) return result;
                            }
                        }
                        return null;
                    };
                    
                    const foundComments = findCommentsArray(data);
                    if (foundComments) {
                        comments = foundComments;
                    }
                }
                
                console.log('Extracted comments:', comments);
                console.log('Comments found:', comments.length);
                
                // Display the comments if found
                if (comments.length > 0) {
                    console.log('Comments found but not displaying. Possible UI issue.');
                    
                    // If we have comments but they're not showing, try to fix the UI
                    fixCommentsDisplay(comments);
                } else {
                    console.log('No comments found in the API response.');
                }
            })
            .catch(error => {
                console.error('Error fetching comments API:', error);
            })
            .finally(() => {
                console.groupEnd();
            });
    } else {
        console.log('Missing appId or pageId for API check.');
        console.groupEnd();
    }
}

/**
 * Fix comments display if comments are found but not showing
 * @param {Array} comments - The comments array from API
 */
function fixCommentsDisplay(comments) {
    // If we have a custom UI instance, force update it
    if (window.customCommentsUIInstance) {
        console.log('Forcing update of custom UI with comments...');
        
        const ui = window.customCommentsUIInstance;
        ui.comments = comments;
        ui.renderComments();
        
        // Update comment counts
        updateCommentCounts(comments.length);
    } else {
        // Create a manual display of comments as fallback
        console.log('Creating fallback display for comments...');
        
        const customComments = document.getElementById('custom_comments');
        if (customComments) {
            // Clear container
            customComments.innerHTML = '';
            
            // Add comments list
            const commentsList = document.createElement('div');
            commentsList.className = 'custom-comments-list';
            
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'comment-item';
                
                const date = new Date(comment.created_at);
                const formattedDate = date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                commentElement.innerHTML = `
                    <div class="comment-header">
                        <div class="comment-author">${comment.by_nickname}</div>
                        <div class="comment-date">${formattedDate}</div>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                `;
                
                commentsList.appendChild(commentElement);
            });
            
            customComments.appendChild(commentsList);
            
            // Update comment counts
            updateCommentCounts(comments.length);
        }
    }
}

/**
 * Update all comment count elements
 * @param {number} count - The number of comments
 */
function updateCommentCounts(count) {
    // Update all count elements
    const countElements = document.querySelectorAll('.comment-count, .comments-count');
    countElements.forEach(element => {
        element.textContent = count;
    });
}
