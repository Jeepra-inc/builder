import React from 'react';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  id: string;
}

export function ImageUpload({ onImageUpload, id }: ImageUploadProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Convert the file to a data URL
        const base64String = reader.result as string;
        onImageUpload(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <>
      <input
        type="file"
        id={id}
        ref={hiddenFileInput}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="image/*"
      />
    </>
  );
}
