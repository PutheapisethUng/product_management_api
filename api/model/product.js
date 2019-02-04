const mongoose = require('mongoose');
const validate = require('mongoose-validator');

const productNameValidator = [
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Product Name should be between 3 to 50 characters'
  })
];

const descriptionValidator = [
  validate({
    validator: 'isLength',
    arguments: [0, 200],
    message: 'Description can be max 200 characters'
  })
];

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  productName: { type: String, required: true, validate: productNameValidator },
  price: { type: Number, required: true },
  discount: { type: Number, required: true, default: '0' },
  description: { type: String, validate: descriptionValidator },
  productImage: { type: String, required: true },
  createDate: { type: Date, required: true, default: Date.now },
  updateDate: Date

});

module.exports = mongoose.model('Product', productSchema);