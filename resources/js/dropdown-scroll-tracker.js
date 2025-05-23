/**
 * Dropdown Scroll Tracker
 * This script adds enhanced scroll-tracking functionality to ensure the dropdown 
 * stays attached to the filter button when scrolling
 */

(function() {
    // Wait for document and other scripts to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize after a delay to ensure other scripts have loaded
        setTimeout(initDropdownScrollTracker, 800);
    });

    function initDropdownScrollTracker() {
        console.log('Initializing enhanced dropdown scroll tracking');
        
        // Check if jQuery is available
        if (typeof $ === 'undefined') {
            console.warn('jQuery not loaded, scroll tracking cannot be initialized');
            return;
        }
        
        // Track scroll events on window and scrollable containers
        $(window).on('scroll.enhancedDropdown', updateDropdownPosition);
        $('.gallery-container, .container, main, section').on('scroll.enhancedDropdown', updateDropdownPosition);
        
        // Also track on interval to catch any missed events
        setInterval(updateDropdownPosition, 200);
        
        // Track mousemove events to make dropdown more responsive
        $(document).on('mousemove.enhancedDropdown', function(e) {
            // Only update if dropdown is visible
            if ($('.tag-filter-container.dropdown-open').length) {
                updateDropdownPosition();
            }
        });
        
        console.log('Enhanced dropdown scroll tracking initialized');
    }
    
    function updateDropdownPosition() {
        // Only proceed if dropdown is open
        if (!$('.tag-filter-container.dropdown-open').length) {
            return;
        }
        
        // Get references to the button and dropdown
        const $button = $('.tag-filter-container.dropdown-open .multiselect');
        const $dropdown = $('.multiselect-container.dropdown-menu:visible');
        
        // Only proceed if both elements exist
        if (!$button.length || !$dropdown.length) {
            return;
        }
        
        // Get button position and dimensions
        const buttonOffset = $button.offset();
        const buttonWidth = $button.outerWidth();
        const buttonHeight = $button.outerHeight();
        
        // Set dropdown position directly under the button
        $dropdown.css({
            'position': 'fixed',
            'top': (buttonOffset.top + buttonHeight) + 'px',
            'left': buttonOffset.left + 'px',
            'width': buttonWidth + 'px',
            'z-index': 9999999
        });
    }
    
    // Clean up function to be called when leaving the page
    window.cleanupDropdownScrollTracker = function() {
        $(window).off('scroll.enhancedDropdown');
        $('.gallery-container, .container, main, section').off('scroll.enhancedDropdown');
        $(document).off('mousemove.enhancedDropdown');
        console.log('Dropdown scroll tracking cleaned up');
    };
})();
