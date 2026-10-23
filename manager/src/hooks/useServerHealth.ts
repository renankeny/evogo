import { useState, useEffect } from "react";
import { serverService } from "@/services/serverService";

export function useServerHealth() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    serverService
      .getStatus()
      .then((data) => {
        if (mounted) setOnline(data.status === "ok");
      })
      .catch(() => {
        if (mounted) setOnline(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { online, loading };
}
