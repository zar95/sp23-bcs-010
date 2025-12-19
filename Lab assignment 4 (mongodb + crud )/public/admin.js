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

    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = '/admin';
        });
    }

  
    if (productListBody) {
        fetchProducts();
    }

    function fetchProducts() {
        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                renderProducts(products);
            })
            .catch(err => console.error('Error fetching products:', err));
    }

    function renderProducts(products) {
        if (!productListBody) return;
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

       
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editProduct(btn.dataset.id));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
        });
    }

   
    if (productForm) {
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
               
                fetch(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(res => res.json())
                    .then(() => {
                        alert('Product updated successfully');
                        window.location.href = '/admin';
                    })
                    .catch(err => console.error('Error updating product:', err));
            } else {
                
                fetch('/api/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                    .then(res => res.json())
                    .then(() => {
                        alert('Product created successfully');
                        window.location.href = '/admin';
                    })
                    .catch(err => console.error('Error creating product:', err));
            }
        });
    }

    function editProduct(id) {
        window.location.href = `/admin/add-product?id=${id}`;
    }

  
    if (productForm) {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) {
            fetch(`/api/products/${id}`)
                .then(res => res.json())
                .then(product => {
                    document.getElementById('product-id').value = product._id;
                    document.getElementById('name').value = product.name;
                    document.getElementById('price').value = product.price;
                    document.getElementById('description').value = product.description;
                    document.getElementById('category').value = product.category || '';
                    document.getElementById('image').value = product.image || '';
                    if (formTitle) formTitle.textContent = 'Edit Product';
                    if (pageTitle) pageTitle.textContent = 'Edit Product';
                })
                .catch(err => console.error('Error fetching product details:', err));
        }
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
});
