const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const CANASTA_FAMILIAR = [
    "arroz", "pan", "pasta", "harina",
    "papa", "yuca", "plátano", "platano",
    "fríjol", "frijol", "lenteja", "garbanzo", "arveja",
    "tomate", "cebolla", "zanahoria", "habichuela",
    "banano", "naranja", "limón", "limon", "guayaba", "mora",
    "carne de res", "carne", "cerdo", "pollo", "pescado", "huevos", "huevo",
    "leche", "queso",
    "aceite", "azúcar", "azucar", "panela", "café", "cafe", "chocolate", "sal"
];

function isCanastaFamiliar(query) {
    const q = query.toLowerCase().trim();
    // Allow if any canasta item matches substring of query or vice versa
    return CANASTA_FAMILIAR.some(item => q.includes(item) || item.includes(q));
}

app.get('/api/scrape', async (req, res) => {
    const query = req.query.q || '';
    
    if (!query) {
        return res.status(400).json({ error: 'Búsqueda vacía' });
    }

    if (!isCanastaFamiliar(query)) {
        return res.status(400).json({ error: 'El producto no pertenece a la canasta familiar alimentaria.' });
    }

    console.log(`Searching for: ${query} via API...`);

    const exitoUrl = `https://www.exito.com/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=24`;
    const olimpicaUrl = `https://www.olimpica.com/api/catalog_system/pub/products/search/${encodeURIComponent(query)}?_from=0&_to=24`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    };

    try {
        const [exitoRes, olimpicaRes] = await Promise.allSettled([
            axios.get(exitoUrl, { headers }),
            axios.get(olimpicaUrl, { headers })
        ]);

        let items = [];

        // Parse Exito
        if (exitoRes.status === 'fulfilled' && Array.isArray(exitoRes.value.data)) {
            exitoRes.value.data.forEach(product => {
                const name = product.productName || 'Unknown Product';
                let link = product.link || '#';
                if (link && !link.startsWith('http')) link = `https://www.exito.com${link}`;
                
                let image = 'https://via.placeholder.com/150';
                if (product.items && product.items[0].images && product.items[0].images[0]) {
                    image = product.items[0].images[0].imageUrl;
                }

                let priceValue = 0;
                let priceText = '$0';
                try {
                    priceValue = product.items[0].sellers[0].commertialOffer.Price;
                    priceText = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(priceValue);
                } catch (e) {}

                if (priceValue > 0) {
                    items.push({ store: 'Exito', name, price: priceText, priceValue, image, link });
                }
            });
        }

        // Parse Olimpica
        if (olimpicaRes.status === 'fulfilled' && Array.isArray(olimpicaRes.value.data)) {
            olimpicaRes.value.data.forEach(product => {
                const name = product.productName || 'Unknown Product';
                let link = product.link || '#';
                if (link && !link.startsWith('http')) link = `https://www.olimpica.com${link}`;
                
                let image = 'https://via.placeholder.com/150';
                if (product.items && product.items[0].images && product.items[0].images[0]) {
                    image = product.items[0].images[0].imageUrl;
                }

                let priceValue = 0;
                let priceText = '$0';
                try {
                    priceValue = product.items[0].sellers[0].commertialOffer.Price;
                    priceText = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(priceValue);
                } catch (e) {}

                if (priceValue > 0) {
                    items.push({ store: 'Olimpica', name, price: priceText, priceValue, image, link });
                }
            });
        }

        items.sort((a, b) => a.priceValue - b.priceValue);
        console.log(`Found ${items.length} products combined.`);
        res.json(items);

    } catch (error) {
        console.error("API Request Failed:", error.message);
        res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
