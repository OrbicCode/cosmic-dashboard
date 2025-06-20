import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { login } from '@/app/login/actions';
import LoginForm from './LoginForm';

jest.mock('@/app/login/actions', () => ({
  login: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('Login form', () => {
  const mockOnSuccess = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders the login form elements', () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit button' })
    ).toBeInTheDocument();
  });

  it('displays client-side empty fields error', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));

    await waitFor(() => {
      expect(screen.getByText('Email required')).toBeInTheDocument();
      expect(screen.getByText('Password required')).toBeInTheDocument();
    });
  });

  it('displays client-side invalid email error', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'invalidexample.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('displays client-side password too short error', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'pass' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));

    await waitFor(() => {
      expect(
        screen.getByText('Password must be at least 6 characters')
      ).toBeInTheDocument();
    });
  });

  it('disables inputs and button onSubmit', async () => {
    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));

    await waitFor(() => {
      expect(screen.getByLabelText('Email')).toBeDisabled();
      expect(screen.getByLabelText('Password')).toBeDisabled();
      expect(
        screen.getByRole('button', { name: 'Submit button' })
      ).toBeDisabled();
    });
  });

  it('logs in user and redirects to dashboard', async () => {
    (login as jest.Mock).mockResolvedValue({ success: true });

    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith(expect.any(FormData));
    });
    expect(login).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('displays server-side invalid credentials error', async () => {
    (login as jest.Mock).mockResolvedValue({
      error: 'Invalid login credentials',
    });

    render(<LoginForm onSuccess={mockOnSuccess} />);
    fireEvent.input(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit button' }));
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
  });
});
