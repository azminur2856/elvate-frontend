// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { initials, isShopImagePath, mediaSrc, shopImageLoader } from "./media.ts";

describe("mediaSrc", () => {
  it("sends API photo paths through the proxy", () => {
    assert.equal(mediaSrc("/media/me/avatar?size=md&v=abc"), "/api/backend/media/me/avatar?size=md&v=abc");
    assert.equal(mediaSrc("/media/avatar/k3y"), "/api/backend/media/avatar/k3y");
  });

  it("ignores missing values and anything that is not our path", () => {
    assert.equal(mediaSrc(null), undefined);
    assert.equal(mediaSrc(undefined), undefined);
    assert.equal(mediaSrc(""), undefined);
    assert.equal(mediaSrc("profile.png"), undefined);
    assert.equal(mediaSrc("https://example.com/a.jpg"), undefined);
    assert.equal(mediaSrc("//example.com/media/a.jpg"), undefined);
  });
});

describe("initials", () => {
  it("takes the first letters of up to two words", () => {
    assert.equal(initials("Rahim Uddin Khan"), "RU");
    assert.equal(initials("  sara  "), "S");
  });

  it("falls back to ? without a name", () => {
    assert.equal(initials(undefined), "?");
    assert.equal(initials(""), "?");
    assert.equal(initials("   "), "?");
  });
});

describe("shop images", () => {
  it("recognises /img paths only", () => {
    assert.equal(isShopImagePath("/img/products/a.jpg"), true);
    assert.equal(isShopImagePath("https://example.com/img/a.jpg"), false);
  });

  it("adds the width and quality for the image CDN", () => {
    assert.equal(shopImageLoader({ src: "/img/p/a.jpg", width: 640 }), "/img/p/a.jpg?tr=w-640,q-75");
    assert.equal(shopImageLoader({ src: "/img/p/a.jpg?v=2", width: 320, quality: 60 }), "/img/p/a.jpg?v=2&tr=w-320,q-60");
  });
});
