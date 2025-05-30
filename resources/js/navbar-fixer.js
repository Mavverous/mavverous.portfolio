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
          // Fix logo image - try both classes
        const logoImg = document.querySelector('.logo-img') || document.querySelector('.logo');
        if (logoImg) {
            console.log('Found and fixing logo image:', logoPath);
            logoImg.src = logoPath;
        } else {
            console.error('Logo image not found');
        }
          // Fix navbar brand link
        const brandLink = document.querySelector('.navbar-brand');
        if (brandLink) {
            brandLink.href = isSubPage ? '../' : '/';
            console.log('Fixed navbar brand link:', brandLink.href);
        }
          // Fix all navigation links
        fixNavLink('.nav-link.home-link', isSubPage ? '../' : '/');
        
        // Try to find gallery link with both class names (works-link or gallery-link)
        fixNavLink('.nav-link.gallery-link', isSubPage ? './gallery.html' : 'pages/gallery.html');
        fixNavLink('.nav-link.works-link', isSubPage ? './gallery.html' : 'pages/gallery.html');
          if (isSubPage) {
            // Fix about and contact links when in subpages
            fixNavLink('.nav-link.about-link', '../#about');
            fixNavLink('.nav-link.contact-link', '../#contact');
        } else {
            // Fix about and contact links when on main page
            fixNavLink('.nav-link.about-link', '#about');
            fixNavLink('.nav-link.contact-link', '#contact');
        }
        
        console.log('Navbar links fixed');
    }, 1000); // Wait 1 second to ensure other scripts have executed
});
