import type { ApiError as ApiErrorResponse } from '@sonix/shared';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export async function apiFetch<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers = new Headers(options.headers);

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  const response = await fetch(url, { 
    ...options, 
    credentials: 'include',
    headers 
  });

  if (!response.ok) {
    let message = `Request failed with status: ${response.status}`;

    try {
      const errorData: ApiErrorResponse = await response.json();

      message = 
        errorData.error?.message || 
        message;
    } catch (error) {
      console.error(
        `Failed to parse error response as JSON`, 
        { 
          status: response.status, 
          url, 
          method: options.method ?? 'GET' 
        },
        error
      );
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}