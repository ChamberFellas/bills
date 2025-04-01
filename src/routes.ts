import { Router } from "express";
import Bill from "./models/item";
import axios from "axios";
import { Types } from "mongoose";
import mongoose from "mongoose";

const router = Router();

router.get("/status", (_, res) => {
  res.status(200).json({ status: "OK" });
});

router.post("/add-bill", async (req, res) => {
  try {
    const {
      Payee,
      Item,
      Amount,
      Deadline,
      Recurring,
      Payors: payorIds,
    } = req.body;

    // Validate Amount type
    if (typeof Amount !== "number") {
      res.status(400).send({ error: "Amount must be a number." });
      return;
    }

    const actualAccount = Amount / payorIds.length;

    // Create Payors array with payorIds and default status as 'Unpaid'
    const payors = payorIds.map((payorId: string) => ({
      payorId,
      status: "Unpaid", // Default status for each payor
    }));

    if (payorIds.includes(Payee)) {
      const payeeIndex = payors.findIndex(
        (payor: { payorId: string; status: string }) => payor.payorId === Payee,
      );
      if (payeeIndex !== -1) {
        payors[payeeIndex].status = "Confirmed";
      }
    }

    const bill = new Bill({
      Item,
      Payee,
      Amount: actualAccount,
      Payors: payors,
      Deadline,
      Recurring,
    });

    const result = await bill.save();
    res.status(201).json(result);
    // Notify the payees that they owe a new bill!!!
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Error occurred while adding bill" });
  }
});

router.get("/all-bill", async (req, res) => {
  try {
    console.log("Getting bills");
    const bills = await Bill.find();
    res.status(200).json(bills);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch bills." });
  }
});

router.get("/bills-to-pay", async (req, res) => {
  try {
    const { userId } = req.query; // Use query parameter

    if (!userId) {
      res.status(400).json({ error: "Missing userId query parameter." });
      return;
    }

    console.log("Finding bills where ", userId, " is a payor.");

    // Find bills where the user is in the Payors list and sort by deadline
    const billsToPay = await Bill.find({ "Payors.payorId": userId }).sort({
      Deadline: 1,
    });

    const simpleBills = [];
    // const userObjectId = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId
    // const userObjectId = userId; // Convert userId to ObjectId
    for (const bill of billsToPay) {
      const payorEntry = bill.Payors.find(payor => payor.payorId.equals(userId)); // Find the current user's entry

      simpleBills.push({
        Name: bill.Item,
        Amount: bill.Amount,
        DueDate: bill.Deadline,
        Paid: payorEntry ? payorEntry.status !== "Unpaid" : false, // Check the user's payment status
        Recipient: bill.Payee
      })
    }

    res.json(billsToPay);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch bills to pay." });
  }
});

router.get("/bills-owed", async (req, res) => {
  try {
    const { userId } = req.query; // Use query parameters

    if (!userId) {
      res.status(400).json({ error: "Missing userId query parameter." });
      return;
    }

    console.log("Finding bills where ", userId, " is a payee.");

    // Find bills where the user is owed money, sorted by deadline
    const bills = await Bill.find({ Payee: userId }).sort({ Deadline: 1 });

    // Separate unpaid and paid bills
    const unpaidBills = bills.filter((bill) =>
      bill.Payors.some((payor) => payor.status === "Unpaid"),
    );
    const paidBills = bills.filter((bill) =>
      bill.Payors.some((payor) => payor.status === "Paid"),
    );

    res.json({
      "You are owed": unpaidBills,
      "Please confirm you have received": paidBills,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch bills owed." });
  }
});

router.put("/update-bill-status/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const { userId, payorId, newStatus } = req.body; // userId = the user making the request

    // Validate new status
    const validStatuses = ["Unpaid", "Paid", "Confirmed"];
    if (!validStatuses.includes(newStatus)) {
      res.status(400).json({
        error: "Invalid status. Choose 'Unpaid', 'Paid', or 'Confirmed'.",
      });
      return;
    }

    // Find the bill
    const bill = await Bill.findById(billId);
    if (!bill) {
      res.status(404).json({ error: "Bill not found." });
      return;
    }

    // If the user is a payor, they can only mark their own status as "Paid"
    if (userId === payorId) {
      const payor = bill.Payors.find((p) => p.payorId.toString() === payorId);
      if (!payor) {
        res.status(404).json({ error: "Payor not found in this bill." });
        return;
      }

      if (payor.status !== "Unpaid") {
        res.status(400).json({
          error: "You can only change your status from 'Unpaid' to 'Paid'.",
        });
        return;
      }

      payor.status = "Paid"; // Update status
      await bill.save();
      res.json({ message: "Payment marked as 'Paid'.", updatedBill: bill });
      return;
    }

    // If the user is the payee (bill owner), they can change "Paid" to "Confirmed"
    if (bill.Payee.toString() === userId) {
      const payor = bill.Payors.find((p) => p.payorId.toString() === payorId);
      if (!payor) {
        res.status(404).json({ error: "Payor not found in this bill." });
        return;
      }

      if (payor.status !== "Paid") {
        res
          .status(400)
          .json({ error: "You can only change 'Paid' to 'Confirmed'." });
        return;
      }

      payor.status = "Confirmed"; // Update status
      await bill.save();
      res.json({ message: "Payment confirmed.", updatedBill: bill });
      return;
    }

    // If neither a payor nor a payee, the user cannot update the status
    res.status(403).json({
      error: "You are not authorized to update this payment status.",
    });
    return;
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "An error occurred while updating payment status." });
  }
});

