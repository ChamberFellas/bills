import request from "supertest";
import { app } from "../../index";

describe("GET /", () => {
  it("should return 200", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(200);
  });
});

// Tests
// Adding a bill object

// typically object looks like this:

const sample_bill_obj = {
  item: "Rent",
  user: "Alice",
  deadline: "---", // How we repping deadlines
  amount: 600.00,
  WhoHasToPay:  ["Bob, Charlie"],
  WhoPaid: [], // Id's rather than names?

}


// BILL CREATION (dep. None)

// -----

// CreateBill(item, user, deadline, amount, whohastoPay, WhoPaid)

  // UserID not in House
  // NULL userID

  // NULL item

  // *** using .today()

  // Deadline day before today?
  // Deadline on current day 
  // Deadline day after current day

  // Amount is negative
  // Amount is 0
  // Amount is integer (600.00)
  // Amount is float (600.99)

  // 
  // No people in the whoHasToPay (FAIL)
  // One person. All in house
  // Multiple people. All in house.
  // Multiple people. one of which does not exist.

  // Fully correct item: verifies all provided data. ensures whoPaid is initally blank

// ------

// UPDATING BILLS (dep. BILL CREATION)

// PersonHasPaid(userid) " Moves specified user id from whoHasToPay to HasPaid"
  // NULL userID
  // userID not in whoHasToPay
  // userID in whoHasToPay

// ChangeStatus(status)
  // Changes current status to current status.
  // fail on invalid status

// bill set to complete when len(Payors) == initial_user_count.
  // works for multiple people
  // works for one person

// Archive bills
  // Bills archived after 30 days after chore deadline

// ----- 

// CONTESTING BILLS

// will update after discussing with Aleena and Ayushi

// -----

// MISC (dep. BILL CREATION, UPDATING BILLS)

// NotifyDeadlineApproach(bill_id) " two days before deadline, get list of all people who have not paid that they need to pay"











