import request from "supertest";
import { app } from "../../index"
import router from "../../routes"
import Bill from "../../models/item"
import mongoose from "mongoose"
import {Types} from "mongoose"

// Tests
// Adding a bill object

// typically object looks like this:

/*

const sample_bill_obj = {
  item: "Rent",
  user: "Alice",
  deadline: "---", // How we repping deadlines
  amount: 600.00,
  WhoHasToPay:  ["Bob, Charlie"],
  WhoPaid: [], // Id's rather than names?

}
  */

describe("Add bills", () => {

  let sample_bill: any;

  beforeEach(() => {

    jest.restoreAllMocks();

    sample_bill = {
      Item: "rent",
      Payee: new Types.ObjectId("111122223333444455556666"),
      Amount: Number(600), 
      Status: "Unpaid",
      Deadline: new Date("May 14, 2025"),
      Recurring: 30,
      Payors: [new Types.ObjectId("aaaabbbbccccddddeeeeffff"), new Types.ObjectId("123456789abcdef123456789"), new Types.ObjectId("111222333444555666777888")]
    };


    jest.spyOn(Bill.prototype, "save").mockResolvedValue(async function () {
        return {_id: new Types.ObjectId("999988887777666655554444"),...sample_bill};
      }
    )


  })

  test("Regular bill addition functions correctly:", async () => {
    const response = await request(app).post("/add-bill").send(sample_bill).set("Content-Type", "application/json");
    expect(response.status).toBe(201)
    expect(Bill.prototype.save).toHaveBeenCalledTimes(1)

  })

  test("Error thrown when amount is not a number", async() => {
    sample_bill.Amount = "not_a_number"
    const response = await request(app).post("/add-bill").send(sample_bill).set("Content-Type", "application/json");
    expect(response.status).toBe(400)

  })

})

describe("edit bill tests", () => {

  let mockBill: any;
  const userId = new Types.ObjectId("111122223333444455556666");
  const otherUserId = new Types.ObjectId("222233334444555566667777");
  
  beforeEach(() => {
    // Create a mock bill object
    mockBill = {
      _id: new Types.ObjectId("123412341234123412341234"),
      Payee: userId,
      Item: "Rent",
      Amount: 500,
      Deadline: new Date("2025-12-31"),
      Recurring: 30,
      Payors: [
        { payorId: "aaaabbbbccccddddeeeeffff", status: "Unpaid" },
        { payorId: "123456789abcdef123456789", status: "Unpaid" },
      ],
      save: jest.fn()
    };

    mockBill.toObject = jest.fn().mockReturnValue({
      _id: mockBill._id,
      Payee: mockBill.Payee,
      Item: mockBill.Item,
      Amount: mockBill.Amount,
      Deadline: mockBill.Deadline,
      Recurring: mockBill.Recurring,
      Payors: mockBill.Payors,
    })

    // Mock Mongoose findById and save
    jest.spyOn(Bill,"findById").mockImplementation(function(id: Types.ObjectId) {
      console.log("string")
      console.log(id.toString())
      if (id.toString() === ":123412341234123412341234"){
        return mockBill;
      }
      return null;
    })

    jest.spyOn(mockBill, 'save').mockResolvedValue(mockBill);  // Mock save to return the mock bill

    //jest.spyOn(global.console, 'error').mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();  // Restore all mocks after tests
  });

  test('should return 404 if bill is not found', async () => {
    jest.spyOn(Bill, 'findById').mockResolvedValue(null);

    const response = await request(app)
      .put(`/edit-bill/:${new Types.ObjectId()}`)
      .send({
        userId: userId.toString(),
        Item: "Updated Rent",
        Amount: 600,
      });

    expect(response.status).toBe(404);
  });

  test('should return 403 if the user is not authorized to edit the bill', async () => {
    const response = await request(app)
      .put(`/edit-bill/:${mockBill._id}`)
      .send({
        userId: otherUserId.toString(),  // Other user trying to update
        Item: "Updated Rent",
        Amount: 600,
      });

    expect(response.status).toBe(403);
  });

  test('should successfully update the bill', async () => {
    const updatedBillData = {
      userId: userId.toString(),
      Item: "Updated Rent",
      Amount: 600,
      Deadline: new Date("2026-01-01"),
      Recurring: 31,
      Payors: [
        "aaaabbbbccccddddeeeeffff",
        "123456789abcdef123456789",
      ],
    };

    const response = await request(app)
      .put(`/edit-bill/:${mockBill._id}`)
      .send(updatedBillData);

    // Check if the response is successful
    expect(response.status).toBe(200);

    // Check that the mockBill's fields were updated correctly
    expect(mockBill.Item).toBe(updatedBillData.Item);
    expect(mockBill.Amount).toBe(updatedBillData.Amount);
    expect(mockBill.Recurring).toBe(updatedBillData.Recurring);
    expect(mockBill.Payors.length).toBe(updatedBillData.Payors.length);

    // Verify if save was called
    expect(mockBill.save).toHaveBeenCalledTimes(1);
  });

  test('should return 500 if an error occurs while updating the bill', async () => {
    jest.spyOn(mockBill, 'save').mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put(`/edit-bill/:${mockBill._id}`)
      .send({
        userId: userId.toString(),
        Item: "Updated Rent",
        Amount: 600,
      });

    expect(response.status).toBe(500);
  });
});

describe("DELETE /delete-bill/:billId", () => {
  let mockBill: any;
  const userId = new Types.ObjectId().toString(); // Mock user ID
  const billId = new Types.ObjectId().toString(); // Mock bill ID

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock bill object
    mockBill = {
      _id: billId,
      Payee: userId,
      Item: "Rent",
      Amount: 500,
      Deadline: new Date("2025-12-31"),
      Recurring: 30,
      Payors: [
        { payorId: new Types.ObjectId().toString(), status: "Unpaid" },
      ],
      toObject: jest.fn().mockReturnValue({
        _id: billId,
        Payee: userId,
        Item: "Rent",
        Amount: 500,
        Deadline: new Date("2025-12-31"),
        Recurring: 30,
        Payors: [
          { payorId: new Types.ObjectId().toString(), status: "Unpaid" },
        ],
      }),
    };

    
  });

  test("Should return 404 if the bill is not found", async () => {
    jest.spyOn(Bill, "findById").mockResolvedValue(null);

    const response = await request(app)
      .delete(`/delete-bill/${billId}`)
      .send({ userId });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Bill not found." });
  });

  test("Should return 403 if the user is not authorized to delete the bill", async () => {
    const differentUserId = new Types.ObjectId().toString(); // A different user ID
    jest.spyOn(Bill, "findById").mockResolvedValue(mockBill);

    const response = await request(app)
      .delete(`/delete-bill/${billId}`)
      .send({ userId: differentUserId });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "You are not authorized to delete this bill." });
  });

  test("Should return 200 if the bill is successfully deleted", async () => {
    jest.spyOn(Bill, "findById").mockResolvedValue(mockBill);
    jest.spyOn(Bill, "findByIdAndDelete").mockResolvedValue(mockBill);

    const response = await request(app)
      .delete(`/delete-bill/${billId}`)
      .send({ userId });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Bill deleted successfully." });
  });

  test("Should return 500 if an error occurs during deletion", async () => {
    jest.spyOn(Bill, "findById").mockRejectedValue(new Error("Database error"));
    jest.spyOn(Bill.prototype, "save").mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .delete(`/delete-bill/${billId}`)
      .send({ userId });

    expect(response.status).toBe(500);
  });
});


