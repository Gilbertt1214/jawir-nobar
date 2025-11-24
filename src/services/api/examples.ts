// Example usage of Nekopoi.care API
// This file demonstrates how to use the new Nekopoi.care integration

import { movieAPI } from "./index";

// Example 1: Get latest hentai from nekopoi.care
export async function exampleGetLatest() {
    try {
        const latest = await movieAPI.getNekopoiCareLatest(1);
        console.log("Latest from Nekopoi.care:", latest);
        return latest;
    } catch (error) {
        console.error("Error getting latest:", error);
    }
}

// Example 2: Get detail by slug
export async function exampleGetDetail() {
    try {
        // Slug example: "hentai-title-episode-1-subtitle-indonesia"
        const detail = await movieAPI.getNekopoiCareDetail("example-slug");
        console.log("Detail:", detail);
        return detail;
    } catch (error) {
        console.error("Error getting detail:", error);
    }
}

// Example 3: Search hentai
export async function exampleSearch() {
    try {
        const results = await movieAPI.searchNekopoiCare("overflow");
        console.log("Search results:", results);
        return results;
    } catch (error) {
        console.error("Error searching:", error);
    }
}

// Example 4: Get by category
export async function exampleGetByCategory() {
    try {
        const byCategory = await movieAPI.getNekopoiCareByCategory("hentai", 1);
        console.log("By category:", byCategory);
        return byCategory;
    } catch (error) {
        console.error("Error getting by category:", error);
    }
}

// Example 5: Get all categories
export async function exampleGetCategories() {
    try {
        const categories = await movieAPI.getNekopoiCareCategories();
        console.log("Available categories:", categories);
        return categories;
    } catch (error) {
        console.error("Error getting categories:", error);
    }
}

// Example 6: Get combined hentai from all sources
export async function exampleGetAllSources() {
    try {
        const allLatest = await movieAPI.getAllHentaiLatest(1);
        console.log("From Nekopoi (proxy):", allLatest.nekopoi.data.length);
        console.log("From Nekopoi.care:", allLatest.nekopoiCare.data.length);
        console.log("From NekoBocc:", allLatest.nekobocc.data.length);
        return allLatest;
    } catch (error) {
        console.error("Error getting all sources:", error);
    }
}

// Example 7: Search across all sources
export async function exampleSearchAllSources() {
    try {
        const allResults = await movieAPI.searchAllHentai("overflow");
        console.log("Nekopoi results:", allResults.nekopoi.length);
        console.log("Nekopoi.care results:", allResults.nekopoiCare.length);
        console.log("NekoBocc results:", allResults.nekobocc.length);
        return allResults;
    } catch (error) {
        console.error("Error searching all sources:", error);
    }
}

// Example usage in React component:
/*
import { movieAPI } from '@/services/api';

function HentaiList() {
    const [hentaiList, setHentaiList] = useState([]);
    
    useEffect(() => {
        async function fetchData() {
            // Get from nekopoi.care
            const data = await movieAPI.getNekopoiCareLatest(1);
            setHentaiList(data.data);
            
            // Or get from all sources
            const allData = await movieAPI.getAllHentaiLatest(1);
            const combined = [
                ...allData.nekopoi.data,
                ...allData.nekopoiCare.data,
                ...allData.nekobocc.data
            ];
            setHentaiList(combined);
        }
        
        fetchData();
    }, []);
    
    return (
        <div>
            {hentaiList.map(item => (
                <div key={item.id}>
                    <img src={item.cover} alt={item.title} />
                    <h3>{item.title}</h3>
                    <p>{item.synopsis}</p>
                </div>
            ))}
        </div>
    );
}
*/
