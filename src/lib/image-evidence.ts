export interface PreparedEvidence {
  url: string;
  name: string;
  bytes: number;
  width: number;
  height: number;
}

export async function prepareEvidence(file: File): Promise<PreparedEvidence> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Choose a PNG, JPG, or WebP screenshot.");
  }
  if (file.size === 0 || file.size > 15 * 1024 * 1024) {
    throw new Error("Choose an image between 1 byte and 15 MB.");
  }
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read this image."));
    reader.onerror = () => reject(new Error("Could not read this image. Please try again."));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be opened. Choose another screenshot."));
    image.src = original;
  });
  const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this screenshot. Please try again.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const url = canvas.toDataURL("image/jpeg", 0.75);
  const encoded = url.slice(url.indexOf(",") + 1);
  const bytes = encoded.length * 3 / 4 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
  return { url, name: file.name || "Pasted screenshot", width, height, bytes };
}
