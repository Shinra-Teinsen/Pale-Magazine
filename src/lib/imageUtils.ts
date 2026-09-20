/**
 * Helper to process and optimize image files uploaded from the user's device.
 * Scales down large camera / high-res photos while preserving crisp detail,
 * ensuring fast loading and reliable storage.
 */
export async function processDeviceImage(
  file: File,
  maxWidth: number = 1600,
  maxHeight: number = 1200,
  quality: number = 0.85
): Promise<{ dataUrl: string; fileName: string; sizeKb: number }> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, etc.).');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier depuis l\'appareil.'));
    };

    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result as string;
      if (!result) {
        reject(new Error('Impossible de lire l\'image sélectionnée.'));
        return;
      }

      const img = new window.Image();
      img.onerror = () => {
        reject(new Error('Le format de l\'image n\'a pas pu être décodé.'));
      };

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original dataUrl if canvas context isn't available
          resolve({
            dataUrl: result,
            fileName: file.name,
            sizeKb: Math.round(file.size / 1024)
          });
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP or JPEG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);
        const approxSizeKb = Math.round((dataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl,
          fileName: file.name,
          sizeKb: approxSizeKb
        });
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  });
}
