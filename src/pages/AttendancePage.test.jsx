import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AttendancePage from './AttendancePage';

describe('AttendancePage', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success) => success({ coords: { latitude: 40.758, longitude: -73.9855 } }),
      },
    });
  });

  it('shows a success state when the user is inside the hospital zone', () => {
    render(
      <MemoryRouter initialEntries={['/attendance?role=trainee']}>
        <AttendancePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Current status/i)).toBeInTheDocument();
    expect(screen.getByText(/Attendance has been approved/i)).toBeInTheDocument();
  });
});
