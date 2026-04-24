import { describe, expect, it, vi, afterEach } from 'vitest';
import { apiFetch, ApiError } from '../../src/api/client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiFetch', () => {
  it('throws ApiError with status 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'Unauthenticated' } }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      )
    );

    const promise = apiFetch('/api/protected');

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      status: 401,
      message: 'Unauthenticated',
    });
  });

  it('does not set Content-Type for FormData requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'test.txt');

    await apiFetch<{ ok: boolean }>('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options.headers);

    expect(headers.has('Content-Type')).toBe(false);
  });
});