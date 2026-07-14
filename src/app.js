import { products } from "./products.js";

const productGrid = document.querySelector("#product-grid");

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

renderProducts(products);