export interface PushCopy {
  title: string;
  body: string;
}

const COPY: Record<string, Record<string, PushCopy>> = {
  'booking.requested': {
    en: { title: 'New viewing request', body: 'You have a new property viewing request.' },
    'ar-EG': { title: 'طلب معاينة جديد', body: 'لديك طلب معاينة عقار جديد.' },
  },
  'booking.confirmed': {
    en: { title: 'Viewing confirmed', body: 'Your property viewing has been confirmed.' },
    'ar-EG': { title: 'تم تأكيد المعاينة', body: 'تم تأكيد موعد معاينة العقار.' },
  },
  'booking.proposed': {
    en: { title: 'Alternative time proposed', body: 'The agent proposed a new viewing time.' },
    'ar-EG': { title: 'وقت بديل مقترح', body: 'اقترح الوكيل موعدًا بديلًا للمعاينة.' },
  },
  'booking.declined': {
    en: { title: 'Viewing declined', body: 'Your viewing request was declined.' },
    'ar-EG': { title: 'تم رفض المعاينة', body: 'تم رفض طلب المعاينة.' },
  },
  'booking.cancelled': {
    en: { title: 'Viewing cancelled', body: 'A property viewing was cancelled.' },
    'ar-EG': { title: 'تم إلغاء المعاينة', body: 'تم إلغاء موعد المعاينة.' },
  },
  'booking.completed': {
    en: { title: 'Viewing completed', body: 'The property viewing is marked complete.' },
    'ar-EG': { title: 'اكتملت المعاينة', body: 'تم إكمال معاينة العقار.' },
  },
};

export function resolvePushCopy(
  eventType: string,
  locale: string,
): PushCopy {
  const table = COPY[eventType] ?? COPY['booking.requested'];
  return table[locale] ?? table.en;
}
