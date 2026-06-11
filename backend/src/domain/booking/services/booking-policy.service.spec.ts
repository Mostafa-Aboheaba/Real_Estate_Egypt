import { BookingStatus } from '../enums/booking-status.enum';
import { BookingPolicyService } from './booking-policy.service';

describe('BookingPolicyService', () => {
  const policy = new BookingPolicyService({
    slotWindowMinutes: 30,
    agentFreeQuotaPerMonth: 5,
  });

  it('flags quota exceeded at free tier limit', () => {
    expect(policy.isQuotaExceeded(5)).toBe(true);
    expect(policy.isQuotaExceeded(4)).toBe(false);
  });

  it('detects overlapping slots within window', () => {
    const a = new Date('2026-06-10T14:00:00.000Z');
    const b = new Date('2026-06-10T14:15:00.000Z');
    expect(policy.slotsOverlap(a, b)).toBe(true);
    expect(policy.slotsOverlap(a, new Date('2026-06-10T15:00:00.000Z'))).toBe(
      false,
    );
  });

  it('allows cancel before preferred time', () => {
    const preferredAt = new Date('2026-06-10T14:00:00.000Z');
    expect(
      policy.canCancel(
        {
          status: BookingStatus.Requested,
          preferredAt,
          scheduledAt: null,
        },
        new Date('2026-06-10T13:00:00.000Z'),
      ),
    ).toBe(true);
  });
});
