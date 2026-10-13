let activeExamStream: MediaStream | null = null;

export function setExamMediaStream(stream: MediaStream | null) {
  activeExamStream = stream;
}

export function getExamMediaStream() {
  return activeExamStream;
}

export function releaseExamMediaStream() {
  activeExamStream?.getTracks().forEach((track) => track.stop());
  activeExamStream = null;
}
