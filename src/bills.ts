import express = require('express');
// import express, { Request, Response } from 'express';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Bill from './models/item';

// import User from './models/User';
// import House from '.models/house';


const uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";

const index = express();
index.use(express.json());

index.post('/add-bill', async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { Item, Payee, Amount, Status, Deadline, Recurring, userID, Payors } = req.body;
    
    // Validate Amount type
    if (typeof Amount !== 'number') {
      res.status(400).send({ error: 'Amount must be a number.' });
      return;
    }
    
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
      Payee,
      Amount,
      Payors,
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

mongoose.connect(uri)
  .then((result) => {
    console.log('connected to bills db');
    index.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err: any) => console.log(err));


// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Electricity\", \"Payee\": \"John\", \"Amount\": 50, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-10\", \"Recurring\": \"Monthly\", \"Payors\": [\"Alice\", \"Bob\"]}"


