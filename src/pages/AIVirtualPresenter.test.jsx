import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AIVirtualPresenter from './AIVirtualPresenter';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';

describe('AIVirtualPresenter', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        cancel: vi.fn(),
        speak: vi.fn(),
        getVoices: () => [],
      },
    });
  });

  it('renders a numeric total duration instead of NaN', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LanguageProvider>
            <AIVirtualPresenter />
          </LanguageProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/0s\s*\/\s*90s/i)).toBeInTheDocument();
  });
});
