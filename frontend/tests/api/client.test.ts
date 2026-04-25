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

  it('returns parsed JSON on successful response and sets credentials and JSON Content-Type', async () => {
    const responseBody = { data: { message: 'Hello World' } };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<typeof responseBody>('/api/hello', {
      method: 'POST',
      body: JSON.stringify({ test: true }),
    });

    expect(result).toEqual(responseBody);

    const [, options] = fetchMock.mock.calls[0];
    const headers = new Headers(options.headers);

    expect(options.credentials).toBe('include');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('uses fallback message when error response is not JSON', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const fetchMock = vi.fn().mockResolvedValue(
      new Response('Not JSON', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    await expect(apiFetch('/api/broken')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'Request failed with status: 500',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to parse error response as JSON',
      expect.objectContaining({
        status: 500,
        url: '/api/broken',
        method: 'GET',
      }),
      expect.any(Error)
    );
  });

  it('returns undefined for 204 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    );

    vi.stubGlobal('fetch', fetchMock);

    const result = await apiFetch<void>('/api/logout');

    expect(result).toBeUndefined();
    });

    it('uses default message when JSON error has no message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: {} }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );

    await expect(apiFetch('/api/no-message')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      message: 'Request failed with status: 500',
    });
  });
});