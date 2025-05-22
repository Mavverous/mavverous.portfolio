/**
 * Card Effects - Simple hover effect for featured work cards
 * Creates a clean tilt-up effect and reflection for portfolio cards
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for all DOM elements to be fully loaded and processed
    setTimeout(initCardEffects, 500);
});

function initCardEffects() {
    console.log('Initializing card effects...');    // Apply tilt effect to all cards (project and gallery)
    const allCards = document.querySelectorAll('.project-card, .gallery-card');
    console.log(`Found ${allCards.length} cards (project and gallery cards)`);
    
    if (allCards.length === 0) {
        // If no cards found, try again later
        console.log('No cards found, will try again in 1 second');
        console.log('Checking for gallery container:', document.querySelector('#gallery-container'));
        console.log('Gallery container HTML:', document.querySelector('#gallery-container')?.innerHTML);
        setTimeout(initCardEffects, 1000);
        return;
    }
    
    // If cards were found, log to confirm
    console.log('Cards found! Applying effects to:', allCards);
      // Detect touch devices
    const isTouchDevice = () => {
        return ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0) ||
               (navigator.msMaxTouchPoints > 0);
    };
    
    // Skip the effect on touch devices
    if (isTouchDevice()) {
        console.log('Touch device detected, disabling effects');
        return;
    }
      allCards.forEach((card) => {
        // Handle mouse enter - apply simple tilt effect
        card.addEventListener('mouseenter', function() {
            console.log('Card hover - applying simple tilt effect');
              // Apply the hover class that will trigger CSS transitions
            card.classList.add('card-hover');
            
            // Different transform effects based on card type
            const isGalleryCard = card.classList.contains('gallery-card');
            
            if (isGalleryCard) {
                // Gallery cards get minimal transform - just a slight upward movement without reflection
                card.style.transform = 'translateY(-5px)';
                // No reflection effect for gallery cards
            } else {
                // Featured works cards get the full effect with perspective and reflection
                card.classList.add('reflection-active');
                card.style.transform = 'translateY(-10px) perspective(1000px) rotateX(5deg)';
                
                // Set fixed reflection position only for featured works
                card.style.setProperty('--reflection-shift-x', '0%');
                card.style.setProperty('--reflection-shift-y', '0%');
                card.style.setProperty('--reflection-brightness', '1.2');
            }
            
            // Add subtle box shadow glow
            card.style.boxShadow = 'var(--box-shadow-hover), 0 0 20px rgba(108, 189, 163, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1)';
        });        // Handle mouse leave - remove effects
        card.addEventListener('mouseleave', function() {
            console.log('Card leave - removing effects');
            
            // Remove hover classes
            card.classList.remove('card-hover');
            card.classList.remove('reflection-active');
            
            // Reset transform completely
            card.style.transform = '';
            
            // Reset shadow completely
            card.style.boxShadow = '';
            
            // Reset any custom properties
            card.style.setProperty('--reflection-shift-x', '0%');
            card.style.setProperty('--reflection-shift-y', '0%');
            card.style.setProperty('--reflection-brightness', '1');
        });
    });
}
