// Test file to check NekoBocc API
// Run this in browser console to test

import { movieAPI } from "./index";

export async function testNekoBocc() {
    console.log("Testing NekoBocc API...");

    try {
        // Test 1: Get release list
        console.log("Test 1: Getting release list...");
        const releases = await movieAPI.getNekoBoccReleaseList(1);
        console.log("Releases:", releases);
        console.log("Number of items:", releases.data.length);

        if (releases.data.length > 0) {
            const firstItem = releases.data[0];
            console.log("First item:", firstItem);
            console.log("First item ID:", firstItem.id);

            // Test 2: Get detail
            console.log("\nTest 2: Getting detail for first item...");
            const detail = await movieAPI.getNekoBoccDetail(firstItem.id);
            console.log("Detail:", detail);

            if (detail) {
                console.log("✅ NekoBocc API is working!");
                console.log("Title:", detail.title);
                console.log(
                    "Download links:",
                    detail.downloadLinks?.length || 0
                );
                console.log("Stream links:", detail.streamLinks?.length || 0);
            } else {
                console.log("❌ Detail returned null");
            }
        } else {
            console.log("❌ No releases found");
        }
    } catch (error) {
        console.error("❌ Error testing NekoBocc:", error);
    }
}

// Auto-run test
testNekoBocc();
