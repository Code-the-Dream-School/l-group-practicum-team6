export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

type ErrorResponse = {
  error?: {
    message?: string;
  };
  message?: string;
};

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
      const errorData: ErrorResponse = await response.json();

      message = 
        errorData.error?.message || 
        errorData.message || 
        message;
    } catch {
      // Response body is not JSON — use default message
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}