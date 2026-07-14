# Grocery Delivery Analytics Demo

A responsive grocery delivery webshop built with HTML, CSS and vanilla JavaScript.

The project includes dynamic product rendering, search and filtering, cart management, delivery slot selection, checkout validation, localStorage persistence, and analytics-style event tracking with consent-based dataLayer logic.

This project was built as part of my junior frontend developer portfolio.

## Live Demo

Coming soon.

## Features

- Grocery product listing
- Product search
- Category filtering
- Price sorting
- In-stock filtering
- Add to cart functionality
- Cart quantity controls
- Remove item from cart
- Subtotal, delivery fee and total calculation
- Cart persistence with localStorage
- Delivery slot selection
- Checkout form validation
- Fake order submission flow
- Analytics-style event tracking
- Custom dataLayer
- Consent-based tracking control
- Analytics debug panel

## Key Concepts Practiced

- HTML5
- CSS3
- JavaScript
- DOM manipulation
- Event listeners
- Product rendering
- Cart logic
- Form validation
- localStorage
- JavaScript modules
- Data layer logic
- Analytics events
- Consent logic
- Payload validation
- Browser DevTools
- Git and GitHub workflow

## Analytics Events

The project tracks the following events:

- product_list_viewed
- product_searched
- category_filtered
- sort_changed
- stock_filter_changed
- add_to_cart
- remove_from_cart
- cart_quantity_changed
- delivery_slot_selected
- order_submitted

If analytics consent is disabled, the webshop still works, but tracking events are blocked and not pushed to the dataLayer.

## Project Structure

```text
grocery-delivery-analytics-demo/
├── index.html
├── README.md
├── src/
│   ├── style.css
│   ├── app.js
│   ├── products.js
│   ├── cart.js
│   ├── analytics.js
│   ├── checkoutValidation.js
│   └── storage.js
└── screenshots/
```
