import { Button } from './Button'
import { Search, Download, ArrowRight } from 'lucide-react'

export default {
  title: 'Foundation/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible button component with multiple variants and sizes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Button variant style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable button',
    },
  },
  tags: ['autodocs', 'a11y'],
}

export const Primary = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Ghost = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Sizes = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  ),
}

export const WithIcons = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Button leftIcon={<Search size={18} />}>Search</Button>
      <Button rightIcon={<ArrowRight size={18} />}>Next</Button>
      <Button leftIcon={<Download size={18} />} rightIcon={<ArrowRight size={18} />}>
        Download
      </Button>
    </div>
  ),
}

export const Loading = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
}

export const Disabled = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const AllVariants = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
}

