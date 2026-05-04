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

const EXCLUDED_KEYWORDS = [
    'shampoo', 'champú', 'jabon', 'jabón', 'crema', 'locion', 'desodorante',
    'detergente', 'limpiador', 'suavizante', 'mascota', 'perro', 'gato', 'ropa',
    'electrodoméstico', 'televisor', 'celular', 'lavadora', 'nevera', 'vajilla',
    'olla', 'sartén', 'juguete', 'aroma', 'olor a', 'fragancia', 'perfume', 'acondicionador', 'maquillaje',
    'papillero', 'plato', 'vaso', 'tetero', 'biberón', 'chupo',
    'colada', 'compota', 'galleta', 'helado', 'postre', 'torta', 'ponqué', 'jugo',
    'refresco', 'néctar', 'nectar', 'batido', 'saborizado', 'sabor a', 'mermelada',
    'puré', 'crema de', 'sopa', 'caldo', 'molde', 'empanada', 'arepa', 'pampita',
    'bebida', 'hidratante', 'energizante', 'gaseosa', 'agua', 'té', 'infusión',
    'licor', 'cerveza', 'vino', 'suplemento', 'vitamina', 'jarabe', 'cápsula',
    'rosquita', 'rosquilla', 'palito', 'almidón', 'almidon', 'mini', 'chicharron',
    'chicharrón', 'combo', 'rapi', 'mccain', 'yucarina', 'papel', 'especial',
    'cuaderno', 'dura', 'snoopy', 'blanco', 'tortilla', 'margarita', 'ensalada',
    'piñata', 'noel', 'cinta', 'ácida', 'acida', 'fini', 'fresa', 'frambuesa',
    'lata', 'platanito', 'tajada', 'farah', 'astilla', 'precocong', 'waffle',
    'manoline', 'manolines', 'superficie', 'inestable', 'cojín', 'cojin', 'movifit',
    'pastelito', 'tufit', 'maizito', 'árbol', 'arbol', 'frutinal', 'cóctel', 'coctel',
    'clamato', "hunt's", 'royal', 'garden', 'gracol', 'selecto', 'enlatado', 'coruña',
    'san jorge', 'jack', 'mágica', 'magica', 'guadal', 'editorial', 'menú', 'menu',
    'estofado', 'juanito', 'autor', 'lector', 'clasico', 'clásico', 'equipo', 'libro',
    'muffin', 'monkey', 'avena', 'crocant', 'liofilizado', 'etnico', 'cereal', 'baby',
    'quaker', 'artesano', 'nuez', 'nueces', 'mezcla', 'pancake', 'orgánico', 'organico',
    'granola', 'lok', 'miel', 'paranice', 'esparcible', 'why not', 'mani', 'amira',
    'cacao', 'ron', 'hechicera', 'experimental', 'jeringa', 'insulina', 'tapón', 'tapon',
    'gelatina', 'colanta', 'paleta', 'aloha', 'tic tac', 'arequipe', 'rimar', 'zumo',
    'frudelca', 'vitad', 'berraquera', 'ponque', 'casero', 'tartaleta', 'mayonesa',
    'clovis', 'bacardi', 'travad', 'oral', 'silla', 'camping', 'dulce', 'lonja',
    'bocadillo', 'roscón', 'roscon', 'combinada', 'hojaldrito', 'bolsa', 'protector',
    'manzana', 'cigarrillo', 'marlboro', 'yogurt', 'base', 'maggi', 'champiñon',
    'champiñones', 'rack', 'condimento', 'sazonador', 'squid', 'tailandesa', 'hamburguesa',
    'antillana', 'apanado', 'apanada', 'nacho', 'espina', 'accesorio', 'ahumador',
    'chaquiro', 'barril', 'asador', 'acero', 'inoxidable', 'disco', 'vinilo', 'rabioso',
    'desatormentandonos', 'dinosaurio', 'dinosaurios', 'chocolatina', 'jet', 'choc lyne',
    'caramelo', 'pirulito', 'flan', 'arroz leche', 'cortadito', 'extractor', 'materna',
    'manual', 'milka', 'copa', 'recolectora', 'borrador', 'cereza', 'salsa', 'fritas',
    'fruco', 'bary', 'kari', 'mermel', 'pastel', 'empan', 'trigo', 'recipiente',
    'boogy', 'asada', 'baguette', 'deliqueso', 'pringles', 'aditivo', 'qualitor',
    'moto', 'liqui', 'moly', 'additive', 'mos2', 'street', 'horquilla', 'sint',
    'tec', 'dual', 'mango', 'sol', 'llanta', 'cliff', 'lizard', 'tundra', 'ruta',
    'challenge', 'strada', 'pro', 'pps', 'bianchi', 'malteada', 'pinguino', 'pingüino',
    'barquillo', 'piazza', 'milkyway', 'kinder', 'chocobreak', 'zombie', 'davida',
    'lindt', 'mercí', 'merci', 'italo', 'bonkiss', 'ferrero', 'rocher', 'joy',
    'mantequilla', 'natuchips', 'alpina', 'esparcib', 'rama', 'guante', 'ciclismo',
    'corto', 'sallow', 'smoke', 'blue', 'vibrador', 'playboy', 'pleasure'
];

