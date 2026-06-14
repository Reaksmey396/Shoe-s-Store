(function () {
    const cartKey = 'solestyleCart';
    const cartBar = document.getElementById('shop-category-bar');
    if (!cartBar) return;

    const formatMoney = amount => `$${amount.toFixed(2)}`;
    const getPriceNumber = price => Number(String(price).replace(/[^0-9.]/g, '')) || 0;
    const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
    const saveCart = cart => localStorage.setItem(cartKey, JSON.stringify(cart));
    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    function getPagePrefix() {
        if (window.location.pathname.includes('/Pages/')) return '';
        if (window.location.pathname.includes('/Components/')) return '../Pages/';
        return './Pages/';
    }

    function getDetailHref(item) {
        const prefix = getPagePrefix();
        return `${prefix}Detail_card.html?service=${encodeURIComponent(item.id)}`;
    }

    function ensureCartShell() {
        const header = cartBar.querySelector('.hidden.md\\:grid');
        if (!header) return;

        let node = header.nextElementSibling;
        while (node) {
            const nextNode = node.nextElementSibling;
            node.remove();
            node = nextNode;
        }

        header.insertAdjacentHTML('afterend', `
            <div id="empty-cart-message" class="rounded-lg border border-dashed border-red-200 bg-red-50/40 p-6 text-center text-sm text-gray-500">
                Your cart is empty.
            </div>
            <div id="cart-items" class="space-y-3"></div>
            <div id="cart-summary" class="hidden mt-5 rounded-lg bg-gray-50 p-4">
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Total items</span>
                    <span id="cart-total-items" class="font-bold text-gray-900">0</span>
                </div>
                <div class="mt-2 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span id="cart-total-price" class="text-orange-600">$0.00</span>
                </div>
                <button id="order-btn" type="button" class="mt-4 block w-full rounded-md bg-red-500 py-3 text-center font-bold text-white hover:bg-red-600">Order Now</button>
                <a href="${getPagePrefix()}Services.html" class="mt-3 block w-full rounded-md border border-red-200 py-3 text-center font-bold text-red-600 hover:bg-red-50">View More Products</a>
            </div>
        `);
    }

    function renderCart() {
        const cart = getCart();
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');
        const cartTotalItems = document.getElementById('cart-total-items');
        const cartTotalPrice = document.getElementById('cart-total-price');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        cartItems.innerHTML = cart.map((item, index) => `
            <div class="cart-item grid grid-cols-1 md:grid-cols-[70px_1fr_90px_90px_120px] gap-3 items-start md:items-center rounded-lg border border-red-100 p-3" data-id="${escapeHtml(item.id)}">
                <p class="text-sm font-bold text-gray-600">#P${String(index + 1).padStart(3, '0')}</p>
                <div class="flex items-center gap-3 min-w-0">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="h-16 w-16 rounded-md object-cover">
                    <div class="min-w-0">
                        <h2 class="font-bold text-gray-900 truncate">${escapeHtml(item.title)}</h2>
                        <p class="text-xs text-gray-500">${escapeHtml(item.category)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="quantity-minus h-8 w-8 rounded border border-gray-200 hover:bg-red-50 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" aria-label="Decrease amount" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                    <span class="w-8 text-center font-bold">${item.quantity}</span>
                    <button class="quantity-plus h-8 w-8 rounded border border-gray-200 hover:bg-red-50" aria-label="Increase amount">+</button>
                </div>
                <p class="font-bold text-orange-600">${formatMoney(item.quantity * item.unitPrice)}</p>
                <div class="flex gap-2">
                    <a href="${getDetailHref(item)}" class="h-9 w-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100" aria-label="View product"><i class="fa-solid fa-eye"></i></a>
                    <button class="remove-item h-9 w-9 rounded bg-red-50 text-red-600 hover:bg-red-100" aria-label="Remove product"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        emptyCartMessage.classList.toggle('hidden', cart.length > 0);
        cartSummary.classList.toggle('hidden', cart.length === 0);
        cartTotalItems.textContent = totalItems;
        cartTotalPrice.textContent = formatMoney(totalPrice);

        document.querySelectorAll('.shop-btn h1').forEach(count => {
            count.textContent = totalItems;
            count.classList.toggle('hidden', totalItems === 0);
        });
    }

    function openCart() {
        cartBar.classList.remove('hidden');
        document.getElementById('mobile-menu')?.classList.add('hidden');
        document.querySelectorAll('.shop-btn').forEach(item => item.setAttribute('aria-expanded', 'true'));
    }

    function addCurrentDetailItem() {
        const serviceId = new URLSearchParams(window.location.search).get('service') || 'modern-clean';
        const title = document.getElementById('service-title')?.textContent.trim();
        const category = document.getElementById('service-category')?.textContent.trim();
        const price = document.getElementById('service-price')?.textContent.trim();
        const image = document.getElementById('service-image')?.src;
        if (!title || !category || !price || !image) return;

        const cart = getCart();
        const existingItem = cart.find(item => item.id === serviceId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: serviceId,
                title,
                category,
                image,
                unitPrice: getPriceNumber(price),
                quantity: 1
            });
        }

        saveCart(cart);
        renderCart();
        openCart();
    }

    ensureCartShell();
    renderCart();

    document.getElementById('cart-items').addEventListener('click', event => {
        const cartItem = event.target.closest('.cart-item');
        if (!cartItem) return;

        const cart = getCart();
        const item = cart.find(product => product.id === cartItem.dataset.id);
        if (!item) return;

        if (event.target.closest('.quantity-plus')) {
            item.quantity += 1;
        }

        if (event.target.closest('.quantity-minus')) {
            item.quantity = Math.max(1, item.quantity - 1);
        }

        if (event.target.closest('.remove-item')) {
            cart.splice(cart.indexOf(item), 1);
        }

        saveCart(cart);
        renderCart();
    });

    document.getElementById('order-btn').addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) return;

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        alert(`Order placed successfully!\nItems: ${totalItems}\nTotal: ${formatMoney(totalPrice)}`);
        saveCart([]);
        renderCart();
    });

    document.getElementById('add-to-cart-btn')?.addEventListener('click', addCurrentDetailItem);
    window.addEventListener('storage', renderCart);
})();
