const showmorebtn = document.querySelector('.load-btn');
let allproduct = []
let filtered = []
let visible = 10;
let currentCategory = "All";

function fetchProducts() {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => {
      console.log(data);

      allproduct = data;
      filteredproducts('All')

    })
    .catch(err => console.log(err)
    )
};
window.onload = fetchProducts;


showmorebtn.addEventListener('click', () => {
  visible += 10;
  showProduct(filtered.slice(0, visible))

})


function showProduct(data) {

  const container = document.querySelector('.product-container');
  container.innerHTML = "";
  data.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <div class="card-body">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <div class="price">$${product.price}</div>
            <button class="btn-add-cart" onclick='addToCart(${JSON.stringify(product)})'>Add to Cart</button>
          </div>
        `;
    container.appendChild(card);
  });
}

function addToCart(product) {
  fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
    .then(res => res.json())
    .then(() => {
      alert('Added to cart!');
    })
    .catch(err => console.error('Error adding to cart:', err));
}

function filteredproducts(category) {
  currentCategory = category;
  visible = 10;

  if (category === "All") {
    filtered = allproduct;
  } else {
    filtered = allproduct.filter(product =>
      product.category.trim().toLowerCase() === category.trim().toLowerCase()
    );
  }

  showProduct(filtered.slice(0, visible));
}


// categorical filter button handeling

const filterbtns = document.querySelectorAll(".filter-btn");

filterbtns.forEach(btn => {
  btn.addEventListener("click", () => {

    filterbtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    filteredproducts(category);

  });
});