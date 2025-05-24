/**
 * Fallback Comments System
 * 
 * This script provides a fallback for when the Cusdis iframe is blocked
 * by displaying static comment data loaded via AJAX.
 * 
 * Note: This is a client-side demonstration. For a production environment,
 * you would need to implement a server-side endpoint to fetch the actual
 * comments data from Cusdis API using your API key.
 */

class FallbackComments {    constructor() {
        this.container = document.getElementById('cusdis_thread');
        this.appId = this.container?.getAttribute('data-app-id');
        this.pageId = this.container?.getAttribute('data-page-id');
        this.pageTitle = this.container?.getAttribute('data-page-title');
        this.pageUrl = this.container?.getAttribute('data-page-url');
    }

    /**
     * Initialize the fallback comments system
     */
    init() {
        if (!this.container) return;
        
        // Add a click event to the "Load comments without iframe" button if it exists
        const fallbackBtn = document.querySelector('.load-comments-fallback');
        if (fallbackBtn) {
            fallbackBtn.addEventListener('click', () => this.loadFallbackComments());
        }
    }

    /**
     * Check if an iframe was blocked by ad blocker
     */
    detectBlockedIframe() {
        setTimeout(() => {
            // If there's no iframe or it has no height, it may have been blocked
            const iframe = this.container.querySelector('iframe');
            const isBlocked = !iframe || iframe.offsetHeight === 0;
            
            if (isBlocked && !this.container.querySelector('.ad-blocker-message')) {
                this.showFallbackOption();
            }
        }, 2000);
    }

    /**
     * Show a fallback option for loading comments
     */
    showFallbackOption() {
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'ad-blocker-message';
        fallbackMessage.innerHTML = `
            <div class="alert alert-info">
                <h5><i class="fas fa-comment-alt me-2"></i> Comments Not Loading?</h5>
                <p>Your browser might be blocking the comments iframe. You can:</p>
                <button class="btn btn-sm btn-primary load-comments-fallback">
                    <i class="fas fa-sync me-2"></i> Try Alternative Comments View
                </button>
            </div>
        `;
        
        // Add the button event listener
        const fallbackBtn = fallbackMessage.querySelector('.load-comments-fallback');
        fallbackBtn.addEventListener('click', () => this.loadFallbackComments());
        
        // Add to the container
        this.container.appendChild(fallbackMessage);
    }

    /**
     * Load comments via an alternative method
     * This is where you would call your own backend API that uses Cusdis API
     */
    loadFallbackComments() {
        if (!this.pageId || !this.appId) {
            console.error('Missing page ID or app ID for fallback comments');
            return;
        }
        
        // Show loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'fallback-comments-loading text-center py-4';
        loadingMsg.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Loading comments...';
        
        // Replace any existing ad blocker messages
        const adBlockerMsg = this.container.querySelector('.ad-blocker-message');
        if (adBlockerMsg) {
            adBlockerMsg.replaceWith(loadingMsg);
        } else {
            this.container.appendChild(loadingMsg);
        }
        
        // In a real implementation, you would fetch from your backend
        // For this demo, we'll simulate a response after a delay
        setTimeout(() => {
            // Create a fallback comments display
            this.renderFallbackComments({
                approved: [
                    {
                        id: 'demo-1',
                        content: 'This is amazing work! I love the attention to detail.',
                        created_at: new Date().toISOString(),
                        by_nickname: 'Art Fan',
                        by_email: 'hidden@example.com'
                    }
                ],
                pending: 1
            });
            
            // Remove the loading message
            loadingMsg.remove();
        }, 1500);
    }

    /**
     * Render fallback comments from data
     * @param {Object} data - The comments data object
     */
    renderFallbackComments(data) {
        // Create a comments container
        const commentsContainer = document.createElement('div');
        commentsContainer.className = 'fallback-comments-container';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'fallback-comments-header mb-4';
        header.innerHTML = `
            <h5 class="mb-3"><i class="fas fa-comments me-2"></i> Comments (${data.approved.length})</h5>
            <div class="fallback-comments-notice alert alert-light small">
                <i class="fas fa-info-circle me-2"></i>
                Comments are shown in simplified view due to ad blocker interference.
                ${data.pending ? `<div class="mt-1 text-muted">${data.pending} comment(s) pending approval</div>` : ''}
            </div>
        `;
        commentsContainer.appendChild(header);
        
        // Add comments
        if (data.approved.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'fallback-comments-empty text-center py-4';
            emptyState.innerHTML = '<p class="mb-0 text-muted">No comments yet. Be the first to comment!</p>';
            commentsContainer.appendChild(emptyState);
        } else {
            const commentsList = document.createElement('div');
            commentsList.className = 'fallback-comments-list';
            
            // Add each comment
            data.approved.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.className = 'fallback-comment';
                
                // Format date
                const date = new Date(comment.created_at);
                const formattedDate = date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                commentEl.innerHTML = `
                    <div class="fallback-comment-header">
                        <strong class="fallback-comment-author">${comment.by_nickname}</strong>
                        <span class="fallback-comment-date">${formattedDate}</span>
                    </div>
                    <div class="fallback-comment-content">${comment.content}</div>
                `;
                commentsList.appendChild(commentEl);
            });
            
            commentsContainer.appendChild(commentsList);
        }
        
        // Add comment form placeholder
        const formPlaceholder = document.createElement('div');
        formPlaceholder.className = 'fallback-comment-form mt-4';
        formPlaceholder.innerHTML = `
            <div class="alert alert-secondary">
                <p class="mb-2"><strong>Add a comment</strong></p>
                <p class="small mb-0">To add a comment, please either disable your ad blocker or use 
                <a href="mailto:mavverous@gmail.com?subject=Comment on: ${document.title}" class="alert-link">email</a> instead.</p>
            </div>
        `;
        commentsContainer.appendChild(formPlaceholder);
        
        // Replace any existing content
        while (this.container.firstChild) {
            this.container.firstChild.remove();
        }
        
        // Add the comments container
        this.container.appendChild(commentsContainer);
        
        // Add styles
        this.addFallbackStyles();
    }
    
    /**
     * Add inline styles for fallback comments
     */
    addFallbackStyles() {
        // Create style element if it doesn't exist
        if (!document.getElementById('fallback-comments-styles')) {
            const style = document.createElement('style');
            style.id = 'fallback-comments-styles';
            style.textContent = `
                .fallback-comments-container {
                    padding: 1rem;
                    background-color: rgba(32, 36, 56, 0.3);
                    border-radius: 8px;
                    animation: fadeIn 0.5s ease-in-out;
                }
                
                .fallback-comment {
                    padding: 1rem;
                    margin-bottom: 1rem;
                    background-color: rgba(24, 27, 46, 0.7);
                    border-left: 3px solid #6d5dfc;
                    border-radius: 0 5px 5px 0;
                }
                
                .fallback-comment-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }
                
                .fallback-comment-author {
                    color: #6d5dfc;
                }
                
                .fallback-comment-date {
                    color: var(--gray-color);
                    font-size: 0.85rem;
                }
                
                .fallback-comment-content {
                    color: var(--text-color);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const fallbackComments = new FallbackComments();
    fallbackComments.detectBlockedIframe();
});
