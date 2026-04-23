import { CustomAPIError } from './CustomAPIError';

export class NotFoundError extends CustomAPIError {
  constructor(message: string = 'Not found') {
    super(message, 404);
  }
}