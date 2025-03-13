const mongoose = require('mongoose');
const Bill = require('./models/item');
const User = require('./models/User');    // Fixed: Added './' before models/User
const House = require('./models/house');
const express = require('express');

const uri = "mongodb+srv://aleenashaiju01:HTHxjwKWgWKjD2Y5@bills.jtyzd.mongodb.net/Bills";

const index = express();
index.use(express.json());

mongoose.connect(uri)
  .then((result) => {
    console.log('connected to bills db');
    index.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch((err) => console.log(err));

index.post('/add-bill', async (req, res) => {
  try {
    // Destructure all needed fields from req.body (including body)
    const { Item, Payee, Amount, Status, Deadline, Recurring, userID } = req.body;
    
    // Validate Amount type
    if (typeof Amount !== 'number') {
      return res.status(400).send({ error: 'Amount must be a number.' });
    }
    
    let payors = [];
    if (userID) {
      const house = await House.findOne({ members: userID });
      if (house) {
        const flatmateIDs = house.members.filter(id => id != userID);
        const flatmates = await User.find({ _id: { $in: flatmateIDs } });
        payors = flatmates.map(user => user.name);
        
        if (req.body.customPayors && Array.isArray(req.body.customPayors)) {
          payors = req.body.customPayors;
        }
      }
    }
    
    const bill = new Bill({
      Item,
      Payee,
      Amount,
      Payors: payors,
      Status,
      Deadline,   // Make sure the client sends a valid date string
      Recurring,
      body
    });
    
    const result = await bill.save();
    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Error occurred while adding bill' });
  }
});

index.get('/all-bill', async (req, res) => {
  try {
    const bills = await Bill.find();
    res.send(bills);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Could not fetch bills.' });
  }
});


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

