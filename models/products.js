const mongoose = require('mongoose')
const productSchema = new  mongoose.Schema({
    name:String,
    quantity:Number,
    totalSales:Number
})
const product = mongoose.model('product', productSchema)
module.exports = product