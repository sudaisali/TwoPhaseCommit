const mongoose = require('mongoose');
const Account = require('./models/accounts');
const Transaction = require('./models/transaction');

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/testdb');

const performTransaction = async () => {
    let updateTransaction;

    try {
        // Save Talha and Usama data
        const talhaAccount = await Account({
            name: 'Talha',
            balance: 500,
            pendingTransactions: [],
        }).save();
        const usamaAccount = await Account({
            name: 'Usama',
            balance: 500,
            pendingTransactions: [],
        }).save();

        
        const transaction = await Transaction({
            source: 'Talha',
            destination: 'Usama',
            value: 100,
            state: 'initial',
        }).save();

       
        updateTransaction = await Transaction.findOneAndUpdate(
            { _id: transaction._id, state: 'initial' },
            { $set: { state: 'pending' } }
        );

        
        await Account.updateOne(
            {
                name: updateTransaction.source,
                pendingTransactions: {
                    $ne: updateTransaction._id,
                },
            },
            {
                $inc: {
                    balance: -updateTransaction.value,
                },
                $push: {
                    pendingTransactions: updateTransaction._id,
                },
            }
        );

        
        if (true) {
            throw new Error('Simulated failure');
        }

        
        await Account.updateOne(
            {
                name: updateTransaction.destination,
                pendingTransactions: {
                    $ne: updateTransaction._id,
                },
            },
            {
                $inc: {
                    balance: updateTransaction.value,
                },
                $push: {
                    pendingTransactions: updateTransaction._id,
                },
            }
        );

       
        await Transaction.updateOne(
            {
                _id: updateTransaction._id,
            },
            {
                $set: {
                    state: 'committed',
                },
            }
        );

        
        await Account.updateOne(
            { name: updateTransaction.source },
            {
                $pull: {
                    pendingTransactions: updateTransaction._id,
                },
            }
        );

        await Account.updateOne(
            { name: updateTransaction.destination },
            {
                $pull: {
                    pendingTransactions: updateTransaction._id,
                },
            }
        );

        
        await Transaction.updateOne(
            { _id: updateTransaction._id },
            { $set: { state: 'done' } }
        );

        console.log('Transaction successful!');
    } catch (error) {
        console.log(error);

        
        if (updateTransaction) {
            await Account.updateOne(
                { name: updateTransaction.source },
                {
                    $inc: {
                        balance: updateTransaction.value,
                    },
                    $pull: {
                        pendingTransactions: updateTransaction._id,
                    },
                }
            );

            await Transaction.updateOne(
                { _id: updateTransaction._id },
                { $set: { state: 'failed' } }
            );
        }
    }
};

performTransaction();
