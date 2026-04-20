import { StatusCodes } from 'http-status-codes';
import { CustomAPIError } from './custom-api';

/*
    Error class used when a user is not authenticated (401).
 */
export class UnauthenticatedError extends CustomAPIError {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}
