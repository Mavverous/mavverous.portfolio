# Artist Portfolio Website

A fast, fluid, dark-themed portfolio website for showcasing artwork.

## How to Add New Artwork

### Step 1: Add Image Files
1. Add your artwork images to the `resources/images/artwork/` folder.
2. For best results, optimize your images before adding them:
   - Recommended size: 1200px on the longest side
   - File format: .jpg or .png
   - File size: Under 300KB for best performance

### Step 2: Update Gallery Data
1. Open `resources/data/gallery-data.json` in a text editor.
2. Add a new entry to the `artworks` array following this format:
   ```json
   {
     "id": "unique-id",
     "title": "Artwork Title",
     "description": "Medium, Year",
     "category": "category1 category2",
     "imagePath": "resources/images/artwork/your-filename.jpg"
   }
   ```
3. Save the file.

Notes:
- The `id` should be unique for each artwork
- The `category` field can contain multiple categories separated by spaces
- The `imagePath` should be the relative path to your image

## Website Structure
- `index.html`: Main page with featured works
- `pages/gallery.html`: Complete gallery of artwork
- `resources/data/gallery-data.json`: Artwork metadata
- `resources/images/artwork/`: Folder containing all artwork images

## Technical Details
- Uses a component-based architecture for maintainability
- Responsive design with Bootstrap 5
- AOS animations for smooth scrolling effects
- Lightbox for image viewing
