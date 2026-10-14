import * as faceapi from '@vladmandic/face-api';

let isLoaded = false;
let loadPromise: Promise<boolean> | null = null;

const LOCAL_MODEL_URL = '/models';
const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

/**
 * Load face-api models once (Singleton).
 * Loads TinyFaceDetector, FaceLandmark68TinyNet, and FaceRecognitionNet.
 */
export async function loadFaceApiModels(): Promise<boolean> {
  if (isLoaded) return true;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // 1. Coba load dari folder lokal public/models/
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL)
        ]);
        isLoaded = true;
        console.log('✅ Face-API models loaded successfully from local models/');
        return true;
      } catch (localErr) {
        console.warn('⚠️ Gagal load model lokal, mencoba CDN fallback...', localErr);
        // 2. Fallback ke CDN resmi
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(CDN_MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(CDN_MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(CDN_MODEL_URL)
        ]);
        isLoaded = true;
        console.log('✅ Face-API models loaded successfully from CDN fallback');
        return true;
      }
    } catch (err) {
      console.error('❌ Gagal memuat model Face-API:', err);
      isLoaded = false;
      loadPromise = null;
      throw err;
    }
  })();

  return loadPromise;
}

export function isModelsLoaded(): boolean {
  return isLoaded;
}

/**
 * Mendeteksi 1 wajah dan mengekstrak 128-float descriptor
 */
export async function extractFaceDescriptor(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
) {
  if (!isLoaded) {
    await loadFaceApiModels();
  }

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.4
  });

  const detection = await faceapi
    .detectSingleFace(input, options)
    .withFaceLandmarks(true)
    .withFaceDescriptor();

  if (!detection) return null;

  return {
    descriptor: Array.from(detection.descriptor), // 128 float array
    rawDescriptor: detection.descriptor, // Float32Array
    detection: detection.detection,
    landmarks: detection.landmarks,
    score: detection.detection.score
  };
}

/**
 * Menghitung Euclidean Distance antara 2 descriptor 128-float
 * Nilai < 0.45 menunjukkan orang yang sama dengan probabilitas tinggi
 */
export function calculateEuclideanDistance(
  desc1: number[] | Float32Array,
  desc2: number[] | Float32Array
): number {
  return faceapi.euclideanDistance(desc1, desc2);
}

/**
 * Menghitung estimasi persentase kemiripan (0 - 100%)
 */
export function calculateSimilarityPercent(distance: number): number {
  // Jarak 0.0 -> 100%, Jarak 0.5 -> ~60%, Jarak >= 0.7 -> 0%
  const similarity = Math.max(0, Math.min(100, Math.round((1 - (distance / 0.7)) * 100)));
  return similarity;
}

/**
 * Mencari Tenaga Ahli yang paling cocok dari daftar descriptor
 */
export interface TenagaAhliDescriptorItem {
  id: number;
  nama: string;
  jabatan?: string;
  face_descriptor?: number[] | string | null;
}

export function findBestMatchingTenagaAhli<T extends TenagaAhliDescriptorItem>(
  queryDescriptor: Float32Array | number[],
  tenagaAhliList: T[],
  threshold = 0.50
) {
  let bestMatch: {
    item: T;
    distance: number;
    similarity: number;
  } | null = null;

  for (const item of tenagaAhliList) {
    if (!item.face_descriptor) continue;

    let targetDesc: number[] = [];
    if (typeof item.face_descriptor === 'string') {
      try {
        targetDesc = JSON.parse(item.face_descriptor);
      } catch {
        continue;
      }
    } else if (Array.isArray(item.face_descriptor)) {
      targetDesc = item.face_descriptor;
    }

    if (!Array.isArray(targetDesc) || targetDesc.length !== 128) continue;

    const distance = calculateEuclideanDistance(queryDescriptor, targetDesc);

    if (distance <= threshold) {
      if (!bestMatch || distance < bestMatch.distance) {
        bestMatch = {
          item,
          distance,
          similarity: calculateSimilarityPercent(distance)
        };
      }
    }
  }

  return bestMatch;
}

export { faceapi };
