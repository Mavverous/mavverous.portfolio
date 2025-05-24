/**
 * Gallery Loader
 * This script loads gallery images from a local folder via a data file
 */

// Check if ArtworkGallery is already defined to prevent duplicate class declarations
if (typeof window.ArtworkGallery === 'undefined') {
    window.ArtworkGallery = class {    constructor(options = {}) {
        this.dataPath = options.dataPath || '../resources/data/gallery-data.json';
        this.containerSelector = options.containerSelector || '#gallery-container';
        console.log('Gallery container selector:', this.containerSelector);
        this.galleryContainer = document.querySelector(this.containerSelector);
        
        if (!this.galleryContainer) {
            console.error(`Gallery container not found with selector "${this.containerSelector}". Attempting to find with alternate selectors.`);
            // Try some fallback selectors
            this.galleryContainer = document.querySelector('#gallery-container') || document.querySelector('.gallery-grid');
            if (this.galleryContainer) {
                console.log(`Found gallery container using fallback selector: ${this.galleryContainer.id || this.galleryContainer.className}`);
            } else {
                console.error('Could not find gallery container with any selector');
                // Create a debugging message directly in the DOM
                const body = document.querySelector('body');
                if (body) {
                    const debugMsg = document.createElement('div');
                    debugMsg.className = 'alert alert-danger m-3';
                    debugMsg.innerHTML = 'ERROR: Gallery container not found! Check the console for details.';
                    body.prepend(debugMsg);
                }
            }
        } else {
            console.log('Gallery container found:', this.galleryContainer);
        }
          this.filterButtons = document.querySelectorAll('.filter-btn');
        this.tagFilterSelect = document.querySelector('.tag-filter');
        this.sortSelect = document.querySelector('.sort-select');
        // Active filters section has been removed from UI
        
        // Store original artwork data and current filters
        this.allArtworks = [];
        this.currentFilters = {
            medium: 'all',
            tags: [],
            sort: 'newest'
        };
        
        this.init();
    }    /**
     * Initialize the gallery
     */    init() {
        this.loadGalleryData()
            .then(data => {
                // Store the original data
                this.allArtworks = data.artworks || [];
                
                // Extract tags and categories for filters
                this.extractFilterOptions();
                
                // Sort artworks by newest first (matching the default UI selection)
                const sortedArtworks = this.sortArtworks([...this.allArtworks], 'newest');
                
                // Initialize the gallery with sorted artworks
                this.renderGallery({ artworks: sortedArtworks });
                
                // Set up filter and sort controls
                this.initMediumFilters();
                this.initTagFilters();
                this.initSortControls();
                this.initClearFilters();
                
                // Initialize lightbox
                this.initLightbox();
                
                // Add document click handler to close dropdown when clicking outside
                this.initDocumentClickHandler();
            })
            .catch(error => {
                console.error('Error loading gallery data:', error);
                this.showError();
            });
    }    /**
     * Extract all filter options from artwork data
     */
    extractFilterOptions() {
        // Extract all unique tags from artwork data
        const allTags = new Set();
        
        this.allArtworks.forEach(artwork => {
            // Extract from category field (for backward compatibility)
            const categoryString = artwork.category || '';
            const categories = categoryString.split(' ');
            
            // Add each category as a tag
            categories.forEach(category => {
                if (category && category.trim()) {
                    allTags.add(category.trim());
                }
            });
            
            // Extract from tags array if available (preferred structure)
            if (Array.isArray(artwork.tags)) {
                artwork.tags.forEach(tag => {
                    if (tag && tag.trim()) {
                        allTags.add(tag.trim());
                    }
                });
            }
        });
        
        // Store the unique tags for filtering
        this.availableTags = Array.from(allTags).sort();
        
        // Populate the tag filter dropdown
        if (this.tagFilterSelect) {
            // Clear any existing options first (except the first one if it exists)
            while (this.tagFilterSelect.options.length > 0) {
                this.tagFilterSelect.remove(0);
            }
            
            // Add the tags as options
            this.availableTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.toLowerCase();
                option.textContent = tag;
                this.tagFilterSelect.appendChild(option);
            });
            
            console.log(`Added ${this.availableTags.length} tag options to select element`);
            
            // Trigger a custom event to notify that tags have been populated
            this.tagFilterSelect.dispatchEvent(new CustomEvent('tagspopulated', {
                bubbles: true,
                detail: { tagCount: this.availableTags.length }
            }));
        } else {
            console.error('Tag filter select element not found in extractFilterOptions');
        }
        
        console.log('Available tags for filtering:', this.availableTags);
    }
      /**
     * Load gallery data from JSON file
     * @returns {Promise} - Promise that resolves with gallery data
     */
    loadGalleryData() {
        return fetch(this.dataPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load gallery data: ${response.status} ${response.statusText}`);
                }
                return response.text().then(text => {
                    try {
                        // Remove any comment lines (starts with //) - these break JSON parsing
                        const cleanText = text.split('\n')
                            .filter(line => !line.trim().startsWith('//'))
                            .join('\n');
                        
                        console.log('Cleaned JSON text:', cleanText);
                        
                        // Try to parse the cleaned JSON
                        return JSON.parse(cleanText);
                    } catch (err) {
                        console.error('Error parsing JSON:', err);
                        console.log('Raw JSON text:', text);
                        throw new Error('Failed to parse gallery data JSON');
                    }
                });
            });
    }
      /**
     * Apply all current filters and sorting to the artworks
     */
    applyFilters() {
        // Start with all artworks
        let filteredArtworks = [...this.allArtworks];
          // Apply medium filter
        if (this.currentFilters.medium !== 'all') {
            filteredArtworks = filteredArtworks.filter(artwork => {
                // Check in category field (for backward compatibility)
                const categories = (artwork.category || '').toLowerCase();
                
                // Check in medium field if available
                const medium = (artwork.medium || '').toLowerCase();
                
                // Check in tags array if available
                const hasMediumInTags = Array.isArray(artwork.tags) && 
                    artwork.tags.some(tag => tag.toLowerCase() === this.currentFilters.medium.toLowerCase());
                
                return categories.includes(this.currentFilters.medium.toLowerCase()) || 
                       medium === this.currentFilters.medium.toLowerCase() ||
                       hasMediumInTags;
            });
        }
        
        // Apply tag filters
        if (this.currentFilters.tags.length > 0) {
            filteredArtworks = filteredArtworks.filter(artwork => {
                // Get categories from category field
                const categories = (artwork.category || '').toLowerCase().split(' ');
                
                // Get tags from tags array if available
                const tags = Array.isArray(artwork.tags) 
                    ? artwork.tags.map(tag => tag.toLowerCase())
                    : [];
                
                // Combine both sources of tags
                const allArtworkTags = [...categories, ...tags];
                
                // Artwork must match all selected tags
                return this.currentFilters.tags.every(selectedTag => 
                    allArtworkTags.some(artworkTag => 
                        artworkTag.toLowerCase() === selectedTag.toLowerCase()
                    )
                );
            });
        }
        
        // Apply sorting
        filteredArtworks = this.sortArtworks(filteredArtworks, this.currentFilters.sort);
        
        // Render the filtered and sorted gallery
        this.renderGallery({ artworks: filteredArtworks });
    }
    
    /**
     * Sort artworks based on the selected sort option
     * @param {Array} artworks - Array of artwork objects
     * @param {string} sortOption - Sort option (newest, oldest, title-asc, title-desc)
     * @returns {Array} - Sorted array of artworks
     */    sortArtworks(artworks, sortOption) {
        const sortedArtworks = [...artworks];
        
        switch (sortOption) {
            case 'newest':
                return sortedArtworks.sort((a, b) => {
                    // Use the ArtworkUtils class to parse dates
                    const dateA = ArtworkUtils.parseArtworkDate(a).getTime();
                    const dateB = ArtworkUtils.parseArtworkDate(b).getTime();
                    console.log(`Comparing dates: ${a.title}: ${a.createdDate} (${new Date(dateA).toISOString()}) vs ${b.title}: ${b.createdDate} (${new Date(dateB).toISOString()})`);
                    return dateB - dateA; // Descending order by date
                });
            case 'oldest':
                return sortedArtworks.sort((a, b) => {
                    // Use the ArtworkUtils class to parse dates
                    const dateA = ArtworkUtils.parseArtworkDate(a).getTime();
                    const dateB = ArtworkUtils.parseArtworkDate(b).getTime();
                    return dateA - dateB; // Ascending order by date
                });
            case 'title-asc':
                return sortedArtworks.sort((a, b) => 
                    (a.title || '').localeCompare(b.title || '')
                );
            case 'title-desc':
                return sortedArtworks.sort((a, b) => 
                    (b.title || '').localeCompare(a.title || '')
                );
            default:
                return sortedArtworks;
        }
    }
    
    /**
     * Render gallery items from data
     * @param {Object} data - Gallery data object
     */
    renderGallery(data) {
        if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
            this.showEmptyState('No artworks found matching your current filters.');
            return;
        }
        
        // Clear existing gallery items
        this.galleryContainer.innerHTML = '';
        
        // Create gallery items from data
        data.artworks.forEach((artwork, index) => {
            const delay = (index % 3) * 100;
            const item = this.createGalleryItem(artwork, delay);
            this.galleryContainer.appendChild(item);
        });
        
        // Reinitialize AOS animations if available
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }
    
    /**
     * Show empty state message when no artworks match filters
     * @param {string} message - Message to display
     */    showEmptyState(message) {        this.galleryContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i class="fas fa-filter-circle-xmark mb-3" style="font-size: 3rem; opacity: 0.2;"></i>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-outline-secondary mt-3 clear-filters">
                        Clear All Filters
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener to the Clear Filters button
        const clearButton = this.galleryContainer.querySelector('.clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                // Reset all filters
                this.resetAllFilters();
            });
        }
    }
      /**
     * Create a gallery item element
     * @param {Object} artwork - Artwork data object
     * @param {number} delay - Delay for animation
     * @returns {HTMLElement} - Gallery item element
     */    createGalleryItem(artwork, delay = 0) {
        const categories = artwork.category ? artwork.category.toLowerCase() : '';
        // Use backward and forward slashes for better path compatibility
        const isInSubfolder = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
        
        // Process image paths - prefer imagePath from the JSON if available
        const imagePath = artwork.imagePath || artwork.fullImageUrl || artwork.thumbnailUrl;
        console.log(`Processing artwork: ${artwork.title}, image path from JSON: ${imagePath}`);
        
        // Check for absolute paths in some entries (entries 5-7 have full paths)
        let fullImagePath;
        if (imagePath.includes('resources/images/artwork/')) {
            fullImagePath = isInSubfolder ? '../' + imagePath : imagePath;
            console.log(`Using existing path structure: ${fullImagePath}`);
        } else {
            fullImagePath = ArtworkUtils.getImagePath(imagePath, isInSubfolder);
            console.log(`Generated path using ArtworkUtils: ${fullImagePath}`);
        }
        
        const thumbnailPath = fullImagePath; // Use the same path for thumbnail to simplify
        const placeholderPath = ArtworkUtils.getPlaceholderImage(isInSubfolder);
        
        // Debug the image path to help identify loading issues
        ArtworkUtils.debugImage(fullImagePath);
        
        console.log(`Creating gallery item for: ${artwork.title}, with image path: ${thumbnailPath}`);
        
        // Create gallery item container
        const itemContainer = document.createElement('div');
        itemContainer.className = `col-lg-4 gallery-item ${categories}`;        // Extract tags for display
        let displayTags = [];
        
        // Add tags from the tags array if available (preferred)
        if (Array.isArray(artwork.tags) && artwork.tags.length > 0) {
            displayTags = [...artwork.tags];
        } 
        // Fall back to category field if no tags array
        else if (artwork.category) {
            displayTags = artwork.category.split(' ');
        }
        
        // Limit the number of displayed tags to prevent overcrowding
        const maxDisplayTags = 4;
        const limitedTags = displayTags.slice(0, maxDisplayTags);
        const extraTagsCount = displayTags.length - maxDisplayTags;
        
        // Create badge HTML
        let tagBadges = limitedTags.map(tag => 
            `<span class="tag">${tag}</span>`
        ).join('');
        
        // Add a +X more badge if we have more tags
        if (extraTagsCount > 0) {
            tagBadges += `<span class="tag">+${extraTagsCount} more</span>`;
        }        // Handle possible case sensitivity issues with file extensions for GitHub Pages
        // Try alternative extensions if needed (.png vs .PNG, .jpg vs .JPG)
        const isCapitalExtension = thumbnailPath.match(/\.(PNG|JPG|JPEG|GIF|WEBP)$/);
        const isLowerExtension = thumbnailPath.match(/\.(png|jpg|jpeg|gif|webp)$/);
        
        // Create a function to try both uppercase and lowercase extensions
        function createImgWithFallback(path) {
            // If no extension match found, just use the path as is
            if (!isCapitalExtension && !isLowerExtension) {
                return `<img src="${path}" class="card-img-top loading" alt="${artwork.title}" 
                       onload="this.classList.remove('loading')"
                       onerror="this.onerror=null; this.src='${placeholderPath}'; console.error('Failed to load image: ${path}');">`;
            }
            
            // If we have an extension, prepare both versions
            const basePath = path.substring(0, path.lastIndexOf('.'));
            const ext = path.substring(path.lastIndexOf('.') + 1);
            const upperPath = `${basePath}.${ext.toUpperCase()}`;
            const lowerPath = `${basePath}.${ext.toLowerCase()}`;
            
            // Create an image tag that tries both variants
            return `<img src="${path}" class="card-img-top loading" alt="${artwork.title}" 
                   onload="this.classList.remove('loading')"
                   onerror="if (!this.dataset.tried) {
                       this.dataset.tried = '1';
                       this.src = '${path === upperPath ? lowerPath : upperPath}';
                   } else {
                       this.src='${placeholderPath}';
                       console.error('Failed to load image: ${path}');
                   }">`;
        }
        
        // Create gallery card that's identical to featured works cards
        const cardHtml = `
            <div class="gallery-card" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='${isInSubfolder ? 'artwork-detail.html?id=' + artwork.id : 'pages/artwork-detail.html?id=' + artwork.id}'">
                ${createImgWithFallback(thumbnailPath)}
                <div class="card-body">
                    <h5 class="card-title">${artwork.title}</h5>
                    <p class="card-text">${artwork.createdDate}</p>
                    <div class="tags">
                        ${tagBadges}
                    </div>
                </div>
            </div>
        `;
        
        // Set the HTML of the container
        itemContainer.innerHTML = cardHtml;
        return itemContainer;
    }
      /**
     * Initialize medium filter buttons (digital, painting, etc.)
     */
    initMediumFilters() {
        if (!this.filterButtons || this.filterButtons.length === 0) {
            return;
        }
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                this.filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Get filter value
                const filterValue = button.getAttribute('data-filter');
                
                // Update current filter state
                this.currentFilters.medium = filterValue;
                
                // Apply all filters with the updated medium
                this.applyFilters();
                
                // Update active filter pills
                this.updateActiveFilterPills();
            });
        });
    }    /**
     * Initialize tag filter checkboxes
     */    initTagFilters() {
        if (!this.tagFilterSelect) {
            return;
        }
        
        // The checkbox UI initialization is handled by simple-tag-filter.js
        // We just need to listen for changes on the original select element
        console.log('Tag filter will be initialized by simple-tag-filter.js');
          // Add event listener for changes
        this.tagFilterSelect.addEventListener('change', () => {
            // Get selected options
            const selectedTags = Array.from(this.tagFilterSelect.selectedOptions).map(option => option.value.toLowerCase());
            
            // Update current filter state
            this.currentFilters.tags = selectedTags;
            
            // Apply filters
            this.applyFilters();
            
            // Log for debugging
            console.log(`🏷️ Tag selection changed: ${selectedTags.length} tags selected`);
            
            // If there are no selected tags and there's a custom event, update simple tag filter UI
            if (selectedTags.length === 0 && event instanceof Event) {
                // Dispatch a custom event that the simple-tag-filter can listen for
                this.tagFilterSelect.dispatchEvent(new CustomEvent('filtersReset', { 
                    bubbles: true,
                    detail: { source: 'gallery' } 
                }));
            }
        });
    }
    
    /**
     * Initialize sort dropdown
     */
    initSortControls() {
        if (!this.sortSelect) {
            return;
        }
        
        this.sortSelect.addEventListener('change', () => {
            // Update current sort option
            this.currentFilters.sort = this.sortSelect.value;
            
            // Apply current filters and sort
            this.applyFilters();
        });
    }    /**
     * Initialize clear filters button
     * (This method is now a no-op since we've removed the clear filters button)
     */
    initClearFilters() {
        // No-op: Clear filters button has been removed
        return;
    }
    
    /**
     * Reset all filters to their default state
     * This is used by the Clear Filters button in the empty state message
     */
    resetAllFilters() {
        console.log('Clearing all filters');
        
        // Reset medium filter buttons
        if (this.filterButtons && this.filterButtons.length > 0) {
            // Remove active class from all buttons
            this.filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Set "All" button to active
            const allButton = Array.from(this.filterButtons).find(btn => btn.getAttribute('data-filter') === 'all');
            if (allButton) {
                allButton.classList.add('active');
            }
        }
        
        // Reset tag filters
        if (this.tagFilterSelect) {
            // Deselect all options
            for (let i = 0; i < this.tagFilterSelect.options.length; i++) {
                this.tagFilterSelect.options[i].selected = false;
            }
            
            // Trigger change event to update any listeners
            this.tagFilterSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Reset sort to default
        if (this.sortSelect) {
            this.sortSelect.value = 'newest';
        }
        
        // Reset current filters state
        this.currentFilters = {
            medium: 'all',
            tags: [],
            sort: 'newest'
        };
        
        // Re-apply the filters (which will now show all)
        this.applyFilters();
    }
      /**
     * Update the active filter pills display
     * (This method is now a no-op since we've removed the active filters UI)
     */
    updateActiveFilterPills() {
        // No-op: Active filters UI has been removed
        return;
    }    /**
     * Initialize lightbox for gallery images
     */
    initLightbox() {
        // Check if lightbox and jQuery are available
        if (typeof lightbox !== 'undefined' && typeof jQuery !== 'undefined') {
            // Set lightbox options using the jQuery plugin pattern that Lightbox2 expects
            $(document).ready(function() {
                lightbox.option({
                    'resizeDuration': 200,
                    'wrapAround': true,
                    'disableScrolling': true,
                    'albumLabel': "Image %1 of %2"
                });
            });
        } else {
            console.warn('Lightbox or jQuery not available for gallery initialization');
        }
    }    
        /**
         * Initialize document click handler
         * No longer needed as we've removed the dropdown completely
         */    initDocumentClickHandler() {
        // No-op: Not needed with checkbox-based UI (no dropdown to close)
        return;
    }
    
    /**
     * Show error message in gallery container
     * @param {string} message - Error message to display
     */
    showError(message = 'Unable to load gallery images. Please try again later.') {
        this.galleryContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    ${message}
                </div>
            </div>
        `;    }
};
}

/**
 * Artwork Utilities
 * Helper functions to work with artwork images
 */
if (typeof window.ArtworkUtils === 'undefined') {
    window.ArtworkUtils = class {    /**
     * Process image path to ensure it's correctly formatted
     * @param {string} imagePath - Path to the image file
     * @param {boolean} isInSubfolder - Whether the current page is in a subfolder
     * @returns {string} - Correctly formatted image path
     */    static getImagePath(imagePath, isInSubfolder = false) {
        // Check if path is empty
        if (!imagePath) {
            console.error('Empty image path provided');
            return isInSubfolder ? '../resources/images/placeholder.jpg' : 'resources/images/placeholder.jpg';
        }
        
        // If it's already a complete URL or absolute path, return as is
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // If it's a relative path, adjust based on current location
        const basePrefix = isInSubfolder ? '../' : '';
        
        // Handle file extensions - IMPORTANT: Don't convert to lowercase for GitHub Pages
        // Instead, keep the original case of the filename and extension
        // This is critical for case-sensitive servers like GitHub Pages
        const normalizedPath = imagePath;
        
        // Check if path already includes resources/images/artwork or similar structure
        if (normalizedPath.includes('resources/images/artwork/') || normalizedPath.includes('resources\\images\\artwork\\')) {
            // Already has the correct path format - just need to add prefix for subfolder context
            const fullPath = `${basePrefix}${normalizedPath.replace(/\\/g, '/')}`;
            console.log('Using existing image path structure:', fullPath);
            return fullPath;
        }
        
        // Path doesn't include the resources/images/artwork structure, so add it
        const filename = normalizedPath.includes('/') ? 
            normalizedPath.split('/').pop() : 
            (normalizedPath.includes('\\') ? normalizedPath.split('\\').pop() : normalizedPath);
        
        // Log the full image path being created
        const fullPath = `${basePrefix}resources/images/artwork/${filename}`;
        console.log('Created full image path from filename:', fullPath);
        return fullPath;
    }
    
    /**
     * Get the default placeholder image path
     * @param {boolean} isInSubfolder - Whether the current page is in a subfolder
     * @returns {string} - Path to the placeholder image
     */    static getPlaceholderImage(isInSubfolder = false) {
        const basePrefix = isInSubfolder ? '../' : '';
        return `${basePrefix}resources/images/placeholder.jpg`;
    }
    
    /**
     * Parse a date string from various formats used in artwork metadata
     * @param {Object} artwork - Artwork object containing date information
     * @returns {Date} - JavaScript Date object
     */
    static parseArtworkDate(artwork) {
        // Try to get date from either yearCreated or createdDate
        const dateStr = artwork.createdDate || artwork.yearCreated || '';
        
        // If it's just a year (e.g., "2023"), parse it directly
        if (/^\d{4}$/.test(dateStr)) {
            return new Date(parseInt(dateStr, 10), 0, 1);
        }
        
        // If it's a date in M/D/YYYY format, parse it
        try {
            return new Date(dateStr);
        } catch (e) {
            console.error('Error parsing date:', dateStr, e);
            return new Date(0); // Return epoch if parsing fails
        }
    }
      /**
     * Debug function to check image availability
     * @param {string} imagePath - Path to check
     */
    static debugImage(imagePath) {
        console.log('Debugging image path:', imagePath);
        
        // Check for common issues with paths
        if (imagePath.includes('\\')) {
            console.warn('Warning: Path contains backslashes which may cause issues on web:', imagePath);
        }
        
        if (imagePath.includes('..\\')) {
            console.warn('Warning: Path contains Windows-style parent directory notation which may cause issues:', imagePath);
        }
        
        if (!/\.(jpg|jpeg|png|gif|webp|svg)/i.test(imagePath)) {
            console.warn('Warning: Path does not have a valid image extension:', imagePath);
        }
        
        // Case sensitivity checks for GitHub Pages
        // This is critical because GitHub Pages is case-sensitive but Windows is not
        if (imagePath.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
            console.log('Note: File has lowercase extension. On GitHub Pages, ensure the actual file extension matches this case.');
            
            // Try to suggest an alternative
            const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
            const ext = imagePath.substring(imagePath.lastIndexOf('.') + 1);
            console.log(`If image fails to load, try: ${basePath}.${ext.toUpperCase()}`);
        }
        
        if (imagePath.match(/\.(PNG|JPG|JPEG|GIF|WEBP)$/)) {
            console.log('Note: File has uppercase extension. On GitHub Pages, ensure the actual file extension matches this case.');
            
            // Try to suggest an alternative
            const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
            const ext = imagePath.substring(imagePath.lastIndexOf('.') + 1);
            console.log(`If image fails to load, try: ${basePath}.${ext.toLowerCase()}`);
        }
        
        // Create a test image to check if the path works
        const img = new Image();
        img.onload = () => {
            console.log('✅ Image successfully loaded:', imagePath);
            console.log(`Image dimensions: ${img.width} x ${img.height}`);
        };
        img.onerror = (error) => {
            console.error('❌ Image failed to load:', imagePath);
            console.error('Error details:', error);
            
            // Try to help with troubleshooting
            if (imagePath.startsWith('..') && !imagePath.includes('/pages/')) {
                console.warn('Possible path issue: Using relative path (..) but not in a subfolder context');
            }
            
            // Case sensitivity troubleshooting
            if (/(PNG|JPG|JPEG|GIF|WEBP)$/i.test(imagePath)) {
                console.warn('GitHub Pages Case Sensitivity Issue: The file extension case might not match the actual file.');
                
                // Extract the base path and extension
                const basePath = imagePath.substring(0, imagePath.lastIndexOf('.'));
                const ext = imagePath.substring(imagePath.lastIndexOf('.') + 1);
                
                // Suggest trying both uppercase and lowercase versions
                console.warn(`Try these alternatives:
                1. ${basePath}.${ext.toUpperCase()}
                2. ${basePath}.${ext.toLowerCase()}`);
                
                // Also suggest checking the actual file case on GitHub
                console.warn(`Tip: Check the exact filename and case in your GitHub repository.
                Fix options: 
                1. Rename your files to match the case in your code
                2. Update your code to match the actual file case`);
            }
        };
        img.src = imagePath;
    }
};
}

// Wait for DOM to be fully loaded
// Use a flag to ensure the initialization code only runs once
if (!window.galleryInitialized) {
    window.galleryInitialized = true;
    
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit to ensure all dependencies are loaded
        setTimeout(() => {
            // Check if we're on a page with a gallery
            if (document.querySelector('.gallery-grid')) {
                console.log('Initializing gallery...');
                try {
                    // Determine if we're on the main page or in a subfolder
                    const isInSubfolder = window.location.pathname.includes('/pages/');
                    const dataPath = isInSubfolder ? '../resources/data/gallery-data.json' : 'resources/data/gallery-data.json';
                    
                    // Initialize the gallery with options
                    const gallery = new ArtworkGallery({
                        dataPath: dataPath,
                        containerSelector: '.gallery-grid'
                    });
                } catch (error) {
                    console.error('Error initializing gallery:', error);
                }
            }
        }, 300); // Small delay to ensure everything is loaded
    });
}
