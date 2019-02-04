const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const productRoutes = require('./api/routes/products');

mongoose.connect('mongodb://node-shop:' + process.env.MONGO_ATLAS_PW + '@node-rest-shop-shard-00-00-0pumq.mongodb.net:27017,node-rest-shop-shard-00-01-0pumq.mongodb.net:27017,node-rest-shop-shard-00-02-0pumq.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-shop-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true });

mongoose.Promise = global.Promise;



app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(function (req, res, next) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authurization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if(req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }

  next();
});

app.use('/products', productRoutes);



app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;