import { fn } from '@storybook/test'
import Navbar from './Navbar'

// Mock the auth store for stories
const createMockAuthStore = (state) => () => ({
  isAuthenticated: false,
  user: null,
  logout: fn(),
  ...state,
})

export default {
  title: 'Components/Layout/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Navigation bar component with authentication states and responsive design.',
      },
    },
  },
}

// Mock different auth states
export const NotAuthenticated = {
  parameters: {
    mockData: [
      {
        url: '../../store/authStore',
        module: {
          default: createMockAuthStore({
            isAuthenticated: false,
            user: null,
          }),
        },
      },
    ],
  },
}

export const AuthenticatedUser = {
  parameters: {
    mockData: [
      {
        url: '../../store/authStore',
        module: {
          default: createMockAuthStore({
            isAuthenticated: true,
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'USER',
            },
          }),
        },
      },
    ],
  },
}

export const AuthenticatedAdmin = {
  parameters: {
    mockData: [
      {
        url: '../../store/authStore',
        module: {
          default: createMockAuthStore({
            isAuthenticated: true,
            user: {
              id: 2,
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@example.com',
              role: 'ADMIN',
            },
          }),
        },
      },
    ],
  },
}

// Mobile viewport
export const MobileView = {
  ...NotAuthenticated,
  parameters: {
    ...NotAuthenticated.parameters,
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}
