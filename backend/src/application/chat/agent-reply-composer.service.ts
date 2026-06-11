import { Injectable } from '@nestjs/common';
import { ParsedSearchIntent } from './search-intent.parser';
import { ListingRefProps } from '../../domain/chat/value-objects/listing-ref.vo';
import { LlmMessage } from '../../domain/chat/ports/llm-completion.port';

export interface ListingNarration extends ListingRefProps {
  city?: string;
  propertyType?: string;
  bedrooms?: number | null;
  listingType?: string;
}

export interface ComposeReplyInput {
  locale: string;
  agentId: string;
  userMessage: string;
  toolsInvoked: boolean;
  listings: ListingNarration[];
  intent?: ParsedSearchIntent;
  recentMessages?: LlmMessage[];
}

const AGENT_NAMES: Record<string, { en: string; ar: string }> = {
  'search-agent': { en: 'Nadia', ar: 'نادية' },
  'recommendation-agent': { en: 'Omar', ar: 'عمر' },
  'booking-agent': { en: 'Sara', ar: 'سارة' },
  'followup-agent': { en: 'Karim', ar: 'كريم' },
};

const DISCLAIMER_EN =
  'AI-generated guidance — not legal or financial advice.';
const DISCLAIMER_AR =
  'إرشادات مولّدة بالذكاء الاصطناعي — ليست استشارة قانونية أو مالية.';

@Injectable()
export class AgentReplyComposerService {
  compose(input: ComposeReplyInput): string {
    const ar = input.locale.startsWith('ar');
    if (!input.toolsInvoked) {
      return this.composeConversational(input, ar);
    }
    if (input.listings.length === 0) {
      return this.composeNoResults(input, ar);
    }
    return this.composeSearchResults(input, ar);
  }

  buildGeminiContextBlock(input: ComposeReplyInput): string {
    if (!input.toolsInvoked) {
      return '';
    }
    if (input.listings.length === 0) {
      return (
        '\n\n[SEARCH RESULTS: none matched the user request. ' +
        'Empathize and suggest adjusting budget, area, or property type.]'
      );
    }
    const lines = input.listings.map((listing, index) => {
      const parts = [
        `${index + 1}. ${listing.title}`,
        `${this.formatPrice(listing.priceEgp)} EGP`,
      ];
      if (listing.city) {
        parts.push(listing.city);
      }
      if (listing.bedrooms != null) {
        parts.push(`${listing.bedrooms} BR`);
      }
      if (listing.propertyType) {
        parts.push(listing.propertyType);
      }
      parts.push(`[id:${listing.propertyId}]`);
      return parts.join(' — ');
    });
    return (
      '\n\n[SEARCH RESULTS — describe highlights naturally; cite only these]\n' +
      lines.join('\n')
    );
  }

  private composeConversational(input: ComposeReplyInput, ar: boolean): string {
    const name = this.agentName(input.agentId, ar);
    const text = input.userMessage.trim();

    if (this.isGreeting(text)) {
      return ar
        ? `${this.greetingAr(text)}أنا ${name}، وكيلتك العقارية في مصر. تدور على إيجار ولا شراء؟ وأي منطقة و budget تقريباً عندك؟\n\n${DISCLAIMER_AR}`
        : `${this.greetingEn(text)}I'm ${name}, your real estate agent in Egypt. Are you looking to rent or buy—and which area and budget do you have in mind?\n\n${DISCLAIMER_EN}`;
    }

    if (this.isThanks(text)) {
      return ar
        ? `العفو! لو حابب نكمّل البحث أو نحجز معاينة، قولي.\n\n${DISCLAIMER_AR}`
        : `You're welcome! If you'd like to keep searching or book a viewing, just let me know.\n\n${DISCLAIMER_EN}`;
    }

    if (this.isVagueRealEstate(text)) {
      return ar
        ? `تمام، خليني أساعدك. قولي: شراء ولا إيجار؟ نوع العقار (شقة، فيلا…)؟ والميزانية التقريبية والمنطقة اللي تفضّلها.\n\n${DISCLAIMER_AR}`
        : `Happy to help. Tell me: rent or buy? What type of home (apartment, villa…)? Rough budget and preferred area?\n\n${DISCLAIMER_EN}`;
    }

    return ar
      ? `أنا ${name} هنا عشان أساعدك تلاقي العقار المناسب في مصر. احكيلي عن المنطقة، الميزانية، ونوع العقار اللي بتدور عليه.\n\n${DISCLAIMER_AR}`
      : `I'm ${name}—here to help you find the right place in Egypt. Share the area, budget, and type of home you're after.\n\n${DISCLAIMER_EN}`;
  }

