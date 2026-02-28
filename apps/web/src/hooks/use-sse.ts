import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SSEEvent } from "@homeboard/types";

export function useSSE() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = new EventSource("/events/stream");

    source.onmessage = (event) => {
      try {
        const data: SSEEvent = JSON.parse(event.data);

        if (data.type === "invalidate") {
          if (data.resource === "all") {
            queryClient.invalidateQueries();
          } else {
            // Invalidate specific keys.
            // We'll use simple keys ['chores'], ['todos'], ['events']
            queryClient.invalidateQueries({ queryKey: [data.resource] });
          }
        }
      } catch (e) {
        console.error("SSE Error:", e);
      }
    };

    source.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      // EventSource auto reconnects, but sometimes we might want to manually handle it if it fails hard.
    };

    return () => {
      source.close();
    };
  }, [queryClient]);
}
