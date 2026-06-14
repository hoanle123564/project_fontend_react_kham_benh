export const buildImageSrc = (image) => {
  if (!image) {
    return "";
  }

  return String(image).startsWith("data:")
    ? image
    : `data:image/jpeg;base64,${image}`;
};

export const getImagePayload = (image) => {
  if (!image) {
    return "";
  }

  if (String(image).startsWith("data:")) {
    return String(image).split(",")[1] || "";
  }

  return image;
};

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
