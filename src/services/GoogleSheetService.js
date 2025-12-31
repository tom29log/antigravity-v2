export const GOOGLE_SHEET_URLS = {
    // Stories Tab (File ID corrected to match Portfolio)
    STORIES: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoDruCEB9bn-gBsvBr36EtpP843Lxyyw3ATKPA55tyYFE3hQnuaP71tDZkhoI07KYZMfrBI_9UTNC/pub?gid=0&single=true&output=csv',
    // Portfolio Tab
    PORTFOLIO: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoDruCEB9bn-gBsvBr36EtpP843Lxyyw3ATKPA55tyYFE3hQnuaP71tDZkhoI07KYZMfrBI_9UTNC/pub?gid=378727619&single=true&output=csv',
    // Aesthetics Tab
    AESTHETICS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeoDruCEB9bn-gBsvBr36EtpP843Lxyyw3ATKPA55tyYFE3hQnuaP71tDZkhoI07KYZMfrBI_9UTNC/pub?gid=906290349&single=true&output=csv',
    // Materials Tab
    MATERIALS: 'PLACEHOLDER_FOR_MATERIALS_SHEET_URL'
};

export const GoogleSheetService = {
    /**
     * Fetches CSV data from a published Google Sheet URL and converts it to JSON.
     * @param {string} url - The URL of the published CSV (e.g. .../pub?gid=0&single=true&output=csv)
     * @returns {Promise<Array>} - Array of objects keyed by header.
     */
    async fetchCSV(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch sheet');
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error('Google Sheet Fetch Error:', error);
            throw error; // Propagate error but handle gracefully in UI
        }
    },

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim()); // Simple comma split

        const result = [];
        for (let i = 1; i < lines.length; i++) {
            const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma ignoring quoted commas
            const obj = {};
            let hasContent = false;

            headers.forEach((header, index) => {
                let val = currentline[index] ? currentline[index].trim() : '';
                // Remove quotes if present
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.substring(1, val.length - 1);
                }
                obj[header] = val;
                if (val) hasContent = true;
            });

            if (hasContent) result.push(obj);
        }
        return result;
    },

    /**
     * Parses the portfolio sheet data with specific logic for multi-column images.
     * Supports columns: image, image1, image2, image3, image4, image5, image6
     */
    mapPortfolio(rows) {
        return rows.map(row => {
            // Aggregate images from multiple columns
            const images = [];

            // Helper to clean and validate URL
            const isValidUrl = (url) => url && typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');

            // Check standard 'image' columns with various potential header names
            // Add 'image', 'image 1', 'Image', etc if needed.
            // Currently supporting 'image' and 'image1'...'image20' to be safe.

            if (isValidUrl(row.image)) images.push(row.image.trim());

            for (let i = 1; i <= 20; i++) {
                const key = `image${i}`;
                if (isValidUrl(row[key])) {
                    images.push(row[key].trim());
                }
            }

            return {
                id: row.id || Math.random().toString(36),
                title: row.title || 'Untitled',
                desc: row.desc || '',
                category: row.category || 'General',
                images: images,
                order: parseInt(row.order) || 999
            };
        });
    },

    mapStories(rows) {
        return rows.map(row => ({
            id: row.id || Math.random().toString(36),
            title: row.title || '',
            imageUrl: row.image || '',
            desc: row.desc || '',
            order: parseInt(row.order) || 999
        }));
    },

    mapAesthetics(rows) {
        return rows.map(row => {
            const images = [];
            const isValidUrl = (url) => url && typeof url === 'string' && url.trim().length > 0 && url.startsWith('http');

            // Support image1 through image6
            for (let i = 1; i <= 6; i++) {
                const key = `image${i}`;
                if (isValidUrl(row[key])) {
                    images.push(row[key].trim());
                }
            }

            return {
                id: row.id || '', // e.g., 'modern', 'nordic'
                images: images
            };
        });
    },

    mapMaterials(rows) {
        return rows.map(row => ({
            category: row.category ? row.category.toLowerCase().trim() : '', // 'floor', 'wall', 'ceiling'
            id: row.id || Math.random().toString(36),
            name: row.name || 'Unnamed Material',
            img: row.image || '',
            order: parseInt(row.order) || 999
        })).filter(item => item.category && item.img); // Filter out invalid rows
    }
};
