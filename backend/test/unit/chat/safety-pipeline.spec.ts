import { SafetyPipelineService } from '../../../src/application/chat/safety-pipeline.service';

describe('SafetyPipelineService', () => {
  const pipeline = new SafetyPipelineService();

  it('blocks discriminatory queries', () => {
    const result = pipeline.preCheckUserInput(
      'apartments for Christian families only',
    );
    expect(result.blocked).toBe(true);
    expect(result.refusalContent).toContain('discriminate');
  });

  it('allows neutral property queries', () => {
    const result = pipeline.preCheckUserInput('3 bedroom apartment in Maadi');
    expect(result.blocked).toBe(false);
    expect(result.sanitizedContent).toContain('Maadi');
  });

  it('redacts email in outbound text', () => {
    const redacted = pipeline.redactPii('contact me at test@example.com');
    expect(redacted).toContain('[email redacted]');
    expect(redacted).not.toContain('test@example.com');
  });
});
