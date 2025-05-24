/**
 * Artwork Detail
 * This script loads and displays details for a specific artwork based on ID parameter
 */

/**
 * Artwork Utilities
 * Helper functions to work with artwork images
 */
if (typeof window.ArtworkUtils === 'undefined') {
    window.ArtworkUtils = class {        /**
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
                
                // IMPORTANT: Do not modify case of file extension for GitHub Pages compatibility
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
        
        /**
         * Get the dimensions of an image
         * @param {string} imagePath - Path to the image file
         * @returns {Promise<string>} - Promise that resolves with dimensions in format "width x height px"
         */
        static getImageDimensions(imagePath) {
            return new Promise((resolve, reject) => {
                // Create a new image object
                const img = new Image();
                
                // Set up event handlers
                img.onload = function() {
                    // Image loaded, resolve with dimensions
                    resolve(`${this.width} x ${this.height} px`);
                };
                
                img.onerror = function() {
                    // Error loading image, resolve with default value
                    console.error('Error loading image for dimension calculation:', imagePath);
                    resolve('Unknown');
                };
                
                // Start loading the image
                img.src = imagePath;
            });
        }
    };
}

class ArtworkDetail {
    constructor(options = {}) {
        this.dataPath = options.dataPath || '../resources/data/gallery-data.json';
        this.detailContainerSelector = options.detailContainerSelector || '#artwork-detail';
        this.relatedContainerSelector = options.relatedContainerSelector || '.related-artworks .row';
        
        this.detailContainer = document.querySelector(this.detailContainerSelector);
        this.relatedContainer = document.querySelector(this.relatedContainerSelector);
        
        // Get artwork ID from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.artworkId = urlParams.get('id');
        
        this.init();
    }
    
