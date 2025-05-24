/**
 * Featured Works Loader
 * This script loads featured works from the gallery data
 */

// Variable to track retry attempts
// Using window variables to avoid redeclaration issues
window.retryCount = window.retryCount || 0;
window.MAX_RETRIES = window.MAX_RETRIES || 3;

// Wait a short period before initializing to ensure other scripts are loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure all dependencies are loaded
    setTimeout(initFeaturedWorks, 200);
});

/**
 * Initialize the featured works section
 */
function initFeaturedWorks() {
    console.log('Initializing featured works, attempt #', window.retryCount + 1);
    
    // Get the container - try both IDs as we have different containers in different files
    const featuredWorksContainer = document.getElementById('featured-works-container');

    if (!featuredWorksContainer) {
        console.error('Featured works container not found');
        return;
    }
    else {
        console.log('Featured works container found:', featuredWorksContainer);
    }

    // Show loading spinner if the helper is available
    if (window.featuredWorksHelpers && window.featuredWorksHelpers.showLoadingSpinner) {
        window.featuredWorksHelpers.showLoadingSpinner();
    }        // Check if ArtworkUtils is available, if not retry after a delay
    if (typeof ArtworkUtils === 'undefined') {
        console.warn('ArtworkUtils not available yet, waiting...');
        if (window.retryCount < window.MAX_RETRIES) {
            window.retryCount++;
            setTimeout(initFeaturedWorks, 500 * window.retryCount); // Exponential backoff
            return;
        } else {
            // Show error after max retries
            console.error('ArtworkUtils not available after max retries');
            if (window.featuredWorksHelpers && window.featuredWorksHelpers.showError) {
                window.featuredWorksHelpers.showError('Failed to load dependencies. Please refresh the page.');
            }
            return;
        }
    }
      // Reset retry count once we have ArtworkUtils
    window.retryCount = 0;

    // Determine if we're on the main page or in a subfolder
    const isInSubfolder = window.location.pathname.includes('/pages/');
    const dataPath = isInSubfolder ? '../resources/data/gallery-data.json' : 'resources/data/gallery-data.json';
    const imagePlaceholder = isInSubfolder ? '../resources/images/placeholder.jpg' : 'resources/images/placeholder.jpg';

    // Log for debugging
    console.log('Loading gallery data from:', dataPath);

    // Use fetch with a timeout
    const fetchPromise = fetch(dataPath);
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out')), 5000)
    );
    
    // Race between fetch and timeout
    Promise.race([fetchPromise, timeoutPromise])
        .then(response => {
            console.log('Gallery data response:', response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Failed to load gallery data: ${response.status} ${response.statusText}`);
            }
            return response.text().then(text => {
                try {
                    // Remove any comment lines (starts with //) - these break JSON parsing
                    const cleanText = text.split('\n')
                        .filter(line => !line.trim().startsWith('//'))
                        .join('\n');
                    
                    // For debugging
                    window.galleryDataText = cleanText;
                    
                    // Try to parse the cleaned JSON
                    return JSON.parse(cleanText);
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                    console.log('Raw JSON text:', text);
                    throw new Error('Failed to parse gallery data JSON');
                }
            });
        })        .then(data => {
            console.log('Gallery data loaded:', data);
            
            // Clear safety timeout if it exists
            if (window.featuredWorksHelpers && window.featuredWorksHelpers.clearSafetyTimeout) {
                window.featuredWorksHelpers.clearSafetyTimeout();
            }
            
            if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
                const emptyMessage = `
                    <div class="col-12 text-center">
                        <p>No featured works available. Add some artwork through the Gallery Manager.</p>
                    </div>
                `;
                
                // Use safer DOM manipulation
                while (featuredWorksContainer.firstChild) {
                    featuredWorksContainer.removeChild(featuredWorksContainer.firstChild);
                }
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = emptyMessage;
                while (tempDiv.firstChild) {
                    featuredWorksContainer.appendChild(tempDiv.firstChild);
                }
                
                return;
            }// Sort artworks by newest first
            const sortedArtworks = [...data.artworks].sort((a, b) => {
                // Use the ArtworkUtils class to parse dates if available
                if (typeof ArtworkUtils !== 'undefined' && ArtworkUtils.parseArtworkDate) {
                    const dateA = ArtworkUtils.parseArtworkDate(a).getTime();
                    const dateB = ArtworkUtils.parseArtworkDate(b).getTime();
                    return dateB - dateA; // Descending order by date (newest first)
                } else {
                    // Fallback to simpler parsing if ArtworkUtils isn't available
                    const dateStrA = a.createdDate || a.yearCreated || '';
                    const dateStrB = b.createdDate || b.yearCreated || '';
                    const dateA = new Date(dateStrA).getTime() || 0;
                    const dateB = new Date(dateStrB).getTime() || 0;
                    return dateB - dateA; // Descending order by date (newest first)
                }
            });
            
            // Get only the first 3 artworks for featured works section
            const featuredWorks = sortedArtworks.slice(0, 3);
            featuredWorksContainer.innerHTML = '';
            
            // Create featured work cards
            featuredWorks.forEach((artwork, index) => {
                const delay = index * 100;
                const detailPath = isInSubfolder ? `artwork-detail.html?id=${artwork.id}` : `pages/artwork-detail.html?id=${artwork.id}`;
                
                // Create tags
                const categories = artwork.tags;
                let tagsHtml = '';
                
                categories.forEach(tag => {
                    if (tag) {
                        tagsHtml += `<span class="tag">${tag}</span>`;
                    }
                });                  // Process image paths for local images
                const processImagePath = path => {
                    // Check if we can access the ArtworkUtils class
                    if (typeof ArtworkUtils !== 'undefined') {
                        return ArtworkUtils.getImagePath(path, isInSubfolder);
                    } else {
                        // Fallback if ArtworkUtils isn't available
                        const basePrefix = isInSubfolder ? '../' : '';
                        
                        // If path is already a complete URL
                        if (path && (path.startsWith('http') || path.startsWith('/'))) {
                            return path;
                        }
                        
                        // Construct path to artwork folder
                        const filename = path && path.includes('/') ? 
                            path.split('/').pop() : 
                            (path || 'placeholder.jpg');
                            
                        return `${basePrefix}resources/images/artwork/${filename}`;
                    }
                };
                
                // Process image paths
                const thumbnailUrl = processImagePath(artwork.thumbnailUrl || artwork.imagePath);
                
                console.log('Processing image URLs:', {
                    processed: thumbnailUrl
                });
                
                const card = document.createElement('div');
                card.className = 'col-lg-4 col-md-6';
                card.setAttribute('data-aos', 'fade-up');
                if (delay > 0) {
                    card.setAttribute('data-aos-delay', delay);
                }
                  card.innerHTML = `
                    <div class="project-card" onclick="window.location.href='${detailPath}'">
                        <img src="${thumbnailUrl}" class="card-img-top" alt="${artwork.title}"
                             onerror="this.onerror=null; this.src='${imagePlaceholder}';">
                        <div class="card-body">
                            <h5 class="card-title">${artwork.title}</h5>
                            <p class="card-text">${artwork.createdDate}</p>
                            <div class="tags">
                                ${tagsHtml}
                            </div>
                        </div>
                    </div>
                `;                console.log('Container:', featuredWorksContainer);
                console.log('Card:', card);
                
                try {
                    // Safely append the card with error handling
                    if (featuredWorksContainer && card) {
                        featuredWorksContainer.appendChild(card);
                        
                        // Double-check if the card was successfully added
                        if (featuredWorksContainer.contains(card)) {
                            console.log('Card appended successfully:', card);
                        } else {
                            // Try another method if direct appendChild fails
                            console.warn('Direct appendChild failed, trying innerHTML method');
                            
                            // Create a temporary container
                            const cardContainer = document.createElement('div');
                            cardContainer.className = card.className;
                            cardContainer.innerHTML = card.innerHTML;
                            
                            // Try appending the new container
                            featuredWorksContainer.appendChild(cardContainer);
                        }
                    } else {
                        throw new Error('Container or card is null');
                    }
                } catch (error) {
                    console.error('Error appending card to container:', error);
                }

                console.log('Featured work card created:', {
                    title: artwork.title,
                    thumbnailUrl: thumbnailUrl,
                    detailPath: detailPath
                });
            });
              // Refresh AOS animations if available
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
            
            // Add a class to indicate successful loading
            featuredWorksContainer.classList.add('loaded');
            console.log('Featured works loaded successfully');
        })
        .catch(error => {
            console.error('Error loading featured works:', error);
            
            // Use the helper function if available
            if (window.featuredWorksHelpers && window.featuredWorksHelpers.showError) {
                window.featuredWorksHelpers.showError('Unable to load featured works. Please try again.');
                return;
            }
            
            // Fallback if helper isn't available
            // Use safer DOM manipulation
            while (featuredWorksContainer.firstChild) {
                featuredWorksContainer.removeChild(featuredWorksContainer.firstChild);
            }
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'col-12 text-center';
            errorDiv.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Unable to load featured works. Please check the console for details.
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary" id="retry-featured-works">
                        <i class="fas fa-sync-alt me-2"></i> Try Again
                    </button>
                </div>
            `;
            
            featuredWorksContainer.appendChild(errorDiv);
              // Add event listener for retry button
            const retryButton = document.getElementById('retry-featured-works');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    // Reset the retryCount
                    window.retryCount = 0;
                    initFeaturedWorks();
                });
            }
        });
}
