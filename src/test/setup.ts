import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
})

// Mock lottie-react to avoid canvas issues in tests
vi.mock('lottie-react', () => ({
  default: ({ className }: { className?: string }) => 
    React.createElement('div', { className, 'data-testid': 'lottie-animation' }),
}))

// Mock axios to prevent real API calls during tests
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })),
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}))

// Mock the API service specifically
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock all service modules
vi.mock('../services/loginService', () => ({
  login: vi.fn().mockResolvedValue({ token: 'mock-token', message: 'Success' }),
  register: vi.fn().mockResolvedValue({ userId: 'mock-user-id' }),
  forgotPassword: vi.fn().mockResolvedValue({ message: 'Email sent' }),
  resetPassword: vi.fn().mockResolvedValue({ message: 'Password reset' }),
  validateResetToken: vi.fn().mockResolvedValue({ valid: true }),
  AuthService: {
    login: vi.fn().mockResolvedValue({ token: 'mock-token', message: 'Success' }),
    register: vi.fn().mockResolvedValue({ userId: 'mock-user-id' }),
    getToken: vi.fn().mockReturnValue(null),
    isAuthenticated: vi.fn().mockReturnValue(false),
    validateResetToken: vi.fn().mockResolvedValue({ valid: true }),
  }
}))

vi.mock('../services/userService', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ name: 'Mock User', email: 'mock@example.com' }),
  updateUserProfile: vi.fn().mockResolvedValue({ message: 'Profile updated' }),
}))

vi.mock('../services/productService', () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue({ id: 'mock-product-id' }),
  updateProduct: vi.fn().mockResolvedValue({ message: 'Product updated' }),
  deleteProduct: vi.fn().mockResolvedValue({ message: 'Product deleted' }),
}))

vi.mock('../services/editUserDataService', () => ({
  updateUserData: vi.fn().mockResolvedValue({ message: 'User data updated' }),
}))

// Mock react-router-dom for navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
    }),
  }
})