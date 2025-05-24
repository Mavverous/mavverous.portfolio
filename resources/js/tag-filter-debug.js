/**
 * Tag Filter Debug Helper
 * Helps diagnose issues with the tag filter functionality
 */

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔍 Tag Filter Debug: Initializing');
        
        // Wait a short time to let other scripts initialize
        setTimeout(checkTagFilterState, 1500);
        
        // Also listen for tagspopulated event
        document.addEventListener('tagspopulated', (event) => {
            console.log(`🎯 Tag Filter Event: Tags populated with ${event.detail.tagCount} tags`);
            checkTagFilterState();
        });
    });
    
    function checkTagFilterState() {
        // Check tag filter select element
        const tagFilterSelect = document.querySelector('.tag-filter');
        if (!tagFilterSelect) {
            console.error('❌ Tag Filter Debug: Select element not found!');
            return;
        }
        
        // Check tag filter container
        const tagFilterContainer = document.querySelector('.tag-filter-container');
        if (!tagFilterContainer) {
            console.error('❌ Tag Filter Debug: Container element not found!');
            return;
        }
        
        // Log tag select status
        console.log(`🏷️ Tag Filter Select: Found with ${tagFilterSelect.options.length} options`);
        if (tagFilterSelect.options.length > 0) {
            console.log('✓ Tag options available:', Array.from(tagFilterSelect.options).map(opt => opt.textContent));
        } else {
            console.error('❌ No tag options found in select element');
        }
        
        // Check if simple tag checkboxes have been created
        const checkboxes = document.querySelector('.simple-tag-checkboxes');
        if (checkboxes) {
            const checkboxCount = checkboxes.querySelectorAll('input[type="checkbox"]').length;
            console.log(`✓ Simple tag filter initialized with ${checkboxCount} checkboxes`);
        } else {
            console.error('❌ Simple tag checkboxes not found - filter may not be initialized');
        }
        
        // Check the gallery data
        checkGalleryData();
    }
    
    function checkGalleryData() {
        // Check if gallery instance is available
        if (window.galleryInstance) {
            const instance = window.galleryInstance;
            if (instance.availableTags && instance.availableTags.length > 0) {
                console.log(`✓ Gallery has ${instance.availableTags.length} tags available`);
            } else {
                console.error('❌ Gallery instance has no tags available');
            }
        } else {
            console.warn('⚠️ Gallery instance not available for checking');
        }
    }
})();
