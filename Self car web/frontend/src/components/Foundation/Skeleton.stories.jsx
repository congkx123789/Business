import { Skeleton, SkeletonText, SkeletonCard } from './Skeleton'

export default {
  title: 'Foundation/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading skeleton components with shimmer effect for better perceived performance.',
      },
    },
  },
  tags: ['autodocs'],
}

export const Text = {
  args: {
    variant: 'text',
    width: '200px',
  },
}

export const Circular = {
  args: {
    variant: 'circular',
    width: '48px',
    height: '48px',
  },
}

export const Rectangular = {
  args: {
    variant: 'rectangular',
    width: '200px',
    height: '100px',
  },
}

export const TextLines = {
  render: () => <SkeletonText lines={3} />,
}

export const Card = {
  render: () => <SkeletonCard />,
}

export const CardWithoutAvatar = {
  render: () => <SkeletonCard showAvatar={false} />,
}

