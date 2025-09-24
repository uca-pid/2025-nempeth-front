import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock lottie-react to avoid canvas issues in tests
vi.mock('lottie-react', () => ({
  default: ({ className }: { className?: string }) => 
    React.createElement('div', { className, 'data-testid': 'lottie-animation' }),
}))