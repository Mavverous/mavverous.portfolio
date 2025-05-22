/**
 * Featured Works Loader
 * This script loads featured works from the gallery data
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get the container - try both IDs as we have different containers in different files
    const featuredWorksContainer = document.getElementById('featured-works-container') || 
                                 document.getElementById('featured-works-inner');
    
    console.log('Featured works script loaded, container found:', !!featuredWorksContainer);
    if (!featuredWorksContainer) return;

    // Determine if we're on the main page or in a subfolder
    const isInSubfolder = window.location.pathname.includes('/pages/');
    const dataPath = isInSubfolder ? '../resources/data/gallery-data.json' : 'resources/data/gallery-data.json';
    const imagePlaceholder = isInSubfolder ? '../resources/images/placeholder.jpg' : 'resources/images/placeholder.jpg';
      // Log for debugging
    console.log('Loading gallery data from:', dataPath);
      // Load gallery data
    fetch(dataPath)
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
                    
                    console.log('Cleaned JSON text:', cleanText);
                    
                    // Try to parse the cleaned JSON
                    return JSON.parse(cleanText);
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                    console.log('Raw JSON text:', text);
                    throw new Error('Failed to parse gallery data JSON');
                }
            });
        })
        .then(data => {
            console.log('Gallery data loaded:', data);
            
            if (!data.artworks || !Array.isArray(data.artworks) || data.artworks.length === 0) {
                featuredWorksContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <p>No featured works available. Add some artwork through the Gallery Manager.</p>
                    </div>
                `;
                return;
            }
            
            // Get only the first 3 artworks for featured works section
            const featuredWorks = data.artworks.slice(0, 3);
            featuredWorksContainer.innerHTML = '';
            
            // Create featured work cards
            featuredWorks.forEach((artwork, index) => {
                const delay = index * 100;
                const detailPath = isInSubfolder ? `artwork-detail.html?id=${artwork.id}` : `pages/artwork-detail.html?id=${artwork.id}`;
                
                // Create tags from categories
                const categories = artwork.category.split(' ');
                let tagsHtml = '';
                
                categories.forEach(category => {
                    if (category) {
                        tagsHtml += `<span class="tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>`;
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
                const fullImageUrl = processImagePath(artwork.fullImageUrl || artwork.imagePath || artwork.thumbnailUrl);
                
                console.log('Processing image URLs:', {
                    original: artwork.thumbnailUrl,
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
                            <div class="tags">
                                ${tagsHtml}
                            </div>
                            <p class="card-text">${artwork.description}</p>
                        </div>
                    </div>
                `;
                
                featuredWorksContainer.appendChild(card);
            });
            
            // Refresh AOS animations if available
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }        })
        .catch(error => {
            console.error('Error loading featured works:', error);
            featuredWorksContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-warning" role="alert">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Unable to load featured works. Please check the console for details.
                    </div>
                    <div class="mt-3 text-start bg-light p-3 rounded" style="max-height: 200px; overflow: auto">
                        <pre class="small text-danger">${error.toString()}</pre>
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">Try Again</button>
                    </div>
                </div>
            `;
        });
});
