const axios = require('axios');

async function test() {
    try {
        const url = 'https://www.olimpica.com/api/catalog_system/pub/products/search/arroz?_from=0&_to=2';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
            const p = response.data[0];
            console.log("Name:", p.productName);
            console.log("Link:", p.link);
            if (p.items && p.items.length > 0) {
                console.log("Image:", p.items[0].images[0].imageUrl);
                console.log("CommertialOffer:", p.items[0].sellers[0].commertialOffer);
            }
        } else {
            console.log("Not array or empty:", typeof response.data);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
