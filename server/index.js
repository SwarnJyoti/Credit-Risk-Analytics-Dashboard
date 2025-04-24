
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Load customers from JSON file
const customersPath = path.join(__dirname, 'customers.json');
let customers = JSON.parse(fs.readFileSync(customersPath, 'utf-8'));

// GET all customers
app.get('/customers', (req, res) => {
  res.json(customers);
});

// POST to update customer status
app.post('/customers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const customerIndex = customers.findIndex(c => c.customerId === id);
  if (customerIndex === -1) return res.status(404).json({ error: 'Customer not found' });

  customers[customerIndex].status = status;

  // Save updated data to JSON file
  fs.writeFileSync(customersPath, JSON.stringify(customers, null, 2));

  res.json({ message: 'Status updated', customer: customers[customerIndex] });
});

// POST to simulate alert if risk score > 70
app.post('/alerts', (req, res) => {
  const { customerId, message } = req.body;
  console.log(`ALERT for Customer ${customerId}: ${message}`);
  res.status(200).json({ message: 'Alert received' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