router.put("/edit-bill/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const { userId, Item, Amount, Payors, Deadline, Recurring } = req.body;

    // Find the bill by ID
    const bill = await Bill.findById(billId);

    if (!bill) {
      res.status(404).json({ error: "Bill not found." });
      return;
    }

    // Check if the user is the payee (only the creator can edit)
    if (bill.Payee.toString() !== userId) {
      res
        .status(403)
        .json({ error: "You are not authorized to edit this bill." });
      return;
    }

    // Update bill fields (only update provided values)
    if (Item) bill.Item = Item;
    if (Amount) bill.Amount = Amount;
    if (Deadline) bill.Deadline = Deadline;
    if (Recurring) bill.Recurring = Recurring;

    // If Payors are provided, update them
    if (Payors) {
      bill.Payors = Payors.map((payorId: string) => ({
        payorId,
        status: "Unpaid", // Reset statuses to unpaid
      }));
    }

    // Save the updated bill
    const updatedBill = await bill.save();

    res.json({ message: "Bill updated successfully.", updatedBill });
  } catch (err) {
    console.error("Error updating bill:", err);
    res
      .status(500)
      .json({ error: "An error occurred while updating the bill." });
  }
});

router.delete("/delete-bill/:billId", async (req, res) => {
  try {
    const { billId } = req.params;
    const { userId } = req.body; // User making the request

    // Find the bill by ID
    const bill = await Bill.findById(billId);

    if (!bill) {
      res.status(404).json({ error: "Bill not found." });
      return;
    }

    // Check if the user is the payee (only the creator can delete)
    if (bill.Payee.toString() !== userId) {
      res
        .status(403)
        .json({ error: "You are not authorized to delete this bill." });
      return;
    }

    // Delete the bill
    await Bill.findByIdAndDelete(billId);

    res.json({ message: "Bill deleted successfully." });
  } catch (err) {
    console.error("Error deleting bill:", err);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the bill." });
  }
});

const testPostBill = async () => {
  const bill = {
    _id: new Types.ObjectId(), // Automatically generates a MongoDB ObjectId
    Item: 'Rent',
    Payee: new Types.ObjectId(), // Example array of house IDs
    Amount: 100, // String description within max length
    Payors: [new Types.ObjectId()], // Set a specific deadline
    Deadline: new Date('2025-04-05'), // Repeat every 7 days (optional)
    Recurring: 'None', // Status is either "incomplete" or "complete"
  };

  try {
      const response = await axios.post('http://172.26.92.10:3000/bills', { bill });
      console.log('Response:', response.data);
  } catch (error: any) {
      console.error('Error:', error.response?.data || error.message);
  }
};

export default router;

// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Electricity\", \"Payee\": \"John\", \"Amount\": 50, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-10\", \"Recurring\": \"Monthly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"

// Test adding a bill
// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Sample Recurring Bill\", \"Amount\": 123, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-30\", \"Recurring\": \"Weekly\", \"Payors\": [\"67bf910446216131dd018d14\", \"67bf910446216131dd018d56\"]}"
// curl -X POST http://localhost:3000/add-bill -H "Content-Type: application/json" -d "{\"Item\": \"Kit Kats\", \"Payee\": \"67bf910446216131dd018d08\", \"Amount\": 200, \"Status\": \"Unpaid\", \"Deadline\": \"2025-03-30\", \"Recurring\": \"None\", \"Payors\": [\"67bf910446216131dd018d05\", \"67bf910446216131dd018d06\", \"67bf910446216131dd018d07\", \"67bf910446216131dd018d08\"]}"


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