/**
 * Components Loader
 * This script loads reusable HTML components into specified container elements
 */

document.addEventListener('DOMContentLoaded', function() {
    // Determine base path based on current directory level
    const currentPath = window.location.pathname;
    const isSubPage = currentPath.includes('/pages/');
    const basePath = isSubPage ? '../components/' : 'components/';
    
    console.log('Loading components with base path:', basePath);
    console.log('Current path:', currentPath);
    console.log('Is subpage:', isSubPage);
    
    // Load components when the DOM is fully loaded
    loadComponent('nav-container', basePath + 'navbar.html', function() {
        console.log('Navigation loaded successfully');
        // Force navbar script execution again in case it wasn't executed properly
        initializeNavbar(isSubPage);
    });
    loadComponent('footer-container', basePath + 'footer.html');
    
    // Load any page-specific components based on the current page
    loadPageSpecificComponents();
});

/**
 * Loads an HTML component into a specified container element
 * @param {string} containerId - The ID of the container element
 * @param {string} componentPath - The path to the component HTML file
 * @param {Function} callback - Optional callback function to execute after component is loaded
 */
function loadComponent(containerId, componentPath, callback) {
    const container = document.getElementById(containerId);
    
    if (container) {
        fetch(componentPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load component: ${response.status} ${response.statusText}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                
                // Execute any scripts in the loaded component
                const scripts = container.querySelectorAll('script');
                scripts.forEach(script => {
                    const newScript = document.createElement('script');
                    
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    
                    document.body.appendChild(newScript);
                });
                
                // Execute callback if provided
                if (typeof callback === 'function') {
                    callback();
                }
            })
            .catch(error => {
                console.error(`Error loading component "${componentPath}":`, error);
            });
    }
}

/**
 * Loads components specific to the current page based on URL or page ID
 */
/**
 * Initialize navbar links and active states
 * @param {boolean} isSubPage - Whether the current page is in a subfolder
 */
function initializeNavbar(isSubPage) {
    // Get navigation elements
    const brandLink = document.getElementById('brand-link');
    const logoImg = document.querySelector('.logo-img');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!brandLink || !logoImg) {
        console.error('Navbar elements not found. Make sure the navbar is loaded properly.');
        return;
    }
    
    // Set the correct path for the logo
    logoImg.src = isSubPage ? '../resources/images/logo.png' : 'resources/images/logo.png';
    
    // Set the correct home link
    brandLink.href = isSubPage ? '../index.html' : 'index.html';
    
    // Fix navigation links
    navLinks.forEach(link => {
        const pathAttr = link.getAttribute('data-path');
        if (!pathAttr) return;
        
        // Home link
        if (pathAttr === 'index.html') {
            link.href = isSubPage ? '../index.html' : 'index.html';
        } 
        // Gallery link
        else if (pathAttr === 'gallery.html') {
            link.href = isSubPage ? './gallery.html' : 'pages/gallery.html';
        } 
        // Anchor links
        else if (pathAttr.startsWith('#')) {
            link.href = isSubPage ? `../index.html${pathAttr}` : pathAttr;
        }
    });
    
    console.log('Navbar links initialized');
}

function loadPageSpecificComponents() {
    // Get current page filename
    const path = window.location.pathname.toLowerCase();
    const page = path.split("/").pop();
    // Determine base path based on current directory level
    const isSubPage = path.includes('/pages/');
    const basePath = isSubPage ? '../components/' : 'components/';
    
    // Load page-specific components
    switch(page) {
        case 'index.html':
        case '':
            // Home page components
            loadComponent('featured-works-container', basePath + 'featured-works.html', function() {
                // The featured-works.js is loaded by the component itself
                console.log('Featured works component loaded');
            });
            break;
        case 'gallery.html':
            // Gallery page components
            loadComponent('gallery-container', basePath + 'gallery.html');
            break;
        case 'about.html':
            // About page components
            loadComponent('experience-container', basePath + 'experience.html');
            loadComponent('education-container', basePath + 'education.html');
            break;
        // Add more pages as needed
    }
}
