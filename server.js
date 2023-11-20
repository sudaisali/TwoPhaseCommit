const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/products'); 
const app = express();

mongoose.connect('mongodb://localhost:27017/account').then(() => {
  console.log("Database is Connected");
  app.listen(3000, () => {
    console.log("Server is starting");
  });
}).catch(error => console.log(error));

async function manageTransaction() {
  const session = await Product.startSession();

  try {
    await session.withTransaction(async () => {
      const productId = "6558ef52477e00ca3b4f3922";
      const quantityToReduce = 1;

      const prod = await Product.findOne({ _id: productId }).session(session);

      if (!prod) {
        throw new Error('Product not found');
      }

      if (prod.quantity < quantityToReduce) {
        throw new Error('Insufficient quantity');
      }

      await Product.updateOne(
        { _id: productId },
        { $inc: { quantity: -quantityToReduce, totalSales: quantityToReduce } }
      );
    });

    
    await session.commitTransaction();
  } finally {
    
    await session.endSession();
  }
}

manageTransaction();
