/**
 * Basic Tag Dropdown
 * A simplified, minimal approach to implementing the tag dropdown
 */

// Wait for the page to load
window.addEventListener('load', function() {
    console.log('Basic tag dropdown initializer running');
    initializeBasicTagDropdown();
});

function initializeBasicTagDropdown() {
    // Find the select element
    const tagSelect = document.querySelector('.tag-filter');
    if (!tagSelect) {
        console.error('Tag filter select element not found');
        return;
    }
    
    console.log('Found tag select element');
    
    // Check if jQuery and multiselect plugin are available
    if (typeof $ === 'undefined' || typeof $.fn.multiselect === 'undefined') {
        console.error('jQuery or multiselect plugin not available');
        return;
    }
    
    // Try to destroy any existing instances
    try {
        $(tagSelect).multiselect('destroy');
    } catch (e) {
        console.warn('Error destroying existing multiselect:', e);
    }
    
    // Initialize with minimal settings
    $(tagSelect).multiselect({
        includeSelectAllOption: true,
        selectAllText: 'All Tags',
        enableFiltering: true,
        nonSelectedText: 'Select Tags',
        buttonClass: 'btn btn-outline-secondary'
    });
    
    console.log('Basic multiselect initialized');
    
    // Apply styling to the dropdown
    styleTagDropdown();
    
    // Add custom click handler
    setupCustomClickHandler();
}

function styleTagDropdown() {
    // Get the dropdown elements
    const dropdown = document.querySelector('.multiselect-container');
    if (!dropdown) {
        console.warn('Multiselect container not found for styling');
        return;
    }
    
    // Apply basic styling
    dropdown.style.backgroundColor = '#1e1e1e';
    dropdown.style.border = '1px solid rgba(108, 189, 163, 0.3)';
    dropdown.style.borderRadius = '4px';
    dropdown.style.padding = '8px 0';
    dropdown.style.maxHeight = '300px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '999999';
    
    // Style labels
    const labels = dropdown.querySelectorAll('label');
    labels.forEach(label => {
        label.style.color = 'var(--secondary-color, #6cbd9b)';
        label.style.padding = '4px 0';
    });
    
    console.log('Applied basic styling to dropdown');
}

function setupCustomClickHandler() {
    // Get the button
    const button = document.querySelector('.tag-filter-container .multiselect');
    if (!button) {
        console.warn('Multiselect button not found');
        return;
    }
    
    // Get the dropdown
    const dropdown = document.querySelector('.multiselect-container');
    if (!dropdown) {
        console.warn('Multiselect container not found');
        return;
    }
    
    // Remove existing click handlers
    $(button).off('click');
    
    // Add custom click handler
    $(button).on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle dropdown visibility
        if ($(dropdown).is(':visible')) {
            $(dropdown).hide();
        } else {
            // Position dropdown
            positionDropdown(button, dropdown);
            $(dropdown).show();
        }
    });
    
    // Close dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest(button).length && !$(e.target).closest(dropdown).length) {
            $(dropdown).hide();
        }
    });
    
    // Update position on scroll
    $(window).on('scroll', function() {
        if ($(dropdown).is(':visible')) {
            positionDropdown(button, dropdown);
        }
    });
    
    console.log('Custom click handler set up');
}

function positionDropdown(button, dropdown) {
    // Get button position
    const buttonRect = button.getBoundingClientRect();
    
    // Position dropdown
    dropdown.style.position = 'fixed';
    dropdown.style.top = (buttonRect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (buttonRect.left + window.scrollX) + 'px';
    dropdown.style.width = buttonRect.width + 'px';
    dropdown.style.zIndex = '999999';
}
