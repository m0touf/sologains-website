// Error handling utilities

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
};

export const logError = (error: unknown, context?: string) => {
  const appError = handleApiError(error);
  const logMessage = context 
    ? `${context}: ${appError.message}` 
    : appError.message;
  
  console.error(logMessage, {
    error: appError,
    timestamp: new Date().toISOString(),
  });
};

export const showUserError = (error: unknown, context?: string): string => {
  const appError = handleApiError(error);
  
  // Log the full error for debugging
  logError(error, context);
  
  // Return user-friendly message
  if (appError.status === 401) {
    return 'Please log in again';
  }
  
  if (appError.status === 403) {
    return 'You do not have permission to perform this action';
  }
  
  if (appError.status === 404) {
    return 'The requested resource was not found';
  }
  
  if (appError.status === 500) {
    return 'Server error. Please try again later';
  }
  
  return appError.message || 'Something went wrong. Please try again';
};
