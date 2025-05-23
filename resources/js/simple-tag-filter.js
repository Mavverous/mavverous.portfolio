/**
 * Ultra Simple Tag Filter
 * No dropdown, just plain checkboxes for maximum reliability
 */

(function() {
    // Execute when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🏷️ Simple Tag Filter: initializing');
        initializeSimpleTagFilter();
    });

    /**
     * Initialize a simple checkbox-based tag filter
     */
    function initializeSimpleTagFilter() {
        // Find necessary elements
        const container = document.querySelector('.tag-filter-container');
        const originalSelect = document.querySelector('.tag-filter');
        
        // Validate elements exist
        if (!container || !originalSelect) {
            console.error('⚠️ Tag filter elements not found');
            return;
        }
        
        // Extract tags from original select options
        const tags = Array.from(originalSelect.options).map(option => ({
            value: option.value,
            text: option.textContent,
            selected: option.selected
        }));
        
        console.log(`🏷️ Found ${tags.length} tags for filtering`);
        
        // Create the checkbox UI
        createCheckboxes(container, originalSelect, tags);
        
        // Hide the original select element
        originalSelect.style.display = 'none';
    }

    /**
     * Create simple checkbox UI for tag filtering
     */
    function createCheckboxes(container, originalSelect, tags) {
        // Clear existing content
        container.innerHTML = '';
        
        // Create container for all checkboxes
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'simple-tag-checkboxes';
        container.appendChild(checkboxContainer);
        
        // Create header row with "Select Tags" and search input
        const headerRow = document.createElement('div');
        headerRow.className = 'tag-header-row';
        checkboxContainer.appendChild(headerRow);
        
        const headerLabel = document.createElement('span');
        headerLabel.className = 'tag-header-label';
        headerLabel.textContent = 'Filter by tags:';
        headerRow.appendChild(headerLabel);
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'tag-search';
        searchInput.placeholder = 'Search tags...';
        headerRow.appendChild(searchInput);
        
        // Create "Select All" option
        const selectAllContainer = document.createElement('div');
        selectAllContainer.className = 'tag-checkbox select-all';
        checkboxContainer.appendChild(selectAllContainer);
        
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = 'tag-select-all';
        selectAllContainer.appendChild(selectAllCheckbox);
        
        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = 'tag-select-all';
        selectAllLabel.textContent = 'All Tags';
        selectAllContainer.appendChild(selectAllLabel);
        
        // Create checkbox grid for tags
        const tagGrid = document.createElement('div');
        tagGrid.className = 'tag-grid';
        checkboxContainer.appendChild(tagGrid);
        
        // Add tag checkboxes
        const tagCheckboxes = [];
        tags.forEach((tag, index) => {
            const tagContainer = document.createElement('div');
            tagContainer.className = 'tag-checkbox';
            tagGrid.appendChild(tagContainer);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `tag-item-${index}`;
            checkbox.dataset.value = tag.value;
            tagContainer.appendChild(checkbox);
            
            const label = document.createElement('label');
            label.htmlFor = `tag-item-${index}`;
            label.textContent = tag.text;
            tagContainer.appendChild(label);
            
            tagCheckboxes.push({ 
                container: tagContainer, 
                checkbox, 
                text: tag.text.toLowerCase() 
            });
        });
        
        // Select All functionality
        selectAllCheckbox.addEventListener('change', () => {
            tagCheckboxes.forEach(({ checkbox, container }) => {
                if (container.style.display !== 'none') { // Only affect visible checkboxes
                    checkbox.checked = selectAllCheckbox.checked;
                }
            });
            updateOriginalSelect();
        });
        
        // Individual checkbox change handlers
        tagCheckboxes.forEach(({ checkbox }) => {
            checkbox.addEventListener('change', () => {
                updateOriginalSelect();
                updateSelectAllState();
            });
        });
        
        // Search functionality
        searchInput.addEventListener('input', () => {
            const searchText = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;
            
            tagCheckboxes.forEach(({ container, text }) => {
                const isVisible = text.includes(searchText);
                container.style.display = isVisible ? '' : 'none';
                if (isVisible) visibleCount++;
            });
            
            // Update select all checkbox based on filtered items
            updateSelectAllState();
            
            // Show/hide no results message
            let noResultsMsg = checkboxContainer.querySelector('.no-results-message');
            
            if (visibleCount === 0 && searchText) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.textContent = 'No matching tags found';
                    tagGrid.appendChild(noResultsMsg);
                }
            } else if (noResultsMsg) {
                noResultsMsg.remove();
            }
        });
        
        // Function to update the original select element
        function updateOriginalSelect() {
            // Clear existing selections
            for (let i = 0; i < originalSelect.options.length; i++) {
                originalSelect.options[i].selected = false;
            }
            
            // Set new selections
            tagCheckboxes.forEach(({ checkbox }) => {
                if (checkbox.checked) {
                    const value = checkbox.dataset.value;
                    for (let i = 0; i < originalSelect.options.length; i++) {
                        if (originalSelect.options[i].value === value) {
                            originalSelect.options[i].selected = true;
                            break;
                        }
                    }
                }
            });
            
            // Trigger change event
            originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Function to update the state of the select all checkbox
        function updateSelectAllState() {
            const visibleCheckboxes = tagCheckboxes.filter(
                ({ container }) => container.style.display !== 'none'
            );
            
            const selectedVisibleCheckboxes = visibleCheckboxes.filter(
                ({ checkbox }) => checkbox.checked
            );
            
            selectAllCheckbox.checked = 
                visibleCheckboxes.length > 0 && 
                selectedVisibleCheckboxes.length === visibleCheckboxes.length;
                
            selectAllCheckbox.indeterminate = 
                selectedVisibleCheckboxes.length > 0 && 
                selectedVisibleCheckboxes.length < visibleCheckboxes.length;
        }
    }
})();
