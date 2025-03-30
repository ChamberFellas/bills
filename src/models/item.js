"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const mongoose = require('mongoose');
var mongoose_1 = require("mongoose");
// const Schema = mongoose.Schema;
var billSchema = new mongoose_1.default.Schema({
    // _id: {
    //     type: String,
    //     required: false
    // },
    Item: {
        type: String,
        required: true
    },
    Payee: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
                type: mongoose_1.default.Schema.Types.ObjectId,
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
}, { timestamps: true });
var Bill = mongoose_1.default.model('Bill', billSchema);
// module.exports = Bill;
exports.default = Bill;
