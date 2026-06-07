import { Injectable } from '@nestjs/common';
import { ListingRefProps } from '../../domain/chat/value-objects/listing-ref.vo';

export interface SafetyPreResult {
  blocked: boolean;
  refusalContent?: string;
  sanitizedContent: string;
}

export interface SafetyPostInput {
  content: string;
  listingRefs: ListingRefProps[];
  allowedPropertyIds: Set<string>;
}

const FAIR_HOUSING_PATTERNS = [
  /\b(christian|muslim|jewish|hindu)\s+(only|families|tenants)\b/i,
  /\b(no\s+)?(muslims|christians|foreigners|expats|nationals)\b/i,
  /\b(white|black|asian)\s+(only|neighborhood)\b/i,
  /\bfor\s+(men|women)\s+only\b/i,
  new RegExp('(مسيحي|مسلم|أقباط)\\s+فقط'),
  /\bnationals?\s+only\b/i,
];

const PII_PATTERNS: Array<{ re: RegExp; replacement: string }> = [
  {
    re: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g,
    replacement: '[email redacted]',
  },
  {
    re: /\b\+?\d[\d\s-]{8,}\d\b/g,
    replacement: '[phone redacted]',
  },
  {
    re: /\b\d{14}\b/g,
    replacement: '[id redacted]',
  },
];

@Injectable()
export class SafetyPipelineService {
  private fairHousingBlocks = 0;

  getFairHousingBlockCount(): number {
    return this.fairHousingBlocks;
  }

  preCheckUserInput(content: string): SafetyPreResult {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return {
        blocked: true,
        refusalContent:
          'Please enter a message about properties in Egypt.',
        sanitizedContent: '',
      };
    }

    for (const pattern of FAIR_HOUSING_PATTERNS) {
      if (pattern.test(trimmed)) {
        this.fairHousingBlocks += 1;
        return {
          blocked: true,
          refusalContent:
            'I cannot help with requests that discriminate based on ' +
            'religion, ethnicity, nationality, or similar protected ' +
            'characteristics. I can help you search for properties using ' +
            'location, price, size, and amenities instead.',
          sanitizedContent: '',
        };
      }
    }

    return {
      blocked: false,
      sanitizedContent: this.redactPii(trimmed),
    };
  }

  redactPii(text: string): string {
    let out = text;
    for (const { re, replacement } of PII_PATTERNS) {
      out = out.replace(re, replacement);
    }
    return out;
  }

  postCheckAssistant(
    input: SafetyPostInput,
  ): { content: string; listingRefs: ListingRefProps[] } {
    const allowed = input.listingRefs.filter((r) =>
      input.allowedPropertyIds.has(r.propertyId),
    );
    return {
      content: input.content,
      listingRefs: allowed,
    };
  }
}
