// Run with `npm test` (Node's built-in test runner, types stripped by Node).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { afterLoginTarget, loginHref, safeNextPath } from "./redirect.ts";

describe("safeNextPath", () => {
  it("keeps normal same-site paths with query and hash", () => {
    assert.equal(safeNextPath("/checkout"), "/checkout");
    assert.equal(safeNextPath("/orders/abc?tab=items#top"), "/orders/abc?tab=items#top");
    assert.equal(safeNextPath("/shop/product/blue-shirt#reviews"), "/shop/product/blue-shirt#reviews");
    assert.equal(safeNextPath("  /cart  "), "/cart");
  });

  it("rejects paths that normalise to another host", () => {
    for (const raw of ["/.//evil.com", "/..//evil.com", "/%2e//evil.com", "/a/..//evil.com", "/a\\..\\/evil.com"]) {
      assert.equal(safeNextPath(raw), "/", raw);
    }
  });

  it("rejects other origins, protocol-relative and backslash forms", () => {
    for (const raw of ["https://evil.com", "//evil.com", "/\\evil.com", "\\\\evil.com", "javascript:alert(1)", "evil.com"]) {
      assert.equal(safeNextPath(raw), "/", raw);
    }
  });

  it("rejects control characters", () => {
    assert.equal(safeNextPath("/orders\n/x"), "/");
    assert.equal(safeNextPath("/ord\ters"), "/");
  });

  it("rejects auth pages that would loop", () => {
    for (const raw of ["/login", "/login?next=/cart", "/signup", "/faceLogin", "/resetPassword/token"]) {
      assert.equal(safeNextPath(raw), "/", raw);
    }
  });

  it("returns the fallback for empty input", () => {
    assert.equal(safeNextPath(null), "/");
    assert.equal(safeNextPath(undefined, "/shop"), "/shop");
    assert.equal(safeNextPath("", "/shop"), "/shop");
  });
});

describe("loginHref", () => {
  it("adds an encoded next for real destinations only", () => {
    assert.equal(loginHref("/checkout"), "/login?next=%2Fcheckout");
    assert.equal(loginHref("/"), "/login");
    assert.equal(loginHref("/.//evil.com"), "/login");
    assert.equal(loginHref(null), "/login");
  });
});

describe("afterLoginTarget", () => {
  it("sends the home fallback to the role-aware landing route", () => {
    assert.equal(afterLoginTarget("/"), "/after-login");
    assert.equal(afterLoginTarget("/checkout"), "/checkout");
  });
});
