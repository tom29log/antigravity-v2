import { Client } from '@notionhq/client';

const notion = new Client({ auth: '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' });

async function verify() {
    try {
        console.log("Attempting to search for databases...");
        const response = await notion.search({});

        if (response.results.length > 0) {
            console.log("Success! Found databases:");
            response.results.forEach(db => {
                console.log(`- Name: ${db.title[0]?.plain_text || 'Untitled'}`);
                console.log(`  ID: ${db.id}`);
                console.log(`  URL: ${db.url}`);
            });
        } else {
            console.log("Token is valid, but no databases are shared with this integration.");
            console.log("Please make sure to click 'Start' -> 'Add connections' -> [Your App] on the database page.");
        }
    } catch (error) {
        console.error("Error connecting to Notion:", error.message);
    }
}

verify();
