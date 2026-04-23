import { CustomAPIError } from './CustomAPIError';

export class BadRequestError extends CustomAPIError {
  constructor(message: string = 'Bad Request') {
    super(message, 400);
  }
}