import React, { useState } from 'react'
import { Input } from './input'
import { Textarea } from './textarea'
import { Button } from './button'
import { Info, Code, Link } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'

interface AdvancedInputProps {
  type: 'text' | 'textarea' | 'json' | 'html' | 'liquid';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: string) => boolean | string;
  };
  helpText?: string;
  learnMoreLink?: string;
  disabled?: boolean;
}

export function AdvancedInput({
  type,
  value = '',
  onChange,
  placeholder,
  validation,
  helpText,
  learnMoreLink,
  disabled = false
}: AdvancedInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const validateInput = (inputValue: string) => {
    // Basic validation
    if (validation?.required && !inputValue) {
      setError('This field is required');
      return false;
    }

    if (validation?.minLength && inputValue.length < validation.minLength) {
      setError(`Minimum length is ${validation.minLength}`);
      return false;
    }

    if (validation?.maxLength && inputValue.length > validation.maxLength) {
      setError(`Maximum length is ${validation.maxLength}`);
      return false;
    }

    if (validation?.pattern && !new RegExp(validation.pattern).test(inputValue)) {
      setError('Invalid input format');
      return false;
    }

    // Custom validation
    if (validation?.custom) {
      const customValidation = validation.custom(inputValue);
      if (typeof customValidation === 'string') {
        setError(customValidation);
        return false;
      }
      if (customValidation === false) {
        setError('Custom validation failed');
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleChange = (newValue: string) => {
    validateInput(newValue);
    onChange?.(newValue);
  };

  const renderInput = () => {
    switch (type) {
      case 'text':
        return (
          <Input 
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-destructive' : ''}
          />
        );
      case 'textarea':
        return (
          <Textarea 
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={isExpanded ? 10 : 3}
            className={error ? 'border-destructive' : ''}
          />
        );
      case 'json':
      case 'html':
      case 'liquid':
        return (
          <>
            <Textarea 
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              rows={isExpanded ? 10 : 3}
              className={`font-mono ${error ? 'border-destructive' : ''}`}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {helpText && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{helpText}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {learnMoreLink && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => window.open(learnMoreLink, '_blank')}
          >
            <Link className="h-4 w-4 mr-1" /> Learn More
          </Button>
        )}
      </div>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
