import { products } from "./products.js";

const productGrid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const sortSelect = document.querySelector("#sort-select");
const stockOnlyCheckbox = document.querySelector("#stock-only");

console.log("App loaded");
console.log("Products:", products);
console.log("Product grid:", productGrid);


function formatPrice(price) {
  return `${price.toLocaleString("hu-HU")} HUF`;
}

function renderProducts(productList) {
  productGrid.innerHTML = "";

  if (productList.length === 0) {
    productGrid.innerHTML = `
      <p class="empty-state">No products found.</p>
    `;
    return;
  }

  productList.forEach((product) => {
    const productCard = document.createElement("article");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <div class="product-image">
        <span>${product.name.charAt(0)}</span>
      </div>

      <div class="product-content">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>

        <p class="product-price">
          ${formatPrice(product.price)} / ${product.unit}
        </p>

        <p class="${product.inStock ? "stock in-stock" : "stock out-of-stock"}">
          ${product.inStock ? "In stock" : "Out of stock"}
        </p>

        <button 
          class="btn add-to-cart-btn" 
          data-product-id="${product.id}"
          ${product.inStock ? "" : "disabled"}
        >
          ${product.inStock ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    `;

    productGrid.append(productCard);
  });
}

function getFilteredProducts() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;
  const selectedSort = sortSelect.value;
  const stockOnly = stockOnlyCheckbox.checked;

  let filteredProducts = [...products];

  if (searchTerm !== "") {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm)
    );
  }

  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  if (stockOnly) {
    filteredProducts = filteredProducts.filter((product) => product.inStock);
  }

  if (selectedSort === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (selectedSort === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return filteredProducts;
}

function updateProductList() {
  const filteredProducts = getFilteredProducts();
  renderProducts(filteredProducts);
}

searchInput.addEventListener("input", updateProductList);
categoryFilter.addEventListener("change", updateProductList);
sortSelect.addEventListener("change", updateProductList);
stockOnlyCheckbox.addEventListener("change", updateProductList);

renderProducts(products);