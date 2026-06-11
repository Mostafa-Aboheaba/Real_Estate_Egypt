export enum BookingStatus {
  Requested = 'requested',
  Confirmed = 'confirmed',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Declined = 'declined',
}

export enum BookingAction {
  Confirm = 'confirm',
  Decline = 'decline',
  Cancel = 'cancel',
  Complete = 'complete',
  Propose = 'propose',
}
