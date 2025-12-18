const showmorebtn = document.querySelector('.load-btn');
let allproduct = []
let filtered = []
let visible = 10;
let currentCategory = "All";

function fetchProducts() {
fetch('/api/products')
.then(res=>res.json())
.then(data=>{
    console.log(data);
    
    allproduct = data;
    filteredproducts('All')

})
.catch(err=>console.log(err)
)
};
window.onload = fetchProducts;


showmorebtn.addEventListener('click', ()=>{
  visible += 10;
  showProduct(filtered.slice(0,visible))

})


 function showProduct(data){

    const container = document.querySelector('.product-container');
    container.innerHTML = "";
    data.forEach((product) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>Price: $${product.price}</p>
          <p>Category: ${product.category}</p>
        `;
        container.appendChild(card);
      });
    }
    

   function filteredproducts(category){
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
  