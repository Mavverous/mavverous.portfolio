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
     */
    init() {
        this.loadGalleryData()
            .then(data => {
                // Store the original data
                this.allArtworks = data.artworks || [];
                
                // Extract tags and categories for filters
                this.extractFilterOptions();
                
                // Initialize the gallery with all artworks
                this.renderGallery({ artworks: this.allArtworks });
                
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
    }
      /**
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
            this.availableTags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.toLowerCase();
                option.textContent = tag;
                this.tagFilterSelect.appendChild(option);
            });
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
     */
    sortArtworks(artworks, sortOption) {
        const sortedArtworks = [...artworks];
        
        switch (sortOption) {
            case 'newest':
                return sortedArtworks.sort((a, b) => {
                    const yearA = parseInt(a.yearCreated || '0', 10);
                    const yearB = parseInt(b.yearCreated || '0', 10);
                    return yearB - yearA; // Descending order by year
                });
            case 'oldest':
                return sortedArtworks.sort((a, b) => {
                    const yearA = parseInt(a.yearCreated || '0', 10);
                    const yearB = parseInt(b.yearCreated || '0', 10);
                    return yearA - yearB; // Ascending order by year
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
     */
    showEmptyState(message) {
        this.galleryContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state">
                    <i class="fas fa-search mb-3" style="font-size: 3rem; opacity: 0.2;"></i>
                    <p class="text-muted">${message}</p>
                    <button class="btn btn-outline-primary btn-sm mt-2 clear-filters">Clear Filters</button>
                </div>
            </div>
        `;
        
        // Add event listener to the Clear Filters button
        const clearButton = this.galleryContainer.querySelector('.clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (this.clearFiltersBtn) {
                    this.clearFiltersBtn.click();
                }
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
            `<span class="badge bg-secondary me-1">${tag}</span>`
        ).join('');
        
        // Add a +X more badge if we have more tags
        if (extraTagsCount > 0) {
            tagBadges += `<span class="badge bg-light text-dark me-1">+${extraTagsCount} more</span>`;
        }          // Create gallery card that's identical to featured works cards
        const cardHtml = `
            <div class="gallery-card project-card" data-aos="fade-up" data-aos-delay="${delay}" onclick="window.location.href='${isInSubfolder ? 'artwork-detail.html?id=' + artwork.id : 'pages/artwork-detail.html?id=' + artwork.id}'">
                <img src="${thumbnailPath}" class="card-img-top loading" alt="${artwork.title}" 
                     onload="this.classList.remove('loading')"
                     onerror="this.onerror=null; this.src='${placeholderPath}'; console.error('Failed to load image: ${thumbnailPath}');">
                <div class="card-body">
                    <h5 class="card-title">${artwork.title}</h5>
                    <div class="tags">
                        ${tagBadges}
                    </div>
                    <p class="card-text">${artwork.description}</p>
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
     * Initialize tag filter dropdown
     */    initTagFilters() {
        if (!this.tagFilterSelect) {
            return;
        }
        
        // Initialize Bootstrap Multiselect if available
        if (typeof $ !== 'undefined' && typeof $.fn.multiselect !== 'undefined') {
            // Use a setTimeout to ensure the DOM is fully ready
            setTimeout(() => {
                // First reset any previous instances
                $(this.tagFilterSelect).multiselect('destroy');
                
                // Initialize with improved settings
                $(this.tagFilterSelect).multiselect({
                    includeSelectAllOption: true,
                    selectAllText: 'All Tags',
                    enableFiltering: true,
                    enableCaseInsensitiveFiltering: true,
                    maxHeight: 300,
                    buttonClass: 'btn btn-outline-secondary',
                    buttonWidth: '100%',
                    nonSelectedText: 'Select Tags',
                    templates: {
                        button: '<button type="button" class="multiselect dropdown-toggle btn btn-outline-secondary" data-bs-toggle="dropdown"><span class="multiselect-selected-text"></span></button>'
                    }
                });
                
                // Custom click handler to toggle dropdown
                $('.tag-filter-container .multiselect').off('click').on('click', function(e) {
                    const $container = $(this).closest('.tag-filter-container');
                    const $dropdown = $container.find('.multiselect-container');
                    
                    // Toggle dropdown state
                    if ($container.hasClass('dropdown-open')) {
                        $container.removeClass('dropdown-open');
                        $dropdown.css('display', 'none');
                    } else {
                        // Close any other open dropdowns first
                        $('.tag-filter-container').removeClass('dropdown-open');
                        $('.multiselect-container').css('display', 'none');
                        
                        // Open this dropdown
                        $container.addClass('dropdown-open');
                        
                        // Position the dropdown properly
                        $dropdown.css({
                            'position': 'absolute',
                            'top': '100%',
                            'left': '0',
                            'width': $container.width() + 'px',
                            'max-height': '300px',
                            'overflow-y': 'auto',
                            'z-index': '10002',
                            'display': 'block'
                        });
                    }
                    
                    // Prevent event from bubbling up or triggering default behavior
                    e.preventDefault();
                    e.stopPropagation();
                });
                
                console.log('Tag filter dropdown initialized with custom click handler');
            }, 500);
        } else {
            // Fallback for browsers where multiselect fails to load
            console.warn('Bootstrap multiselect not available, using basic select');
            // Add basic styling to make the dropdown more usable
            this.tagFilterSelect.classList.add('form-control');
            this.tagFilterSelect.style.height = 'auto';
            this.tagFilterSelect.style.minHeight = '38px';
        }
        
        // Add event listener for changes
        this.tagFilterSelect.addEventListener('change', () => {
            // Get selected options
            const selectedTags = Array.from(this.tagFilterSelect.selectedOptions).map(option => option.value.toLowerCase());
            
            // Update current filter state
            this.currentFilters.tags = selectedTags;
            
            // Apply filters
            this.applyFilters();
            
            // Update active filter pills
            this.updateActiveFilterPills();
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
    }
      /**
     * Initialize clear filters button
     * (This method is now a no-op since we've removed the clear filters button)
     */
    initClearFilters() {
        // No-op: Clear filters button has been removed
        return;
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
     * Initialize document click handler to close dropdown when clicking outside
     */
    initDocumentClickHandler() {
        if (typeof $ !== 'undefined') {
            // Remove any existing handler first to prevent duplicates
            $(document).off('click.tagDropdown').on('click.tagDropdown', function(e) {
                // If click is outside the tag filter container, close any open dropdowns
                if (!$(e.target).closest('.tag-filter-container').length && 
                    !$(e.target).closest('.multiselect-container').length) {
                    
                    // Close all open dropdowns
                    $('.tag-filter-container').removeClass('dropdown-open');
                    $('.multiselect-container').css('display', 'none');
                    
                    console.log('Closing all dropdowns due to outside click');
                }
            });
            
            console.log('Document click handler initialized for dropdown closing');
        }
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
        
        // Handle case sensitivity issues with file extensions
        const normalizedPath = imagePath.replace(/\.(png|jpg|jpeg|gif|webp)$/i, match => match.toLowerCase());
        
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
     */
    static getPlaceholderImage(isInSubfolder = false) {
        const basePrefix = isInSubfolder ? '../' : '';
        return `${basePrefix}resources/images/placeholder.jpg`;
    }    /**
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
            
            // Check for case sensitivity issues that might have been missed
            if (/(PNG|JPG|JPEG|GIF|WEBP)$/i.test(imagePath)) {
                console.warn('Possible case sensitivity issue with file extension');
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
