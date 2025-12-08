const emailService = require('../../services/emailService');
const nodemailer = require('nodemailer');

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let mockTransporter;
  let mockSendMail;

  beforeEach(() => {
    mockSendMail = jest.fn();
    mockTransporter = {
      sendMail: mockSendMail
    };
    nodemailer.createTransport.mockReturnValue(mockTransporter);
    
    // Reset environment variables
    process.env.EMAIL_HOST = 'smtp.test.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'testpassword';
    process.env.EMAIL_FROM = 'noreply@test.com';
    process.env.FRONTEND_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct options', async () => {
      const email = 'test@example.com';
      const token = 'test-verification-token';
      const expectedUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendVerificationEmail(email, token);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Email Verification - Web Programlama Final Projesi',
        html: expect.stringContaining(expectedUrl)
      });
      expect(result.messageId).toBe('test-message-id');
    });

    it('should include verification URL in email body', async () => {
      const email = 'test@example.com';
      const token = 'test-token-123';
      
      mockSendMail.mockResolvedValue({ messageId: 'test' });

      await emailService.sendVerificationEmail(email, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(token);
      expect(callArgs.html).toContain('/verify-email?token=');
      expect(callArgs.html).toContain('expire in 24 hours');
    });

    it('should handle email sending errors', async () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const error = new Error('SMTP Error');
      
      mockSendMail.mockRejectedValue(error);

      await expect(emailService.sendVerificationEmail(email, token)).rejects.toThrow('SMTP Error');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email with correct options', async () => {
      const email = 'test@example.com';
      const token = 'test-reset-token';
      const expectedUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await emailService.sendPasswordResetEmail(email, token);

      expect(mockSendMail).toHaveBeenCalledWith({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset - Web Programlama Final Projesi',
        html: expect.stringContaining(expectedUrl)
      });
      expect(result.messageId).toBe('test-message-id');
    });

    it('should include reset URL in email body', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-456';
      
      mockSendMail.mockResolvedValue({ messageId: 'test' });

      await emailService.sendPasswordResetEmail(email, token);

      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain(token);
      expect(callArgs.html).toContain('/reset-password?token=');
      expect(callArgs.html).toContain('expire in 1 hour');
      expect(callArgs.html).toContain("didn't request this");
    });

    it('should handle email sending errors', async () => {
      const email = 'test@example.com';
      const token = 'test-token';
      const error = new Error('SMTP Connection Error');
      
      mockSendMail.mockRejectedValue(error);

      await expect(emailService.sendPasswordResetEmail(email, token)).rejects.toThrow('SMTP Connection Error');
    });
  });

  describe('transporter configuration', () => {
    it('should configure transporter with environment variables', () => {
      // EmailService is instantiated when module is loaded
      // So we need to check the transporter was created with correct config
      expect(nodemailer.createTransport).toHaveBeenCalled();
      
      const transporterConfig = nodemailer.createTransport.mock.calls[0][0];
      expect(transporterConfig.host).toBe(process.env.EMAIL_HOST);
      expect(transporterConfig.port).toBe(process.env.EMAIL_PORT);
      expect(transporterConfig.auth.user).toBe(process.env.EMAIL_USER);
      expect(transporterConfig.auth.pass).toBe(process.env.EMAIL_PASSWORD);
      expect(transporterConfig.secure).toBe(false);
    });

    it('should handle email sending failure in forgotPassword scenario', async () => {
      const email = 'forgot@test.com';
      const token = 'reset-token-123';
      
      mockSendMail.mockRejectedValueOnce(new Error('SMTP Connection Failed'));

      await expect(emailService.sendPasswordResetEmail(email, token)).rejects.toThrow('SMTP Connection Failed');
    });
  });
});

