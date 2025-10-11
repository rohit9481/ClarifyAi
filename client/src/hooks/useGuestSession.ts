import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export function useGuestSession() {
  const [guestSessionId, setGuestSessionId] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("guestSessionId");
    if (stored) {
      setGuestSessionId(stored);
    } else {
      const newId = uuidv4();
      localStorage.setItem("guestSessionId", newId);
      setGuestSessionId(newId);
    }
  }, []);

  return guestSessionId;
}
