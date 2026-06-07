import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import User from '../../src/models/User';
import { connectTestDatabase, disconnectTestDatabase } from '../helpers/mongoMemoryServer';

describe('User model', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_LIFETIME = '1d';

    await connectTestDatabase();
    await User.syncIndexes();
  }, 120000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await disconnectTestDatabase();
    delete process.env.JWT_SECRET;
    delete process.env.JWT_LIFETIME;
  });

  describe('validation', () => {
    it('requires name, email, and password', () => {
      const error = new User({}).validateSync();
      expect(error?.errors.name).toBeDefined();
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.password).toBeDefined();
    });

    it('rejects name shorter than 2 chars', () => {
      const error = new User({
        name: 'a',
        email: 'a@b.co',
        password: 'password123',
      }).validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('rejects name longer than 50 chars', () => {
      const error = new User({
        name: 'a'.repeat(51),
        email: 'a@b.co',
        password: 'password123',
      }).validateSync();
      expect(error?.errors.name).toBeDefined();
    });

    it('rejects malformed email', () => {
      const error = new User({
        name: 'John',
        email: 'not-an-email',
        password: 'password123',
      }).validateSync();
      expect(error?.errors.email).toBeDefined();
    });

    it('rejects password shorter than 8 chars', () => {
      const error = new User({
        name: 'John',
        email: 'john@example.com',
        password: 'short',
      }).validateSync();
      expect(error?.errors.password).toBeDefined();
    });

    it('passes validation with valid fields', () => {
      const error = new User({
        name: 'John',
        email: 'john@example.com',
        password: 'password123',
      }).validateSync();
      expect(error).toBeUndefined();
    });
  });

  describe('email uniqueness', () => {
    it('rejects duplicate emails on save', async () => {
      await User.create({
        name: 'First',
        email: 'dupe@example.com',
        password: 'password123',
      });

      await expect(
        User.create({
          name: 'Second',
          email: 'dupe@example.com',
          password: 'password456',
        })
      ).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('password hashing', () => {
    it('hashes the password before saving', async () => {
      const plain = 'password123';
      const user = await User.create({
        name: 'John',
        email: 'hash@example.com',
        password: plain,
      });

      expect(user.password).not.toBe(plain);
      expect(user.password).toMatch(/^\$2[aby]?\$/);
    });

    it('does not re-hash password when it is unchanged on save', async () => {
      const user = await User.create({
        name: 'John',
        email: 'rehash@example.com',
        password: 'password123',
      });
      const hashedAfterCreate = user.password;

      user.name = 'Johnny';
      await user.save();

      expect(user.password).toBe(hashedAfterCreate);
    });

    it('re-hashes password when it changes', async () => {
      const user = await User.create({
        name: 'John',
        email: 'change@example.com',
        password: 'password123',
      });
      const initialHash = user.password;

      user.password = 'newpassword456';
      await user.save();

      expect(user.password).not.toBe(initialHash);
      expect(user.password).toMatch(/^\$2[aby]?\$/);
    });
  });

  describe('comparePassword', () => {
    it('returns true for the correct password', async () => {
      const user = await User.create({
        name: 'John',
        email: 'cmp@example.com',
        password: 'password123',
      });

      await expect(user.comparePassword('password123')).resolves.toBe(true);
    });

    it('returns false for an incorrect password', async () => {
      const user = await User.create({
        name: 'John',
        email: 'cmpno@example.com',
        password: 'password123',
      });

      await expect(user.comparePassword('wrongpassword')).resolves.toBe(false);
    });
  });

  describe('createJWT', () => {
    it('returns a non-empty JWT string', async () => {
      const user = await User.create({
        name: 'John',
        email: 'jwt@example.com',
        password: 'password123',
      });

      const token = user.createJWT();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('toJSON', () => {
    it('strips the password from serialized output', async () => {
      const user = await User.create({
        name: 'John',
        email: 'json@example.com',
        password: 'password123',
      });

      const serialized = JSON.parse(JSON.stringify(user));
      expect(serialized.password).toBeUndefined();
      expect(serialized.email).toBe('json@example.com');
    });
  });
});
