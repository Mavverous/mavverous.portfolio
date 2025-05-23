/**
 * Direct Tag Dropdown
 * A simple, direct implementation to create and position the dropdown manually
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Direct tag dropdown script loaded');
    
    // Wait for jQuery to be available
    if (typeof jQuery === 'undefined') {
        console.error('jQuery not available for direct tag dropdown');
        return;
    }
    
    const $ = jQuery;
    
    // Manually initialize the multiselect without using the plugin's built-in positioning
    function initializeManualDropdown() {
        // Get the tag filter select element
        const $select = $('.tag-filter');
        if (!$select.length) {
            console.error('Tag filter select element not found');
            return;
        }
        
        console.log('Found tag filter select, initializing manual dropdown');
        
        // Get available tags from the select element
        const tags = [];
        $select.find('option').each(function() {
            tags.push({
                value: $(this).val(),
                text: $(this).text()
            });
        });
        
        // Create manual dropdown button
        const $container = $('.tag-filter-container');
        const $button = $('<button>')
            .addClass('btn btn-outline-secondary dropdown-toggle manual-tag-dropdown-btn')
            .css({
                'width': '100%',
                'text-align': 'left',
                'background-color': '#1e1e1e',
                'border': '1px solid rgba(255, 255, 255, 0.2)',
                'color': 'white',
                'position': 'relative',
                'z-index': '100',
                'padding': '8px 12px'
            })
            .text('Select Tags')
            .appendTo($container);
        
        // Create manual dropdown
        const $dropdown = $('<div>')
            .addClass('manual-tag-dropdown')
            .css({
                'position': 'absolute',
                'top': 'calc(100% + 5px)',
                'left': '0',
                'width': '100%',
                'background-color': '#1e1e1e',
                'border': '2px solid #6cbd9b',
                'border-radius': '4px',
                'z-index': '2147483647',
                'padding': '10px',
                'display': 'none',
                'box-shadow': '0 6px 12px rgba(0, 0, 0, 0.5)',
                'max-height': '300px',
                'overflow-y': 'auto'
            })
            .appendTo($container);
        
        // Add "Select All" option
        $('<div>')
            .addClass('dropdown-item')
            .css({
                'padding': '8px',
                'color': '#6cbd9b',
                'font-weight': 'bold',
                'border-bottom': '1px solid rgba(108, 189, 155, 0.2)',
                'margin-bottom': '5px',
                'cursor': 'pointer'
            })
            .text('All Tags')
            .on('click', function() {
                // Toggle all checkboxes
                const $checkboxes = $dropdown.find('input[type="checkbox"]');
                const allChecked = $checkboxes.filter(':checked').length === $checkboxes.length;
                $checkboxes.prop('checked', !allChecked);
                updateSelectedTags();
            })
            .appendTo($dropdown);
        
        // Add each tag as a checkbox
        tags.forEach(tag => {
            const $item = $('<div>')
                .addClass('dropdown-item')
                .css({
                    'padding': '6px 8px',
                    'color': '#6cbd9b',
                    'cursor': 'pointer'
                });
            
            const $checkbox = $('<input>')
                .attr('type', 'checkbox')
                .attr('value', tag.value)
                .css({
                    'margin-right': '8px',
                    'position': 'relative',
                    'top': '2px'
                });
            
            $item.append($checkbox).append(tag.text);
            $item.on('click', function(e) {
                if (e.target !== $checkbox[0]) {
                    $checkbox.prop('checked', !$checkbox.prop('checked'));
                }
                updateSelectedTags();
            });
            
            $dropdown.append($item);
        });
        
        // Add click handler to button
        $button.on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            // Toggle dropdown
            if ($dropdown.is(':visible')) {
                $dropdown.hide();
            } else {
                // Position dropdown when opening
                positionDropdown();
                $dropdown.show();
            }
        });
        
        // Function to position dropdown manually
        function positionDropdown() {
            // Get button position for fixed positioning
            const buttonOffset = $button.offset();
            const buttonHeight = $button.outerHeight();
            const buttonWidth = $button.outerWidth();
            
            // If using fixed positioning:
            $dropdown.css({
                'position': 'fixed',
                'top': (buttonOffset.top + buttonHeight) + 'px',
                'left': buttonOffset.left + 'px',
                'width': buttonWidth + 'px'
            });
            
            console.log('Manual dropdown positioned at:', buttonOffset.top + buttonHeight, buttonOffset.left);
        }
        
        // Function to update the original select based on checked boxes
        function updateSelectedTags() {
            const selectedValues = [];
            $dropdown.find('input[type="checkbox"]:checked').each(function() {
                selectedValues.push($(this).val());
            });
            
            // Update the original select
            $select.val(selectedValues);
            $select.trigger('change');
            
            // Update button text
            if (selectedValues.length === 0) {
                $button.text('Select Tags');
            } else if (selectedValues.length === tags.length) {
                $button.text('All Tags Selected');
            } else {
                $button.text(`${selectedValues.length} Tags Selected`);
            }
        }
        
        // Close dropdown when clicking outside
        $(document).on('click', function(event) {
            if (!$(event.target).closest('.manual-tag-dropdown, .manual-tag-dropdown-btn').length) {
                $dropdown.hide();
            }
        });
        
        // Handle scroll events
        $(window).on('scroll', function() {
            if ($dropdown.is(':visible')) {
                positionDropdown();
            }
        });
        
        // Hide original select
        $select.hide();
        
        console.log('Manual tag dropdown initialized successfully');
    }
    
    // Wait for the page to be fully loaded
    setTimeout(initializeManualDropdown, 500);
});
