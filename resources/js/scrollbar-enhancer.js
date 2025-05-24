/**
 * Scrollbar Enhancement Script
 * Adds interactive effects to the tag filter scrollbar
 */

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for the tag filter to initialize
        setTimeout(enhanceScrollbars, 1500);
        
        // Also listen for the tagspopulated event if available
        document.addEventListener('tagspopulated', enhanceScrollbars);
    });
    
    function enhanceScrollbars() {
        // Get all tag grids
        const tagGrids = document.querySelectorAll('.tag-grid');
        
        tagGrids.forEach(grid => {
            // Add class to initially hide scrollbar until hover (optional)
            // Uncomment this if you want scrollbars to only show on hover
            // grid.classList.add('hide-scrollbar');
            
            // Add scroll indicator when the grid is scrollable
            function updateScrollIndicator() {
                // Check if the content is scrollable
                const isScrollable = grid.scrollHeight > grid.clientHeight;
                
                if (isScrollable) {
                    // Add a class to indicate it's scrollable
                    grid.classList.add('is-scrollable');
                    
                    // Update indicator opacity based on scroll position
                    const scrollPercentage = grid.scrollTop / (grid.scrollHeight - grid.clientHeight);
                    
                    // Add "bottom reached" class when scrolled to bottom
                    if (scrollPercentage > 0.95) {
                        grid.classList.add('bottom-reached');
                    } else {
                        grid.classList.remove('bottom-reached');
                    }
                } else {
                    grid.classList.remove('is-scrollable');
                }
            }
            
            // Initial check
            updateScrollIndicator();
            
            // Update on scroll
            grid.addEventListener('scroll', updateScrollIndicator);
            
            // Update on window resize
            window.addEventListener('resize', updateScrollIndicator);
            
            // Add smooth scrolling helper
            grid.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    // Add some animation when scrolling
                    grid.style.scrollBehavior = 'smooth';
                    
                    // Reset after a short delay
                    setTimeout(() => {
                        grid.style.scrollBehavior = 'auto';
                    }, 500);
                }
            });
        });
    }
})();
