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
var cron = require("node-cron");
// import User from './models/User';
// import House from '.models/house';
var uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";
var index = express();
index.use(express.json());
var payee = new mongoose_1.default.Types.ObjectId('67bf910446216131dd018d88');
// to test if finding/displaying the bills the user needs to pay are working
// const user = new mongoose.Types.ObjectId('67bf910446216131dd018d14');
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
// cron.schedule('0 0 * * *', async () => { /* Runs at midnight daily */ });
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
                    console.log("No recurring bills need to be created today.");
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
    var userId, billsToPay, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.query.userId;
                if (!userId) {
                    res.status(400).json({ error: "Missing userId query parameter." });
                    return [2 /*return*/];
                }
                console.log("Finding bills where ", userId, " is a payor.");
                return [4 /*yield*/, item_1.default.find({ "Payors.payorId": userId }).sort({ Deadline: 1 })];
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
    var userId, bills, unpaidBills, paidBills, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                userId = req.query.userId;
                if (!userId) {
                    res.status(400).json({ error: "Missing userId query parameter." });
                    return [2 /*return*/];
                }
                console.log("Finding bills where ", userId, " is a payee.");
                return [4 /*yield*/, item_1.default.find({ Payee: userId }).sort({ Deadline: 1 })];
            case 1:
                bills = _a.sent();
                unpaidBills = bills.filter(function (bill) { return bill.Payors.some(function (payor) { return payor.status === "Unpaid"; }); });
                paidBills = bills.filter(function (bill) { return bill.Payors.some(function (payor) { return payor.status === "Paid"; }); });
                res.json({
                    "You are owed": unpaidBills,
                    "Please confirm you have received": paidBills,
                });
                return [3 /*break*/, 3];
            case 2:
                err_5 = _a.sent();
                console.error(err_5);
                res.status(500).json({ error: "Could not fetch bills owed." });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Update the bill status [Unpaid -> Paid -> Confirmed]
