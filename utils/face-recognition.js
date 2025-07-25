import * as tf from '@tensorflow/tfjs-node-gpu';
import * as canvas from 'canvas';
import * as faceapi from '@vladmandic/face-api';
import * as path from 'path';
import * as fs from 'fs';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(__dirname, '../models');

export async function loadModels() {
    try {
        console.log('⏳ Loading Face-API.js models...');
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
        console.log('✅ Face-API.js models loaded');
    } catch (error) {
        console.error('❌ Error loading Face-API.js models:', error);
        throw error;
    }
}

export async function detectAndGetDescriptor(filePath) {
    const imageBuffer = fs.readFileSync(filePath);
    const img = await canvas.loadImage(imageBuffer);
    const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
    return detections;
}

export async function detectAndCompareAllDescriptors(filePath, targetDescriptor, threshold) {
    const imageBuffer = fs.readFileSync(filePath);
    const img = await canvas.loadImage(imageBuffer);

    // Deteksi semua wajah + landmarks + descriptor
    const detections = await faceapi
        .detectAllFaces(img)
        .withFaceLandmarks()
        .withFaceDescriptors();

    if (!detections || detections.length === 0) {
        console.log("❌ Tidak ada wajah terdeteksi");
        return undefined;
    }
    
    return detections
}

export async function euclideanDistance(descriptor1, descriptor2, threshold) {
    // const comparasion = faceapi.euclideanDistance(descriptor1, descriptor2);
    // console.log("jarak: ", comparasion)
    // return comparasion < threshold

    for (const det of descriptor2) {
        const distance = faceapi.euclideanDistance(det.descriptor, descriptor1);
        console.log(`🔍 Jarak wajah: ${distance.toFixed(4)}`);
        if (distance < threshold) {
          console.log("✅ Ada wajah yang cocok (di bawah threshold)");
          return true;
        }
      }
    
      console.log("❌ Tidak ada wajah yang cocok");
      return false;
}