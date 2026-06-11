import { BookingAction, BookingStatus } from '../enums/booking-status.enum';

const TRANSITIONS: Record<
  BookingStatus,
  Partial<Record<BookingAction, BookingStatus>>
> = {
  [BookingStatus.Requested]: {
    [BookingAction.Confirm]: BookingStatus.Confirmed,
    [BookingAction.Decline]: BookingStatus.Declined,
    [BookingAction.Cancel]: BookingStatus.Cancelled,
    [BookingAction.Propose]: BookingStatus.Requested,
  },
  [BookingStatus.Confirmed]: {
    [BookingAction.Cancel]: BookingStatus.Cancelled,
    [BookingAction.Complete]: BookingStatus.Completed,
  },
  [BookingStatus.Declined]: {},
  [BookingStatus.Cancelled]: {},
  [BookingStatus.Completed]: {},
};

export type BookingActor = 'buyer' | 'agent';

const ACTOR_ACTIONS: Record<BookingActor, Set<BookingAction>> = {
  buyer: new Set([
    BookingAction.Cancel,
  ]),
  agent: new Set([
    BookingAction.Confirm,
    BookingAction.Decline,
    BookingAction.Cancel,
    BookingAction.Complete,
    BookingAction.Propose,
  ]),
};

export class BookingStateMachine {
  static canTransition(
    from: BookingStatus,
    action: BookingAction,
    actor: BookingActor,
  ): boolean {
    if (!ACTOR_ACTIONS[actor].has(action)) {
      return false;
    }
    if (action === BookingAction.Cancel) {
      return from === BookingStatus.Requested || from === BookingStatus.Confirmed;
    }
    return TRANSITIONS[from]?.[action] !== undefined;
  }

  static nextStatus(
    from: BookingStatus,
    action: BookingAction,
  ): BookingStatus {
    const next = TRANSITIONS[from]?.[action];
    if (!next) {
      throw new Error(`Invalid transition ${from} -> ${action}`);
    }
    return next;
  }
}
