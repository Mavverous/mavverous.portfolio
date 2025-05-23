/**
 * Direct Multiselect Implementation
 * A simple, direct implementation of the tag dropdown with no dependencies on other scripts
 */

// Self-executing function to avoid polluting global namespace
(function() {
    // Wait for document ready
    document.addEventListener('DOMContentLoaded', function() {
        // Give a little time for other scripts to load
        setTimeout(initializeDirectMultiselect, 500);
    });
    
    function initializeDirectMultiselect() {
        console.log('Direct multiselect implementation running');
        
        // Check if jQuery and multiselect plugin are available
        if (typeof jQuery === 'undefined') {
            console.error('jQuery is not available');
            return;
        }
        
        if (typeof jQuery.fn.multiselect === 'undefined') {
            console.error('Bootstrap multiselect plugin is not available');
            return;
        }
        
        // Find the tag filter element
        const $tagFilter = jQuery('.tag-filter');
        if ($tagFilter.length === 0) {
            console.error('Tag filter element not found');
            return;
        }
        
        // Clean up any existing instances
        try {
            if ($tagFilter.data('multiselect')) {
                $tagFilter.multiselect('destroy');
            }
        } catch(e) {
            console.warn('Error cleaning up existing multiselect:', e);
        }
        
        // Initialize with direct approach
        try {
            $tagFilter.multiselect({
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
            
            console.log('Direct multiselect initialization complete');
            
            // Store references
            const $button = jQuery('.multiselect.dropdown-toggle');
            let $dropdown = jQuery('.multiselect-container.dropdown-menu');
            
            // Apply immediate styling fixes
            $dropdown.css({
                'z-index': 9999999,
                'background-color': '#1e1e1e',
                'color': 'white',
                'border': '1px solid rgba(108, 189, 163, 0.3)',
                'box-shadow': '0 6px 20px rgba(0, 0, 0, 0.7)',
                'max-height': '300px',
                'overflow-y': 'auto'
            });
            
            // Add direct click handler that works regardless of Bootstrap
            $button.off('click.direct').on('click.direct', function(e) {
                console.log('Button clicked with direct handler');
                
                // Get updated dropdown reference (may have been recreated)
                $dropdown = jQuery('.multiselect-container.dropdown-menu');
                
                // Toggle dropdown visibility
                const isVisible = $dropdown.is(':visible');
                
                if (isVisible) {
                    $dropdown.hide();
                } else {
                    // Position dropdown under button
                    const buttonOffset = $button.offset();
                    const buttonHeight = $button.outerHeight();
                    
                    $dropdown.css({
                        'position': 'fixed',
                        'top': (buttonOffset.top + buttonHeight) + 'px',
                        'left': buttonOffset.left + 'px',
                        'width': $button.outerWidth() + 'px',
                        'display': 'block'
                    });
                    
                    console.log('Showing dropdown at position:', buttonOffset);
                }
                
                e.preventDefault();
                e.stopPropagation();
            });
            
            // Add document click handler to close dropdown
            jQuery(document).off('click.directMultiselect').on('click.directMultiselect', function(e) {
                if (!jQuery(e.target).closest('.multiselect, .multiselect-container').length) {
                    jQuery('.multiselect-container').hide();
                }
            });
            
            // Add scroll handler to keep dropdown positioned correctly
            jQuery(window).off('scroll.directMultiselect').on('scroll.directMultiselect', function() {
                if ($dropdown.is(':visible')) {
                    // Get current button position
                    const buttonOffset = $button.offset();
                    const buttonHeight = $button.outerHeight();
                    
                    // Update dropdown position
                    $dropdown.css({
                        'top': (buttonOffset.top + buttonHeight) + 'px',
                        'left': buttonOffset.left + 'px'
                    });
                }
            });
            
        } catch(error) {
            console.error('Error in direct multiselect implementation:', error);
        }
    }
})();
