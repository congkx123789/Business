import { Checkbox } from './Checkbox'

export default {
  title: 'Foundation/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible checkbox component with proper ARIA attributes.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
}

export const Default = {
  args: {
    label: 'Accept terms and conditions',
  },
}

export const Checked = {
  args: {
    label: 'Accept terms and conditions',
    checked: true,
  },
}

export const Indeterminate = {
  args: {
    label: 'Select all',
    indeterminate: true,
  },
}

export const Disabled = {
  args: {
    label: 'Disabled checkbox',
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

