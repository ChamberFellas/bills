const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const billSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    Item: {
        type: String,
        required: true
    },
    Payee: {
        type: String,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    }, 
    Payors: {
        type: [String],
        required: true
    }, 
    Status: {
        type: String, 
        enum: ['Unpaid', 'Paid', 'Confirmed'],
        required: true
    }, 
    Deadline: {
        type: Date,
        required: true 
    },
    Recurring: {
        type: String,
        enum: ['Weekly', 'Biweekly', 'Monthly', 'None'], 
        required: true
    },
    Flag: {
        type: Boolean,
        required: true
    }
    //#endregion#]]]]]]]]]]

}, {timestamps: true});

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;