import { ValidationError } from '../lib/errors';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T = any> {
  required?: boolean;
  rules?: ValidationRule<T>[];
}

export interface ValidationSchema {
  [key: string]: FieldValidation;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const commonRules = {
  email: {
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  },
  password: {
    validate: (value: string) => value.length >= 6,
    message: 'Password must be at least 6 characters long'
  },
  phone: {
    validate: (value: string) => /^\+?[\d\s-]{10,}$/.test(value),
    message: 'Please enter a valid phone number'
  },
  url: {
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message: 'Please enter a valid URL'
  },
  postalCode: {
    validate: (value: string) => /^[A-Z\d]{3,10}$/i.test(value),
    message: 'Please enter a valid postal code'
  }
};

export function validateField<T>(
  value: T,
  validation: FieldValidation<T>
): string | null {
  if (validation.required && !value) {
    return 'This field is required';
  }

  if (validation.rules) {
    for (const rule of validation.rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
  }

  return null;
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema
): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, validation] of Object.entries(schema)) {
    const error = validateField(data[field], validation);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
}

export function validateFormAsync<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema,
  asyncValidations: Record<string, (value: any) => Promise<boolean>> = {}
): Promise<ValidationResult> {
  return new Promise(async (resolve) => {
    // First do sync validation
    const syncResult = validateForm(data, schema);
    if (!syncResult.isValid) {
      resolve(syncResult);
      return;
    }

    // Then do async validation
    const asyncErrors: Record<string, string> = {};
    let isValid = true;

    await Promise.all(
      Object.entries(asyncValidations).map(async ([field, validate]) => {
        try {
          const isFieldValid = await validate(data[field]);
          if (!isFieldValid) {
            asyncErrors[field] = `Invalid ${field}`;
            isValid = false;
          }
        } catch (error) {
          asyncErrors[field] = error instanceof Error ? error.message : 'Validation failed';
          isValid = false;
        }
      })
    );

    resolve({
      isValid,
      errors: { ...syncResult.errors, ...asyncErrors }
    });
  });
}

export function createFormValidator<T extends Record<string, any>>(schema: ValidationSchema) {
  return {
    validateField: (field: keyof T, value: T[keyof T]) => 
      validateField(value, schema[field as string]),
    validateForm: (data: T) => validateForm(data, schema),
    validateFormAsync: (
      data: T,
      asyncValidations?: Record<string, (value: any) => Promise<boolean>>
    ) => validateFormAsync(data, schema, asyncValidations)
  };
}

export function validatePostContent(content: string, platform: string): string | null {
  if (!content.trim()) {
    return 'Content is required';
  }

  const maxLengths: Record<string, number> = {
    twitter: 280,
    facebook: 63206,
    instagram: 2200,
    linkedin: 3000,
  };

  if (content.length > maxLengths[platform]) {
    return `Content exceeds maximum length for ${platform} (${maxLengths[platform]} characters)`;
  }

  return null;
}

export function validateScheduleDate(date: string): string | null {
  if (!date) {
    return 'Schedule date is required';
  }

  const scheduleDate = new Date(date);
  const now = new Date();

  if (scheduleDate <= now) {
    return 'Schedule date must be in the future';
  }

  return null;
}