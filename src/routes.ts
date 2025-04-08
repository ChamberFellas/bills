import { Router } from "express";
import Bill from "./models/item";

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
      Status,
      Deadline,
      Recurring,
      Payors: payorIds,
    } = req.body;

    // Validate Amount type
    if (typeof Amount !== "number") {
      res.status(400).send({ error: "Amount must be a number." });
      return;
    }

    const actualAmount = Amount / payorIds.length;

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
      Amount: actualAmount,
      Payors: payors,
      Status,
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
    const { userId, Item, Amount, Deadline, Recurring, Payors } = req.body;

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
    res
      .status(500)
      .json({ error: "An error occurred while updating the bill." });
    console.log("Error updating bill:", err);
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

    res
      .status(500)
      .json({ error: "An error occurred while deleting the bill." });
    console.log("Error deleting bill:", err);
  }
});

export default router;
