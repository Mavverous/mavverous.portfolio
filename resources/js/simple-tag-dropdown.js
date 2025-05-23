/**
 * Simple Tag Dropdown Initializer
 * This provides a basic fallback for initializing the tag dropdown
 */

// Wait for the document to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for jQuery and multiselect to be loaded
    setTimeout(function() {
        initializeTagDropdown();
    }, 800);
});

function initializeTagDropdown() {
    console.log('Simple tag dropdown initializer running...');
    
    // Check if jQuery and multiselect are available
    if (typeof $ === 'undefined') {
        console.error('jQuery not available for tag dropdown');
        return;
    }
    
    if (typeof $.fn.multiselect === 'undefined') {
        console.error('Bootstrap multiselect plugin not available');
        return;
    }
    
    // Find the tag filter select element
    const $tagFilter = $('.tag-filter');
    if ($tagFilter.length === 0) {
        console.error('Tag filter select element not found');
        return;
    }
    
    console.log('Found tag filter element, initializing...');
    
    try {
        // Destroy previous instance if it exists
        if ($tagFilter.data('multiselect')) {
            $tagFilter.multiselect('destroy');
        }
        
        // Initialize with basic settings
        $tagFilter.multiselect({
            includeSelectAllOption: true,
            selectAllText: 'All Tags',
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true,
            maxHeight: 300,
            buttonClass: 'btn btn-outline-secondary',
            buttonWidth: '100%',
            nonSelectedText: 'Select Tags'
        });
        
        // Add click handler to ensure dropdown opens
        $('.multiselect').on('click', function(e) {
            const $dropdown = $('.multiselect-container');
            if ($dropdown.is(':visible')) {
                $dropdown.hide();
            } else {
                // Position the dropdown
                const $button = $(this);
                const buttonOffset = $button.offset();
                const buttonHeight = $button.outerHeight();
                
                $dropdown.css({
                    'position': 'fixed',
                    'top': (buttonOffset.top + buttonHeight) + 'px',
                    'left': buttonOffset.left + 'px',
                    'width': $button.outerWidth() + 'px',
                    'z-index': 999999,
                    'display': 'block',
                    'max-height': '300px',
                    'overflow-y': 'auto',
                    'background-color': '#1e1e1e',
                    'color': 'white',
                    'border': '1px solid rgba(108, 189, 163, 0.3)',
                    'box-shadow': '0 6px 12px rgba(0, 0, 0, 0.5)'
                });
            }
            
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Add click handler to close dropdown when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.multiselect, .multiselect-container').length) {
                $('.multiselect-container').hide();
            }
        });
        
        // Make sure labels are visible
        $tagFilter.closest('.tag-filter-container').find('label').css('color', 'var(--secondary-color, #6cbd9b)');
        
        console.log('Tag dropdown initialized successfully with direct approach');
    } catch (error) {
        console.error('Error initializing tag dropdown:', error);
    }
}

// Export function for global access
window.initializeTagDropdown = initializeTagDropdown;
