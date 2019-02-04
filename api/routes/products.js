const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const fileFilter = (res, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('file upload wrong extension, we accept only png, jpeg and jpg'), false);
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

const Product = require('../model/product');

router.get('/', (req, res) => {
  Product.find()
  .select('_id productName price discount productImage')
  .exec()
  .then(docs => {
    const response = {
      products: docs.map(doc => {
        return {
          productName: doc.productName,
          _id: doc._id,
          price: doc.price,
          discount: doc.discount,
          productImage: doc.productImage
        }
      })
    };

    res.status(200).json(response);
  })
  .catch();
});

router.post('/', upload.single('productImage'), (req, res) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    productName: req.body.productName,
    price: req.body.price,
    description: req.body.description,
    discount: req.body.discount,
    productImage: req.file.path
  });

  product.save()
    .then(result => {
      res.status(201).json({
        _id: result._id
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });

});

router.get('/:productId', (req, res) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("_id productName description price discount productImage createDate updateDate")
    .exec()
    .then(product => {
      if(product){
        res.status(200).json({ product });
      } else {
        res.status(404).json({ message: 'No valid entry found for provided ID'});
      }
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.put('/upload/:productId', upload.single('productImage'), async(req, res) => {
  const id = req.params.productId;
  const product = await Product.findById({ _id: id });
  fs.unlink(product.productImage, (err) =>{
    if (err) throw err;
  });
  const updateOps = {};
  updateOps['productName'] = req.body.productName;
  updateOps['price'] = req.body.price;
  updateOps['description'] = req.body.description;
  updateOps['discount'] = req.body.discount;
  updateOps['productImage'] = req.file.path;
  updateOps['updateDate'] = new Date();
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.put('/:productId', (req, res) =>{
  const id = req.params.productId;
  const updateOps = {};
  updateOps['productName'] = req.body.productName;
  updateOps['price'] = req.body.price;
  updateOps['description'] = req.body.description;
  updateOps['discount'] = req.body.discount;
  updateOps['updateDate'] = new Date();
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

router.delete('/:productId', async(req, res) => {
  const id = req.params.productId;
  const product = await Product.findById({ _id: id });
  fs.unlink(product.productImage, (err) =>{
    if (err) throw err;
  });
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;