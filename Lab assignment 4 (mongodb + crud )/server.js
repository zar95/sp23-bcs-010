const express = require('express');
const mongoose = require('mongoose');
var ProductModel = require('./models/Product.model.js');
const app = express();
const port = 3000;
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));


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

// get all the data in db
app.get('/api/products', async (req, res) => {
  const products = await ProductModel.find();
  res.send(products);
});

// get single data by id
app.get("/api/products/:id", async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  res.send(product);
});
// post data to db and entertain post request from postman
app.post("/api/products", async (req, res) => {
  let data = req.body;
  if (Array.isArray(data)) {
    const records = await ProductModel.insertMany(data);
    return res.send(records)
  }

  let record = new ProductModel(data);
  await record.save();
  res.send(record);
});

//delete data by id
app.delete('/api/products/:id', async (req, res) => {
  const product = await ProductModel.findByIdAndDelete(req.params.id)
  res.send(product)
});

// update data by id
app.put('/api/products/:id', async (req, res) => {
  let data = req.body;
  const record = await ProductModel.findById(req.params.id);
  record.name = data.name;
  record.price = data.price;
  record.description = data.description;
  record.category = data.category;
  record.image = data.image;
  await record.save();
  res.send(record);
});

app.get('/products', (req, res) => {
  res.sendFile(__dirname + '/public/products.html');
});

app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

app.get('/', (req, res) => {
  res.redirect('/products');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
}); 