import { CustomAPIError } from './CustomAPIError';
import { RATE_LIMIT } from '../constants';

export class TooManyRequestsError extends CustomAPIError {
  constructor(message: string = RATE_LIMIT.GLOBAL_MESSAGE) {
    super(message, 429);
  }
}
