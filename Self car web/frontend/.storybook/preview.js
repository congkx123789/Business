import { themes } from '@storybook/theming';
import '../src/index.css';

/** @type {import('storybook').Preview} */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Accessibility addon
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'keyboard',
            enabled: true,
          },
        ],
      },
    },
    // Dark mode support
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#111827',
        },
      ],
    },
    // Docs theme
    docs: {
      theme: themes.light,
    },
  },
  // Global decorators
  decorators: [
    (Story) => {
      // Apply theme class to story container
      const isDark = document.documentElement.classList.contains('dark');
      if (!isDark) {
        document.documentElement.classList.remove('dark');
      }
      return Story();
    },
  ],
};

export default preview;

