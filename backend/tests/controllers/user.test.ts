import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

// Mock models before importing controller
vi.mock('../../src/models/User');
vi.mock('../../src/models/UserVisual');
vi.mock('../../src/models/Visualizer');

import User from '../../src/models/User';
import UserVisual from '../../src/models/UserVisual';
import Visualizer from '../../src/models/Visualizer';

import {
  showCurrentUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUserVisuals,
  addVisualToCollection,
  removeVisualFromCollection,
} from '../../src/controllers/user';

// AuthRequest with req.user populated
interface AuthRequest extends Request {
  user?: { userId: string; name: string; email: string };
}

const FAKE_USER_ID = new mongoose.Types.ObjectId().toString();
const FAKE_VIS_ID  = new mongoose.Types.ObjectId().toString();

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json:   vi.fn(),
    send:   vi.fn(),
    cookie: vi.fn(),
  } as unknown as Response;
}

function makeReq(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    user: { userId: FAKE_USER_ID, name: 'Test User', email: 'test@example.com' },
    body: {},
    params: {},
    ...overrides,
  } as AuthRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── showCurrentUser ────────────────────────────────────────────────────────

describe('showCurrentUser', () => {
  it('returns 200 with user data when user exists', async () => {
    const fakeUser = { _id: FAKE_USER_ID, name: 'Test User', email: 'test@example.com' };
    vi.mocked(User.findById).mockResolvedValue(fakeUser as any);

    const req = makeReq();
    const res = makeRes();

    await showCurrentUser(req, res);

    expect(User.findById).toHaveBeenCalledWith(FAKE_USER_ID);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: fakeUser });
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(User.findById).mockResolvedValue(null);

    const req = makeReq();
    const res = makeRes();

    await expect(showCurrentUser(req, res)).rejects.toThrow('User not found');
  });
});

// ─── updateUser ─────────────────────────────────────────────────────────────

describe('updateUser', () => {
  it('throws BadRequestError when neither name nor email is provided', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();

    await expect(updateUser(req, res)).rejects.toThrow('Please provide name or email');
  });

  it('updates name and returns 200', async () => {
    const fakeUser = {
      _id: FAKE_USER_ID,
      name: 'Old Name',
      email: 'test@example.com',
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(User.findById).mockResolvedValue(fakeUser as any);

    const req = makeReq({ body: { name: 'New Name' } });
    const res = makeRes();

    await updateUser(req, res);

    expect(fakeUser.name).toBe('New Name');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
  });

  it('throws BadRequestError when new email is already in use', async () => {
    const fakeUser = {
      _id: FAKE_USER_ID,
      name: 'Test',
      email: 'old@example.com',
      save: vi.fn(),
    };
    vi.mocked(User.findById).mockResolvedValue(fakeUser as any);
    vi.mocked(User.findOne).mockResolvedValue({ _id: 'other-id' } as any);

    const req = makeReq({ body: { email: 'taken@example.com' } });
    const res = makeRes();

    await expect(updateUser(req, res)).rejects.toThrow('Email already in use');
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(User.findById).mockResolvedValue(null);

    const req = makeReq({ body: { name: 'Test' } });
    const res = makeRes();

    await expect(updateUser(req, res)).rejects.toThrow('User not found');
  });
});

// ─── updateUserPassword ─────────────────────────────────────────────────────

describe('updateUserPassword', () => {
  it('throws BadRequestError when fields are missing', async () => {
    const req = makeReq({ body: { currentPassword: 'old' } });
    const res = makeRes();

    await expect(updateUserPassword(req, res)).rejects.toThrow('Please provide all password fields');
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(null) } as any);

    const req = makeReq({ body: { currentPassword: 'old', newPassword: 'newpass1' } });
    const res = makeRes();

    await expect(updateUserPassword(req, res)).rejects.toThrow('User not found');
  });

  it('throws BadRequestError when current password is incorrect', async () => {
    const fakeUser = { comparePassword: vi.fn().mockResolvedValue(false) };
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) } as any);

    const req = makeReq({ body: { currentPassword: 'wrong', newPassword: 'newpass1' } });
    const res = makeRes();

    await expect(updateUserPassword(req, res)).rejects.toThrow('Current password is incorrect');
  });

  it('throws BadRequestError when new password is too short', async () => {
    const fakeUser = { comparePassword: vi.fn().mockResolvedValue(true) };
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) } as any);

    const req = makeReq({ body: { currentPassword: 'correct', newPassword: 'short' } });
    const res = makeRes();

    await expect(updateUserPassword(req, res)).rejects.toThrow('Password must be at least 8 characters');
  });

  it('updates password and returns 200', async () => {
    const fakeUser = {
      password: 'old',
      comparePassword: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) } as any);

    const req = makeReq({ body: { currentPassword: 'correct', newPassword: 'newpassword1' } });
    const res = makeRes();

    await updateUserPassword(req, res);

    expect(fakeUser.password).toBe('newpassword1');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Password updated' });
  });
});

