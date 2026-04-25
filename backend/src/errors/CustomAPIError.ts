export class CustomAPIError extends Error {
  
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}