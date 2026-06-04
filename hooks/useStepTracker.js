import { Accelerometer } from "expo-sensors";
import { useEffect } from "react";

export function useStepTracker(onStepDetected) {
  useEffect(() => {
    let subscription;

    const threshold = 1.2;
    let lastUpdate = 0;

    const subscribe = async () => {
      const isAvailable = await Accelerometer.isAvailableAsync();

      if (isAvailable) {
        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener((data) => {
          let { x, y, z } = data;

          // Calculate the total force (magnitude)
          // Using the formula: sqrt(x^2 + y^2 + z^2)
          let acceleration = Math.sqrt(x * x + y * y + z * z);
          if (acceleration > threshold) {
            const now = Date.now();
            // Prevent counting 50 steps in 1 second (debounce)
            if (now - lastUpdate > 300) {
              if (onStepDetected) onStepDetected(1);
              lastUpdate = now;
            }
          }
        });
      } else {
        console.log("Accelerometer not available");
      }
    };

    subscribe();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [onStepDetected]);
}
