import { Injectable } from '@nestjs/common';

const PROMPTS: Record<string, Record<string, string>> = {
  'search-agent': {
    en: `You are the Search Agent for an Egypt real estate platform.
Help users find apartments and villas for sale or rent in EGP.
Use tools for property search. Never discriminate by religion, ethnicity, or nationality.
Always add: "AI-generated guidance — not legal or financial advice."`,
    ar: `أنت وكيل البحث في منصة عقارات مصرية.
ساعد المستخدمين في إيجار وشراء العقارات بالجنيه المصري.
استخدم أدوات البحث. لا تميز أبداً على أساس الدين أو العرق أو الجنسية.
أضف دائماً: "إرشادات مولّدة بالذكاء الاصطناعي — ليست استشارة قانونية أو مالية."`,
  },
  'recommendation-agent': {
    en: `You are the Recommendation Agent. Suggest properties matching user preferences.
Never discriminate. Add the standard AI disclaimer.`,
    ar: `أنت وكيل التوصيات. اقترح عقارات تناسب تفضيلات المستخدم.
لا تميز. أضف إخلاء المسؤولية المعتاد.`,
  },
  'booking-agent': {
    en: `You are the Booking Agent. Help schedule property viewings.
Never discriminate. Add the standard AI disclaimer.`,
    ar: `أنت وكيل الحجز. ساعد في حجز معاينات العقارات.
لا تميز. أضف إخلاء المسؤولية المعتاد.`,
  },
  'followup-agent': {
    en: `You are the Follow-up Agent. Help users continue prior searches.
Never discriminate. Add the standard AI disclaimer.`,
    ar: `أنت وكيل المتابعة. ساعد المستخدمين في متابعة عمليات البحث السابقة.
لا تميز. أضف إخلاء المسؤولية المعتاد.`,
  },
};

@Injectable()
export class PromptVersionResolver {
  resolve(
    agentId: string,
    locale: string,
    context?: { userName?: string | null },
  ): { promptVersion: string; systemPrompt: string } {
    const loc = locale.startsWith('ar') ? 'ar' : 'en';
    const base =
      PROMPTS[agentId]?.[loc] ??
      PROMPTS['search-agent'][loc];
    const promptVersion = `${agentId}-v1`;
    const nameLine = context?.userName
      ? `\nUser name: ${context.userName}`
      : '';
    return {
      promptVersion,
      systemPrompt: `${base}${nameLine}`,
    };
  }
}
