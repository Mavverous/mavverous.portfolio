/**
 * Custom Cusdis Comments UI - Updated Version
 * 
 * This script provides a custom UI for the Cusdis comment system with improved
 * API response handling to handle various response structures.
 */

class CustomCommentsUI {
    constructor(options = {}) {
        // Container element
        this.container = document.getElementById(options.containerId || 'custom_comments');
        if (!this.container) return;
        
        // Cusdis parameters
        this.host = options.host || 'https://cusdis.com';
        this.appId = options.appId || this.container.getAttribute('data-app-id');
        this.pageId = options.pageId || this.container.getAttribute('data-page-id');
        this.pageUrl = options.pageUrl || this.container.getAttribute('data-page-url');
        this.pageTitle = options.pageTitle || this.container.getAttribute('data-page-title');
        
        // State
        this.comments = [];
        this.isLoading = false;
        this.error = null;
        this.pendingComment = null;
        
        // DOM elements
        this.commentsListElement = null;
        this.commentFormElement = null;
        this.statusElement = null;
        this.paginationElement = null;
        
        // Pagination
        this.currentPage = 1;
        this.totalPages = 1;
        this.commentsPerPage = 10;
        
        // Initialize the UI
        this.init();
    }
    
    /**
     * Initialize the comments UI
     */
    init() {
        // Check if necessary parameters are available
        if (!this.appId || !this.container) {
            console.error('Missing required parameters for custom comments UI');
            return;
        }
        
        // If page ID is still missing, try to get it from URL
        if (!this.pageId) {
            const urlParams = new URLSearchParams(window.location.search);
            this.pageId = urlParams.get('id');
            console.log('Setting page ID from URL:', this.pageId);
        }
        
        // Update container data attributes to ensure consistency
        if (this.pageId) {
            this.container.setAttribute('data-page-id', this.pageId);
        }
        if (this.pageUrl) {
            this.container.setAttribute('data-page-url', this.pageUrl);
        }
        if (this.pageTitle) {
            this.container.setAttribute('data-page-title', this.pageTitle);
        }
        
        // Also update the regular Cusdis thread element if it exists (for count functionality)
        const cusdisThread = document.getElementById('cusdis_thread');
        if (cusdisThread && this.pageId) {
            cusdisThread.setAttribute('data-page-id', this.pageId);
            cusdisThread.setAttribute('data-page-url', this.pageUrl || window.location.href);
            cusdisThread.setAttribute('data-page-title', this.pageTitle || document.title);
        }
        
        // Create UI structure
        this.renderUI();
        
        // Fetch comments if we have the required parameters
        if (this.appId && this.pageId) {
            this.fetchComments();
        } else {
            this.showError('Missing appId or pageId. Comments cannot be loaded.');
        }
        
        // Initialize comment count if Cusdis count script is loaded
        if (typeof window.CUSDIS_DOCUMENT_COUNTER !== 'undefined') {
            window.CUSDIS_DOCUMENT_COUNTER.refresh();
        }
    }
    
    /**
     * Render the basic UI structure
     */
    renderUI() {
        // Clear container
        this.container.innerHTML = '';
        
        // Add custom class for styling
        this.container.classList.add('custom-comments-container');
        
        // Create status element for messages
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'custom-comments-status';
        
        // Create comments list
        this.commentsListElement = document.createElement('div');
        this.commentsListElement.className = 'custom-comments-list';
        
        // Create loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'custom-comments-loading';
        loadingElement.innerHTML = '<div class="spinner"></div><span>Loading comments...</span>';
        
        // Create form
        this.commentFormElement = this.createCommentForm();
        
        // Create pagination
        this.paginationElement = document.createElement('div');
        this.paginationElement.className = 'custom-comments-pagination';
        
        // Add approval notification
        const approvalNotification = document.createElement('div');
        approvalNotification.className = 'approval-notification';
        approvalNotification.innerHTML = '<i class="fas fa-info-circle"></i> Comments will appear after approval. Thank you for your patience!';
        
        // Append elements to container
        this.container.appendChild(this.statusElement);
        this.container.appendChild(loadingElement);
        this.container.appendChild(this.commentsListElement);
        this.container.appendChild(this.paginationElement);
        this.container.appendChild(this.commentFormElement);
        this.container.appendChild(approvalNotification);
        
        // Show initial loading state
        this.showLoading(true);
    }
    
