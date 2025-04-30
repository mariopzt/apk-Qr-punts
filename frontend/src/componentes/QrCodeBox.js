import React from "react";
import { QRCodeCanvas } from "qrcode.react";

function QrCodeBox({ value, size = 180 }) {
  if (!value) return null;
  return (
    <div style={{ margin: "24px auto", textAlign: "center" }}>
      <QRCodeCanvas value={value} size={size} />
      <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>{value}</div>
    </div>
  );
}

export default QrCodeBox;
