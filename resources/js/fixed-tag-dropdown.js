/**
 * Final Tag Dropdown Fix
 * Simple, conflict-free implementation for tag dropdown functionality
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', function() {
  console.log('Final tag dropdown fix loading...');

  // Give other scripts time to load and initialize first
  setTimeout(initializeFixedTagDropdown, 500);
});

/**
 * Initialize the tag dropdown with minimal, conflict-free configuration
 */
function initializeFixedTagDropdown() {
  // Check for jQuery and multiselect availability
  if (typeof jQuery === 'undefined') {
    console.error('jQuery not available - cannot initialize dropdown');
    return;
  }

  if (typeof jQuery.fn.multiselect === 'undefined') {
    console.error('Bootstrap multiselect plugin not available');
    return;
  }

  const $ = jQuery;
  const $select = $('.tag-filter');
  
  if ($select.length === 0) {
    console.error('Tag filter element not found');
    return;
  }

  console.log('Initializing fixed tag dropdown with clean configuration');
  
  // Clean up any existing multiselect instances
  try {
    if ($select.data('multiselect')) {
      $select.multiselect('destroy');
      console.log('Cleaned up existing multiselect instance');
    }
  } catch (e) {
    // Ignore errors from cleanup
  }
  
  // Initialize with minimal options
  $select.multiselect({
    includeSelectAllOption: true,
    selectAllText: 'All Tags',
    enableFiltering: true,
    enableCaseInsensitiveFiltering: true,
    nonSelectedText: 'Select Tags',
    maxHeight: 300,
    buttonWidth: '100%'
  });
  
  // Fix dropdown menu positioning
  const $button = $('.tag-filter-container .multiselect');
  const $dropdown = $('.multiselect-container');
  
  // Modify dropdown toggle behavior
  $button.off('click').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if ($dropdown.is(':visible')) {
      hideDropdown();
    } else {
      showDropdown();
    }
  });
  
  // Add event handlers for document clicks and scrolling
  $(document).off('click.tagDropdownFix').on('click.tagDropdownFix', function(e) {
    if ($dropdown.is(':visible') && 
        !$(e.target).closest('.tag-filter-container').length && 
        !$(e.target).closest('.multiselect-container').length) {
      hideDropdown();
    }
  });
  
  // Track scrolling to keep dropdown with button
  $(window).off('scroll.tagDropdownFix').on('scroll.tagDropdownFix', function() {
    if ($dropdown.is(':visible')) {
      positionDropdown();
    }
  });
  
  // Handle window resize
  $(window).off('resize.tagDropdownFix').on('resize.tagDropdownFix', function() {
    if ($dropdown.is(':visible')) {
      positionDropdown();
    }
  });
  
  // Make sure the dropdown is attached to the body
  if ($dropdown.parent()[0] !== document.body) {
    $dropdown.detach().appendTo('body');
  }
  
  /**
   * Show and position the dropdown
   */
  function showDropdown() {
    // Make sure dropdown is attached to body before showing
    if ($dropdown.parent()[0] !== document.body) {
      $dropdown.detach().appendTo('body');
    }
    
    // Apply styling to ensure visibility
    $dropdown.css('display', 'block');
    
    // Position the dropdown
    positionDropdown();
    
    // Style search field and labels
    $dropdown.find('.multiselect-search').attr('placeholder', 'Search tags...');
  }
  
  /**
   * Hide the dropdown
   */
  function hideDropdown() {
    $dropdown.css('display', 'none');
  }
  
  /**
   * Position the dropdown relative to its button
   */
  function positionDropdown() {
    const buttonPos = $button.offset();
    const buttonHeight = $button.outerHeight();
    const buttonWidth = $button.outerWidth();
    
    $dropdown.css({
      'position': 'fixed',
      'top': (buttonPos.top + buttonHeight) + 'px',
      'left': buttonPos.left + 'px',
      'width': buttonWidth + 'px',
      'z-index': 2147483647
    });
  }
  
  console.log('Fixed tag dropdown initialized successfully');
}
