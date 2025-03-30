"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var mongoose_1 = require("mongoose");
var item_1 = require("./models/item");
//import cron from 'node-cron';
var cron = require("node-cron");
// import User from './models/User';
// import House from '.models/house';
var uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";
var index = express();
index.use(express.json());
var payee = new mongoose_1.default.Types.ObjectId('67bf910446216131dd018d88');
//to test if finding/displaying the bills the user needs to pay are working
var user = new mongoose_1.default.Types.ObjectId('67bf910446216131dd018d14');
var generateNextDate = function (currentDate, recurringType) {
    var nextDate = new Date(currentDate);
    if (recurringType === 'Weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
    }
    else if (recurringType === 'Biweekly') {
        nextDate.setDate(nextDate.getDate() + 14);
    }
    else if (recurringType === 'Monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
};
cron.schedule('* * * * *', function () { return __awaiter(void 0, void 0, void 0, function () {
    var today, overdueBills, _i, overdueBills_1, bill, newDueDate, existingBill, newBill, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Checking for recurring bills..");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                today = new Date();
                return [4 /*yield*/, item_1.default.find({
                        Recurring: { $ne: 'None' },
                        Deadline: { $lte: today },
                    })];
            case 2:
                overdueBills = _a.sent();
                _i = 0, overdueBills_1 = overdueBills;
                _a.label = 3;
            case 3:
                if (!(_i < overdueBills_1.length)) return [3 /*break*/, 7];
                bill = overdueBills_1[_i];
                newDueDate = generateNextDate(bill.Deadline, bill.Recurring);
                return [4 /*yield*/, item_1.default.findOne({
                        Payee: bill.Payee,
                        Item: bill.Item,
                        Deadline: newDueDate,
                        Recurring: bill.Recurring,
                    })];
            case 4:
                existingBill = _a.sent();
                if (existingBill) {
                    return [3 /*break*/, 6];
                }
                newBill = new item_1.default({
                    Item: bill.Item,
                    Payee: bill.Payee,
                    Amount: bill.Amount,
                    Payors: bill.Payors.map(function (payors) { return ({
                        payorId: payors.payorId,
                        status: 'Unpaid'
                    }); }),
                    Deadline: newDueDate,
                    Recurring: bill.Recurring
                });
                return [4 /*yield*/, newBill.save()];
            case 5:
                _a.sent();
                console.log("New recurring bill created for ", bill.Item, "due: ", newDueDate);
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 3];
            case 7: return [3 /*break*/, 9];
            case 8:
                err_1 = _a.sent();
                console.error("Error generating recurring bills:", err_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
index.post('/add-bill', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, Item, Amount, Status, Deadline, Recurring, payorIds, payors, bill, result, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, Item = _a.Item, Amount = _a.Amount, Status = _a.Status, Deadline = _a.Deadline, Recurring = _a.Recurring, payorIds = _a.Payors;
                // const payee = new mongoose.Types.ObjectId('67bf910446216131dd018d82')
                // Validate Amount type
                if (typeof Amount !== 'number') {
                    res.status(400).send({ error: 'Amount must be a number.' });
                    return [2 /*return*/];
                }
                payors = payorIds.map(function (payorId) { return ({
                    payorId: payorId,
                    status: 'Unpaid', // Default status for each payor
                }); });
                bill = new item_1.default({
                    Item: Item,
                    Payee: payee,
                    Amount: Amount,
                    Payors: payors,
                    Status: Status,
                    Deadline: Deadline,
                    Recurring: Recurring,
                });
                return [4 /*yield*/, bill.save()];
            case 1:
                result = _b.sent();
                res.status(201).json(result);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _b.sent();
                console.error(err_2);
                res.status(500).json({ error: 'Error occurred while adding bill' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
index.get('/all-bill', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bills, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, item_1.default.find()];
            case 1:
                bills = _a.sent();
                res.json(bills);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.error(err_3);
                res.status(500).json({ error: 'Could not fetch bills.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
index.get('/bills-to-pay', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var billsToPay, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Finding bills where ", user, " is a payor.");
                return [4 /*yield*/, item_1.default.find({ "Payors.payorId": user })];
            case 1:
                billsToPay = _a.sent();
                res.json(billsToPay);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                console.error(err_4);
                res.status(500).json({ error: 'Could not fetch bills to pay.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
index.get('/bills-owed', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bills, unpaidBills, paidBills, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log("Finding bills where ", user, " is a payee.");
                return [4 /*yield*/, item_1.default.find({ Payee: user })];
            case 1:
                bills = _a.sent();
                unpaidBills = bills.filter(function (bill) { return bill.Payors.some(function (payor) { return payor.status == "Unpaid"; }); });
                paidBills = bills.filter(function (bill) { return bill.Payors.some(function (payors) { return payors.status == "Paid"; }); });
                res.json({
                    "You are owed: ": unpaidBills,
                    "Please confirm you have received: ": paidBills,
                });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                console.error(err_5);
                res.status(500).json({ error: 'Could not fetch bills owed.' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
mongoose_1.default.connect(uri)
    .then(function (result) {
    console.log('connected to bills db');
    index.listen(3000, function () { return console.log("Server running on port 3000"); });
})
    .catch(function (err) { return console.log(err); });
// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Electricity\", \"Payee\": \"John\", \"Amount\": 50, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-10\", \"Recurring\": \"Monthly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"
// Status system
// Edit bills
// Delete bills
// Recurring bills
// Getting all bills - only return relevant bills, ideally in order of deadlines
// app.get('/get-email/:userID)
// user should not need to type their own user id (remove payee like autofill) KINDA DONE
// individual payor status for bills DONE
// displaying all of current users unpaid bills DONE
// display all bills with current user as payee DONE
// displays bills where the current user needs to confirm receiving 
