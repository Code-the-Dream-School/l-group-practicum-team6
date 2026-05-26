import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../src/context/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
  }),
}));

vi.mock('../../src/components/NavBar', () => ({
  default: () => <div>NavBar</div>,
}));

vi.mock('../../src/components/Footer', () => ({
  default: () => <div>Footer</div>,
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import SignUpPage from '../../src/pages/SignUpPage';

function renderPage() {
  render(
    <MemoryRouter>
      <SignUpPage />
    </MemoryRouter>
  );
}

describe('SignUpPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders sign up form fields', () => {
    renderPage();
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Alex Rivera')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
  });

  it('shows mismatch password validation', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'different123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows short password validation', async () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('toggles password visibility for both password fields', () => {
    renderPage();
    const pass = screen.getByPlaceholderText('Enter your password') as HTMLInputElement;
    const confirm = screen.getByPlaceholderText('Re-enter your password') as HTMLInputElement;

    expect(pass.type).toBe('password');
    expect(confirm.type).toBe('password');

    const toggles = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('type') === 'button');
    fireEvent.click(toggles[0]);
    expect(pass.type).toBe('text');
    expect(confirm.type).toBe('text');
  });

  it('submits, trims name/email, and navigates on success', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), {
      target: { value: '  John  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: '  john@example.com  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith('John', 'john@example.com', 'password123')
    );
    expect(mockNavigate).toHaveBeenCalledWith('/explore', { replace: true });
  });

  it('shows backend error on failed registration', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Email already exists'));
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Alex Rivera'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter your password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });
});
