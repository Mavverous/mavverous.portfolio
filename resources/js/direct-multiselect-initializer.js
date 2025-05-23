/**
 * Direct Multiselect Initializer
 * This script provides a last-resort direct initialization of the multiselect dropdown
 */

(function() {
    // Execute after a delay to ensure all other scripts have loaded
    setTimeout(directMultiselectInitializer, 1500);
    
    function directMultiselectInitializer() {
        console.log('Running direct multiselect initializer');
        
        // Check if jQuery is available
        if (typeof $ === 'undefined') {
            console.error('jQuery not available for direct initializer');
            return;
        }
        
        // Check if multiselect plugin is available
        if (typeof $.fn.multiselect === 'undefined') {
            console.error('Multiselect plugin not available for direct initializer');
            return;
        }
        
        // Find tag filter select element
        const $select = $('.tag-filter');
        if ($select.length === 0) {
            console.error('Tag filter select element not found');
            return;
        }
        
        console.log('Found tag filter, attempting direct initialization');
        
        // Try to destroy any existing instances
        try {
            if ($select.data('multiselect')) {
                $select.multiselect('destroy');
                console.log('Existing multiselect instance destroyed');
            }
        } catch (e) {
            console.warn('Error destroying existing multiselect instance:', e);
        }
        
        // Initialize with minimal options
        try {
            $select.multiselect({
                nonSelectedText: 'Select Tags'
            });
            console.log('Successfully initialized multiselect with minimal options');
            
            // Force the button to be visible
            const $button = $('.tag-filter-container .multiselect');
            $button.css({
                'display': 'block',
                'width': '100%',
                'background-color': '#1e1e1e',
                'color': 'white',
                'border': '1px solid rgba(255,255,255,0.2)',
                'text-align': 'left',
                'padding': '6px 12px'
            });
            
            // Add click handler
            $button.off('click').on('click', function() {
                const $dropdown = $('.multiselect-container');
                
                // Toggle visibility
                if ($dropdown.is(':visible')) {
                    $dropdown.hide();
                } else {
                    // Position dropdown
                    const buttonPos = $button.offset();
                    $dropdown.css({
                        'position': 'absolute',
                        'top': buttonPos.top + $button.outerHeight(),
                        'left': buttonPos.left,
                        'width': $button.outerWidth(),
                        'display': 'block',
                        'z-index': 999999
                    });
                }
            });
        } catch (e) {
            console.error('Error initializing multiselect:', e);
        }
    }
})();
