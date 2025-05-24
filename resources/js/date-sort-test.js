/**
 * Date Sorting Test Script
 * This file tests the date sorting functionality for artwork.
 * Use this in your browser console to verify date sorting is working correctly.
 */

// Function to test date parsing
function testDateParsing() {
    console.group('🧪 Testing Date Parsing Logic');
    
    const testCases = [
        { title: "Test 1", createdDate: "1/1/2023" },
        { title: "Test 2", createdDate: "12/31/2023" },
        { title: "Test 3", createdDate: "1/1/2024" },
        { title: "Test 4", yearCreated: "2022" },
        { title: "Test 5", createdDate: "2021" },
        { title: "Test 6" } // No date
    ];
    
    console.log('📋 Test Cases:');
    testCases.forEach(test => {
        console.log(`${test.title}: ${test.createdDate || test.yearCreated || 'No date'}`);
    });
    
    console.log('\n📊 Parsed Dates:');
    testCases.forEach(test => {
        const parsedDate = ArtworkUtils.parseArtworkDate(test);
        console.log(`${test.title}: ${parsedDate.toLocaleDateString()} (timestamp: ${parsedDate.getTime()})`);
    });
    
    console.log('\n🔄 Sorted by Newest:');
    const newestFirst = [...testCases].sort((a, b) => {
        const dateA = ArtworkUtils.parseArtworkDate(a).getTime();
        const dateB = ArtworkUtils.parseArtworkDate(b).getTime();
        return dateB - dateA;
    });
    
    newestFirst.forEach(test => {
        console.log(`${test.title}: ${test.createdDate || test.yearCreated || 'No date'}`);
    });
    
    console.log('\n🔄 Sorted by Oldest:');
    const oldestFirst = [...testCases].sort((a, b) => {
        const dateA = ArtworkUtils.parseArtworkDate(a).getTime();
        const dateB = ArtworkUtils.parseArtworkDate(b).getTime();
        return dateA - dateB;
    });
    
    oldestFirst.forEach(test => {
        console.log(`${test.title}: ${test.createdDate || test.yearCreated || 'No date'}`);
    });
    
    console.groupEnd();
}

// Function to test actual gallery data
function testGalleryDataSorting() {
    if (typeof window.ArtworkGallery === 'undefined') {
        console.error('ArtworkGallery class not available');
        return;
    }
    
    // Try to get the gallery instance if possible
    const galleryInstance = window.galleryInstance;
    
    if (!galleryInstance || !galleryInstance.allArtworks) {
        console.error('Cannot access gallery artwork data');
        return;
    }
    
    console.group('🖼️ Testing Gallery Data Sorting');
    
    const artworks = galleryInstance.allArtworks;
    console.log(`Found ${artworks.length} artworks in gallery data`);
    
    console.log('\n📅 Date Values in Gallery Data:');
    artworks.forEach(artwork => {
        console.log(`${artwork.title}: createdDate=${artwork.createdDate}, yearCreated=${artwork.yearCreated}`);
    });
    
    console.log('\n🔄 Sorted by Newest:');
    const newestFirst = galleryInstance.sortArtworks([...artworks], 'newest');
    newestFirst.forEach(artwork => {
        const parsedDate = ArtworkUtils.parseArtworkDate(artwork);
        console.log(`${artwork.title}: ${artwork.createdDate || artwork.yearCreated || 'No date'} (${parsedDate.toLocaleDateString()})`);
    });
    
    console.log('\n🔄 Sorted by Oldest:');
    const oldestFirst = galleryInstance.sortArtworks([...artworks], 'oldest');
    oldestFirst.forEach(artwork => {
        const parsedDate = ArtworkUtils.parseArtworkDate(artwork);
        console.log(`${artwork.title}: ${artwork.createdDate || artwork.yearCreated || 'No date'} (${parsedDate.toLocaleDateString()})`);
    });
    
    console.groupEnd();
}

// Export global test functions
window.testDateParsing = testDateParsing;
window.testGalleryDataSorting = testGalleryDataSorting;

console.log('✅ Date sorting test script loaded. Run testDateParsing() or testGalleryDataSorting() to test functionality.');
