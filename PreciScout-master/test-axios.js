const axios = require('axios');
const fs = require('fs');

async function testFetch() {
    try {
        const response = await axios.get('https://www.exito.com/s?q=arroz', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'es-419,es;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        fs.writeFileSync('axios_exito.html', response.data);
        console.log("Downloaded successfully.");

        // Check for specific keywords
        if (response.data.includes('__RUNTIME__') || response.data.includes('__STATE__')) {
            console.log("Found VTEX state data!");
        }

    } catch (error) {
        console.error("Axios failed:", error.message);
        if (error.response) {
            console.log("Status:", error.response.status);
        }
    }
}

testFetch();
