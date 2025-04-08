import cron from "node-cron";
import Bill from "./models/item";

cron.schedule("0 0 * * *", async () => {
  console.log("Checking for recurring bills..");

  // add thing to check if overdue bills are unpaid and send notifications

  try {
    const today = new Date();
    const getAllBills = await Bill.find({
      "Payors.status": "Unpaid", // Checks if at least one payor has "Unpaid"
      // Recurring: { $ne: 'None'},
      // Deadline: { $lte: today},
    });

    for (const bill of getAllBills) {
      if (bill.Deadline == today) {
        // notify

        if (bill.Recurring != "None") {
          const newDueDate = generateNextDate(bill.Deadline, bill.Recurring);
          const existingBill = await Bill.findOne({
            Payee: bill.Payee,
            Item: bill.Item,
            Deadline: newDueDate,
            Recurring: bill.Recurring,
          });

          if (existingBill) {
            console.log("No recurring bills need to be created today.");
            continue;
          }

          const newBill = new Bill({
            Item: bill.Item,
            Payee: bill.Payee,
            Amount: bill.Amount,
            Payors: bill.Payors.map((payors) => ({
              payorId: payors.payorId,
              status: "Unpaid",
            })),
            Deadline: newDueDate,
            Recurring: bill.Recurring,
          });
          await newBill.save();
          console.log(
            "New recurring bill created for ",
            bill.Item,
            "due: ",
            newDueDate,
          );
        }
      } else if (bill.Deadline.getDate() + 3 == today.getDate()) {
        // notify
      }
    }
  } catch (err) {
    console.error("Error generating recurring bills:", err);
  }
});
