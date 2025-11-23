import { useState } from 'react'
import { fn } from '@storybook/test'
import Modal from './Modal'

export default {
  title: 'Components/Shared/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Accessible modal component with focus trap, keyboard navigation, and ARIA attributes.',
      },
    },
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    onClose: {
      action: 'onClose',
      description: 'Function called when modal is closed',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Modal size',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close modal when clicking backdrop',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button',
    },
  },
}

// Interactive wrapper for modal
const ModalWrapper = (args) => {
  const [isOpen, setIsOpen] = useState(args.isOpen || false)

  return (
    <div className="p-8">
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary mb-4"
      >
        Open Modal
      </button>
      <Modal
        {...args}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
          args.onClose()
        }}
      >
        {args.children || (
          <div>
            <p className="mb-4">This is modal content. You can add any content here.</p>
            <button className="btn-primary">Action Button</button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export const Default = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Modal Title',
    size: 'md',
    closeOnBackdropClick: true,
    showCloseButton: true,
    onClose: fn(),
  },
}

export const WithoutTitle = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    size: 'md',
    closeOnBackdropClick: true,
    showCloseButton: true,
    onClose: fn(),
    children: (
      <div>
        <p>This modal has no title but has a close button.</p>
      </div>
    ),
  },
}

export const Small = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Small Modal',
    size: 'sm',
    onClose: fn(),
  },
}

export const Large = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Large Modal',
    size: 'lg',
    onClose: fn(),
  },
}

export const FullWidth = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Full Width Modal',
    size: 'full',
    onClose: fn(),
  },
}

export const NoBackdropClick = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Modal (No Backdrop Click)',
    closeOnBackdropClick: false,
    onClose: fn(),
  },
}

export const FormContent = {
  render: ModalWrapper,
  args: {
    isOpen: false,
    title: 'Booking Form',
    size: 'md',
    onClose: fn(),
    children: (
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            className="input-field"
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" className="btn-secondary flex-1" onClick={() => {}}>
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Book Now
          </button>
        </div>
      </form>
    ),
  },
}

