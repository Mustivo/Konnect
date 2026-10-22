"use client";

import { useEffect, useState } from "react";

export type FaceVisibilityStatus = "no_camera" | "loading" | "checking" | "clear" | "not_clear" | "multiple_faces" | "error";

type FaceModel = {
  estimateFaces: (video: HTMLVideoElement, returnTensors?: boolean, flipHorizontal?: boolean, annotateBoxes?: boolean) => Promise<Array<{
    topLeft: [number, number] | { dataSync: () => Float32Array };
    bottomRight: [number, number] | { dataSync: () => Float32Array };
    probability?: number | { dataSync: () => Float32Array };
  }>>;
};

let faceModelPromise: Promise<FaceModel | null> | null = null;

async function loadFaceModel(): Promise<FaceModel | null> {
  if (!faceModelPromise) {
    faceModelPromise = (async () => {
      try {
        const tf = await import("@tensorflow/tfjs");
        await tf.ready();
        const blazeFace = await import("@tensorflow-models/blazeface");
        return await blazeFace.load({ maxFaces: 2, scoreThreshold: 0.75 }) as unknown as FaceModel;
      } catch (error) {
        console.error("[Face Check] Could not load face detection model:", error);
        faceModelPromise = null;
        return null;
      }
    })();
  }
  return faceModelPromise;
}

function values(value: [number, number] | { dataSync: () => Float32Array }) {
  return Array.isArray(value) ? value : Array.from(value.dataSync());
}

function probabilityValue(value?: number | { dataSync: () => Float32Array }) {
  if (typeof value === "number") return value;
  return value?.dataSync()[0] ?? 0;
}

export function useFaceVisibility(videoRef: React.RefObject<HTMLVideoElement | null>, cameraReady: boolean) {
  const [status, setStatus] = useState<FaceVisibilityStatus>("no_camera");

  useEffect(() => {
    if (!cameraReady) {
      setStatus("no_camera");
      return;
    }

    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let checking = false;
    let consecutiveClearFrames = 0;
    setStatus("loading");

    void loadFaceModel().then((model) => {
      if (!mounted) return;
      if (!model) {
        setStatus("error");
        return;
      }

      const checkFrame = async () => {
        if (!mounted) return;
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.videoWidth === 0 || video.paused || checking) {
          timer = setTimeout(checkFrame, 400);
          return;
        }

        checking = true;
        try {
          const faces = await model.estimateFaces(video, false, false, true);
          if (!mounted) return;
          if (faces.length > 1) {
            consecutiveClearFrames = 0;
            setStatus("multiple_faces");
          } else if (faces.length === 0) {
            consecutiveClearFrames = 0;
            setStatus("not_clear");
          } else {
            const face = faces[0];
            const [left, top] = values(face.topLeft);
            const [right, bottom] = values(face.bottomRight);
            const confidence = probabilityValue(face.probability);
            const width = right - left;
            const height = bottom - top;
            const centerX = (left + right) / 2 / video.videoWidth;
            const centerY = (top + bottom) / 2 / video.videoHeight;
            const insideFrame = left >= video.videoWidth * 0.02 && top >= video.videoHeight * 0.02 && right <= video.videoWidth * 0.98 && bottom <= video.videoHeight * 0.98;
            const faceIsClear = confidence >= 0.75 && width >= video.videoWidth * 0.18 && height >= video.videoHeight * 0.22 && centerX >= 0.2 && centerX <= 0.8 && centerY >= 0.18 && centerY <= 0.82 && insideFrame;

            if (faceIsClear) {
              consecutiveClearFrames++;
              setStatus(consecutiveClearFrames >= 3 ? "clear" : "checking");
            } else {
              consecutiveClearFrames = 0;
              setStatus("not_clear");
            }
          }
        } catch (error) {
          console.warn("[Face Check] Frame detection failed:", error);
          consecutiveClearFrames = 0;
          if (mounted) setStatus("error");
        } finally {
          checking = false;
          if (mounted) timer = setTimeout(checkFrame, 650);
        }
      };

      void checkFrame();
    });

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [cameraReady, videoRef]);

  return { status, faceVisible: status === "clear" };
}
