/**
 * Tag Dropdown Manager
 * Completely handles the initialization and functionality of the tag dropdown menu
 */

class TagDropdownManager {
    constructor(options = {}) {
        // Default options
        this.options = {
            container: '.tag-filter-container',
            select: '.tag-filter',
            backdrop: true,
            zIndex: 999999,
            ...options
        };
        
        // Store elements
        this.$container = null;
        this.$select = null;
        this.$dropdown = null;
        this.$button = null;
        this.$backdrop = null;
        
        // State
        this.isOpen = false;
        
        // Initialize
        this.initialize();
    }
      /**
     * Initialize the tag dropdown
     */
    initialize() {
        if (typeof $ === 'undefined') {
            console.error('jQuery is not defined - cannot initialize tag dropdown');
            return;
        }
        
        // Find container and select elements
        this.$container = $(this.options.container);
        this.$select = $(this.options.container + ' ' + this.options.select);
        
        if (this.$container.length === 0 || this.$select.length === 0) {
            console.warn('Tag dropdown elements not found:', this.options.container, this.options.select);
            return;
        }
        
        console.log('Found tag dropdown elements:', {
            container: this.$container.length + ' elements', 
            select: this.$select.length + ' elements'
        });
        
        // Initialize multiselect if available
        if (typeof $.fn.multiselect !== 'undefined') {
            // Clean up any existing instances first
            this.cleanup();
              // Initialize multiselect plugin with a direct call
            try {
                console.log('Initializing multiselect with jQuery version:', $.fn.jquery);
                
                // Make sure the select element is visible in the DOM
                this.$select.show();
                
                // Initialize multiselect with direct call
                this.$select.multiselect({
                    includeSelectAllOption: true,
                    selectAllText: 'All Tags',
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 300,
                    buttonClass: 'btn btn-outline-secondary',
                    buttonWidth: '100%',
                    nonSelectedText: 'Select Tags',
                    templates: {
                        button: '<button type="button" class="multiselect dropdown-toggle btn btn-outline-secondary" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>'
                    }
                });
                
                console.log('Multiselect initialization complete');
            } catch (error) {
                console.error('Error initializing multiselect:', error);
            }
            
            // Store references
            this.$button = this.$container.find('.multiselect');
            this.$dropdown = this.$container.find('.multiselect-container');
            
            // Set up event handlers
            this.setupEvents();
            
            // Fix any existing markup issues
            this.fixDropdownMarkup();
            
            console.log('Tag dropdown initialized successfully');
        } else {
            console.error('Bootstrap multiselect plugin not available');
            
            // Apply basic styles to make the native select usable
            this.$select.css({
                width: '100%',
                padding: '8px',
                backgroundColor: '#1e1e1e',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            });
        }
        
        // Add global document click handler
        this.setupDocumentClickHandler();
    }
    
    /**
     * Clean up any existing multiselect instances
     */
    cleanup() {
        try {
            if (this.$select.data('multiselect')) {
                this.$select.multiselect('destroy');
            }
        } catch (e) {
            console.warn('Error cleaning up existing multiselect:', e);
        }
    }
      /**
     * Fix any markup issues with the dropdown
     */
    fixDropdownMarkup() {
        // Ensure dropdown has correct styles
        this.$dropdown.css({
            'z-index': this.options.zIndex,
            'position': 'fixed',
            'display': 'none',
            'background-color': '#1e1e1e',
            'border': '1px solid rgba(108, 189, 163, 0.3)',
            'box-shadow': '0 6px 20px rgba(0, 0, 0, 0.7)',
            'max-height': '300px',
            'overflow-y': 'auto'
        });
        
        // Move dropdown to the body to avoid z-index issues
        if (this.$dropdown.parent()[0] !== document.body) {
            this.$dropdown.detach().appendTo('body');
        }
        
        // Apply additional styling enhancements for the search field
        const $searchInput = this.$dropdown.find('.multiselect-search');
        if ($searchInput.length) {
            $searchInput.attr('placeholder', 'Search tags...');
            $searchInput.css({
                'color': 'white',
                'background-color': '#2a2a2a'
            });
        }
        
        // Ensure checkbox labels have the secondary color
        this.$dropdown.find('label').css({
            'color': 'var(--secondary-color, #6cbd9b)'
        });
        
        // Add a class to improve styling hook
        this.$dropdown.addClass('tag-dropdown-enhanced');
    }
      /**
     * Set up button click and other events
     */
    setupEvents() {
        // Remove any existing handlers
        this.$button.off('click.tagDropdown');
        
        // Add click handler to toggle dropdown
        this.$button.on('click.tagDropdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle dropdown state
            this.toggleDropdown();
        });
        
        // Window resize handler
        $(window).on('resize.tagDropdown', () => {
            if (this.isOpen) {
                this.positionDropdown();
            }
        });
        
