import { ImageResponse } from "next/og";

export const alt = "Elvate — digital services and smart shopping";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "linear-gradient(135deg, #0f172a 0%, #111827 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 800,
              fontStyle: "italic",
            }}
          >
            E
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, fontStyle: "italic" }}>Elvate</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 68, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Elevate your digital experience
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#cbd5e1", maxWidth: 900 }}>
          PDF & image OCR, resizing and editing tools — plus smart shopping — in one place.
        </div>
        <div style={{ marginTop: 48, height: 8, width: 160, borderRadius: 4, background: "#ea580c" }} />
      </div>
    ),
    size
  );
}
