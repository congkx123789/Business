import { fn } from '@storybook/test'
import CarFilters from './CarFilters'

export default {
  title: 'Components/Forms/CarFilters',
  component: CarFilters,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Filter component for cars list with search, price range, and various filters.',
      },
    },
  },
  argTypes: {
    filters: {
      control: 'object',
      description: 'Current filter values',
    },
    setFilters: {
      action: 'setFilters',
      description: 'Function to update filters',
    },
    onSearch: {
      action: 'onSearch',
      description: 'Function to trigger search',
    },
  },
}

export const Default = {
  args: {
    filters: {},
    setFilters: fn(),
    onSearch: fn(),
  },
}

export const WithActiveFilters = {
  args: {
    filters: {
      search: 'BMW',
      type: 'SEDAN',
      transmission: 'AUTOMATIC',
      minPrice: '50',
      maxPrice: '200',
    },
    setFilters: fn(),
    onSearch: fn(),
  },
}

export const PriceRangeFilter = {
  args: {
    filters: {
      minPrice: '100',
      maxPrice: '500',
    },
    setFilters: fn(),
    onSearch: fn(),
  },
}

export const AllFiltersActive = {
  args: {
    filters: {
      search: 'Tesla',
      type: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      fuelType: 'ELECTRIC',
      seats: '5',
      minPrice: '150',
      maxPrice: '300',
    },
    setFilters: fn(),
    onSearch: fn(),
  },
}
