const mongoose = require('mongoose');
const Account = require('./models/accounts')
const Transaction = require('./models/transaction')

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/testdb');


const performTransaction = async () => {

    try {

        //save talha and usama data
        const talhaAccount = await Account({
            name: 'Talha',
            balance: 500,
            pendingTransactions: []
        }).save()
        const usamaAccount = await Account({
            name: 'Usama',
            balance: 500,
            pendingTransactions: []
        }).save()

        //set Transaction State to initial
        const transaction = await Transaction({
            source: 'Talha',
            destination: 'Usama',
            value: 100,
            state: 'initial'
        }).save()


        //switch transaction state to pending
        const updateTransaction = await Transaction.findOneAndUpdate(
            { _id: transaction._id, state: 'initial' },
            { $set: { state: 'pending' } })


        //make transaction

        await Account.updateOne(
            {
                name: updateTransaction.source,
                pendingTransactions: {
                    $ne: updateTransaction._id
                }

            },
            {
                $inc: {
                    balance: -updateTransaction.value,
                },
                $push: {
                    pendingTransactions: updateTransaction._id
                }
            }
        )
        await Account.updateOne(
            {
                name: updateTransaction.destination,
                pendingTransactions: {
                    $ne: updateTransaction._id
                }

            },
            {
                $inc: {
                    balance: updateTransaction.value,
                },
                $push: {
                    pendingTransactions: updateTransaction._id
                }
            }
        )

        //change transaction state to commited
        await Transaction.updateOne(
            {
                _id: updateTransaction._id
            },
            {
                $set:
                {
                    state: 'committed'
                }
            }
        );
        //remove  pending transactions
        await Account.updateOne(
            { name: updateTransaction.source },
            {
                $pull: {
                    pendingTransactions: updateTransaction._id
                }
            }
        )
        await Account.updateOne(
            { name: updateTransaction.destination },
            {
                $pull: {
                    pendingTransactions: updateTransaction._id
                }
            }
        )

        // Step 7: Set Transaction State to Done
        await Transaction.updateOne(
            { _id: updateTransaction._id },
            { $set: { state: 'done' } });

        console.log('Transaction successful!');
    } catch (error) {
        console.log(error)
    }

}


performTransaction()