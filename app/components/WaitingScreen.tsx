"use client";

import { useTheme } from "@/app/context/ThemeContext";
import { useOnlineCount } from "@/app/hooks/useOnlineCount";

interface WaitingScreenProps {
  position: number;
  onCancel: () => void;
}

export function WaitingScreen({ position, onCancel }: WaitingScreenProps) {
  const { theme } = useTheme();
  const onlineCount = useOnlineCount();

  const onlineIndicator = onlineCount !== null ? (
    <div style={{ fontSize: "13px", color: theme === "modern" ? "#636366" : "#666", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "4px" }}>
      <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
      {onlineCount} {onlineCount === 1 ? "user" : "users"} online
    </div>
  ) : null;

  if (theme === "modern") {
    return (
      <div className="modern-waiting">
        <div className="modern-waiting-spinner">
          <div className="modern-spinner" />
        </div>
        <div className="modern-waiting-text">
          Looking for someone to chat with...
        </div>
        {position > 0 && (
          <div className="modern-waiting-position">
            Position in queue: {position}
          </div>
        )}
        {onlineIndicator}
        <button className="modern-btn-secondary" onClick={onCancel} style={{ marginTop: "8px" }}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, padding: "32px", gap: "16px" }}>
      <div style={{ fontSize: "32px" }} className="hourglass-spin">
        &#9203;
      </div>
      <div style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>
        Looking for someone to chat with...
      </div>
      {position > 0 && (
        <div style={{ fontSize: "14px", color: "#666" }}>
          Position in queue: {position}
        </div>
      )}
      {onlineIndicator}
      <button className="button" onClick={onCancel} style={{ marginTop: "8px" }}>
        Cancel
      </button>
    </div>
  );
}
