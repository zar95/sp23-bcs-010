const express = require('express');
const mongoose = require('mongoose');
var ProductModel = require('./models/Product.model.js');
const Order = require('./models/Order.model.js');
const app = express();
const port = 3000;
app.use(express.json());
const path = require('path');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
const session = require('express-session');
app.use(session({
  secret: 'my secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.urlencoded({ extended: true })); // Parse form data

// Middleware
/**
 * Middleware: checkCartNotEmpty
 * Purpose: Ensures that a user cannot proceed to checkout with an empty cart.
 * If the cart is empty or undefined, it redirects the user back to the cart page.
 */
const checkCartNotEmpty = (req, res, next) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/cart');
  }
  next();
};

const adminOnly = (req, res, next) => {
  if (req.session.user && req.session.user.email === 'admin@shop.com') {
    next();
  } else {
    res.status(403).send('Access Denied. Admins only. <a href="/login">Login as Admin</a>');
  }
};


mongoose.connect("mongodb://localhost:27017/labtest", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');

});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

// Login Routes
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  req.session.user = { email: req.body.email };
  if (req.body.email === 'admin@shop.com') {
    res.redirect('/admin');
  } else {
    res.redirect('/products');
  }
});

app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/products');
});


// get all the data in db
app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.send(products);
  } catch (err) {
    res.status(500).send({ error: "Error fetching products" });
  }
});

// get single data by id
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.send(product);
  } catch (err) {
    res.status(500).send({ error: "Error fetching product" });
  }
});
// post data to db and entertain post request from postman
app.post("/api/products", async (req, res) => {
  try {
    let data = req.body;
    if (Array.isArray(data)) {
      const records = await ProductModel.insertMany(data);
      return res.send(records)
    }

    let record = new ProductModel(data);
    await record.save();
    res.send(record);
  } catch (err) {
    res.status(500).send({ error: "Error saving product" });
  }
});

//delete data by id
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id)
    res.send(product)
  } catch (err) {
    res.status(500).send({ error: "Error deleting product" });
  }
});

// update data by id
app.put('/api/products/:id', async (req, res) => {
  try {
    let data = req.body;
    const record = await ProductModel.findById(req.params.id);
    if (!record) return res.status(404).send({ error: "Product not found" });

    record.name = data.name;
    record.price = data.price;
    record.description = data.description;
    record.category = data.category;
    record.image = data.image;
    await record.save();
    res.send(record);
  } catch (err) {
    res.status(500).send({ error: "Error updating product" });
  }
});

// Cart API
app.post('/api/cart', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  const product = req.body;

  // Prevent duplicate items
  const exists = req.session.cart.find(item => item._id === product._id);
  if (!exists) {
    req.session.cart.push(product);
  }

  res.send(req.session.cart);
});

app.get('/api/cart', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.send(req.session.cart);
});

app.post('/api/cart/remove', (req, res) => {
  const { id } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item._id !== id);
  }
  res.send(req.session.cart);
});

app.get('/products', (req, res) => {
  res.render('products');
});

// Admin Routes (Protected)
app.get('/admin', adminOnly, (req, res) => {
  res.render('admin-dashboard');
});

app.get('/admin/add-product', adminOnly, (req, res) => {
  res.render('admin-add-product');
});

app.get('/admin/orders', adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.render('admin-orders', { orders });
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

app.post('/admin/orders/update-status', adminOnly, async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await Order.findByIdAndUpdate(orderId, { status });
    res.redirect('/admin/orders');
  } catch (err) {
    res.status(500).send("Error updating order status");
  }
});

app.get('/cart', (req, res) => {
  res.render('cart');
});

app.get('/', (req, res) => {
  res.redirect('/products');
});

// Checkout Routes
app.get('/checkout', checkCartNotEmpty, (req, res) => {
  const cart = req.session.cart || [];
  res.render('checkout', { items: cart });
});

/**
 * Route: POST /checkout
 * Purpose: Handles the order creation process.
 * Logic:
 * 1. Validates that the cart is not empty.
 * 2. Iterates through the session cart items.
 * 3. Fetches the LATEST product details (especially price) from the database to ensure data integrity.
 *    This prevents users from manipulating prices in the session or client-side.
 * 4. Calculates the total amount based on database prices.
 * 5. Creates a new Order document and saves it to MongoDB.
 * 6. Clears the user's session cart.
 * 7. Redirects to the order confirmation page.
 */
app.post('/checkout', checkCartNotEmpty, async (req, res) => {
  try {
    const { customerName, customerEmail } = req.body;
    const cartSession = req.session.cart || [];

    let totalAmount = 0;
    const orderItems = [];

    // Recalculate total and verify items from DB
    for (const sessionItem of cartSession) {
      try {
        const product = await ProductModel.findById(sessionItem._id);
        if (product) {
          totalAmount += parseFloat(product.price);
          orderItems.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1 // Default to 1
          });
        }
      } catch (err) {
        console.error(`Error fetching product ${sessionItem._id}:`, err);
      }
    }

    if (orderItems.length === 0) {
      // If all items were invalid/deleted
      return res.redirect('/cart');
    }

    const order = new Order({
      customerName,
      customerEmail,
      items: orderItems,
      totalAmount
    });

    await order.save();
    req.session.cart = []; // Clear cart
    res.redirect(`/order-confirmation/${order._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error processing checkout");
  }
});

app.get('/order-confirmation/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.redirect('/products');
    }
    res.render('order-confirmation', { order });
  } catch (err) {
    console.error(err);
    res.redirect('/products');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});