/**
 * Navbar Fixer
 * This script ensures navbar links work even if the dynamic approaches fail
 */

document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to make sure all other scripts have run
    setTimeout(function() {
        console.log('Running navbar fixer...');
        
        // Function to fix a specific link
        function fixNavLink(selector, href) {
            const link = document.querySelector(selector);
            if (link && (!link.href || link.href === '#' || link.href.endsWith('#'))) {
                console.log('Fixing broken link:', selector);
                link.href = href;
            }
        }
        
        // Get current path to determine if we're in a subpage
        const currentPath = window.location.pathname.toLowerCase();
        const isSubPage = currentPath.includes('/pages/');
        const logoPath = isSubPage ? '../resources/images/logo.png' : 'resources/images/logo.png';
        
        // Fix logo image
        const logoImg = document.querySelector('.logo-img');
        if (logoImg) {
            logoImg.src = logoPath;
        }
        
        // Fix navbar brand link
        const brandLink = document.querySelector('.navbar-brand');
        if (brandLink) {
            brandLink.href = isSubPage ? '../index.html' : 'index.html';
        }
        
        // Fix all navigation links
        fixNavLink('.nav-link.home-link', isSubPage ? '../index.html' : 'index.html');
        fixNavLink('.nav-link.gallery-link', isSubPage ? './gallery.html' : 'pages/gallery.html');
        
        if (isSubPage) {
            // Fix about and contact links when in subpages
            fixNavLink('.nav-link.about-link', '../index.html#about');
            fixNavLink('.nav-link.contact-link', '../index.html#contact');
        } else {
            // Fix about and contact links when on main page
            fixNavLink('.nav-link.about-link', '#about');
            fixNavLink('.nav-link.contact-link', '#contact');
        }
        
        console.log('Navbar links fixed');
    }, 1000); // Wait 1 second to ensure other scripts have executed
});
