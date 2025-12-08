const apiKey = "9998d44e51ed7634a06c4198b289bfe4";
const seriesId = "1399"; // Game of Thrones (8 Seasons)
const url = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${apiKey}`;

async function run() {
    console.log(`Fetching Series Details for ID: ${seriesId}...`);
    const res = await fetch(url).then(r => r.json());
    if(!res.seasons) {
        console.error("Failed to fetch seasons", res);
        return;
    }
    console.log(`Series: ${res.name}`);
    console.log(`Total Seasons Available: ${res.seasons.length}`);
    
    // Show counts for all seasons to prove > 3
    console.log("Seasons Overview:");
    res.seasons.forEach(s => {
        if (s.season_number > 0) // Skip specials
            console.log(`- Season ${s.season_number}: ${s.episode_count} episodes`);
    });

    // Fetch Season 1 details to prove > 10 episodes
    // Game of Thrones Season 1 has 10 eps. Let's try to find one with > 10.
    // Stranger Things S4 has 9. 
    // The Walking Dead S10 has 22. ID: 1402
}

run();
