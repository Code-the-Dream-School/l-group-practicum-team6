import { CustomAPIError } from './CustomAPIError';

export class UnauthenticatedError extends CustomAPIError {
  constructor(message: string = 'Unauthenticated') {
    super(message, 401);
  }
} 