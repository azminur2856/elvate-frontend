// Run with `npm test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { didAction, eyeAspectRatio, faceMetrics, isFrontal, type Point } from "./face-metrics.ts";

/** 68 points of a simple synthetic face: eyes at y=100, nose tip at `noseX`, eye height `eyeH`. */
function face({ noseX = 150, eyeH = 9 }: { noseX?: number; eyeH?: number } = {}): Point[] {
  const p: Point[] = Array.from({ length: 68 }, () => ({ x: 0, y: 0 }));
  const eye = (x0: number) => [
    { x: x0, y: 100 },
    { x: x0 + 10, y: 100 - eyeH / 2 },
    { x: x0 + 20, y: 100 - eyeH / 2 },
    { x: x0 + 30, y: 100 },
    { x: x0 + 20, y: 100 + eyeH / 2 },
    { x: x0 + 10, y: 100 + eyeH / 2 },
  ];
  eye(100).forEach((pt, i) => (p[36 + i] = pt)); // 100..130
  eye(170).forEach((pt, i) => (p[42 + i] = pt)); // 170..200
  p[30] = { x: noseX, y: 140 };
  return p;
}

describe("face metrics", () => {
  it("measures eye openness", () => {
    assert.equal(eyeAspectRatio(face().slice(36, 42)), 0.3);
    assert.equal(eyeAspectRatio(face({ eyeH: 3 }).slice(36, 42)), 0.1);
    assert.equal(eyeAspectRatio([]), 0);
  });

  it("puts the nose in the middle when facing the camera", () => {
    const m = faceMetrics(face());
    assert.ok(m);
    assert.equal(m.turn, 0.5);
    assert.ok(isFrontal(m));
    assert.equal(faceMetrics([]), null);
  });

  it("is not frontal when turned or with closed eyes", () => {
    assert.equal(isFrontal(faceMetrics(face({ noseX: 180 }))!), false);
    assert.equal(isFrontal(faceMetrics(face({ eyeH: 3 }))!), false);
  });

  it("sees closed eyes and a head turn against the first shot", () => {
    const neutral = faceMetrics(face())!;
    assert.ok(didAction("BLINK", neutral, faceMetrics(face({ eyeH: 4 }))!));
    assert.equal(didAction("BLINK", neutral, faceMetrics(face({ eyeH: 8 }))!), false);
    assert.ok(didAction("TURN_HEAD", neutral, faceMetrics(face({ noseX: 115 }))!));
    assert.ok(didAction("TURN_HEAD", neutral, faceMetrics(face({ noseX: 185 }))!));
    assert.equal(didAction("TURN_HEAD", neutral, faceMetrics(face({ noseX: 160 }))!), false);
  });
});
