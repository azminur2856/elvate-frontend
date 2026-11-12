// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PASSWORD_MIN_LENGTH, passwordProblem } from "./password.ts";

describe("passwordProblem", () => {
  it("accepts 8+ characters with letters and numbers", () => {
    assert.equal(passwordProblem("abcdefg1"), null);
    assert.equal(passwordProblem("1234567A"), null);
    assert.equal(passwordProblem("correct horse 9"), null);
  });

  it("rejects passwords shorter than the minimum", () => {
    assert.equal(PASSWORD_MIN_LENGTH, 8);
    assert.match(passwordProblem("abc123") ?? "", /at least 8/);
    assert.match(passwordProblem("") ?? "", /at least 8/);
  });

  it("rejects letters only or numbers only", () => {
    assert.match(passwordProblem("abcdefgh") ?? "", /letters and numbers/);
    assert.match(passwordProblem("12345678") ?? "", /letters and numbers/);
    assert.match(passwordProblem("!!!!!!!!") ?? "", /letters and numbers/);
  });
});
