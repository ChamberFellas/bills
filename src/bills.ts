import express = require('express');
// import express, { Request, Response } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Bill from './models/item';
//import cron from 'node-cron';
import cron = require('node-cron');
// import User from './models/User';
// import House from '.models/house';


const uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";

const index = express();
index.use(express.json());
const payee = new mongoose.Types.ObjectId('67bf910446216131dd018d88');

//to test if finding/displaying the bills the user needs to pay are working
const user = new mongoose.Types.ObjectId('67bf910446216131dd018d14');


const generateNextDate = (currentDate: Date, recurringType: string): Date => {
  const nextDate = new Date(currentDate);

  if (recurringType === 'Weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (recurringType === 'Biweekly') {
    nextDate.setDate(nextDate.getDate() + 14);
  } else if (recurringType === 'Monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
};

cron.schedule('* * * * *', async () => {
  console.log("Checking for recurring bills..");

  // add thing to check if overdue bills are unpaid and send notifications

  try {
    const today = new Date();

    const overdueBills = await Bill.find ({
      Recurring: { $ne: 'None'},
      Deadline: { $lte: today},
    });

    for (const bill of overdueBills) {
      const newDueDate = generateNextDate(bill.Deadline, bill.Recurring);
      
      const existingBill = await Bill.findOne({
        Payee: bill.Payee,
        Item: bill.Item,
        Deadline: newDueDate,
        Recurring: bill.Recurring,
      });

      if (existingBill) {
        console.log("No recurring bills need to be created today.")
        continue;
      }

      const newBill = new Bill ({
        Item: bill.Item, 
        Payee:bill.Payee,
        Amount: bill.Amount, 
        Payors: bill.Payors.map(payors => ({
          payorId: payors.payorId,
          status: 'Unpaid'
        })),
        Deadline: newDueDate,
        Recurring: bill.Recurring
      });
      await newBill.save();
      console.log("New recurring bill created for ", bill.Item, "due: ", newDueDate);
    }
  } catch (err) {
    console.error("Error generating recurring bills:", err)
  }
});


index.post('/add-bill', async (req: Request, res: Response): Promise<void> => {
  try {
    
    // const { Item, Payee, Amount, Status, Deadline, Recurring, Payors } = req.body;
    const { Item, Amount, Status, Deadline, Recurring, Payors: payorIds } = req.body;
    
    // const payee = new mongoose.Types.ObjectId('67bf910446216131dd018d82')

    // Validate Amount type
    if (typeof Amount !== 'number') {
      res.status(400).send({ error: 'Amount must be a number.' });
      return;
    }

    // Create Payors array with payorIds and default status as 'Unpaid'
    const payors = payorIds.map((payorId: string) => ({
      payorId,
      status: 'Unpaid',  // Default status for each payor
    }));
    
    //let payors = [];
    // if (userID) {
    //   const house = await House.findOne({ members: userID });
    //   if (housbe) {
    //     const flatmateIDs = house.members.filter(id => id != userID);
    //     const flatmates = await User.find({ _id: { $in: flatmateIDs } });
    //     payors = flatmates.map(user => user.name);
        
    //     if (customPayors && Array.isArray(customPayors)) {
    //       payors = customPayors;
    //     }
    //   }
    // }
    
    const bill = new Bill({
      Item,
      Payee: payee,
      Amount,
      Payors: payors,
      Status,
      Deadline,   
      Recurring,
    });
    
    const result = await bill.save();
    res.status(201).json(result);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Error occurred while adding bill' });
  }
});

index.get('/all-bill', async (req: Request, res: Response) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bills.' });
  }
});


index.get('/bills-to-pay', async (req: Request, res: Response) => {
  try {
    console.log("Finding bills where ", user, " is a payor.");

    //Find bills where the user is in the Payors list
    const billsToPay = await Bill.find({ "Payors.payorId": user });

    res.json(billsToPay);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bills to pay.' });
  }
});

index.get('/bills-owed', async (req: Request, res: Response) => {
  try {
    console.log("Finding bills where ", user, " is a payee.");

    //Find bills where the user is owed money
    const bills = await Bill.find({ Payee: user });

    const unpaidBills = bills.filter(bill => bill.Payors.some(payor => payor.status == "Unpaid"));

    const paidBills = bills.filter(bill => bill.Payors.some(payors => payors.status == "Paid"));


    res.json({
      "You are owed: ": unpaidBills,
      "Please confirm you have received: ":  paidBills,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bills owed.' });
  }
});

mongoose.connect(uri)
  .then((result) => {
    console.log('connected to bills db');
    index.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err: any) => console.log(err));


// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Electricity\", \"Payee\": \"John\", \"Amount\": 50, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-10\", \"Recurring\": \"Monthly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"

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
