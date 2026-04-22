const axios = require('axios');
const fs = require('fs');

async function testApi() {
    const urls = [
        'https://www.exito.com/api/catalog_system/pub/products/search/arroz?_from=0&_to=49',
        'https://www.exito.com/api/catalog_system/pub/products/search?ft=arroz&_from=0&_to=49',
        'https://www.exito.com/api/catalog_system/pub/products/search/arroz'
    ];

    for (const url of urls) {
        try {
            console.log(`\nTesting: ${url}`);
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                }
            });

            console.log("Success! Status:", response.status);
            if (Array.isArray(response.data) && response.data.length > 0) {
                console.log("Found products:", response.data.length);
                console.log("Example:", response.data[0].productName);
                fs.writeFileSync('api_success.json', JSON.stringify(response.data, null, 2));
                return; // Stop if successful
            }

        } catch (error) {
            console.log("Failed:", error.message);
            if (error.response) console.log("Status:", error.response.status);
        }
    }
}

testApi();
