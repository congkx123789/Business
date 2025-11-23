import { tokens } from './tokens'

export default {
  title: 'Design System/Tokens',
  parameters: {
    docs: {
      description: {
        component: 'Design tokens for spacing, colors, border radius, and other design system values.',
      },
    },
  },
}

// Spacing Tokens
export const Spacing = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Spacing Tokens</h2>
      <div className="space-y-4">
        {Object.entries(tokens.spacing).map(([name, value]) => (
          <div key={name} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium">{name}</div>
            <div className="w-16 text-sm text-gray-600">{value}</div>
            <div 
              className="bg-primary-500"
              style={{ width: value, height: '2rem' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// Color Tokens
export const Colors = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">Color Tokens</h2>
      
      {/* Primary Colors */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(tokens.colors.primary).map(([name, value]) => (
            <div key={name} className="text-center">
              <div 
                className="w-full h-24 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: value }}
              />
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-gray-600">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gray Scale */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Gray Scale</h3>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(tokens.colors.gray).map(([name, value]) => (
            <div key={name} className="text-center">
              <div 
                className="w-full h-24 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: value }}
              />
              <div className="text-sm font-medium">{name}</div>
              <div className="text-xs text-gray-600">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(tokens.colors.semantic).map(([name, value]) => (
            <div key={name} className="text-center">
              <div 
                className="w-full h-24 rounded-lg shadow-md mb-2"
                style={{ backgroundColor: value }}
              />
              <div className="text-sm font-medium capitalize">{name}</div>
              <div className="text-xs text-gray-600">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Border Radius Tokens
export const BorderRadius = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Border Radius Tokens</h2>
      <div className="grid grid-cols-4 gap-6">
        {Object.entries(tokens.radius).map(([name, value]) => (
          <div key={name} className="text-center">
            <div 
              className="w-32 h-32 bg-primary-500 mx-auto mb-2"
              style={{ borderRadius: value }}
            />
            <div className="text-sm font-medium">{name}</div>
            <div className="text-xs text-gray-600">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Typography Tokens
export const Typography = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Typography Tokens</h2>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Font Sizes</h3>
        <div className="space-y-4">
          {Object.entries(tokens.typography.fontSize).map(([name, value]) => (
            <div key={name} className="flex items-baseline gap-4">
              <div className="w-24 text-sm font-medium">{name}</div>
              <div className="w-16 text-sm text-gray-600">{value}</div>
              <div style={{ fontSize: value }}>
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Font Weights</h3>
        <div className="space-y-4">
          {Object.entries(tokens.typography.fontWeight).map(([name, value]) => (
            <div key={name} className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">{name}</div>
              <div className="w-16 text-sm text-gray-600">{value}</div>
              <div style={{ fontWeight: value }} className="text-lg">
                The quick brown fox jumps over the lazy dog
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Shadow Tokens
export const Shadows = () => {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Shadow Tokens</h2>
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(tokens.shadows).map(([name, value]) => (
          <div key={name} className="text-center">
            <div 
              className="w-32 h-32 bg-white mx-auto mb-2"
              style={{ boxShadow: value }}
            />
            <div className="text-sm font-medium">{name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// All Tokens Overview
export const AllTokens = () => {
  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold">Design Tokens Overview</h1>
      <Spacing />
      <Colors />
      <BorderRadius />
      <Typography />
      <Shadows />
    </div>
  )
}

