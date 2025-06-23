/**
 * Resize and compress image to maxWidth/maxHeight and under maxSizeKB.
 * Returns a Blob or null.
 */
export async function resizeImage(
  file: File,
  maxWidth = 512,
  maxHeight = 512,
  quality = 0.8
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        // Set canvas size
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, width, height);

        // Compress (jpeg, you can use "image/png" if needed)
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          quality // 0.7~0.9 is good
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
