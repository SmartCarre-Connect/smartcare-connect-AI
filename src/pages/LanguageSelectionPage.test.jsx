import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LanguageSelectionPage from './LanguageSelectionPage';
import { LanguageProvider } from '../context/LanguageContext';

describe('LanguageSelectionPage', () => {
  it('renders the premium language selection experience', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <LanguageSelectionPage />
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Choose your preferred language/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /English/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /हिन्दी/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /मराठी/i })).toBeInTheDocument();
  });
});
