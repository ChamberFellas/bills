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
// import User from './models/User';
// import House from '.models/house';
var uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";
var index = express();
index.use(express.json());
// mongoose.connect(uri)
//   .then((result) => {
//     console.log('connected to bills db');
//     index.listen(3000, () => console.log("Server running on port 3000"));
//   })
//   .catch((err: any) => console.log(err));
index.post('/add-bill', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, Item, Payee, Amount, Status, Deadline, Recurring, userID, Payors, bill, result, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                _a = req.body, Item = _a.Item, Payee = _a.Payee, Amount = _a.Amount, Status = _a.Status, Deadline = _a.Deadline, Recurring = _a.Recurring, userID = _a.userID, Payors = _a.Payors;
                // Validate Amount type
                if (typeof Amount !== 'number') {
                    res.status(400).send({ error: 'Amount must be a number.' });
                    return [2 /*return*/];
                }
                bill = new item_1.default({
                    Item: Item,
                    Payee: Payee,
                    Amount: Amount,
                    Payors: Payors,
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
                err_1 = _b.sent();
                console.error(err_1);
                res.status(500).json({ error: 'Error occurred while adding bill' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
index.get('/all-bill', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var bills, err_2;
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
                err_2 = _a.sent();
                console.error(err_2);
                res.status(500).json({ error: 'Could not fetch bills.' });
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
// index.get('/add-bill', (req, res) => {
//   const bill = new Bill ({
//     Item: 'Toilet paper',
//     Payee: '0',
//     Amount: '5.00',
//     Payors: ["Ayushi", "Aleena", "Felix", "Shatakshi", "Finn", "Talia"],
//     Status: 'Unpaid',
//     Deadline: '2025-03-10',
//     Recurring: 'Weekly',
//     Flag: 'true'
//   });
//   bill.save()
//     .then((result) => {
//       res.send(result)
//     })
//     .catch((err) => {
//       console.log(err)
//     });
// })
// index.get('/all-bills', (req, res) => {
//   Bill.find()
//     .then((result) => {
//       res.send(result);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// })
// index.get('/single-blog', (req, res) => {
//   Blog.findById('67bf910446216131dd018d82')
//     .then((result) => {
//       res.send(result)
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// })
