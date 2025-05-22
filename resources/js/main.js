/**
 * Main JavaScript for portfolio website
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize contact form
    initContactForm();
    
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Apply dynamic animations
    initScrollAnimations();
});

/**
 * Initialize contact form submission 
 */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // You would normally send this data to a backend service
            // For now, we'll just log it and show a success message
            console.log('Form submitted:', { name, email, message });
            
            // Show success message
            const formContainer = contactForm.parentElement;
            contactForm.style.display = 'none';
            
            const successMsg = document.createElement('div');
            successMsg.className = 'alert alert-success mt-4';
            successMsg.innerHTML = `
                <h4>Message Sent!</h4>
                <p>Thank you for reaching out, ${name}. I'll get back to you soon.</p>
                <button class="btn btn-sm btn-outline-success mt-2" id="reset-form">Send another message</button>
            `;
            formContainer.appendChild(successMsg);
            
            // Add event listener to reset button
            document.getElementById('reset-form').addEventListener('click', function() {
                contactForm.reset();
                successMsg.remove();
                contactForm.style.display = 'block';
            });
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize scroll-based animations and effects
 */
function initScrollAnimations() {
    // Add active class to nav links on scroll
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                    if (navLink.getAttribute('href') === '#' + sectionId) {
                        navLink.classList.add('active');
                    }
                });
            }
        });
        
        // Add scroll class to header for background change
        const header = document.querySelector('header');
        if (header) {
            if (scrollPosition > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}
