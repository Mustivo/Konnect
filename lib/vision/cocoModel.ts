"use client";

// Dynamic client-side singleton loader for TensorFlow.js & COCO-SSD
// Prevents SSR hydration mismatches, duplicate weight downloads, and heavy bundling.

type ObjectDetectionModel = {
  detect: (
    element: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    maxNumBoxes?: number,
    minScore?: number
  ) => Promise<
    Array<{
      bbox: [number, number, number, number];
      class: string;
      score: number;
    }>
  >;
};

let cachedModelPromise: Promise<ObjectDetectionModel | null> | null = null;
let isLoaded = false;

export async function loadCocoModel(): Promise<ObjectDetectionModel | null> {
  if (typeof window === "undefined") return null;

  if (cachedModelPromise) {
    return cachedModelPromise;
  }

  cachedModelPromise = (async () => {
    try {
      // 1. Ensure TensorFlow.js core is loaded
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();

      // 2. Load COCO-SSD with lightweight MobileNet-v2 base for high speed & low CPU usage
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      const model = await cocoSsd.load({
        base: "lite_mobilenet_v2",
      });

      isLoaded = true;
      return model as unknown as ObjectDetectionModel;
    } catch (err) {
      console.error("[Vision AI] Failed to load COCO-SSD model:", err);
      cachedModelPromise = null;
      return null;
    }
  })();

  return cachedModelPromise;
}

export function isModelReady(): boolean {
  return isLoaded;
}
