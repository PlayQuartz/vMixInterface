const fs = require('fs');
const path = require('path');
const csvFilePath = path.join(__dirname, 'ranking.csv');

async function getPlayerTrackerName(playerFullId) {
    const baseUrl = "http://api-direct-rec.fortnitetracker.com";
    const url = `${baseUrl}/profile/all/${playerFullId}`;

    try {
        const response = await fetch(url);
        const text = await response.text(); // Get the response text

        let playerName = null;
        const lines = text.split('\n'); // Split response into lines

        for (const line of lines) {
            if (line.trim().startsWith("const profile = {")) {
                const lineWithoutConst = line.trim().substring("const profile = ".length).slice(0, -1).trim();
                const data = JSON.parse(lineWithoutConst); // Parse JSON string
                playerName = data.platformInfo.platformUserIdentifier;
                console.log(playerName);
                break;
            }
        }

        return playerName;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

function getProfileConstFromTracker(html) {
    const lines = html.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith("const profile = {")) {
            const cleanLine = line.trim().substring("const profile = ".length, line.trim().length - 1).trim();
            return JSON.parse(cleanLine);
        }
    }

    return null;
}

async function getProfileData(trackerName) {
    const baseUrl = "http://api-direct-rec.fortnitetracker.com";
    const eventUrl = `${baseUrl}/profile/all/${trackerName}/events?region=GLOBAL`;

    try {
        const response = await fetch(eventUrl);

        if (response.status !== 200) {
            return null;
        }

        const text = await response.text();
        return getProfileConstFromTracker(text); // Assuming this is another function you have
    } catch (error) {
        console.error('Error fetching profile data:', error);
        return null;
    }
}

// Function to get power ranking from profile data
function getPowerRanking(profileData, period = null) {
    if (!period) {
        if (profileData.powerRank) {
            return [
                profileData.powerRank.points,
                profileData.powerRank.statRank,
                profileData.powerRank.region,
                profileData.powerRank.platform
            ];
        }
    } else {
        if (profileData.prSegments) {
            for (const segment of profileData.prSegments) {
                if (segment.segment === period) {
                    return [
                        segment.points,
                        segment.rank,
                        segment.region,
                        segment.platform
                    ];
                }
            }
        }
    }

    return null;
}

async function fetchData() {
    const url = 'https://api.wls.gg/v5/leaderboards/0-0000-657289168270970880?page=1';
    
    // Start a new CSV file
    const csvHeaders = 'Placement,Name,Power Ranking,PR Rank,Region,Platform\n';
    fs.writeFileSync(csvFilePath, csvHeaders);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        
        for(let team in jsonData.teams){
            for(let member in jsonData.teams[team].members){
                let id = jsonData.teams[team].members[member].ingame_id
                name = await getPlayerTrackerName(id)
                data = await getProfileData(name)
                pw = await getPowerRanking(data)
                console.log(pw)
                
                if (pw) {
                    const csvLine = `${parseInt(team)+100},${name},${pw[0]},${pw[1]},${pw[2]},${pw[3]}\n`;
                    fs.appendFileSync(csvFilePath, csvLine);
                }
            }
        }

        console.log('CSV file created successfully at', csvFilePath);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Example usage:
(async () => {
    await fetchData();
})();

