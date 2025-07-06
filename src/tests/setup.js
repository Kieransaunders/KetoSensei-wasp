import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Wasp client operations
global.getTodaysTip = vi.fn();
global.trackStreak = vi.fn();

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));
