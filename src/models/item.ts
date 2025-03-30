// const mongoose = require('mongoose');
import mongoose from 'mongoose'
// const Schema = mongoose.Schema;

const billSchema = new mongoose.Schema({
    // _id: {
    //     type: String,
    //     required: false
    // },
    Item: {
        type: String,
        required: true
    },
    Payee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    Amount: {
        type: Number,
        required: true
    }, 
    // Payors: {
    //     type: [String],
    //     required: true
    // }, 
    Payors: [{
        payorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }, 
        status: {
            type: String, 
            enum: ['Unpaid', 'Paid', 'Confirmed'],
            required: true
        }
    }], 
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
        required: false
    },
    //#endregion#]]]]]]]]]]

}, {timestamps: true});

const Bill = mongoose.model('Bill', billSchema);
// module.exports = Bill;
export default Bill