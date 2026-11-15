# Simple Product JSON API (Workshop 1 Example)

This example demonstrates how to build a small JSON API with **Express.js** using in-memory data.

The API looks up a product by its ID, returns a JSON representation, optionally includes stock information, and responds with a proper 404 status when a product does not exist.

### What You'll Learn

- **In-Memory Data:** Model a small product collection with a JavaScript object.
- **Route Parameters:** Look up a resource using `req.params.productId`.
- **Optional Query Parameters:** Include extra fields only when they are requested.
- **JSON Responses:** Shape API responses with `res.json()`.
- **404 Handling:** Return a meaningful error and status code for missing resources.

### Project Structure

- `app.js` — Express server, in-memory product data, and the product endpoint.
- `package.json` — Project dependencies and the start script.

### Getting Started

**1. Install Dependencies**

```bash
npm install
```

**2. Start the Application**

```bash
npm start
```

### Exploring the Examples

| Route | What to Explore |
|---|---|
| `/api/products/100` | Retrieve the basic product fields without stock information. |
| `/api/products/100?includeStock=true` | Include the optional `inStock` field in the response. |
| `/api/products/999` | See the JSON 404 response for an unknown product. |

Available product IDs are `100`, `101`, and `102`. Try each one and compare the responses.

### Workshop Objective

By the end of this example, you should understand how a JSON API combines routing, parameters, optional query values, and HTTP status codes to expose data.
