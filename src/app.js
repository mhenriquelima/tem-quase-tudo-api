const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

const pRoutes = require('./routes/products');
const uRoutes = require('./routes/auth');
const errHandler = require('./middlewares/errHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
  res.json({ status: 'API Tem Quase Tudo no ar' });
});

app.use('/api/produtos', pRoutes);
app.use('/api/users', uRoutes);

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

app.use(errHandler);

module.exports = app;
