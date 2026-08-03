import { beforeEach, describe, expect, it, vi } from 'vitest';

const postMock = vi.fn();
const getMock = vi.fn();
const putMock = vi.fn();
const deleteMock = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: postMock,
      get: getMock,
      put: putMock,
      delete: deleteMock,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

import { authApi } from './api.js';

describe('authApi login', () => {
  beforeEach(() => {
    postMock.mockReset();
    getMock.mockReset();
    putMock.mockReset();
    deleteMock.mockReset();
  });

  it('uses the backend response for demo credentials when login succeeds', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        access_token: 'backend-demo-token',
        user_id: 'demo-user-id',
        full_name: 'Backend Demo Patient',
        role: 'patient',
        email: 'demo@smartcare.ai',
      },
    });

    const result = await authApi.login({
      email: 'demo@smartcare.ai',
      password: 'Demo@123',
      role: 'patient',
    });

    expect(postMock).toHaveBeenCalledWith('/auth/login', expect.objectContaining({
      email: 'demo@smartcare.ai',
      password: 'Demo@123',
      role: 'patient',
    }));
    expect(result.data.access_token).toBe('backend-demo-token');
  });
});
