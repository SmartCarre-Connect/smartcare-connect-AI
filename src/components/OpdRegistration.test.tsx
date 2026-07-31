import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpdRegistration } from './OpdRegistration';
import { doctorsApi, appointmentsApi } from '../services/api';

vi.mock('../services/api', () => ({
  doctorsApi: {
    list: vi.fn(),
  },
  appointmentsApi: {
    create: vi.fn(),
  },
}));

describe('OpdRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('suggests a department and urgency for symptoms before booking', async () => {
    vi.mocked(doctorsApi.list).mockResolvedValue({
      data: [],
    });

    render(
      <OpdRegistration
        currentLanguage="en"
        currentUser={{
          id: 'patient-1',
          name: 'Asha Rao',
          email: 'asha@example.com',
          role: 'patient',
          phone: '9999999999',
          isVerified: true,
        }}
      />
    );

    fireEvent.change(screen.getByLabelText(/describe your symptoms/i), {
      target: { value: 'Chest pain and breathing trouble after exercise' },
    });

    fireEvent.click(screen.getByRole('button', { name: /check recommendation/i }));

    const specialistLine = await screen.findByText(/Suggested specialist:/i);
    expect(specialistLine.closest('div')).toHaveTextContent('Cardiology');
    expect(screen.getByText(/Urgency:/i)).toBeInTheDocument();
  });

  it('loads doctors from the backend and creates an appointment when the slip is generated', async () => {
    vi.mocked(doctorsApi.list).mockResolvedValue({
      data: {
        doctors: [
          {
            _id: 'doc-1',
            full_name: 'Dr. Priya Rao',
            specialization: 'Cardiology',
            consultation_fee: 500,
            experience: 12,
            qualification: 'MBBS, MD',
            is_available: true,
          },
        ],
      },
    });
    vi.mocked(appointmentsApi.create).mockResolvedValue({
      data: {
        appointment_id: 'APT12345',
        id: 'appt-1',
      },
    });

    render(
      <OpdRegistration
        currentLanguage="en"
        currentUser={{
          id: 'patient-1',
          name: 'Asha Rao',
          email: 'asha@example.com',
          role: 'patient',
          phone: '9999999999',
          isVerified: true,
        }}
      />
    );

    await waitFor(() => expect(doctorsApi.list).toHaveBeenCalled());
    expect(screen.getByRole('option', { name: /Dr\. Priya Rao/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /generate opd token slip|generate opd slip|generate opd token/i }));

    await waitFor(() => expect(appointmentsApi.create).toHaveBeenCalled());
    expect(screen.getByText(/official digital opd token/i)).toBeInTheDocument();
  });

  it('shows a preselected doctor alert when initialSelectedDoctorId is provided', async () => {
    vi.mocked(doctorsApi.list).mockResolvedValue({
      data: {
        doctors: [
          {
            _id: 'doc-1',
            full_name: 'Dr. Priya Rao',
            specialization: 'Cardiology',
            consultation_fee: 500,
            experience: 12,
            qualification: 'MBBS, MD',
            is_available: true,
          },
        ],
      },
    });

    render(
      <OpdRegistration
        currentLanguage="en"
        currentUser={{
          id: 'patient-1',
          name: 'Asha Rao',
          email: 'asha@example.com',
          role: 'patient',
          phone: '9999999999',
          isVerified: true,
        }}
        initialSelectedDoctorId="doc-1"
      />
    );

    await waitFor(() => expect(doctorsApi.list).toHaveBeenCalled());
    expect(screen.getByText(/Doctor selected from availability/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Dr\. Priya Rao/i })).toBeInTheDocument();
  });
});
