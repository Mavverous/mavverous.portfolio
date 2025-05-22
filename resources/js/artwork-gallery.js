/**
 * Gallery Loader
 * This script loads gallery images from a local folder via a data file
 */

// Check if ArtworkGallery is already defined to prevent duplicate class declarations
if (typeof window.ArtworkGallery === 'undefined') {
    window.ArtworkGallery = class {
    constructor(options = {}) {
        this.dataPath = options.dataPath || '../resources/data/gallery-data.json';
        this.containerSelector = options.containerSelector || '.gallery-grid';
        this.galleryContainer = document.querySelector(this.containerSelector);
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        this.init();
    }
    
    /**
     * Initialize the gallery
     */
    init() {
        this.loadGalleryData()
            .then(data => {
                this.renderGallery(data);
                this.initFilters();
                this.initLightbox();
            })
            .catch(error => {
                console.error('Error loading gallery data:', error);
                this.showError();
            });
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
     * Render gallery items from data
     * @param {Object} data - Gallery data object
     */
    renderGallery(data) {
        if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
            this.showError('No artworks found in the gallery data.');
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
     * Create a gallery item element
     * @param {Object} artwork - Artwork data object
     * @param {number} delay - Delay for animation
     * @returns {HTMLElement} - Gallery item element
     */
    createGalleryItem(artwork, delay = 0) {
        const categories = artwork.category ? artwork.category.toLowerCase() : '';
        const isInSubfolder = window.location.pathname.includes('/pages/');
        
        // Process image paths
        const fullImagePath = ArtworkUtils.getImagePath(artwork.imagePath || artwork.fullImageUrl || artwork.thumbnailUrl, isInSubfolder);
        const thumbnailPath = ArtworkUtils.getImagePath(artwork.thumbnailUrl || artwork.imagePath || artwork.fullImageUrl, isInSubfolder);
        const placeholderPath = ArtworkUtils.getPlaceholderImage(isInSubfolder);
        
        // Create gallery item container
        const itemContainer = document.createElement('div');
        itemContainer.className = `col-lg-4 col-md-6 mb-4 gallery-item ${categories}`;
          // Create gallery card
        const cardHtml = `
            <div class="gallery-card" data-aos="fade-up" data-aos-delay="${delay}">
                <a href="${isInSubfolder ? 'artwork-detail.html?id=' + artwork.id : 'pages/artwork-detail.html?id=' + artwork.id}">
                    <img src="${thumbnailPath}" class="img-fluid" alt="${artwork.title}" 
                         onerror="this.onerror=null; this.src='${placeholderPath}';">
                    <div class="gallery-overlay">
                        <div class="gallery-info">
                            <h5>${artwork.title}</h5>
                            <p>${artwork.description}</p>
                        </div>
                    </div>
                </a>
            </div>
        `;
        
        // Set the HTML of the container
        itemContainer.innerHTML = cardHtml;
        return itemContainer;
    }
    
    /**
     * Initialize filter buttons
     */
    initFilters() {
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
                
                // Filter gallery items
                const galleryItems = document.querySelectorAll('.gallery-item');
                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.classList.contains(filterValue)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }
      /**
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
     */
    static getImagePath(imagePath, isInSubfolder = false) {
        // Check if path is empty
        if (!imagePath) {
            console.error('Empty image path provided');
            return '';
        }
        
        // If it's already a complete URL or absolute path, return as is
        if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
            return imagePath;
        }
        
        // If it's a relative path, adjust based on current location
        const basePrefix = isInSubfolder ? '../' : '';
        
        // If the path doesn't already include resources/images/artwork, add it
        if (!imagePath.includes('resources/images/artwork/')) {
            // Ensure we're not duplicating paths
            const filename = imagePath.includes('/') ? 
                imagePath.split('/').pop() : 
                imagePath;
            
            return `${basePrefix}resources/images/artwork/${filename}`;
        }
        
        // Already has the correct path format
        return `${basePrefix}${imagePath}`;
    }
    
    /**
     * Get the default placeholder image path
     * @param {boolean} isInSubfolder - Whether the current page is in a subfolder
     * @returns {string} - Path to the placeholder image
     */
    static getPlaceholderImage(isInSubfolder = false) {
        const basePrefix = isInSubfolder ? '../' : '';
        return `${basePrefix}resources/images/placeholder.jpg`;
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
