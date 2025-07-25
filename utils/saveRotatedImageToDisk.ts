import sharp from "sharp";
import fs from "fs";
import path from "path";

export async function saveRotatedImageToDisk(
  buffer: Buffer,
  rfid: string,
  originalName: string
): Promise<string> {
  const now = new Date();
  const milliseconds = now.getMilliseconds().toString().padStart(3, "0");
  const datetimeStamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    "_" +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0") +
    "_" +
    milliseconds;

  const fileExtension = path.extname(originalName);
  const filename = `${rfid}_${datetimeStamp}${fileExtension}`;
  const uploadDir = path.join(__dirname, "../log_camera");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);

  await sharp(buffer)
    .rotate(180) // Rotate sesuai EXIF
    .toFile(filePath);

  return filename;
}