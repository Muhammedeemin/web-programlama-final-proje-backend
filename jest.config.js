// Set test environment variables before anything else
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '3307';
process.env.DB_NAME = process.env.DB_NAME || 'campus_db_test';
process.env.DB_USER = process.env.DB_USER || 'root';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'mysql_root_password';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-key';

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/migrations/**',
    '!src/seeders/**',
    '!src/models/index.js',
    '!src/server.js'
  ],
  // Coverage hesaplama ayarları - başarısız testlerden de coverage topla
  collectCoverage: true,
  coverageProvider: 'v8',
  // Coverage'ı tüm testler için topla, başarısız testlerde de
  coverageReporters: ['text', 'text-summary', 'json', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  testTimeout: 30000, // Integration testler için daha uzun timeout
  verbose: true,
  // Başarısız testlerden sonra da devam et - coverage toplamaya devam et
  bail: false,
  // Coverage'ı her test için topla
  forceExit: true // Açık bağlantıları kapat
};