index.put('/update-bill-status/:billId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var billId, _a, userId, payorId_1, newStatus, validStatuses, bill, payor, payor, err_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                billId = req.params.billId;
                _a = req.body, userId = _a.userId, payorId_1 = _a.payorId, newStatus = _a.newStatus;
                validStatuses = ["Unpaid", "Paid", "Confirmed"];
                if (!validStatuses.includes(newStatus)) {
                    res.status(400).json({ error: "Invalid status. Choose 'Unpaid', 'Paid', or 'Confirmed'." });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, item_1.default.findById(billId)];
            case 1:
                bill = _b.sent();
                if (!bill) {
                    res.status(404).json({ error: "Bill not found." });
                    return [2 /*return*/];
                }
                if (!(userId === payorId_1)) return [3 /*break*/, 3];
                payor = bill.Payors.find(function (p) { return p.payorId.toString() === payorId_1; });
                if (!payor) {
                    res.status(404).json({ error: "Payor not found in this bill." });
                    return [2 /*return*/];
                }
                if (payor.status !== "Unpaid") {
                    res.status(400).json({ error: "You can only change your status from 'Unpaid' to 'Paid'." });
                    return [2 /*return*/];
                }
                payor.status = "Paid"; // Update status
                return [4 /*yield*/, bill.save()];
            case 2:
                _b.sent();
                res.json({ message: "Payment marked as 'Paid'.", updatedBill: bill });
                return [2 /*return*/];
            case 3:
                if (!(bill.Payee.toString() === userId)) return [3 /*break*/, 5];
                payor = bill.Payors.find(function (p) { return p.payorId.toString() === payorId_1; });
                if (!payor) {
                    res.status(404).json({ error: "Payor not found in this bill." });
                    return [2 /*return*/];
                }
                if (payor.status !== "Paid") {
                    res.status(400).json({ error: "You can only change 'Paid' to 'Confirmed'." });
                    return [2 /*return*/];
                }
                payor.status = "Confirmed"; // Update status
                return [4 /*yield*/, bill.save()];
            case 4:
                _b.sent();
                res.json({ message: "Payment confirmed.", updatedBill: bill });
                return [2 /*return*/];
            case 5:
                // If neither a payor nor a payee, the user cannot update the status
                res.status(403).json({ error: "You are not authorized to update this payment status." });
                return [2 /*return*/];
            case 6:
                err_6 = _b.sent();
                console.error(err_6);
                res.status(500).json({ error: "An error occurred while updating payment status." });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Update a preexisting bill
index.put('/edit-bill/:billId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var billId, _a, userId, Item, Amount, Deadline, Recurring, Payors, bill, updatedBill, err_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                billId = req.params.billId;
                _a = req.body, userId = _a.userId, Item = _a.Item, Amount = _a.Amount, Deadline = _a.Deadline, Recurring = _a.Recurring, Payors = _a.Payors;
                return [4 /*yield*/, item_1.default.findById(billId)];
            case 1:
                bill = _b.sent();
                if (!bill) {
                    res.status(404).json({ error: "Bill not found." });
                    return [2 /*return*/];
                }
                // Check if the user is the payee (only the creator can edit)
                if (bill.Payee.toString() !== userId) {
                    res.status(403).json({ error: "You are not authorized to edit this bill." });
                    return [2 /*return*/];
                }
                // Update bill fields (only update provided values)
                if (Item)
                    bill.Item = Item;
                if (Amount)
                    bill.Amount = Amount;
                if (Deadline)
                    bill.Deadline = Deadline;
                if (Recurring)
                    bill.Recurring = Recurring;
                // If Payors are provided, update them
                if (Payors) {
                    bill.Payors = Payors.map(function (payorId) { return ({
                        payorId: payorId,
                        status: 'Unpaid' // Reset statuses to unpaid
                    }); });
                }
                return [4 /*yield*/, bill.save()];
            case 2:
                updatedBill = _b.sent();
                res.json({ message: "Bill updated successfully.", updatedBill: updatedBill });
                return [3 /*break*/, 4];
            case 3:
                err_7 = _b.sent();
                console.error("Error updating bill:", err_7);
                res.status(500).json({ error: "An error occurred while updating the bill." });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
// Delete a bill
index.delete('/delete-bill/:billId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var billId, userId, bill, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                billId = req.params.billId;
                userId = req.body.userId;
                return [4 /*yield*/, item_1.default.findById(billId)];
            case 1:
                bill = _a.sent();
                if (!bill) {
                    res.status(404).json({ error: "Bill not found." });
                    return [2 /*return*/];
                }
                // Check if the user is the payee (only the creator can delete)
                if (bill.Payee.toString() !== userId) {
                    res.status(403).json({ error: "You are not authorized to delete this bill." });
                    return [2 /*return*/];
                }
                // Delete the bill
                return [4 /*yield*/, item_1.default.findByIdAndDelete(billId)];
            case 2:
                // Delete the bill
                _a.sent();
                res.json({ message: "Bill deleted successfully." });
                return [3 /*break*/, 4];
            case 3:
                err_8 = _a.sent();
                console.error("Error deleting bill:", err_8);
                res.status(500).json({ error: "An error occurred while deleting the bill." });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
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
// Test adding a bill
// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Sample Recurring Bill\", \"Amount\": 123, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-30\", \"Recurring\": \"Weekly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"
// ------test updating a bill-------
// Payor marks own bill as paid
// curl -X PUT "http://localhost:3000/update-bill-status/67e9346cb70ec50344644723" -H "Content-Type: application/json" -d "{\"userId\": \"67bf910446216131dd018d14\", \"payorId\": \"67bf910446216131dd018d14\", \"newStatus\": \"Paid\"}"
// Payor tries to mark someone elses bill as paid (should fail)
// Payor tries to mark alrd paid bill as paid (idk what should happen)
// Payee marks bill as confirmed
// Payor tries to makr bill as confirmed but payee is not valid (should fail)
// user tries to mark bill as confirmed but is not tthe payor (should fail)
// ---------------testing editing a bill ------------
// curl -X PUT "http://localhost:3000/edit-bill/67e923b8f86bf385172ca729" -H "Content-Type: application/json" -d "{\"userId\": \"67bf910446216131dd018d88\", \"Item\": \"Updated Electricity Bill\", \"Amount\": 75, \"Deadline\": \"2025-04-15\", \"Recurring\": \"Biweekly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"
// Status system - nned to do the code so that if the user can change it from unpaid to paid to confirmed etc
// Edit bills
// Delete bills
// Recurring bills - DONE (?)
// Getting all bills - only return relevant bills, ideally in order of deadlines
// app.get('/get-email/:userID)
// user should not need to type their own user id (remove payee like autofill) KINDA DONE
// individual payor status for bills DONE
// displaying all of current users unpaid bills DONE
// display all bills with current user as payee DONE
// displays bills where the current user needs to confirm receiving 
// netstat -ano | findstr :3000
// taskkill /PID [enter number] /F