    /**
     * Create the comment submission form
     * @returns {HTMLElement} The form element
     */
    createCommentForm() {
        const formElement = document.createElement('div');
        formElement.className = 'custom-comment-form';
        
        formElement.innerHTML = `
            <h4 class="form-title">Leave a Comment</h4>
            <div class="form-group">
                <label for="comment-nickname">Name</label>
                <input type="text" id="comment-nickname" class="form-control custom-input" placeholder="Your name (required)" required>
            </div>
            <div class="form-group">
                <label for="comment-content">Comment</label>
                <textarea id="comment-content" class="form-control custom-textarea" placeholder="Write your comment here..." required></textarea>
            </div>
            <button type="button" class="btn btn-primary custom-submit-btn" id="comment-submit-btn">
                Submit Comment
            </button>
            <div class="submit-status"></div>
        `;
        
        // Add event listener to submit button
        const submitButton = formElement.querySelector('#comment-submit-btn');
        submitButton.addEventListener('click', this.handleCommentSubmit.bind(this));
        
        return formElement;
    }
    
    /**
     * Handle comment submission
     */
    handleCommentSubmit() {
        // Get form values
        const nickname = document.getElementById('comment-nickname').value;
        const email = document.getElementById('comment-email').value;
        const website = document.getElementById('comment-website').value;
        const content = document.getElementById('comment-content').value;
        const notification = document.getElementById('notification-checkbox').checked;
        
        // Validate required fields
        if (!nickname || !email || !content) {
            this.showFormStatus('Please fill in all required fields.', 'error');
            return;
        }
        
        // Prepare comment data
        const commentData = {
            appId: this.appId,
            pageId: this.pageId,
            content: content,
            email: email,
            nickname: nickname,
            website: website || ''
        };
        
        // Store pending comment for preview
        this.pendingComment = {
            ...commentData,
            created_at: new Date().toISOString(),
            is_pending: true
        };
        
        // Show submitting state
        const submitButton = document.getElementById('comment-submit-btn');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
        
        // Submit comment to Cusdis API
        this.submitComment(commentData)
            .then(response => {
                // Show success message
                this.showFormStatus('Comment submitted successfully! It will be visible after approval.', 'success');
                
                // Clear form
                document.getElementById('comment-nickname').value = '';
                document.getElementById('comment-email').value = '';
                document.getElementById('comment-website').value = '';
                document.getElementById('comment-content').value = '';
                document.getElementById('notification-checkbox').checked = false;
                
                // Show pending comment in the list
                this.renderPendingComment();
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                this.showFormStatus('Failed to submit comment. Please try again.', 'error');
            })
            .finally(() => {
                // Restore button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            });
    }
    
    /**
     * Show status message in the form
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error)
     */
    showFormStatus(message, type = 'info') {
        const statusElement = this.commentFormElement.querySelector('.submit-status');
        statusElement.textContent = message;
        statusElement.className = 'submit-status';
        statusElement.classList.add(`status-${type}`);
        
        // Clear status after a delay for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'submit-status';
            }, 5000);
        }
    }
    
    /**
     * Render the pending comment in the list
     */
    renderPendingComment() {
        if (!this.pendingComment) return;
        
        // Create a temporary element for the pending comment
        const pendingCommentElement = document.createElement('div');
        pendingCommentElement.className = 'comment-item pending-comment';
        
        const date = new Date(this.pendingComment.created_at);
        const formattedDate = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        pendingCommentElement.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">${this.pendingComment.nickname}</div>
                <div class="comment-date">${formattedDate}</div>
            </div>
            <div class="comment-content">${this.pendingComment.content}</div>
            <div class="comment-pending-badge">Awaiting Approval</div>
        `;
        
        // Add to the beginning of the list
        if (this.commentsListElement.firstChild) {
            this.commentsListElement.insertBefore(pendingCommentElement, this.commentsListElement.firstChild);
        } else {
            this.commentsListElement.appendChild(pendingCommentElement);
        }
        
        // Update comments count
        const countElement = this.container.querySelector('.comments-count');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent, 10);
            countElement.textContent = currentCount + 1;
        }
    }
    
    /**
     * Submit comment to Cusdis API
     * @param {Object} commentData - The comment data
     * @returns {Promise} A promise resolving to the response
     */
    async submitComment(commentData) {
        const endpoint = `${this.host}/api/open/comments`;
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(commentData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error submitting comment:', error);
            throw error;
        }
    }
    
    /**
     * Fetch comments from Cusdis API
     */
    async fetchComments() {
        // Try to get the latest page ID from the container if it's still not set
        if (!this.pageId && this.container) {
            this.pageId = this.container.getAttribute('data-page-id');
        }
        
        // Try to get page ID from URL as a last resort
        if (!this.pageId) {
            const urlParams = new URLSearchParams(window.location.search);
            this.pageId = urlParams.get('id');
        }
        
        if (!this.appId || !this.pageId) {
            console.error('Missing appId or pageId for fetching comments', {
                appId: this.appId,
                pageId: this.pageId
            });
            this.showError('Could not load comments: missing parameters');
            return;
        }
        
        this.showLoading(true);
        this.statusElement.innerHTML = ''; // Clear any previous error messages
        
        try {
            const endpoint = `${this.host}/api/open/comments?appId=${this.appId}&pageId=${this.pageId}`;
            console.log('Fetching comments from:', endpoint);
            
            const response = await fetch(endpoint);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Raw API response:', data);
            
            // Check the structure of the response and extract comments accordingly
            let extractedComments = [];
            
            if (Array.isArray(data)) {
                extractedComments = data;
            } else if (data.data && Array.isArray(data.data)) {
                extractedComments = data.data;
            } else if (data.comments && Array.isArray(data.comments)) {
                extractedComments = data.comments;
            } else if (data.approved && Array.isArray(data.approved)) {
                extractedComments = data.approved;
            } else {
                // If we can't figure out the structure, log it and use an empty array
                console.warn('Unknown response structure:', data);
                extractedComments = [];
            }
            
            this.comments = extractedComments;
            
            console.log(`Fetched ${this.comments.length} comments for page ID: ${this.pageId}`, this.comments);
            
            // Update UI with comments
            this.renderComments();
            
            // Update comments count - both in our UI and any external count elements
            const countElement = this.container.querySelector('.comments-count');
            if (countElement) {
                countElement.textContent = this.comments.length;
            }
            
            // Also update the external comment count if it exists
            const externalCountElement = document.querySelector('.comment-count');
            if (externalCountElement && externalCountElement !== countElement) {
                externalCountElement.textContent = this.comments.length;
            }
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            this.showError('Failed to load comments. Please try again later.');
        }
    }
    
    /**
     * Render comments in the list
     */
    renderComments() {
        // Clear comments list
        this.commentsListElement.innerHTML = '';
        
        // Ensure this.comments is an array before proceeding
        if (!Array.isArray(this.comments)) {
            console.error('this.comments is not an array:', this.comments);
            this.comments = [];
        }
        
        if (this.comments.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'comments-empty-state';
            emptyState.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
            this.commentsListElement.appendChild(emptyState);
            return;
        }
        
        console.log(`Rendering ${this.comments.length} comments`);
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.commentsPerPage;
        const endIndex = startIndex + this.commentsPerPage;
        const commentsToShow = this.comments.slice(startIndex, endIndex);
        
        // Render each comment
        commentsToShow.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.id = comment.id ? `comment-${comment.id}` : '';
            
            // Ensure required comment properties exist
            const nickname = comment.by_nickname || comment.nickname || 'Anonymous';
            const content = comment.content || '(No content)';
            const createdAt = comment.created_at || new Date().toISOString();
            
            const date = new Date(createdAt);
            const formattedDate = date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            commentElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">${nickname}</div>
                    <div class="comment-date">${formattedDate}</div>
                </div>
                <div class="comment-content">${content}</div>
            `;
            
            this.commentsListElement.appendChild(commentElement);
        });
        
        // Update pagination if needed
        this.updatePagination();
    }
    
    /**
     * Update pagination controls
     */
    updatePagination() {
        this.totalPages = Math.ceil(this.comments.length / this.commentsPerPage);
        
        // Only show pagination if there's more than one page
        if (this.totalPages <= 1) {
            this.paginationElement.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<nav aria-label="Comments pagination"><ul class="pagination">';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="prev" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;
        
        // Page numbers
        for (let i = 1; i <= this.totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="next" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;
        
        paginationHTML += '</ul></nav>';
        this.paginationElement.innerHTML = paginationHTML;
        
        // Add event listeners to pagination buttons
        const pageLinks = this.paginationElement.querySelectorAll('.page-link');
        pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.getAttribute('data-page');
                
                if (page === 'prev') {
                    this.goToPage(this.currentPage - 1);
                } else if (page === 'next') {
                    this.goToPage(this.currentPage + 1);
                } else {
                    this.goToPage(parseInt(page, 10));
                }
            });
        });
    }
    
    /**
     * Go to a specific page of comments
     * @param {number} page - The page number to navigate to
     */
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        
        this.currentPage = page;
        this.renderComments();
        
        // Scroll to the top of the comments list
        this.commentsListElement.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * Show or hide loading state
     * @param {boolean} isLoading - Whether to show loading state
     */
    showLoading(isLoading) {
        this.isLoading = isLoading;
        const loadingElement = this.container.querySelector('.custom-comments-loading');
        
        if (loadingElement) {
            loadingElement.style.display = isLoading ? 'flex' : 'none';
        }
    }
    
    /**
     * Show error message
     * @param {string} message - The error message to display
     */
    showError(message) {
        this.error = message;
        this.showLoading(false);
        
        this.statusElement.innerHTML = `
            <div class="custom-comments-error">
                <i class="fas fa-exclamation-circle"></i>
                ${message}
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we need to initialize the custom comments UI
    const customCommentsContainer = document.getElementById('custom_comments');
    
    // Get parameters from Cusdis thread element if it exists
    if (customCommentsContainer) {
        // Get URL params to extract artwork ID
        const urlParams = new URLSearchParams(window.location.search);
        const artworkId = urlParams.get('id');
        
        // Initialize with parameters from the cusdis_thread element
        const customCommentsUI = new CustomCommentsUI({
            containerId: 'custom_comments',
            host: customCommentsContainer.getAttribute('data-host'),
            appId: customCommentsContainer.getAttribute('data-app-id'),
            // Use artwork ID from URL if page-id is not set
            pageId: customCommentsContainer.getAttribute('data-page-id') || artworkId,
            pageUrl: customCommentsContainer.getAttribute('data-page-url') || window.location.href,
            pageTitle: customCommentsContainer.getAttribute('data-page-title') || document.title
        });
        
        // Store the instance globally so it can be accessed by other scripts
        window.customCommentsUIInstance = customCommentsUI;
        
        console.log('Custom comments UI initialized with page ID:', 
                   customCommentsContainer.getAttribute('data-page-id') || artworkId || 'none');
    }
});
