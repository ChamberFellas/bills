import request from "supertest";
import { app } from "../../index";

describe("GET /", () => {
  it("should return 200", async () => {
    const response = await request(app).get("/status");
    expect(response.status).toBe(200);
  });
});
