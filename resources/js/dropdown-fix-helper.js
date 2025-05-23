/**
 * Dropdown Fix Helper
 * This script provides additional functionality to ensure dropdowns appear above all content
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for other scripts to initialize
    setTimeout(initializeDropdownFixes, 500);
});

function initializeDropdownFixes() {
    console.log('Initializing dropdown fix helper');
    
    // Check if jQuery is available
    if (typeof $ === 'undefined') {
        console.warn('jQuery not found, dropdown fixes may not work');
        return;
    }
    
    // Move multiselect dropdown to body for better positioning
    function moveDropdownToBody() {
        const $dropdown = $('.multiselect-container.dropdown-menu');
        
        if ($dropdown.length && $dropdown.parent()[0] !== document.body) {
            // Create a clone with all event handlers
            const $clone = $dropdown.clone(true);
            
            // Store reference to original parent for later cleanup
            $clone.attr('data-original-parent', $dropdown.parent().attr('class'));
            
            // Move to body
            $dropdown.detach();
            $('body').append($clone);
            
            console.log('Moved dropdown to body for better z-index handling');
        }
    }
    
    // Fix any z-index issues
    function fixZIndex() {
        // Ensure gallery items have lower z-index
        $('.gallery-item').css('z-index', 1);
        
        // Ensure filter container has higher z-index
        $('.gallery-filter-card').css('z-index', 10001);
        
        // Give dropdown ultra-high z-index
        $('.multiselect-container.dropdown-menu').css({
            'z-index': 9999999,
            'position': 'fixed'
        });
    }
    
    // Monitor for dropdown visibility changes
    function monitorDropdownVisibility() {
        // Create mutation observer
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style' || 
                    mutation.attributeName === 'class') {
                    
                    const $target = $(mutation.target);
                    
                    // If this is our dropdown and it's visible
                    if ($target.hasClass('multiselect-container') && 
                        ($target.is(':visible') || $target.css('display') !== 'none')) {
                        
                        // Force it to have the highest z-index
                        $target.css({
                            'z-index': 9999999,
                            'position': 'fixed',
                            'visibility': 'visible',
                            'opacity': 1
                        });
                    }
                }
            });
        });
        
        // Observe all current and future dropdowns
        document.querySelectorAll('.multiselect-container').forEach(function(dropdown) {
            observer.observe(dropdown, { attributes: true, attributeFilter: ['style', 'class'] });
        });
        
        // Also observe tag filter containers for class changes
        document.querySelectorAll('.tag-filter-container').forEach(function(container) {
            observer.observe(container, { attributes: true, attributeFilter: ['class'] });
        });
    }
    
    // Handle clicks on tag filter button
    function setupClickHandler() {
        $('.tag-filter-container .multiselect').off('click.helper').on('click.helper', function() {
            // Run fixes after a short delay to ensure dropdown is rendered
            setTimeout(function() {
                fixZIndex();
                
                // If dropdown is open but not visible, force it to be visible
                const $dropdown = $('.multiselect-container:visible');
                if ($dropdown.length) {
                    $dropdown.css({
                        'z-index': 9999999,
                        'visibility': 'visible',
                        'opacity': 1,
                        'display': 'block'
                    });
                }
            }, 50);
        });
    }
    
    // Initialize all fixes
    fixZIndex();
    setupClickHandler();
    monitorDropdownVisibility();
    
    // Set up interval to periodically check for issues
    setInterval(function() {
        // Find any open dropdowns
        const $openDropdown = $('.multiselect-container:visible');
        
        if ($openDropdown.length) {
            // Force proper styling
            $openDropdown.css({
                'z-index': 9999999,
                'position': 'fixed',
                'visibility': 'visible',
                'opacity': 1,
                'display': 'block'
            });
        }
    }, 500);
    
    console.log('Dropdown fix helper initialized');
}
