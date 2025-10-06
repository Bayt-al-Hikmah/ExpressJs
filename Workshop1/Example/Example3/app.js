const express = require('express');
const app = express();
const port = 3000;
// Fake database to simulate product data
const productsDb = {
    "100": { name: "Laptop", price: 1200 },
    "101": { name: "Mouse", price: 25 },
    "102": { name: "Keyboard", price: 75 }
};

// API route to get product details
app.get('/api/products/:productId', (req, res) => {

    // Capture the productId from the URL
    const productId = req.params.productId;
    // Look up the product in our fake database
    const product = productsDb[productId];
    // If the product doesn’t exist, return a 404 error with a JSON message
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    // Get the optional currency query parameter, default to 'USD' if not provided
    const currency = req.query.currency || 'USD';
    // Build the response object
    const responseData = {
        id: productId,
        name: product.name,
        price: product.price,
        currency: currency
    };
    // Send the response as JSON
    res.json(responseData);

});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});