const EXCLUDED_CATEGORIES = [
    'electrodomésticos', 'tecnología', 'hogar', 'aseo', 'belleza', 'salud', 'mascotas',
    'ropa', 'juguetes', 'limpieza', 'cuidado personal', 'muebles', 'celulares', 'moda'
];

function isValidFoodProduct(product, query) {
    const name = (product.productName || '').toLowerCase();
    const q = query.toLowerCase();
    
    // Check keyword exclusions
    for (const kw of EXCLUDED_KEYWORDS) {
        if (name.includes(kw)) return false;
    }

    // Exclude 'frito', 'snack', 'paquete' etc. unless explicitly requested
    if (!q.includes('frito') && !q.includes('snack') && !q.includes('paquete') && !q.includes('pasaboca')) {
        if (name.includes('frito') || name.includes('snack') || name.includes('paquete') || name.includes('pasaboca') || name.includes('toston')) {
            return false;
        }
    }

    // Exclude derived items if not explicitly searched
    if (!q.includes('harina') && name.includes('harina')) return false;
    if (!q.includes('aceite') && name.includes('aceite')) return false;
    if (!q.includes('leche') && name.includes('leche')) return false;
    if (!q.includes('queso') && name.includes('queso')) return false;
    if (!q.includes('pan') && (name.includes(' pan ') || name.startsWith('pan '))) return false;

    // Check categories
    if (product.categories && Array.isArray(product.categories)) {
        for (const catPath of product.categories) {
            const cat = catPath.toLowerCase();
            for (const badCat of EXCLUDED_CATEGORIES) {
                if (cat.includes(badCat)) return false;
            }
        }
    }
    
    return true;
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
                if (!isValidFoodProduct(product, query)) return;

                const name = product.productName || 'Unknown Product';
                let link = product.linkText ? `https://www.exito.com/${product.linkText}/p` : (product.link || '#');
                if (link && !link.startsWith('http')) link = `https://www.exito.com${link}`;
                
                let image = 'https://via.placeholder.com/150';
                if (product.items && product.items[0].images && product.items[0].images[0]) {
                    image = product.items[0].images[0].imageUrl;
                }

                let priceValue = 0;
                let priceText = '$0';
                let isAvailable = true;

                try {
                    const offer = product.items[0].sellers[0].commertialOffer;
                    priceValue = offer.Price;
                    
                    if (offer.AvailableQuantity === 0 || offer.IsAvailable === false || priceValue === 0) {
                        isAvailable = false;
                    }
                    
                    if (isAvailable) {
                        priceText = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(priceValue);
                    } else {
                        priceText = 'Agotado';
                        priceValue = 999999999;
                    }
                } catch (e) {
                    isAvailable = false;
                    priceText = 'Agotado';
                    priceValue = 999999999;
                }

                items.push({ store: 'Exito', name, price: priceText, priceValue, image, link });
            });
        }

        // Parse Olimpica
        if (olimpicaRes.status === 'fulfilled' && Array.isArray(olimpicaRes.value.data)) {
            olimpicaRes.value.data.forEach(product => {
                if (!isValidFoodProduct(product, query)) return;

                const name = product.productName || 'Unknown Product';
                let link = product.linkText ? `https://www.olimpica.com/${product.linkText}/p` : (product.link || '#');
                if (link && !link.startsWith('http')) link = `https://www.olimpica.com${link}`;
                
                let image = 'https://via.placeholder.com/150';
                if (product.items && product.items[0].images && product.items[0].images[0]) {
                    image = product.items[0].images[0].imageUrl;
                }

                let priceValue = 0;
                let priceText = '$0';
                let isAvailable = true;

                try {
                    const offer = product.items[0].sellers[0].commertialOffer;
                    priceValue = offer.Price;
                    
                    if (offer.AvailableQuantity === 0 || offer.IsAvailable === false || priceValue === 0) {
                        isAvailable = false;
                    }
                    
                    if (isAvailable) {
                        priceText = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(priceValue);
                    } else {
                        priceText = 'Agotado';
                        priceValue = 999999999;
                    }
                } catch (e) {
                    isAvailable = false;
                    priceText = 'Agotado';
                    priceValue = 999999999;
                }

                items.push({ store: 'Olimpica', name, price: priceText, priceValue, image, link });
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
