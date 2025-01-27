import React, { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { ImageIcon, XIcon } from 'lucide-react'

interface ImageUploaderProps {
  value?: string | File
  onChange?: (image: string | File) => void
  disabled?: boolean
  className?: string
}

export function ImageUploader({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        onChange?.(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange?.('')
  }

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <Input 
        type="file" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="image-upload"
      />
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-40 object-cover rounded-md"
          />
          {!disabled && (
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <label 
          htmlFor="image-upload" 
          className={`
            flex items-center justify-center 
            w-full h-40 
            border-2 border-dashed rounded-md 
            hover:bg-accent/10 cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {!disabled && (
            <>
              <ImageIcon className="mr-2 h-6 w-6 text-muted-foreground" />
              <span className="text-muted-foreground">Upload Image</span>
            </>
          )}
        </label>
      )}
    </div>
  )
}
