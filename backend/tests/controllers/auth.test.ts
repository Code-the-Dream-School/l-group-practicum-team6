import { describe, it, expect, vi, beforeAll } from 'vitest';
import { register, login, logout } from '../../src/controllers/auth';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

describe('Auth Controller', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';
  });
  
  describe('register', () => {
    it('should return 201 and user data when all fields are provided', async () => {
      const req = {
        body: { name: 'John', email: 'john@example.com', password: 'password123' }
      } as Request;
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        cookie: vi.fn()
      } as unknown as Response;

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: 'John', email: 'john@example.com' })
      }));
    });

    it('should throw BadRequestError if name is missing', async () => {
      const req = {
        body: { email: 'john@example.com', password: 'password123' }
      } as Request;
      const res = {} as Response;

      await expect(register(req, res)).rejects.toThrow('Please provide name, email and password');
    });
  });

  describe('login', () => {
    it('should return 200 and user data when credentials are correct', async () => {
      const req = {
        body: { email: 'test@test.com', password: 'password123' }
      } as Request;
      
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        cookie: vi.fn()
      } as unknown as Response;

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ email: 'test@test.com' })
      }));
    });

    it('should throw BadRequestError if email or password is missing', async () => {
      const req = {
        body: { email: 'test@test.com' }
      } as Request;
      const res = {} as Response;

      await expect(login(req, res)).rejects.toThrow('Please provide email and password');
    });
  });

  describe('logout', () => {
    it('should return 200 on logout and clear cookie', async () => {
      const req = {} as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        cookie: vi.fn(),
      } as unknown as Response;

      await logout(req, res);
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.cookie).toHaveBeenCalledWith('token', 'logout', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ msg: 'user logged out!' });
    });
  });
});
