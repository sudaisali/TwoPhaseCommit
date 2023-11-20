const mongoose = require('mongoose')


// Define Account schema
const accountSchema = new mongoose.Schema({
    name: String,
    balance: Number,
    pendingTransactions: [
        {
             type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' 
        }
        ],
  });


  const Account = mongoose.model('Account', accountSchema);


  module.exports = Account