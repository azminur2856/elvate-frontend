// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  FEE_MESSAGE,
  FREE_THRESHOLD_MESSAGE,
  checkShippingForm,
  exampleOrderAmount,
  freeDeliveryProgress,
  parseWhole,
  shippingExample,
} from "./shipping.ts";

describe("parseWhole", () => {
  it("reads plain whole numbers", () => {
    assert.equal(parseWhole("60"), 60);
    assert.equal(parseWhole(" 0 "), 0);
    assert.equal(parseWhole("0120"), 120);
  });

  it("rejects everything else", () => {
    for (const t of ["", " ", "1.5", "-3", "6e1", "60৳", "abc", "12345678"]) assert.equal(parseWhole(t), null, t);
  });
});

describe("checkShippingForm", () => {
  const form = (insideDhaka: string, outsideDhaka: string, freeThreshold: string) => ({
    insideDhaka,
    outsideDhaka,
    freeThreshold,
  });

  it("accepts the API's limits", () => {
    assert.deepEqual(checkShippingForm(form("0", "5000", "0")), {
      fees: { insideDhaka: 0, outsideDhaka: 5000, freeThreshold: 0 },
      errors: {},
    });
    assert.deepEqual(checkShippingForm(form("60", "120", "100")).errors, {});
    assert.deepEqual(checkShippingForm(form("60", "120", "100000")).errors, {});
  });

  it("uses the API's messages", () => {
    const res = checkShippingForm(form("5001", "", "99"));
    assert.equal(res.fees, null);
    assert.deepEqual(res.errors, {
      insideDhaka: FEE_MESSAGE,
      outsideDhaka: FEE_MESSAGE,
      freeThreshold: FREE_THRESHOLD_MESSAGE,
    });
    assert.equal(checkShippingForm(form("60", "120", "100001")).errors.freeThreshold, FREE_THRESHOLD_MESSAGE);
    assert.equal(checkShippingForm(form("60.5", "120", "3000")).errors.insideDhaka, FEE_MESSAGE);
  });
});

describe("example line", () => {
  it("picks a round amount below the threshold", () => {
    assert.equal(exampleOrderAmount(3000), 2500);
    assert.equal(exampleOrderAmount(1000), 900);
    assert.equal(exampleOrderAmount(100), 90);
    assert.equal(exampleOrderAmount(150), 140);
    assert.equal(exampleOrderAmount(100000), 99500);
    for (const t of [100, 101, 333, 999, 1234, 3000, 77777, 100000]) {
      const a = exampleOrderAmount(t);
      assert.ok(a > 0 && a < t, `${t} → ${a}`);
    }
  });

  it("reads like the spec", () => {
    assert.equal(
      shippingExample({ insideDhaka: 60, outsideDhaka: 120, freeThreshold: 3000 }),
      "Example: a ৳2,500 order inside Dhaka pays ৳60. Orders of ৳3,000 or more ship free."
    );
    assert.equal(
      shippingExample({ insideDhaka: 60, outsideDhaka: 120, freeThreshold: 0 }),
      "Free delivery is off: every order pays the delivery fee."
    );
  });
});

describe("freeDeliveryProgress", () => {
  it("is null while free delivery is off", () => {
    assert.equal(freeDeliveryProgress(500, 0), null);
    assert.equal(freeDeliveryProgress(500, null), null);
    assert.equal(freeDeliveryProgress(500, undefined), null);
  });

  it("counts what is left", () => {
    assert.deepEqual(freeDeliveryProgress(2500, 3000), { free: false, remaining: 500, percent: 83 });
    assert.deepEqual(freeDeliveryProgress(0, 3000), { free: false, remaining: 3000, percent: 0 });
    assert.deepEqual(freeDeliveryProgress(2999.5, 3000), { free: false, remaining: 0.5, percent: 99 });
  });

  it("is free at or above the threshold", () => {
    assert.deepEqual(freeDeliveryProgress(3000, 3000), { free: true, remaining: 0, percent: 100 });
    assert.deepEqual(freeDeliveryProgress(4200, 3000), { free: true, remaining: 0, percent: 100 });
  });
});
