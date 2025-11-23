import { Input } from './Input'

export default {
  title: 'Foundation/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A fully accessible input component with error states and labels.',
      },
    },
  },
  tags: ['autodocs', 'a11y'],
}

export const Default = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
  },
}

export const WithError = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address',
  },
}

export const WithHelperText = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters',
  },
}

export const Required = {
  args: {
    label: 'Name',
    type: 'text',
    placeholder: 'Enter your name',
    required: true,
  },
}

export const Disabled = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    disabled: true,
  },
}

export const AllTypes = {
  render: () => (
    <div className="w-80 space-y-4">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="Email input" />
      <Input label="Password" type="password" placeholder="Password input" />
      <Input label="Number" type="number" placeholder="Number input" />
    </div>
  ),
}

