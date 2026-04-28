document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // DOM REFERENCES
    // ============================================================
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsContainer = document.getElementById('results');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const categoriesSection = document.getElementById('categories-section');
    const categoriesGrid = document.getElementById('categories-grid');

    // Auth elements
    const btnGoogleLogin = document.getElementById('btnGoogleLogin');
    const btnLogout = document.getElementById('btnLogout');
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');

    // Basket elements
    const btnBasket = document.getElementById('btnBasket');
    const basketBadge = document.getElementById('basketBadge');
    const basketPanel = document.getElementById('basketPanel');
    const basketOverlay = document.getElementById('basketOverlay');
    const btnCloseBasket = document.getElementById('btnCloseBasket');
    const basketItems = document.getElementById('basketItems');
    const basketEmpty = document.getElementById('basketEmpty');

    // Toast
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // Nav brand (click to go home)
    const navBrand = document.getElementById('navBrand');

    // ============================================================
    // STATE
    // ============================================================
    let currentUser = null;
    let userBasket = []; // local cache of basket items

    // ============================================================
    // CATEGORIES
    // ============================================================
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

    // ============================================================
    // SEARCH FUNCTIONS
    // ============================================================
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
                const card = createProductCard(product, index);
                resultsContainer.appendChild(card);
            });

        } catch (error) {
            console.error('Error fetching products:', error);
            errorEl.classList.remove('hidden');
            errorText.textContent = error.message;
            categoriesSection.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
            searchBtn.disabled = false;
        }
    }

    function createProductCard(product, index) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.05}s`;
        card.style.opacity = '0';

        let storeColor = product.store === 'Exito' ? '#FFD233' : '#0070bc';
        let storeTextColor = product.store === 'Exito' ? '#1e293b' : '#ffffff';

        // Check if already in basket
        const isInBasket = userBasket.some(item => 
            item.name === product.name && item.store === product.store
        );

        card.innerHTML = `
            <div class="badge-store" style="background: ${storeColor}; color: ${storeTextColor}; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${product.store}</div>
            <div class="card-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            </div>
            <div class="card-content">
                <h3 class="product-name" title="${product.name}">${product.name}</h3>
                <div class="product-price">${product.price}</div>
                <div class="card-actions">
                    <a href="${product.link}" target="_blank" class="visit-btn" style="background: ${storeColor}; color: ${storeTextColor};">Comprar en ${product.store}</a>
                    <button class="btn-add-basket ${isInBasket ? 'in-basket' : ''}" title="${isInBasket ? 'Ya en tu canasta' : 'Agregar a Mi Canasta'}">
                        <ion-icon name="${isInBasket ? 'checkmark-circle' : 'basket-outline'}"></ion-icon>
                    </button>
                </div>
            </div>
        `;

        // Add to basket button
        const addBtn = card.querySelector('.btn-add-basket');
        addBtn.addEventListener('click', () => {
            if (isInBasket) {
                showToast('Este producto ya está en tu canasta', 'info');
                return;
            }
            handleAddToBasket(product, addBtn);
        });

        return card;
    }

    // ============================================================
    // AUTHENTICATION — GOOGLE SIGN-IN
    // ============================================================
    async function signInWithGoogle() {
        try {
            const result = await auth.signInWithPopup(googleProvider);
            showToast(`¡Bienvenido, ${result.user.displayName}!`, 'success');
        } catch (error) {
            console.error('Error signing in:', error);
            if (error.code !== 'auth/popup-closed-by-user') {
                showToast('Error al iniciar sesión. Intenta de nuevo.', 'error');
            }
        }
    }

    async function logOut() {
        try {
            await auth.signOut();
            showToast('Sesión cerrada', 'info');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        updateAuthUI(user);
        if (user) {
            loadBasket();
        } else {
            userBasket = [];
            updateBasketBadge();
        }
    });

    function updateAuthUI(user) {
        if (user) {
            // Show logged-in state
            btnGoogleLogin.classList.add('hidden');
            userInfo.classList.remove('hidden');
            btnBasket.classList.remove('hidden');

            userAvatar.src = user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U');
            userName.textContent = user.displayName?.split(' ')[0] || 'Usuario';
        } else {
            // Show logged-out state
            btnGoogleLogin.classList.remove('hidden');
            userInfo.classList.add('hidden');
            btnBasket.classList.add('hidden');
            closeBasketPanel();
        }
    }

    // Auth event listeners
    btnGoogleLogin.addEventListener('click', signInWithGoogle);
    btnLogout.addEventListener('click', logOut);

    // ============================================================
    // BASKET FUNCTIONS — FIRESTORE
    // ============================================================

    async function handleAddToBasket(product, buttonEl) {
        // If not logged in, prompt to sign in first
        if (!currentUser) {
            showToast('Inicia sesión para guardar productos', 'info');
            signInWithGoogle();
            return;
        }

        try {
            // Check if already exists
            const exists = userBasket.some(item => 
                item.name === product.name && item.store === product.store
            );

            if (exists) {
                showToast('Este producto ya está en tu canasta', 'info');
                return;
            }

            // Save to Firestore
            await db.collection('users').doc(currentUser.uid)
                .collection('basket').add({
                    store: product.store,
                    name: product.name,
                    price: product.price,
                    priceValue: product.priceValue,
                    image: product.image,
                    link: product.link,
                    addedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Update button UI
            if (buttonEl) {
                buttonEl.classList.add('in-basket');
                buttonEl.title = 'Ya en tu canasta';
                buttonEl.querySelector('ion-icon').setAttribute('name', 'checkmark-circle');
            }

            showToast('Producto agregado a tu canasta 🛒', 'success');
            // Basket will update via the onSnapshot listener

        } catch (error) {
            console.error('Error adding to basket:', error);
            showToast('Error al agregar el producto', 'error');
        }
    }

    async function removeFromBasket(docId) {
        if (!currentUser) return;

        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('basket').doc(docId).delete();

            showToast('Producto eliminado de tu canasta', 'info');
            // Basket will update via the onSnapshot listener

        } catch (error) {
            console.error('Error removing from basket:', error);
            showToast('Error al eliminar el producto', 'error');
        }
    }

    function loadBasket() {
        if (!currentUser) return;

        // Real-time listener for basket changes
        db.collection('users').doc(currentUser.uid)
            .collection('basket')
            .orderBy('addedAt', 'desc')
            .onSnapshot((snapshot) => {
                userBasket = [];
                snapshot.forEach(doc => {
                    userBasket.push({ id: doc.id, ...doc.data() });
                });
                updateBasketBadge();
                renderBasketItems();
            }, (error) => {
                console.error('Error loading basket:', error);
            });
    }

    function updateBasketBadge() {
        const count = userBasket.length;
        if (count > 0) {
            basketBadge.textContent = count;
            basketBadge.classList.remove('hidden');
        } else {
            basketBadge.classList.add('hidden');
        }
    }

    function renderBasketItems() {
        basketItems.innerHTML = '';

        if (userBasket.length === 0) {
            basketEmpty.classList.remove('hidden');
            basketItems.classList.add('hidden');
            return;
        }

        basketEmpty.classList.add('hidden');
        basketItems.classList.remove('hidden');

        userBasket.forEach((item, index) => {
            const el = document.createElement('div');
            el.className = 'basket-item';
            el.style.animation = `slideInRight 0.3s ease forwards ${index * 0.05}s`;
            el.style.opacity = '0';

            const storeColor = item.store === 'Exito' ? '#FFD233' : '#0070bc';
            const storeTextColor = item.store === 'Exito' ? '#1e293b' : '#ffffff';

            el.innerHTML = `
                <div class="basket-item-img">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60?text=?'">
                </div>
                <div class="basket-item-info">
                    <span class="basket-item-store" style="background: ${storeColor}; color: ${storeTextColor};">${item.store}</span>
                    <p class="basket-item-name" title="${item.name}">${item.name}</p>
                    <span class="basket-item-price">${item.price}</span>
                </div>
                <div class="basket-item-actions">
                    <a href="${item.link}" target="_blank" class="basket-item-link" title="Ver en tienda">
                        <ion-icon name="open-outline"></ion-icon>
                    </a>
                    <button class="basket-item-remove" title="Eliminar de canasta">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </div>
            `;

            // Remove button
            el.querySelector('.basket-item-remove').addEventListener('click', () => {
                el.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => removeFromBasket(item.id), 300);
            });

            basketItems.appendChild(el);
        });
    }

    // ============================================================
    // BASKET PANEL — OPEN / CLOSE
    // ============================================================
    function openBasketPanel() {
        basketPanel.classList.add('open');
        basketOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeBasketPanel() {
        basketPanel.classList.remove('open');
        basketOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    btnBasket.addEventListener('click', openBasketPanel);
    btnCloseBasket.addEventListener('click', closeBasketPanel);
    basketOverlay.addEventListener('click', closeBasketPanel);

    // Close basket with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBasketPanel();
    });

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================
    let toastTimeout;
    function showToast(message, type = 'success') {
        clearTimeout(toastTimeout);
        
        const icon = toast.querySelector('ion-icon');
        toastMessage.textContent = message;
        
        toast.className = `toast toast-${type}`;
        
        switch(type) {
            case 'success':
                icon.setAttribute('name', 'checkmark-circle');
                break;
            case 'error':
                icon.setAttribute('name', 'alert-circle');
                break;
            case 'info':
                icon.setAttribute('name', 'information-circle');
                break;
        }

        // Show
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============================================================
    // NAVIGATION
    // ============================================================

    // Nav brand click = go home
    navBrand.addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        errorEl.classList.add('hidden');
        categoriesSection.classList.remove('hidden');
    });

    // Header click = go home
    document.querySelector('header h1').addEventListener('click', () => {
        searchInput.value = '';
        resultsContainer.innerHTML = '';
        resultsContainer.classList.add('hidden');
        errorEl.classList.add('hidden');
        categoriesSection.classList.remove('hidden');
    });
    document.querySelector('header h1').style.cursor = 'pointer';

    // Controls
    searchBtn.addEventListener('click', searchProducts);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        }
    });

    // ============================================================
    // INJECTED KEYFRAMES
    // ============================================================
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(60px); }
        }
    `;
    document.head.appendChild(styleSheet);
});
