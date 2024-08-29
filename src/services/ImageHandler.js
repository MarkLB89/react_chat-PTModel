// src/services/ImageHandler.js

class ImageHandler {
    handleImageUpload(inputElement, onImageProcessed) {
        const file = inputElement.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDimension = 400;

                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxDimension) {
                            height *= maxDimension / width;
                            width = maxDimension;
                        }
                    } else {
                        if (height > maxDimension) {
                            width *= maxDimension / height;
                            height = maxDimension;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const resizedImageUrl = canvas.toDataURL(file.type);
                    onImageProcessed(resizedImageUrl);
                };
            };
            reader.readAsDataURL(file);
        }
    }
}

export default ImageHandler;
