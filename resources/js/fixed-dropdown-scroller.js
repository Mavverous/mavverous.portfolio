/**
 * Fixed Dropdown Scroller
 * A simple, focused solution to keep dropdowns attached to their buttons when scrolling
 */

(function() {
    // Track if the dropdown is currently visible
    let dropdownVisible = false;
    
    // Store a reference to the dropdown and button
    let $dropdown = null;
    let $button = null;
    
    // Wait for the page to be fully loaded
    window.addEventListener('load', function() {
        console.log('Fixed dropdown scroller initialized');
        
        // Only proceed if jQuery is available
        if (typeof jQuery === 'undefined') {
            console.error('jQuery is required for the fixed dropdown scroller');
            return;
        }
        
        const $ = jQuery;
        
        // Intercept clicks on the multiselect button
        $(document).on('click', '.tag-filter-container .multiselect', function(e) {
            console.log('Dropdown button clicked');
            
            // Store the button reference
            $button = $(this);
            
            // Give a small delay to allow the dropdown to be rendered
            setTimeout(function() {
                // Find the dropdown
                $dropdown = $('.multiselect-container.dropdown-menu:visible');
                
                if ($dropdown.length) {
                    console.log('Dropdown found and visible');
                    dropdownVisible = true;
                    
                    // Initially position the dropdown
                    positionDropdown();
                    
                    // Add a high z-index to make sure it's on top
                    $dropdown.css('z-index', '9999999');
                } else {
                    console.log('Dropdown not visible after click');
                    dropdownVisible = false;
                }
            }, 50);
        });
        
        // Close dropdown when clicking elsewhere
        $(document).on('click', function(e) {
            if (dropdownVisible && 
                !$(e.target).closest('.multiselect').length && 
                !$(e.target).closest('.multiselect-container').length) {
                
                console.log('Clicked outside dropdown, hiding');
                dropdownVisible = false;
            }
        });
        
        // Watch for scroll events on window and all possible scrollable containers
        $(window).on('scroll', handleScroll);
        $(document).on('scroll', '.container, .gallery-container, main, section', handleScroll);
        
        // Also handle resize events
        $(window).on('resize', handleScroll);
    });
    
    // Handle scroll events by repositioning the dropdown
    function handleScroll() {
        if (dropdownVisible && $dropdown && $dropdown.length && $button && $button.length) {
            // This needs to be throttled to avoid performance issues
            if (!handleScroll.throttled) {
                handleScroll.throttled = true;
                
                // Use requestAnimationFrame for smooth animation
                window.requestAnimationFrame(function() {
                    positionDropdown();
                    setTimeout(function() {
                        handleScroll.throttled = false;
                    }, 100);
                });
            }
        }
    }
    
    // Position the dropdown under the button
    function positionDropdown() {
        if (!$button || !$dropdown) return;
        
        const buttonOffset = $button.offset();
        const buttonWidth = $button.outerWidth();
        const buttonHeight = $button.outerHeight();
        
        // Position directly under the button
        $dropdown.css({
            'position': 'fixed',
            'top': (buttonOffset.top + buttonHeight) + 'px',
            'left': buttonOffset.left + 'px',
            'width': buttonWidth + 'px',
            'max-height': '300px',
            'overflow-y': 'auto'
        });
        
        console.log('Dropdown repositioned:', buttonOffset.top + buttonHeight, buttonOffset.left);
    }
})();