    /**
     * Initialize the artwork detail page
     */
    init() {
        if (!this.artworkId) {
            this.showError('No artwork ID specified.');
            return;
        }
        
        this.loadArtworkData()
            .then(data => {
                this.renderArtworkDetail(data);
                this.renderRelatedArtworks(data);
            })
            .catch(error => {
                console.error('Error loading artwork data:', error);
                this.showError();
            });
    }
      /**
     * Load artwork data from JSON file
     * @returns {Promise} - Promise that resolves with artwork data
     */
    loadArtworkData() {
        return fetch(this.dataPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load artwork data: ${response.status} ${response.statusText}`);
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
     * Render artwork details
     * @param {Object} data - Gallery data object containing artworks
     */
    renderArtworkDetail(data) {
        if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
            this.showError('No artworks found in the gallery data.');
            return;
        }
        
        // Find the artwork by ID
        const artwork = data.artworks.find(item => item.id === this.artworkId);
        
        if (!artwork) {
            this.showError(`Artwork with ID ${this.artworkId} not found.`);
            return;
        }
          // Update document title
        document.title = `MAVVEROUS | ${artwork.title}`;
        
        // Update Cusdis comment attributes with artwork data
        const cusdisThread = document.getElementById('cusdis_thread');
        if (cusdisThread) {
            cusdisThread.setAttribute('data-page-id', this.artworkId);
            cusdisThread.setAttribute('data-page-url', window.location.href);
            cusdisThread.setAttribute('data-page-title', artwork.title);
            
            // Reload Cusdis comments with new parameters if Cusdis is already loaded
            if (window.CUSDIS) {
                window.CUSDIS.initial();
            }
        }
        
        // Process image path
        const isInSubfolder = window.location.pathname.includes('/pages/');
        
        // Use the ArtworkUtils class that we defined above
        let imagePath;
        if (typeof window.ArtworkUtils !== 'undefined') {
            imagePath = window.ArtworkUtils.getImagePath(artwork.imagePath, isInSubfolder);
        } else {
            const basePrefix = isInSubfolder ? '../' : '';
            
            if (artwork.imagePath.startsWith('http') || artwork.imagePath.startsWith('/')) {
                imagePath = artwork.imagePath;
            } else {
                // Ensure correct path format
                if (artwork.imagePath.includes('resources/images/artwork/')) {
                    imagePath = `${basePrefix}${artwork.imagePath}`;
                } else {
                    const filename = artwork.imagePath.includes('/') ? 
                        artwork.imagePath.split('/').pop() : 
                        artwork.imagePath;
                    
                    imagePath = `${basePrefix}resources/images/artwork/${filename}`;
                }
            }
        }
        
        console.log('Loading artwork image:', imagePath);
          // Extract tags
        const tags = artwork.tags || [];

        const tagHtml = tags.map(cat => `<span class="artwork-tag">${cat}</span>`).join('');
        
        // Update the detail container with the artwork information
        if (this.detailContainer) {
            this.detailContainer.querySelector('.artwork-image-container img').src = imagePath;
            this.detailContainer.querySelector('.artwork-image-container img').alt = artwork.title;
            
            this.detailContainer.querySelector('.artwork-title').textContent = artwork.title;
            
            // Find the tags container (now under the "Tags:" row)
            const tagsContainer = this.detailContainer.querySelector('.tags');
            if (tagsContainer) {
                tagsContainer.innerHTML = tagHtml;
            }// Update details based on available information
            const detailsRows = this.detailContainer.querySelectorAll('.artwork-details .row');
            const medium = artwork.medium || 'Unknown';
            const date = artwork.yearCreated || artwork.createdDate || artwork.date || 'Unknown';
            
            // Set medium
            if (detailsRows[0]) {
                detailsRows[0].querySelector('.col-8').textContent = medium;
            }
              // Set dimensions - either use the value from JSON or calculate it dynamically
            if (detailsRows[1]) {
                const dimensionsCell = detailsRows[1].querySelector('.col-8');
                if (artwork.dimensions) {
                    // If dimensions are specified in the metadata, use those
                    dimensionsCell.textContent = artwork.dimensions;
                } else {
                    // Otherwise, calculate dimensions dynamically
                    dimensionsCell.textContent = 'Calculating...';
                    if (typeof window.ArtworkUtils !== 'undefined') {
                        window.ArtworkUtils.getImageDimensions(imagePath)
                            .then(dimensions => {
                                dimensionsCell.textContent = dimensions;
                            });
                    }
                }
            }
            
            // Set created date
            if (detailsRows[2]) {
                detailsRows[2].querySelector('.col-8').textContent = date;
            }
              // Set artwork description - can be customized based on your data structure
            const descriptionContainer = this.detailContainer.querySelector('.artwork-description p');
            if (descriptionContainer) {
                if (artwork.fullDescription) {
                    // Use the full description if available
                    descriptionContainer.textContent = artwork.fullDescription;
                } else {                    // Generate a more detailed description based on available metadata
                    const tagLabels = tags.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ');
                    
                    // Format the date for better presentation
                    let formattedDate = date;
                    if (date && !isNaN(date)) {
                        formattedDate = date; // If it's just a year number, keep it as is
                    }
                      // Start with basic description
                    let description = `This ${medium} was created in ${formattedDate}. ` +
                                        `This piece is part of my ${tagLabels} collection and showcases my artistic style.`;
                    
                    // Add dimensions if available in metadata
                    if (artwork.dimensions) {
                        description += ` The artwork's dimensions are ${artwork.dimensions}.`;
                        descriptionContainer.textContent = description;
                    } else {
                        // Calculate dimensions dynamically and update the description later
                        descriptionContainer.textContent = description + " Calculating dimensions...";
                        
                        if (typeof window.ArtworkUtils !== 'undefined') {
                            window.ArtworkUtils.getImageDimensions(imagePath)
                                .then(dimensions => {
                                    descriptionContainer.textContent = description + ` The artwork's dimensions are ${dimensions}.`;
                                });
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Render related artworks (other artworks in the same tag)
     * @param {Object} data - Gallery data object containing artworks
     */    renderRelatedArtworks(data) {
        if (!this.relatedContainer || !data.artworks || !Array.isArray(data.artworks)) {
            console.log("No related container or artwork data available");
            return;
        }
        
        console.log("Starting related artwork search...");
          // Find the current artwork
        const currentArtwork = data.artworks.find(item => item.id === this.artworkId);
        if (!currentArtwork || !currentArtwork.tags || !Array.isArray(currentArtwork.tags)) {
            console.log("No tags available for the current artwork");
            return;
        }
          // Get related artworks using several methods for better recommendations
        const currentTags = currentArtwork.tags;
        const currentYear = currentArtwork.yearCreated;
        
        // Array to store related artworks with their relevance score
        let relatedArtworksWithScores = [];
        
        // First, check for explicitly related artworks if that property exists
        if (currentArtwork.relatedTo && Array.isArray(currentArtwork.relatedTo) && currentArtwork.relatedTo.length > 0) {
            // Add explicitly related artworks with highest score (10)
            currentArtwork.relatedTo.forEach(relatedId => {
                const relatedArtwork = data.artworks.find(a => a.id === relatedId);
                if (relatedArtwork) {
                    relatedArtworksWithScores.push({
                        artwork: relatedArtwork,
                        score: 10 // Highest priority for explicitly related items
                    });
                }
            });
        }
        
        // Then find related artworks by tags and year
        data.artworks.forEach(item => {
            if (item.id === this.artworkId) return; // Skip current artwork
            
            // Skip if already in the related list
            if (relatedArtworksWithScores.some(r => r.artwork.id === item.id)) return;
            
            let score = 0;
              // Score based on tag matches
            if (item.tags && Array.isArray(item.tags)) {
                const itemTags = item.tags;
                const tagMatches = itemTags.filter(cat => currentTags.includes(cat)).length;
                
                // More shared tags = higher score
                score += tagMatches * 2;
                
                // Bonus if at least one tag matches
                if (tagMatches > 0) {
                    score += 1;
                }
            }
            
            // Score based on creation year proximity
            if (currentYear && item.yearCreated) {
                const yearDiff = Math.abs(parseInt(currentYear) - parseInt(item.yearCreated));
                if (yearDiff === 0) {
                    score += 2; // Same year
                } else if (yearDiff === 1) {
                    score += 1; // Adjacent year
                }
            }
            
            // Only include items with some relevance
            if (score > 0) {
                relatedArtworksWithScores.push({ artwork: item, score });
            }
        });        // Sort by relevance score (highest first) and then by year (newest first) if scores are equal
        const relatedArtworks = relatedArtworksWithScores
            .sort((a, b) => {
                // First sort by relevance score
                const scoreDiff = b.score - a.score;
                if (scoreDiff !== 0) return scoreDiff;                // If scores are equal, sort by date (newest first)
                // Use ArtworkUtils if available, otherwise fall back to basic parsing
                let dateA, dateB;
                
                if (typeof window.ArtworkUtils !== 'undefined' && window.ArtworkUtils.parseArtworkDate) {
                    dateA = window.ArtworkUtils.parseArtworkDate(a.artwork).getTime();
                    dateB = window.ArtworkUtils.parseArtworkDate(b.artwork).getTime();
                } else {
                    // Fallback to simpler parsing
                    const dateStrA = a.artwork.createdDate || a.artwork.yearCreated || '';
                    const dateStrB = b.artwork.createdDate || b.artwork.yearCreated || '';
                    dateA = new Date(dateStrA).getTime() || 0;
                    dateB = new Date(dateStrB).getTime() || 0;
                }
                
                return dateB - dateA;
            })
            .map(item => item.artwork)
            .slice(0, 3);
        
        console.log(`Found ${relatedArtworksWithScores.length} related artworks with scores:`, 
            relatedArtworksWithScores.map(item => ({
                id: item.artwork.id,
                title: item.artwork.title, 
                score: item.score,
                tags: item.artwork.tags
            }))
        );
            
        // Clear container
        this.relatedContainer.innerHTML = '';
        
        // Generate related artworks HTML
        if (relatedArtworks.length > 0) {
            const isInSubfolder = window.location.pathname.includes('/pages/');
                relatedArtworks.forEach((artwork, index) => {
                // Get image path using ArtworkUtils
                let imagePath;
                if (typeof window.ArtworkUtils !== 'undefined') {
                    imagePath = window.ArtworkUtils.getImagePath(artwork.imagePath, isInSubfolder);
                } else {
                    // Fallback if ArtworkUtils is not defined
                    const basePrefix = isInSubfolder ? '../' : '';
                    imagePath = `${basePrefix}${artwork.imagePath}`;
                }
                
                const delay = index * 100;
                
                const relatedArtworkHtml = `
                    <div class="col-md-4 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
                        <div class="gallery-card">
                            <a href="artwork-detail.html?id=${artwork.id}">
                                <img src="${imagePath}" class="img-fluid" alt="${artwork.title}">
                                <div class="gallery-overlay">
                                    <div class="gallery-info">
                                        <h5>${artwork.title}</h5>
                                        <p>${artwork.description}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
                
                this.relatedContainer.innerHTML += relatedArtworkHtml;
            });
            
            // Refresh AOS animations
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }        } else {
            // Show a message when no related artworks are found
            this.relatedContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info" role="alert">
                        <i class="fas fa-info-circle me-2"></i>
                        No related artworks found. This piece is truly one of a kind!
                    </div>
                </div>
            `;
            console.log("No related artworks found to display");
        }
    }
    
    /**
     * Show error message in detail container
     * @param {string} message - Error message to display
     */
    showError(message = 'Unable to load artwork details. Please try again later.') {
        if (this.detailContainer) {
            this.detailContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        ${message}
                    </div>
                </div>
            `;
        }
    }
}

/**
 * The artwork-detail.js file now includes automatic image dimension calculation:
 *
 * 1. When an artwork is displayed, if no 'dimensions' property is provided in the JSON:
 *    - The system will load the image and calculate its dimensions
 *    - The dimensions will be displayed in the artwork details section
 *    - The description will be updated with the calculated dimensions
 *
 * 2. The related artworks system has been enhanced to:
 *    - Use explicit relationships defined in the 'relatedTo' property
 *    - Score artworks based on tag overlap and creation year proximity
 *    - Sort and display the most relevant related artworks first
 *
 * You can remove the 'dimensions' property from artwork entries in the gallery-data.json
 * file and they will be calculated automatically when displayed.
 */

// Initialize the artwork detail page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the artwork detail page
    if (document.querySelector('#artwork-detail')) {
        console.log('Initializing artwork detail page...');
        const isInSubfolder = window.location.pathname.includes('/pages/');
        const dataPath = isInSubfolder ? '../resources/data/gallery-data.json' : 'resources/data/gallery-data.json';
        
        try {
            // Initialize the artwork detail page
            const detail = new ArtworkDetail({
                dataPath: dataPath,
                detailContainerSelector: '#artwork-detail',
                relatedContainerSelector: '.related-artworks .row'
            });
        } catch (error) {
            console.error('Error initializing artwork detail page:', error);
        }
    }
});
