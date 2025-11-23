import { Switch } from './Switch'

export default {
  title: 'Foundation/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible toggle switch component with proper ARIA attributes.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
}

export const Default = {
  args: {
    label: 'Enable notifications',
  },
}

export const Checked = {
  args: {
    label: 'Enable notifications',
    checked: true,
  },
}

export const Disabled = {
  args: {
    label: 'Disabled switch',
    disabled: true,
  },
}

export const DisabledChecked = {
  args: {
    label: 'Disabled checked',
    checked: true,
    disabled: true,
  },
}

