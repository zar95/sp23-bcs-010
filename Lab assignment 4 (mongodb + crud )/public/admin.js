document.addEventListener('DOMContentLoaded', () => {
    const productListBody = document.getElementById('product-list-body');
    const productFormView = document.getElementById('product-form-view');
    const dashboardView = document.getElementById('dashboard-view');
    const productForm = document.getElementById('product-form');
    const navDashboard = document.getElementById('nav-dashboard');
    const navAddProduct = document.getElementById('nav-add-product');
    const pageTitle = document.getElementById('page-title');
    const formTitle = document.getElementById('form-title');
    const cancelBtn = document.getElementById('cancel-btn');

    // Navigation
    navDashboard.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });

    navAddProduct.addEventListener('click', (e) => {
        e.preventDefault();
        showAddProductForm();
    });

    cancelBtn.addEventListener('click', () => {
        showDashboard();
    });

    // Load Products
    fetchProducts();

    function fetchProducts() {
        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                renderProducts(products);
            })
            .catch(err => console.error('Error fetching products:', err));
    }

    function renderProducts(products) {
        productListBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('div');
            row.className = 'product-row';
            row.innerHTML = `
                <div class="col-name">${product.name}</div>
                <div class="col-price">$${product.price}</div>
                <div class="col-category">${product.category || '-'}</div>
                <div class="col-actions">
                    <button class="btn-edit" data-id="${product._id}">Edit</button>
                    <button class="btn-delete" data-id="${product._id}">Delete</button>
                </div>
            `;
            productListBody.appendChild(row);
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

    // Form Submission
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('product-id').value;
        const data = {
            name: document.getElementById('name').value,
            price: document.getElementById('price').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            image: document.getElementById('image').value
        };

        if (id) {
            // Update
            fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(() => {
                    alert('Product updated successfully');
                    showDashboard();
                    fetchProducts();
                })
                .catch(err => console.error('Error updating product:', err));
        } else {
            // Create
            fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(() => {
                    alert('Product created successfully');
                    showDashboard();
                    fetchProducts();
                })
                .catch(err => console.error('Error creating product:', err));
        }
    });

    function editProduct(id) {
        fetch(`/api/products/${id}`)
            .then(res => res.json())
            .then(product => {
                document.getElementById('product-id').value = product._id;
                document.getElementById('name').value = product.name;
                document.getElementById('price').value = product.price;
                document.getElementById('description').value = product.description;
                document.getElementById('category').value = product.category || '';
                document.getElementById('image').value = product.image || '';

                showForm('Edit Product');
            })
            .catch(err => console.error('Error fetching product details:', err));
    }

    function deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            fetch(`/api/products/${id}`, {
                method: 'DELETE'
            })
                .then(res => res.json())
                .then(() => {
                    fetchProducts();
                })
                .catch(err => console.error('Error deleting product:', err));
        }
    }

    // View Switching Helpers
    function showDashboard() {
        dashboardView.style.display = 'block';
        productFormView.style.display = 'none';
        pageTitle.textContent = 'Dashboard';
        navDashboard.classList.add('active');
        navAddProduct.classList.remove('active');
    }

    function showAddProductForm() {
        productForm.reset();
        document.getElementById('product-id').value = '';
        showForm('Add New Product');
    }

    function showForm(title) {
        dashboardView.style.display = 'none';
        productFormView.style.display = 'block';
        pageTitle.textContent = title;
        formTitle.textContent = title;
        navDashboard.classList.remove('active');
        // If it's "Add Product", highlight the nav, otherwise (Edit) don't highlight add
        if (title === 'Add New Product') {
            navAddProduct.classList.add('active');
        } else {
            navAddProduct.classList.remove('active');
        }
    }
});