  private composeSearchResults(
    input: ComposeReplyInput,
    ar: boolean,
  ): string {
    const name = this.agentName(input.agentId, ar);
    const top = input.listings.slice(0, 3);
    const count = input.listings.length;

    if (ar) {
      const highlights = top
        .map((listing) => {
          const location = listing.city ? ` في ${listing.city}` : '';
          const beds =
            listing.bedrooms != null ? `، ${listing.bedrooms} غرف` : '';
          return `• ${listing.title}${location} — ${this.formatPrice(listing.priceEgp)} جنيه${beds}`;
        })
        .join('\n');

      const budgetNote = input.intent?.maxPriceEgp
        ? ` ضمن ميزانية تقريب ${this.formatPrice(input.intent.maxPriceEgp)} جنيه`
        : '';
      const typeNote = input.intent?.propertyType
        ? ` (${this.propertyTypeAr(input.intent.propertyType)})`
        : '';

      const followUp =
        count > 3
          ? ' فيه خيارات تانية تحت—تحب أضيّق على حي معيّن أو عدد غرف؟'
          : ' تحب نضيّق أكتر على المنطقة أو نحجز معاينة لأي وحدة؟';

      return (
        `بناءً على طلبك${typeNote}${budgetNote}، لقيت ${count} خيار يناسبك:\n\n` +
        `${highlights}\n\n` +
        `شوف البطاقات تحت للتفاصيل. ${followUp}\n\n` +
        `${DISCLAIMER_AR}`
      );
    }

    const highlights = top
      .map((listing) => {
        const location = listing.city ? ` in ${listing.city}` : '';
        const beds =
          listing.bedrooms != null ? `, ${listing.bedrooms} bed` : '';
        return `• ${listing.title}${location} — ${this.formatPrice(listing.priceEgp)} EGP${beds}`;
      })
      .join('\n');

    const budgetNote = input.intent?.maxPriceEgp
      ? ` around your ${this.formatPrice(input.intent.maxPriceEgp)} EGP budget`
      : '';
    const typeNote = input.intent?.propertyType
      ? ` (${input.intent.propertyType})`
      : '';

    const followUp =
      count > 3
        ? ' I have a few more below—want to narrow by neighborhood or bedrooms?'
        : ' Want to refine the area or book a viewing for any of these?';

    return (
      `Based on what you asked${typeNote}${budgetNote}, I pulled ${count} ` +
      `options that could work:\n\n` +
      `${highlights}\n\n` +
      `Tap the cards below for full details.${followUp}\n\n` +
      `${DISCLAIMER_EN}`
    );
  }

  private composeNoResults(input: ComposeReplyInput, ar: boolean): string {
    const suggestions = ar
      ? 'جرب توسّع الميزانية شوية، أو منطقة مجاورة، أو نوع تاني من العقار.'
      : 'Try widening the budget slightly, a nearby area, or a different property type.';

    if (ar) {
      return (
        `دورت على اللي طلبته بس للأسف مفيش نتائج مطابقة دلوقتي. ${suggestions}\n\n` +
        `قولي تحب أعدّل إيه في البحث.\n\n${DISCLAIMER_AR}`
      );
    }

    return (
      `I searched for what you described but nothing matched right now. ${suggestions}\n\n` +
      `Tell me what you'd like to adjust.\n\n${DISCLAIMER_EN}`
    );
  }

  private agentName(agentId: string, ar: boolean): string {
    const entry = AGENT_NAMES[agentId] ?? AGENT_NAMES['search-agent'];
    return ar ? entry.ar : entry.en;
  }

  private greetingEn(text: string): string {
    if (/morning/i.test(text)) {
      return 'Good morning! ';
    }
    if (/evening|night/i.test(text)) {
      return 'Good evening! ';
    }
    if (/afternoon/i.test(text)) {
      return 'Good afternoon! ';
    }
    if (/hello|hi|hey/i.test(text)) {
      return 'Hello! ';
    }
    return 'Hi! ';
  }

  private greetingAr(text: string): string {
    if (/صباح/i.test(text)) {
      return 'صباح الخير! ';
    }
    if (/مساء/i.test(text)) {
      return 'مساء الخير! ';
    }
    if (/مرحب|أهلا|اهلا|السلام/i.test(text)) {
      return 'أهلاً بيك! ';
    }
    return 'مرحباً! ';
  }

  private isGreeting(text: string): boolean {
    return /^(good\s+(morning|afternoon|evening|night)|hi|hello|hey|howdy|صباح|مساء|مرحب|أهلا|اهلا|السلام)/i.test(
      text.trim(),
    );
  }

  private isThanks(text: string): boolean {
    return /^(thanks|thank you|thx|شكر|متشكر)/i.test(text.trim());
  }

  private isVagueRealEstate(text: string): boolean {
    return /looking for|need a|want a|help me find|new to|area|neighborhood|منطقة|محتاج|عايز|دور على/i.test(
      text,
    );
  }

  private formatPrice(egp: number): string {
    if (egp >= 1_000_000) {
      const millions = egp / 1_000_000;
      return millions % 1 === 0
        ? `${millions}M`
        : `${millions.toFixed(1)}M`;
    }
    if (egp >= 1_000) {
      return `${Math.round(egp / 1_000)}K`;
    }
    return egp.toLocaleString('en-US');
  }

  private propertyTypeAr(type: string): string {
    const map: Record<string, string> = {
      apartment: 'شقة',
      villa: 'فيلا',
      duplex: 'دوبلكس',
      townhouse: 'تاون هاوس',
      commercial: 'تجاري',
      land: 'أرض',
      other: 'عقار',
    };
    return map[type] ?? type;
  }
}
