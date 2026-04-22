document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('results');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const categoriesSection = document.getElementById('categories-section');
    const categoriesGrid = document.getElementById('categories-grid');

    const categories = [
        { name: "Cereales y derivados", items: ["Arroz", "Pan", "Pasta", "Harina"], icon: "nutrition-outline" },
        { name: "Tubérculos y plátanos", items: ["Papa", "Yuca", "Plátano"], icon: "leaf-outline" },
        { name: "Legumbres", items: ["Fríjol", "Lenteja", "Garbanzo", "Arveja"], icon: "restaurant-outline" },
        { name: "Verduras", items: ["Tomate", "Cebolla", "Zanahoria", "Habichuela"], icon: "water-outline" },
        { name: "Frutas", items: ["Banano", "Naranja", "Limón", "Guayaba", "Mora"], icon: "pizza-outline" },
        { name: "Proteínas", items: ["Carne de res", "Carne de cerdo", "Pollo", "Pescado", "Huevos"], icon: "fish-outline" },
        { name: "Lácteos", items: ["Leche", "Queso"], icon: "cafe-outline" },
        { name: "Otros básicos", items: ["Aceite", "Azúcar", "Panela", "Café", "Chocolate", "Sal"], icon: "basket-outline" }
    ];

    // Render categories
    categories.forEach((cat, index) => {
        const catEl = document.createElement('div');
        catEl.className = 'category-card';
        catEl.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
        catEl.style.opacity = '0';
        
        let pillsHTML = cat.items.map(item => `<button class="pill-btn" onclick="triggerSearch('${item}')">${item}</button>`).join('');

        catEl.innerHTML = `
            <div class="category-header">
                <ion-icon name="${cat.icon}"></ion-icon>
                <h3>${cat.name}</h3>
            </div>
            <div class="category-pills">
                ${pillsHTML}
            </div>
        `;
        categoriesGrid.appendChild(catEl);
    });

    window.triggerSearch = function(query) {
        searchInput.value = query;
        searchProducts();
    };

    async function searchProducts() {
        const query = searchInput.value.trim();
        if (!query) return;

        // UI Updates
        categoriesSection.classList.add('hidden');
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        loadingEl.classList.remove('hidden');
        errorEl.classList.add('hidden');
        searchBtn.disabled = true;

        try {
            const response = await fetch(`/api/scrape?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al buscar en el servidor.');
            }

            resultsContainer.classList.remove('hidden');
            if (data.length === 0) {
                resultsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: #f8fafc;">No se encontraron productos en ninguna tienda.</p>';
                return;
            }

            data.forEach((product, index) => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.05}s`;
                card.style.opacity = '0';

                // Design specifics per store
                let storeColor = product.store === 'Exito' ? '#FFD233' : '#0070bc';
                let storeTextColor = product.store === 'Exito' ? '#1e293b' : '#ffffff';

                card.innerHTML = `
                    <div class="badge-store" style="background: ${storeColor}; color: ${storeTextColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${product.store}</div>
                    <div class="card-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
                    </div>
                    <div class="card-content">
                        <h3 class="product-name" title="${product.name}">${product.name}</h3>
                        <div class="product-price">${product.price}</div>
                        <a href="${product.link}" target="_blank" class="visit-btn" style="background: ${storeColor}; color: ${storeTextColor};">Comprar en ${product.store}</a>
                    </div>
                `;
                resultsContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            errorEl.classList.remove('hidden');
            errorText.textContent = error.message;
            // Show categories again if error
            categoriesSection.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
            searchBtn.disabled = false;
        }
    }

    // Controls
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });

    // Handle header click to reset
    document.querySelector('header h1').addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        errorEl.classList.add('hidden');
        categoriesSection.classList.remove('hidden');
    });
    document.querySelector('header h1').style.cursor = 'pointer';

    // Keyframes injected here
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(styleSheet);
});
