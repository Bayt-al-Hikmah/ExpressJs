const express = require('express');

const app = express();
const port = 3000;

const productsDb = {
  '100': { name: 'Laptop', price: 1200, inStock: true },
  '101': { name: 'Mouse', price: 25, inStock: true },
  '102': { name: 'Keyboard', price: 75, inStock: false }
};

app.get('/api/products/:productId', (req, res) => {
  const { productId } = req.params;
  const product = productsDb[productId];

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const includeStock = req.query.includeStock === 'true';
  const responseData = {
    id: productId,
    name: product.name,
    price: product.price,
    currency: 'USD'
  };

  if (includeStock) {
    responseData.inStock = product.inStock;
  }

  res.json(responseData);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
