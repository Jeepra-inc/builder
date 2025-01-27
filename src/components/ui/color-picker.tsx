import React from 'react'
import { Input } from './input'

interface ColorPickerProps {
  value?: string
  onChange?: (color: string) => void
  disabled?: boolean
  className?: string
}

export function ColorPicker({ 
  value = '#000000', 
  onChange, 
  disabled = false, 
  className = '' 
}: ColorPickerProps) {
  return (
    <div className="flex items-center space-x-2">
      <Input 
        type="color" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full h-10 p-1 ${className}`}
      />
      <Input 
        type="text" 
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="flex-grow"
        placeholder="Enter color hex"
      />
    </div>
  )
}
