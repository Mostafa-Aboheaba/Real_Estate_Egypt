export const EMAIL_SENDER = Symbol('EMAIL_SENDER');

export interface EmailSenderPort {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
