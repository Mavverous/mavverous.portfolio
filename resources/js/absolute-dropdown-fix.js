/**
 * Absolute Dropdown Fix
 * A simple, direct solution that fixes dropdown positioning and z-index issues
 */

(function() {
    // Ensure we run this after the page is fully loaded
    window.addEventListener('load', function() {
        console.log('🔧 Absolute dropdown fix loaded');
        
        // Check if jQuery is available
        if (typeof jQuery === 'undefined') {
            console.error('jQuery is required for the dropdown fix');
            return;
        }
        
        const $ = jQuery;
        
        // Initialize dropdown with correct options
        function initializeDropdown() {
            $('.tag-filter').multiselect({
                includeSelectAllOption: true,
                selectAllText: 'All Tags',
                enableFiltering: true,
                nonSelectedText: 'Select Tags',
                buttonClass: 'btn btn-outline-secondary',
                maxHeight: 300,
                buttonWidth: '100%'
            });
            
            console.log('✅ Multiselect dropdown initialized');
            
            // Force the dropdown to use our absolute positioning handler
            $('.tag-filter-container .multiselect').off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const $dropdown = $('.multiselect-container.dropdown-menu');
                const isVisible = $dropdown.is(':visible');
                
                // Close all other dropdowns first
                $('.multiselect-container.dropdown-menu').hide();
                
                if (!isVisible) {
                    // Position and show the dropdown
                    positionDropdownAbsolute($(this));
                }
            });
            
            // Handle document click to close dropdown
            $(document).on('click', function(e) {
                if (!$(e.target).closest('.multiselect, .multiselect-container').length) {
                    $('.multiselect-container.dropdown-menu').hide();
                }
            });
            
            // Handle scroll events
            $(window).on('scroll', handleScroll);
            $('.container, .gallery-container, section').on('scroll', handleScroll);
        }
        
        // Position the dropdown using absolute positioning relative to the viewport
        function positionDropdownAbsolute($button) {
            const $dropdown = $('.multiselect-container.dropdown-menu');
            if (!$dropdown.length || !$button.length) return;
            
            // Get button position
            const buttonOffset = $button.offset();
            const buttonHeight = $button.outerHeight();
            const buttonWidth = $button.outerWidth();
            
            // Calculate position
            const top = buttonOffset.top + buttonHeight;
            const left = buttonOffset.left;
            
            console.log(`📏 Positioning dropdown at ${top}px from top, ${left}px from left`);
            
            // Apply a fixed position that's not affected by scrolling
            $dropdown.css({
                'position': 'fixed',
                'top': top + 'px',
                'left': left + 'px',
                'width': buttonWidth + 'px',
                'z-index': 2147483647, // Maximum possible z-index
                'display': 'block',
                'max-height': '300px',
                'overflow-y': 'auto'
            });
            
            // Apply additional styles for visibility
            $dropdown.css({
                'background-color': '#1e1e1e',
                'border': '2px solid var(--secondary-color, #6cbd9b)',
                'box-shadow': '0 8px 24px rgba(0, 0, 0, 0.8)'
            });
        }
        
        // Handle scroll events by repositioning if dropdown is visible
        function handleScroll() {
            const $dropdown = $('.multiselect-container.dropdown-menu:visible');
            if ($dropdown.length) {
                const $button = $('.tag-filter-container .multiselect');
                positionDropdownAbsolute($button);
            }
        }
        
        // Wait for multiselect to be available
        if (typeof $.fn.multiselect !== 'undefined') {
            initializeDropdown();
        } else {
            // Retry after a short delay
            console.log('Waiting for multiselect plugin to load...');
            setTimeout(function() {
                if (typeof $.fn.multiselect !== 'undefined') {
                    initializeDropdown();
                } else {
                    console.error('Bootstrap multiselect plugin not available');
                }
            }, 1000);
        }
    });
})();
