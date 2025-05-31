/**
 * Commission Form Handler
 * 
 * This script handles the commission form submission process
 * and formats the data for email delivery
 */

document.addEventListener("DOMContentLoaded", function() {
    // Show/hide other type field based on selection
    const commissionTypeSelect = document.getElementById('commission-type');
    const otherTypeContainer = document.getElementById('other-type-container');
    
    if (commissionTypeSelect) {
        commissionTypeSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherTypeContainer.style.display = 'block';
            } else {
                otherTypeContainer.style.display = 'none';
            }
        });
    }
    
    // Show/hide other style field based on selection
    const styleSelect = document.getElementById('style');
    const otherStyleContainer = document.getElementById('other-style-container');
    
    if (styleSelect) {
        styleSelect.addEventListener('change', function() {
            if (this.value === 'other') {
                otherStyleContainer.style.display = 'block';
            } else {
                otherStyleContainer.style.display = 'none';
            }
        });
    }
    
    // Format the submission message
    const commissionForm = document.getElementById('commission-form');
    if (commissionForm) {
        commissionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Build a formatted message from the form fields
            const formData = new FormData(commissionForm);
            
            // Personal Information
            let name = formData.get('name');
            let email = formData.get('email');
            let discord = formData.get('discord') || 'Not provided';
            
            // Commission Details
            let commissionType = formData.get('commission-type');
            if (commissionType === 'other') {
                commissionType = formData.get('other-type') || 'Other';
            }
            
            let artStyle = formData.get('style');
            if (artStyle === 'other') {
                artStyle = formData.get('other-style') || 'Other';
            }
            
            let deadline = formData.get('deadline') || 'Flexible';
            let budget = formData.get('budget');
            
            // Project Description
            let projectTitle = formData.get('project-title');
            let projectDescription = formData.get('project-description');
            let referenceLinksText = formData.get('reference-links') || 'None provided';
            let specialRequirements = formData.get('special-requirements') || 'None provided';
            
            // Additional Information
            let foundThrough = formData.get('found-through') || 'Not specified';
              // Create a well-structured message
            let messageBody = `=== COMMISSION REQUEST: ${projectTitle} ===\n\n`;
            
            messageBody += `--- PERSONAL INFORMATION ---\n`;
            messageBody += `Name: ${name}\n`;
            messageBody += `Email: ${email}\n`;
            messageBody += `Discord: ${discord}\n\n`;
            
            messageBody += `--- COMMISSION DETAILS ---\n`;
            messageBody += `Type: ${commissionType}\n`;
            messageBody += `Style: ${artStyle}\n`;
            messageBody += `Deadline: ${deadline}\n`;
            messageBody += `Budget: ${budget}\n\n`;
            
            messageBody += `--- PROJECT DESCRIPTION ---\n`;
            messageBody += `Title: ${projectTitle}\n`;
            messageBody += `Description: ${projectDescription}\n\n`;
            messageBody += `Special Requirements: ${specialRequirements}\n\n`;
            
            messageBody += `--- REFERENCE IMAGES & LINKS ---\n`;
            if (referenceLinksText !== 'None provided') {
                // Format each link on its own line
                const links = referenceLinksText.split('\n')
                    .map(link => link.trim())
                    .filter(link => link);
                
                links.forEach((link, index) => {
                    messageBody += `[${index + 1}] ${link}\n`;
                    
                    // Create hidden inputs for each reference image/link
                    if (link) {
                        const refField = document.createElement('input');
                        refField.type = 'hidden';
                        refField.name = `reference_${index + 1}`;
                        refField.value = link;
                        commissionForm.appendChild(refField);
                    }
                });
                
                // Add a note for reference images
                messageBody += `\nPlease see the reference links above. If they're images, you should be able to click/copy them.\n`;
            } else {
                messageBody += 'No reference links provided\n';
            }
            
            messageBody += `\n--- ADDITIONAL INFORMATION ---\n`;
            messageBody += `Found Through: ${foundThrough}\n`;
            
            // Add the message content to the form
            let messageField = document.createElement('input');
            messageField.type = 'hidden';
            messageField.name = 'message';
            messageField.value = messageBody;
            commissionForm.appendChild(messageField);
            
            // Add a plain text version of references as a separate field
            if (referenceLinksText !== 'None provided') {
                let referencesField = document.createElement('input');
                referencesField.type = 'hidden';
                referencesField.name = 'reference_links_raw';
                referencesField.value = referenceLinksText;
                commissionForm.appendChild(referencesField);
            }
            
            // Submit the form
            commissionForm.submit();
        });
    }
});
