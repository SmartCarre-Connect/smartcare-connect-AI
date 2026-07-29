import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RoleRoute from './RoleRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

describe('RoleRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children for an allowed role', () => {
    useAuth.mockReturnValue({ user: { role: 'patient' } });

    render(
      <MemoryRouter initialEntries={['/patient']}>
        <Routes>
          <Route
            path="/patient"
            element={
              <RoleRoute allowedRoles={['patient']}>
                <div>Dashboard visible</div>
              </RoleRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard visible')).toBeInTheDocument();
  });
});
