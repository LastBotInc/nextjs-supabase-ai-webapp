module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }],
    '^.+\\.m?js$': ['ts-jest', {
      useESM: true
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@supabase/auth-helpers-nextjs|@supabase/auth-helpers-shared)/)'
  ],
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)'
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  }
}; 