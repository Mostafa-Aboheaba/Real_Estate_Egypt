import { BookingAction, BookingStatus } from '../enums/booking-status.enum';
import { BookingStateMachine } from './booking-state-machine';

describe('BookingStateMachine', () => {
  it('allows agent to confirm requested booking', () => {
    expect(
      BookingStateMachine.canTransition(
        BookingStatus.Requested,
        BookingAction.Confirm,
        'agent',
      ),
    ).toBe(true);
    expect(
      BookingStateMachine.nextStatus(
        BookingStatus.Requested,
        BookingAction.Confirm,
      ),
    ).toBe(BookingStatus.Confirmed);
  });

  it('allows buyer to cancel requested booking', () => {
    expect(
      BookingStateMachine.canTransition(
        BookingStatus.Requested,
        BookingAction.Cancel,
        'buyer',
      ),
    ).toBe(true);
  });

  it('blocks buyer from confirming', () => {
    expect(
      BookingStateMachine.canTransition(
        BookingStatus.Requested,
        BookingAction.Confirm,
        'buyer',
      ),
    ).toBe(false);
  });
});
