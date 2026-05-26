import { CustomAPIError } from './CustomAPIError';

export class ConflictError extends CustomAPIError {
  constructor(message: string = 'Conflict') {
    super(message, 409);
  }
}
