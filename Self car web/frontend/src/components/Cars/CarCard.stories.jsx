import CarCard from './CarCard'

export default {
  title: 'Components/Cars/CarCard',
  component: CarCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Car card component displaying car information with booking functionality.',
      },
    },
  },
  argTypes: {
    car: {
      description: 'Car object with all necessary details',
      control: { type: 'object' },
    },
  },
}

const mockCar = {
  id: 1,
  name: 'Toyota Camry',
  brand: 'Toyota',
  year: 2023,
  color: 'Blue',
  pricePerDay: 50.00,
  available: true,
  description: 'A reliable and comfortable sedan',
  imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  rating: 4.5,
  seats: 5,
  transmission: 'Automatic',
  fuelType: 'Gasoline',
  features: ['Air Conditioning', 'Bluetooth', 'GPS'],
}

export const Default = {
  args: {
    car: mockCar,
  },
}

export const WithoutImage = {
  args: {
    car: {
      ...mockCar,
      imageUrl: null,
    },
  },
}

export const Featured = {
  args: {
    car: {
      ...mockCar,
      featured: true,
    },
  },
}

export const HighPrice = {
  args: {
    car: {
      ...mockCar,
      name: 'BMW M4',
      brand: 'BMW',
      pricePerDay: 150.00,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
    },
  },
}

export const LongName = {
  args: {
    car: {
      ...mockCar,
      name: 'Mercedes-Benz AMG GT 63 S 4MATIC+ Coupe Premium Plus',
      brand: 'Mercedes-Benz',
    },
  },
}
