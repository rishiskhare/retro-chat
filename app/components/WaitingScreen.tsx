"use client";

interface WaitingScreenProps {
  position: number;
  onCancel: () => void;
}

export function WaitingScreen({ position, onCancel }: WaitingScreenProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "32px", gap: "16px" }}>
      <div style={{ fontSize: "32px" }} className="hourglass-spin">
        &#9203;
      </div>
      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#333" }}>
        Looking for someone to chat with...
      </div>
      {position > 0 && (
        <div style={{ fontSize: "11px", color: "#666" }}>
          Position in queue: {position}
        </div>
      )}
      <button className="button" onClick={onCancel} style={{ marginTop: "8px" }}>
        Cancel
      </button>
    </div>
  );
}
