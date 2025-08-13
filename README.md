# Mini POS System

A simple Point of Sale (POS) web application built with HTML, CSS, Bootstrap, and JavaScript. All data is stored in the browser's localStorage. No backend required.

## Features
- **User Authentication:** Signup, login, and logout. User data is stored in localStorage.
- **Product List:** Six predefined products with name, price, and "Add to Cart" button.
- **Shopping Cart:** Add products, adjust quantity, remove items. Cart is stored in localStorage.
- **Total Calculation:** Subtotal, tax (10%), and grand total update instantly.
- **Checkout:** Confirmation popup with purchased items and totals. Cart clears after checkout.
- **Receipt Download:** Download a beautiful HTML receipt after checkout.
- **Purchase History:** View previous orders per user, now available on a dedicated history page.
- **History Page:** View your complete purchase history on `history.html` with navigation from the dashboard.
- **Search Bar:** Filter products by name.
- **Dark Mode:** Toggle between light and dark themes.
- **Responsive Design:** Works on desktop and mobile (Bootstrap grid).

## How It Works
- All user, cart, and order data is stored in your browser's localStorage.
- No server or backend is needed. Everything runs in your browser.
- Each user has their own cart and purchase history.

## How to Run
1. **Download or clone the project files.**
2. **Open `index.html` in your web browser.**
   - Double-click `index.html` or right-click and choose "Open with" → your browser.
3. **Sign up for a new account or log in.**
4. **Browse products, add to cart, and checkout.**
5. **Download your receipt after checkout.**

## File Structure
- `index.html` — Login page
- `signup.html` — Signup page
- `dashboard.html` — POS dashboard (products, cart)
- `history.html` — Dedicated purchase history page
- `app.js` — Main application logic
- `style.css` — Custom styles

## Notes
- All data is stored locally. Clearing browser storage will erase users, carts, and history.
- No installation or server setup required.

---
Created for assignment purposes. For questions or improvements, contact the author.
