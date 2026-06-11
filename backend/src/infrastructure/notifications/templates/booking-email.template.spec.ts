import {
  renderBookingConfirmedEmail,
  renderBookingRequestAgentEmail,
} from './booking-email.template';

describe('booking email templates', () => {
  const base = {
    bookingId: '660e8400-e29b-41d4-a716-446655440001',
    propertyTitle: '3BR Apartment, Maadi',
    propertyAddress: 'Maadi, Cairo',
    scheduledAtFormatted: 'Jun 10, 2026, 2:00 PM',
    buyerName: 'Sara Mohamed',
    agentName: 'Ahmed Hassan',
    manageUrl: 'https://app.example.com/bookings/660e8400',
  };

  it('renders English confirmed template', () => {
    const html = renderBookingConfirmedEmail({ ...base, locale: 'en' });
    expect(html).toContain('Viewing confirmed');
    expect(html).toContain(base.propertyTitle);
    expect(html).toContain(base.manageUrl);
  });

  it('renders Arabic confirmed template', () => {
    const html = renderBookingConfirmedEmail({ ...base, locale: 'ar-EG' });
    expect(html).toContain('تم تأكيد المعاينة');
    expect(html).toContain(base.propertyTitle);
  });

  it('renders Arabic agent request template', () => {
    const html = renderBookingRequestAgentEmail({ ...base, locale: 'ar-EG' });
    expect(html).toContain('طلب معاينة جديد');
    expect(html).toContain(base.buyerName!);
  });
});