// ─── deleteUser ─────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  it('throws BadRequestError when password is not provided', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();

    await expect(deleteUser(req, res)).rejects.toThrow('Please provide password');
  });

  it('throws NotFoundError when user does not exist', async () => {
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(null) } as any);

    const req = makeReq({ body: { password: 'pass' } });
    const res = makeRes();

    await expect(deleteUser(req, res)).rejects.toThrow('User not found');
  });

  it('throws BadRequestError when password is incorrect', async () => {
    const fakeUser = { _id: FAKE_USER_ID, comparePassword: vi.fn().mockResolvedValue(false) };
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) } as any);

    const req = makeReq({ body: { password: 'wrong' } });
    const res = makeRes();

    await expect(deleteUser(req, res)).rejects.toThrow('Invalid password');
  });

  it('deletes user and visuals then returns 204', async () => {
    const fakeUser = { _id: FAKE_USER_ID, comparePassword: vi.fn().mockResolvedValue(true) };
    vi.mocked(User.findById).mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) } as any);
    vi.mocked(UserVisual.deleteMany).mockResolvedValue({ deletedCount: 1 } as any);
    vi.mocked(User.findByIdAndDelete).mockResolvedValue(fakeUser as any);

    const req = makeReq({ body: { password: 'correct' } });
    const res = makeRes();

    await deleteUser(req, res);

    expect(UserVisual.deleteMany).toHaveBeenCalledWith({ userId: fakeUser._id });
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(fakeUser._id);
    expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    expect(res.send).toHaveBeenCalled();
  });
});

// ─── getUserVisuals ──────────────────────────────────────────────────────────

describe('getUserVisuals', () => {
  it('returns 200 with list of visuals', async () => {
    const fakeVisuals = [{ visualizerId: FAKE_VIS_ID }];
    vi.mocked(UserVisual.find).mockReturnValue({
      populate: vi.fn().mockResolvedValue(fakeVisuals),
    } as any);

    const req = makeReq();
    const res = makeRes();

    await getUserVisuals(req, res);

    expect(UserVisual.find).toHaveBeenCalledWith({ userId: FAKE_USER_ID });
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ data: fakeVisuals });
  });
});

// ─── addVisualToCollection ───────────────────────────────────────────────────

describe('addVisualToCollection', () => {
  it('throws BadRequestError for invalid ObjectId', async () => {
    const req = makeReq({ params: { id: 'not-valid-id' } });
    const res = makeRes();

    await expect(addVisualToCollection(req, res)).rejects.toThrow('Invalid visualizer ID');
  });

  it('throws NotFoundError when visualizer does not exist', async () => {
    vi.mocked(Visualizer.findById).mockResolvedValue(null);

    const req = makeReq({ params: { id: FAKE_VIS_ID } });
    const res = makeRes();

    await expect(addVisualToCollection(req, res)).rejects.toThrow('Visualizer not found');
  });

  it('throws BadRequestError when visualizer already in collection', async () => {
    vi.mocked(Visualizer.findById).mockResolvedValue({ _id: FAKE_VIS_ID } as any);
    vi.mocked(UserVisual.findOne).mockResolvedValue({ _id: 'exists' } as any);

    const req = makeReq({ params: { id: FAKE_VIS_ID } });
    const res = makeRes();

    await expect(addVisualToCollection(req, res)).rejects.toThrow('Visualizer already in collection');
  });

  it('adds visualizer to collection and returns 201', async () => {
    const fakeEntry = { userId: FAKE_USER_ID, visualizerId: FAKE_VIS_ID };
    vi.mocked(Visualizer.findById).mockResolvedValue({ _id: FAKE_VIS_ID } as any);
    vi.mocked(UserVisual.findOne).mockResolvedValue(null);
    vi.mocked(UserVisual.create).mockResolvedValue(fakeEntry as any);

    const req = makeReq({ params: { id: FAKE_VIS_ID } });
    const res = makeRes();

    await addVisualToCollection(req, res);

    expect(UserVisual.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
    expect(res.json).toHaveBeenCalledWith({ data: fakeEntry });
  });
});

// ─── removeVisualFromCollection ──────────────────────────────────────────────

describe('removeVisualFromCollection', () => {
  it('throws BadRequestError for invalid ObjectId', async () => {
    const req = makeReq({ params: { id: 'not-valid-id' } });
    const res = makeRes();

    await expect(removeVisualFromCollection(req, res)).rejects.toThrow('Invalid visualizer ID');
  });

  it('throws NotFoundError when entry is not in collection', async () => {
    vi.mocked(UserVisual.findOneAndDelete).mockResolvedValue(null);

    const req = makeReq({ params: { id: FAKE_VIS_ID } });
    const res = makeRes();

    await expect(removeVisualFromCollection(req, res)).rejects.toThrow('Visualizer not found in collection');
  });

  it('removes visualizer and returns 200', async () => {
    vi.mocked(UserVisual.findOneAndDelete).mockResolvedValue({ _id: 'entry' } as any);

    const req = makeReq({ params: { id: FAKE_VIS_ID } });
    const res = makeRes();

    await removeVisualFromCollection(req, res);

    expect(UserVisual.findOneAndDelete).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Removed from collection' });
  });
});
