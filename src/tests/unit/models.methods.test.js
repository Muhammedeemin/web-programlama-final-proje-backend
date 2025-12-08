const { User } = require('../../models');
const bcrypt = require('bcryptjs');

describe('Model Methods', () => {
  describe('User.comparePassword', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'compare@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student'
      });
    });

    afterEach(async () => {
      await User.destroy({ where: {}, force: true });
    });

    it('should return true for correct password', async () => {
      const isValid = await testUser.comparePassword('password123');
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const isValid = await testUser.comparePassword('wrongpassword');
      expect(isValid).toBe(false);
    });
  });

  describe('User.toJSON', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        email: 'json@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        refreshToken: 'some-refresh-token',
        emailVerificationToken: 'some-verification-token',
        passwordResetToken: 'some-reset-token'
      });
    });

    afterEach(async () => {
      await User.destroy({ where: {}, force: true });
    });

    it('should exclude sensitive fields from JSON', () => {
      const json = testUser.toJSON();
      
      expect(json.password).toBeUndefined();
      expect(json.refreshToken).toBeUndefined();
      expect(json.emailVerificationToken).toBeUndefined();
      expect(json.passwordResetToken).toBeUndefined();
    });

    it('should include non-sensitive fields', () => {
      const json = testUser.toJSON();
      
      expect(json.email).toBe('json@test.com');
      expect(json.firstName).toBe('Test');
      expect(json.lastName).toBe('User');
      expect(json.role).toBe('student');
      expect(json.id).toBeDefined();
    });
  });
});

