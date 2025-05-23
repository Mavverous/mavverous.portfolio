/**
 * Debug Dropdown Position
 * This script ensures the dropdown is visible by adding debugging visuals and forced positioning
 */

(function() {
    console.log('🛠️ Debug Dropdown Position script loaded');
    
    // Execute after page is fully loaded
    window.addEventListener('load', function() {
        console.log('🔍 Starting dropdown debug operation');
        
        // Make sure jQuery is available
        if (typeof jQuery === 'undefined') {
            console.error('jQuery not available for dropdown debugging');
            return;
        }
        
        const $ = jQuery;
        
        // Function to highlight the dropdown button
        function highlightButton() {
            const $button = $('.tag-filter-container .multiselect');
            if ($button.length) {
                console.log('⭐ Highlighting dropdown button for visibility');
                $button.css({
                    'border': '3px solid lime',
                    'position': 'relative',
                    'z-index': '100'
                });
            } else {
                console.warn('❌ Could not find dropdown button to highlight');
            }
        }
        
        // Function to force display the dropdown
        function forceShowDropdown() {
            const $dropdown = $('.multiselect-container.dropdown-menu');
            
            if ($dropdown.length) {
                console.log('📋 Found dropdown, preparing to force display');
                
                // First ensure the dropdown has extreme visibility styling
                $dropdown.css({
                    'display': 'block !important',
                    'position': 'fixed !important',
                    'z-index': '2147483647 !important',
                    'background-color': '#1e1e1e !important',
                    'border': '5px solid lime !important',
                    'box-shadow': '0 0 20px red !important',
                    'max-height': '80vh !important',
                    'overflow-y': 'auto !important',
                    'width': '300px !important',
                    'top': '50% !important',
                    'left': '50% !important',
                    'transform': 'translate(-50%, -50%) !important',
                    'opacity': '1 !important',
                    'visibility': 'visible !important'
                });
                
                // Then add !important flag through attributes for extra assurance
                $dropdown.attr('style', $dropdown.attr('style') + ' display: block !important; visibility: visible !important; opacity: 1 !important;');
                
                // Log success
                console.log('✅ Dropdown styling forced for maximum visibility');
                console.log('📐 Current dropdown dimensions:', {
                    width: $dropdown.width(),
                    height: $dropdown.height(),
                    outerWidth: $dropdown.outerWidth(),
                    outerHeight: $dropdown.outerHeight(),
                    position: $dropdown.css('position'),
                    display: $dropdown.css('display'),
                    visibility: $dropdown.css('visibility'),
                    opacity: $dropdown.css('opacity'),
                    zIndex: $dropdown.css('z-index')
                });
            } else {
                console.warn('❌ Could not find dropdown element to force display');
            }
        }
        
        // Create emergency override button
        function createDebugButton() {
            const $debugBtn = $('<button>')
                .text('FORCE SHOW DROPDOWN')
                .css({
                    'position': 'fixed',
                    'top': '10px',
                    'right': '10px',
                    'z-index': '999999',
                    'background': 'red',
                    'color': 'white',
                    'border': '2px solid white',
                    'border-radius': '4px',
                    'padding': '10px',
                    'cursor': 'pointer'
                })
                .on('click', function() {
                    console.log('🔴 Emergency dropdown button clicked');
                    
                    // Force create dropdown if it doesn't exist
                    if ($('.multiselect-container.dropdown-menu').length === 0) {
                        console.log('Creating dropdown manually...');
                        
                        // Create dropdown container
                        const $dropdown = $('<ul>')
                            .addClass('multiselect-container dropdown-menu')
                            .appendTo('body');
                        
                        // Add "Select All" option
                        $('<li>')
                            .append($('<a>').append($('<label>').text('All Tags')))
                            .appendTo($dropdown);
                        
                        // Add some sample tags
                        ['Character', 'Commission', 'Concept', 'Environment', 'FanArt', 'Game']
                            .forEach(tag => {
                                $('<li>')
                                    .append($('<a>').append($('<label>').text(tag)))
                                    .appendTo($dropdown);
                            });
                    }
                    
                    // Force show the dropdown
                    forceShowDropdown();
                    highlightButton();
                });
            
            // Add button to body
            $('body').append($debugBtn);
            console.log('🔴 Emergency dropdown debug button added');
        }
        
        // Wait a bit to ensure the page is fully loaded
        setTimeout(function() {
            highlightButton();
            createDebugButton();
            
            // Check if dropdown is in the DOM but hidden
            const $dropdown = $('.multiselect-container.dropdown-menu');
            if ($dropdown.length) {
                console.log('🔍 Dropdown element exists in DOM but may be hidden');
                console.log('📊 Dropdown current style:', {
                    display: $dropdown.css('display'),
                    visibility: $dropdown.css('visibility'),
                    opacity: $dropdown.css('opacity'),
                    zIndex: $dropdown.css('z-index'),
                    position: $dropdown.css('position'),
                    top: $dropdown.css('top'),
                    left: $dropdown.css('left'),
                    width: $dropdown.css('width'),
                    height: $dropdown.css('height')
                });
            } else {
                console.warn('⚠️ Dropdown element does not exist in the DOM yet');
            }
            
            // Add click handler to dropdown button
            $('.tag-filter-container .multiselect').on('click.debug', function() {
                console.log('🖱️ Dropdown button clicked (debug handler)');
                setTimeout(forceShowDropdown, 100);
            });
        }, 1000);
    });
})();
