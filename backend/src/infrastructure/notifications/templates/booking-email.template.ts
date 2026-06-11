export interface BookingEmailVars {
  locale: string;
  bookingId: string;
  propertyTitle: string;
  propertyAddress?: string;
  scheduledAtFormatted?: string;
  buyerName?: string;
  agentName?: string;
  manageUrl: string;
}

export function renderBookingConfirmedEmail(vars: BookingEmailVars): string {
  const isAr = vars.locale.startsWith('ar');
  const heading = isAr ? 'تم تأكيد المعاينة' : 'Viewing confirmed';
  const intro = isAr
    ? `تم تأكيد معاينة العقار: ${vars.propertyTitle}`
    : `Your viewing for ${vars.propertyTitle} is confirmed.`;
  const when = vars.scheduledAtFormatted
    ? isAr
      ? `الموعد: ${vars.scheduledAtFormatted}`
      : `When: ${vars.scheduledAtFormatted}`
    : '';
  const cta = isAr ? 'إدارة الحجز' : 'Manage booking';

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}">
<head><meta charset="utf-8"><title>${heading}</title></head>
<body>
  <h1>${heading}</h1>
  <p>${intro}</p>
  ${when ? `<p>${when}</p>` : ''}
  <p><a href="${vars.manageUrl}">${cta}</a></p>
  <p style="color:#666;font-size:12px;">Booking ID: ${vars.bookingId}</p>
</body>
</html>`;
}

export function renderBookingRequestAgentEmail(vars: BookingEmailVars): string {
  const isAr = vars.locale.startsWith('ar');
  const heading = isAr ? 'طلب معاينة جديد' : 'New viewing request';
  const intro = isAr
    ? `طلب المشتري ${vars.buyerName ?? ''} معاينة للعقار: ${vars.propertyTitle}`
    : `Buyer ${vars.buyerName ?? ''} requested a viewing for ${vars.propertyTitle}.`;

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}">
<head><meta charset="utf-8"><title>${heading}</title></head>
<body>
  <h1>${heading}</h1>
  <p>${intro}</p>
  <p><a href="${vars.manageUrl}">${isAr ? 'عرض الطلب' : 'View request'}</a></p>
</body>
</html>`;
}
