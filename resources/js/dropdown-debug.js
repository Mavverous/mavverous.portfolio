/**
 * Dropdown Debug Script
 * This script will help identify and fix issues with the dropdown menu
 */

// Execute when the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dropdown debug script running...');
    
    // Wait a moment to ensure all scripts have initialized
    setTimeout(function() {
        // Check if jQuery is available
        if (typeof jQuery === 'undefined') {
            console.error('jQuery is not available - this is required for the dropdown');
            return;
        }
        
        // Check if the multiselect plugin is available
        if (typeof jQuery.fn.multiselect === 'undefined') {
            console.error('Bootstrap multiselect plugin is not available');
            return;
        }
        
        console.log('jQuery and multiselect plugin are loaded correctly');
        
        // Check for the tag filter element
        const $tagFilter = jQuery('.tag-filter');
        if ($tagFilter.length === 0) {
            console.error('Tag filter element not found');
            return;
        }
        
        console.log('Tag filter element found:', $tagFilter);
        
        // Force initialization of the dropdown
        try {
            // First, destroy any existing instance to prevent conflicts
            if ($tagFilter.data('multiselect')) {
                $tagFilter.multiselect('destroy');
            }
            
            // Initialize with minimal options
            $tagFilter.multiselect({
                includeSelectAllOption: true,
                enableFiltering: true,
                nonSelectedText: 'Select Tags',
                buttonWidth: '100%'
            });
            
            console.log('Multiselect initialized successfully');
            
            // Test opening the dropdown
            const $button = jQuery('.multiselect.dropdown-toggle');
            console.log('Dropdown button found:', $button.length > 0);
            
            // Add a click handler to show the dropdown with maximum specificity
            $button.off('click.debugger').on('click.debugger', function(e) {
                console.log('Button clicked');
                
                // Find the dropdown menu
                const $dropdown = jQuery('.multiselect-container.dropdown-menu');
                
                if ($dropdown.length) {
                    // Force the dropdown to be visible with maximum specificity
                    $dropdown.css({
                        'display': 'block !important',
                        'visibility': 'visible !important',
                        'opacity': '1 !important',
                        'z-index': '2147483647 !important',
                        'position': 'fixed !important'
                    });
                    
                    // Set position under the button
                    const buttonPos = $button.offset();
                    $dropdown.css({
                        'top': (buttonPos.top + $button.outerHeight()) + 'px',
                        'left': buttonPos.left + 'px',
                        'width': $button.outerWidth() + 'px'
                    });
                    
                    console.log('Forced dropdown visibility:', buttonPos);
                    
                    // Add visible class with setAttribute for maximum compatibility
                    $dropdown[0].setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 2147483647 !important; position: fixed !important;');
                } else {
                    console.error('Dropdown menu element not found');
                }
                
                e.stopPropagation();
            });
            
        } catch (error) {
            console.error('Error initializing multiselect:', error);
        }
    }, 1000);
});
