const mongoose = require('mongoose');
const Order = require('./models/Order.model.js');

mongoose.connect("mongodb://localhost:27017/labtest", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function showOrder() {
    try {
        // Using the ID from your screenshot
        const order = await Order.findById('6944f01dcede0eaa9880a66d');
        if (order) {
            console.log("Order Found:");
            console.log(JSON.stringify(order.items, null, 2));
        } else {
            console.log("Order not found (check ID or DB connection)");
        }
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
}

showOrder();