        // Window scroll handler - reposition dropdown when scrolling
        $(window).off('scroll.tagDropdown').on('scroll.tagDropdown', () => {
            if (this.isOpen) {
                this.positionDropdown();
            }
        });
        
        // Handle scrolling in any container (in case the gallery is in a scrollable container)
        $('.gallery-container, .container, main, body').on('scroll.tagDropdown', () => {
            if (this.isOpen) {
                this.positionDropdown();
            }
        });
    }
    
    /**
     * Set up document click handler to close dropdown when clicking outside
     */
    setupDocumentClickHandler() {
        $(document).off('click.tagDropdown').on('click.tagDropdown', (e) => {
            if (!this.$container) return;
            
            // If click is outside the dropdown and button
            if (this.isOpen && 
                !$(e.target).closest(this.$button).length && 
                !$(e.target).closest(this.$dropdown).length) {
                
                this.closeDropdown();
            }
        });
    }
    
    /**
     * Toggle dropdown state
     */
    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
      /**
     * Open the dropdown
     */
    openDropdown() {
        if (!this.$dropdown) return;
        
        // Close any other open dropdowns first
        $('.tag-filter-container').removeClass('dropdown-open');
        $('.multiselect-container').css('display', 'none');
        $('.dropdown-backdrop').remove();
        
        // Position the dropdown
        this.positionDropdown();
        
        // Show the dropdown
        this.$container.addClass('dropdown-open');
        this.$dropdown.css('display', 'block');
        
        // Apply enhanced styling to search field and labels
        this.$dropdown.find('.multiselect-search').css({
            'color': 'white',
            'backgroundColor': '#2a2a2a'
        }).attr('placeholder', 'Search tags...');
        
        // Fix checkbox label colors
        this.$dropdown.find('label').css('color', 'var(--secondary-color, #6cbd9b)');
        this.$dropdown.find('li.active label').css({
            'color': 'var(--secondary-color, #6cbd9b)',
            'font-weight': '600'
        });
        
        // Create backdrop if enabled
        if (this.options.backdrop) {
            this.$backdrop = $('<div class="dropdown-backdrop"></div>').appendTo('body');
            
            // Add click handler to backdrop
            this.$backdrop.on('click', () => this.closeDropdown());
        }
        
        // Update state
        this.isOpen = true;
        
        console.log('Tag dropdown opened');
        
        // Apply styling after a short delay to ensure it overrides any default styling
        setTimeout(() => {
            // Re-apply important styles to ensure they weren't overridden
            this.$dropdown.find('.multiselect-search').css({
                'color': 'white !important',
                'backgroundColor': '#2a2a2a !important'
            });
        }, 50);
    }
    
    /**
     * Close the dropdown
     */
    closeDropdown() {
        if (!this.$dropdown) return;
        
        // Hide dropdown
        this.$container.removeClass('dropdown-open');
        this.$dropdown.css('display', 'none');
        
        // Remove backdrop
        if (this.$backdrop) {
            this.$backdrop.remove();
            this.$backdrop = null;
        }
        
        // Update state
        this.isOpen = false;
        
        console.log('Tag dropdown closed');
    }
      /**
     * Position the dropdown relative to its button, accounting for scrolling
     */
    positionDropdown() {
        if (!this.$button || !this.$dropdown) return;
        
        // Get current button position (this will account for scrolling)
        const buttonOffset = this.$button.offset();
        const buttonWidth = this.$button.outerWidth();
        const buttonHeight = this.$button.outerHeight();
        
        // Get window dimensions to avoid dropdown going off-screen
        const windowHeight = $(window).height();
        const windowWidth = $(window).width();
        const scrollTop = $(window).scrollTop();
        
        // Calculate dropdown position
        let top = buttonOffset.top + buttonHeight;
        let left = buttonOffset.left;
        
        // Make sure dropdown doesn't go off the right edge
        if (left + buttonWidth > windowWidth) {
            left = Math.max(10, windowWidth - buttonWidth - 10);
        }
        
        // Position the dropdown under the button, accounting for scroll position
        this.$dropdown.css({
            'position': 'fixed',
            'top': top + 'px',
            'left': left + 'px',
            'width': buttonWidth + 'px',
            'max-height': '300px',
            'z-index': this.options.zIndex
        });
        
        // Log position for debugging
        console.log('Positioning dropdown at:', { top, left, buttonOffset, scrollTop });
    }
}

// Initialize when the document is ready
$(document).ready(function() {
    // Create tag dropdown manager after a short delay to ensure DOM is ready
    setTimeout(() => {
        window.tagDropdownManager = new TagDropdownManager();
    }, 500);
});

// Export the class
window.TagDropdownManager = TagDropdownManager;
