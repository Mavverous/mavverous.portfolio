/**
 * Comments System
 * 
 * This script handles the initialization and management of the Cusdis comments system.
 * It supports both the native iframe and our custom UI implementation.
 */

class CommentsManager {
    constructor() {
        this.cusdisThread = document.getElementById('cusdis_thread');
        this.customComments = document.getElementById('custom_comments');
        this.approvalNotification = document.querySelector('.approval-notification');
        this.useCustomUI = !!this.customComments; // Use custom UI if element exists
        this.customStyles = `
            /* Reduce input field sizes */
            .comment-form .input {
                height: 36px !important;
                padding: 6px 12px !important;
                font-size: 0.9rem !important;
                margin-bottom: 10px !important;
            }
            
            /* Reduce textarea size */
            .comment-form textarea {
                padding: 6px 12px !important;
                font-size: 0.9rem !important;
                min-height: 80px !important;
                max-height: 120px !important;
            }
            
            /* Adjust form layout */
            .comment-form {
                padding: 10px !important;
                margin-bottom: 10px !important;
            }
            
            /* Make buttons smaller */
            .comment-form button, .reply-form button {
                padding: 5px 10px !important;
                font-size: 0.85rem !important;
                height: auto !important;
            }
            
            /* Adjust spacing between elements */
            .comment-form > div {
                margin-bottom: 8px !important;
            }
        `;
    }    /**
     * Initialize the comments system
     */    init() {
        // Early return if neither comments container exists
        if (!this.cusdisThread && !this.customComments) return;
        
        // Show the approval notification
        if (this.approvalNotification) {
            setTimeout(() => {
                this.approvalNotification.style.display = 'block';
            }, 2000);
        }
        
        if (this.useCustomUI) {
            // Custom UI is handled by custom-comments-ui.js
            console.log('Using custom comments UI');
        } else {
            // Using default Cusdis iframe
            console.log('Using default Cusdis iframe');
            // Inject custom styles for iframe
            this.injectCustomStyles();
            
            // Set up a mutation observer to watch for iframe creation/changes
            this.setupMutationObserver();
        }
        
        // Ensure comment count is properly initialized if the method exists
        if (typeof this.initCommentCount === 'function') {
            this.initCommentCount();
        }

        // Listen for Cusdis events
        window.addEventListener('message', (e) => {
            if (e.data?.type === 'cusdis.initial' || e.data?.type === 'cusdis.comment.posted') {
                console.log('Cusdis comments initialized or updated');
                // Re-inject styles when comments are loaded or updated
                setTimeout(() => this.injectCustomStyles(), 500);
            }
        });
    }
      /**
     * Inject custom styles into the Cusdis iframe
     */
    injectCustomStyles() {
        const iframe = this.cusdisThread.querySelector('iframe');
        if (!iframe) return;
        
        try {
            // Wait for iframe to load
            iframe.addEventListener('load', () => {
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                
                // Create a style element if it doesn't exist
                let styleElement = iframeDocument.getElementById('cusdis-custom-styles');
                if (!styleElement) {
                    styleElement = iframeDocument.createElement('style');
                    styleElement.id = 'cusdis-custom-styles';
                    iframeDocument.head.appendChild(styleElement);
                }
                
                // Update the styles
                styleElement.textContent = this.customStyles;
                
                console.log('Custom styles injected into Cusdis iframe');
            });
            
            // Try to inject immediately as well (in case iframe is already loaded)
            if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
                const iframeDocument = iframe.contentDocument;
                let styleElement = iframeDocument.getElementById('cusdis-custom-styles');
                if (!styleElement) {
                    styleElement = iframeDocument.createElement('style');
                    styleElement.id = 'cusdis-custom-styles';
                    iframeDocument.head.appendChild(styleElement);
                }
                styleElement.textContent = this.customStyles;
            }        } catch (error) {
            console.error('Error injecting custom styles into iframe:', error);
        }
    }
    
    /**
     * Set up a mutation observer to detect iframe changes
     */
    setupMutationObserver() {
        // Create a new observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if an iframe was added
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeName === 'IFRAME') {
                            console.log('Iframe detected, injecting styles');
                            setTimeout(() => this.injectCustomStyles(), 500);
                        }
                    });
                }
            });
        });
        
        // Start observing the cusdis_thread element for changes
        observer.observe(this.cusdisThread, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize comments when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create instance
    const commentsManager = new CommentsManager();
    
    // Store instance in global array for extensions to access
    if (!window._commentsManagerInstances) {
        window._commentsManagerInstances = [];
    }
    window._commentsManagerInstances.push(commentsManager);
    
    // Initialize
    commentsManager.init();
});
