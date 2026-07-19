import { ImageResponse } from "next/og";

export const alt = "Shorya Gupta — Backend & Distributed Systems Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #05050a 0%, #0c111d 100%)",
          color: "#e6e8ef",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Constellation accents */}
        <div
          style={{
            position: "absolute",
            top: 90,
            right: 110,
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: "#4f8dff",
            boxShadow: "0 0 24px 6px rgba(79,141,255,0.5)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 170,
            right: 260,
            width: 5,
            height: 5,
            borderRadius: 9999,
            background: "#7caaff",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 260,
            right: 150,
            width: 4,
            height: 4,
            borderRadius: 9999,
            background: "#9aa1b2",
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#4f8dff",
            letterSpacing: 6,
          }}
        >
          SHORYA@GUPTA
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.1,
          }}
        >
          I build reliable
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.1,
            color: "#4f8dff",
          }}
        >
          distributed systems.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 28,
            color: "#9aa1b2",
          }}
        >
          Backend Engineering · System Design · Codeforces Expert
        </div>
      </div>
    ),
    { ...size },
  );
}
