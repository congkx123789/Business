import { Select } from './Select'

export default {
  title: 'Foundation/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible select component with error states and labels.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
}

export const Default = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'th', label: 'Thailand' },
      { value: 'uk', label: 'United Kingdom' },
      { value: 'ca', label: 'Canada' },
    ],
  },
}

export const WithError = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    error: 'Please select a country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'th', label: 'Thailand' },
    ],
  },
}

export const WithHelperText = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    helperText: 'Select your country of residence',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'th', label: 'Thailand' },
    ],
  },
}

export const Required = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    required: true,
    options: [
      { value: 'us', label: 'United States' },
      { value: 'th', label: 'Thailand' },
    ],
  },
}

export const Disabled = {
  args: {
    label: 'Country',
    placeholder: 'Select a country',
    disabled: true,
    options: [
      { value: 'us', label: 'United States' },
      { value: 'th', label: 'Thailand' },
    ],
  },
}

