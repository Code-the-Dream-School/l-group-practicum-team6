import { CustomAPIError } from './CustomAPIError';

export class ForbiddenError extends CustomAPIError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
} 