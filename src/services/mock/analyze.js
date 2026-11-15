export const AI_STUB_LABEL = 'Simulated stub, not a real model';

const CATEGORY_RULES = [
  {
    id: 'street-lighting',
    pattern:
      /street\s*lights?|streetlight|(?:^|\s)light(?:\s|$)|lait|andhera|اندھیرا|اسٹریٹ لائٹ|لائٹ|چراغ/i,
  },
  {
    id: 'sewerage',
    pattern: /gutter|gatar|sewer(?:age)?|overflow|badboo|smell|گٹر|سیوریج|ابل|بدبو/i,
  },
  {
    id: 'drainage',
    pattern: /drainage|rainwater|standing water|barish|بارش|کھڑا پانی|نالی/i,
  },
  {
    id: 'water-supply',
    pattern: /water supply|water is|pani|paani|pany|water pressure|پانی|نلکا/i,
  },
  {
    id: 'electricity',
    pattern: /electric|electricity|bijli|بجلی|wire|تار/i,
  },
  {
    id: 'garbage',
    pattern: /garbage|rubbish|kachra|کچرا|کوڑا|waste collection/i,
  },
  {
    id: 'roads',
    pattern: /pothole|road|sarak|سڑک|گڑھا/i,
  },
  {
    id: 'traffic',
    pattern: /traffic|signal|ٹریفک|سگنل/i,
  },
  {
    id: 'parks',
    pattern: /park|green space|پارک/i,
  },
  {
    id: 'public-safety',
    pattern: /unsafe|danger|crime|safety|خطرہ|غیر محفوظ/i,
  },
  {
    id: 'sanitation',
    pattern: /sanitation|safai|صفائی|litter/i,
  },
];

const DEPARTMENTS = {
  sanitation: 'municipal_dept',
  garbage: 'municipal_dept',
  sewerage: 'sewerage_dept',
  drainage: 'drainage_dept',
  'water-supply': 'water_dept',
  electricity: 'infrastructure_dept',
  'street-lighting': 'infrastructure_dept',
  roads: 'infrastructure_dept',
  traffic: 'traffic_dept',
  parks: 'municipal_dept',
  'public-safety': 'public_safety_dept',
  other: 'municipal_dept',
};

const AREA_NAMES = [
  'Model Town',
  'Johar Town',
  'Township',
  'Gulberg',
  'Iqbal Town',
  'Samanabad',
  'Wapda Town',
  'DHA',
];

const URDU_NUMBERS = {
  ایک: 1,
  دو: 2,
  تین: 3,
  چار: 4,
  پانچ: 5,
};

const ENGLISH_NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  teen: 3,
};

function normalizeText(text) {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/\b(paani|pany)\b/g, 'pani')
    .replace(/\b(gatar)\b/g, 'gutter')
    .replace(/\b(dino)\b/g, 'din')
    .replace(/\b(lait)\b/g, 'light')
    .replace(/\b(kharaab)\b/g, 'kharab')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLanguage(text) {
  const hasUrdu = /[\u0600-\u06ff]/u.test(text);
  const hasLatin = /[a-z]/i.test(text);
  if (hasUrdu && hasLatin) return { label: 'mixed', confidence: 0.9 };
  if (hasUrdu) return { label: 'urdu', confidence: 0.98 };
  if (/\b(gali|bohat|nahi|pani|gutter|gatar|hai|din|paani|pany)\b/i.test(text)) {
    return { label: 'roman_urdu', confidence: 0.96 };
  }
  return { label: 'en', confidence: 0.98 };
}

function classify(normalized) {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(normalized)) return { id: rule.id, confidence: 0.91 };
  }
  return { id: 'other', confidence: 0.38 };
}

function parseDuration(text) {
  const number = '(?<amount>\\d+|one|two|three|four|five|teen|ایک|دو|تین|چار|پانچ)';
  const unit = '(?:days?|din|dino|دن)';
  const match = new RegExp(`(?<![\\p{L}\\p{N}])${number}\\s*${unit}(?![\\p{L}\\p{N}])`, 'iu').exec(
    text,
  );
  if (!match) return null;
  const amountText = match.groups.amount.toLocaleLowerCase();
  const amount = Number.isFinite(Number(amountText))
    ? Number(amountText)
    : (URDU_NUMBERS[amountText] ?? ENGLISH_NUMBERS[amountText] ?? 3);
  const value = `${amount} days`;
  return { value, amount, span: [match.index, match.index + match[0].length] };
}

function extractEntities(text, category) {
  const entities = [];
  const issuePattern =
    /(?:gutter|gatar|sewer|گٹر|سیوریج)\s*(?:overflow|overflows|leak|ابل رہا|ابل رہی)?/iu;
  const issueMatch = issuePattern.exec(text);
  if (issueMatch) {
    entities.push({
      type: 'issue',
      value: category.id === 'sewerage' ? 'sewer overflow' : issueMatch[0].trim(),
      span: [issueMatch.index, issueMatch.index + issueMatch[0].length],
      confidence: 0.9,
    });
  }

  const duration = parseDuration(text);
  if (duration) {
    entities.push({
      type: 'duration',
      value: duration.value,
      span: duration.span,
      confidence: 0.96,
    });
  }

  const areaRegex = new RegExp(`\\b(${AREA_NAMES.join('|')})\\b`, 'i');
  const areaMatch = areaRegex.exec(text);
  if (areaMatch) {
    entities.push({
      type: 'area',
      value: areaMatch[1],
      span: [areaMatch.index, areaMatch.index + areaMatch[0].length],
      confidence: 0.94,
    });
  }

  const blockMatch = /\bblock\s+[a-z0-9-]+/i.exec(text);
  if (blockMatch) {
    entities.push({
      type: 'block',
      value: blockMatch[0],
      span: [blockMatch.index, blockMatch.index + blockMatch[0].length],
      confidence: 0.9,
    });
  }

  const landmarkMatch =
    /\b(?:near|beside|opposite|behind)\s+(?:the\s+)?([a-z][a-z0-9 -]{1,30})/i.exec(text);
  if (landmarkMatch) {
    const value = landmarkMatch[1].trim().split(/\s+(?:and|but|for|since|with)\s+/i)[0];
    const valueStart = landmarkMatch.index + landmarkMatch[0].indexOf(landmarkMatch[1]);
    entities.push({
      type: 'landmark',
      value,
      span: [valueStart, valueStart + value.length],
      confidence: 0.82,
    });
  }
  return entities;
}

function meaningfulTokens(text) {
  return new Set(
    text
      .toLocaleLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter(
        (token) => token.length > 2 && !['the', 'and', 'hai', 'mein', 'se'].includes(token),
      ) ?? [],
  );
}

function tokenSimilarity(left, right) {
  const a = meaningfulTokens(left);
  const b = meaningfulTokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  const intersection = [...a].filter((token) => b.has(token)).length;
  return intersection / new Set([...a, ...b]).size;
}

function findSimilar(text, category, language, complaints, locality) {
  if (category.id === 'other') return [];
  return complaints
    .filter((complaint) => {
      const seededCategory = String(complaint.categoryId ?? complaint.category ?? '').toLowerCase();
      return seededCategory.includes(category.id);
    })
    .map((complaint) => {
      const seededText = complaint.originalText ?? complaint.text ?? '';
      const crossLanguage = Boolean(complaint.language && complaint.language !== language);
      const tokenScore = tokenSimilarity(normalizeText(text), normalizeText(seededText));
      const sameArea = locality && complaint.locality === locality;
      const semanticScore = crossLanguage ? 0.84 : 0.72;
      const score = Math.min(
        0.99,
        Math.max(semanticScore, 0.72 + tokenScore * 0.2) + (sameArea ? 0.04 : 0),
      );
      return {
        complaint_id: complaint.id,
        score: Number(score.toFixed(2)),
        cross_language: crossLanguage,
        distance_m: sameArea ? 120 : 220,
        days_apart: 2,
      };
    })
    .filter((item) => item.score >= 0.78)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

export function analyzeComplaint(text, options = {}) {
  const originalText = String(text ?? '');
  const normalized = normalizeText(originalText);
  const language = detectLanguage(originalText);
  const category = classify(normalized);
  const duration = parseDuration(originalText);
  const riskyIssue =
    category.id === 'sewerage' && /overflow|gutter|gatar|گٹر|سیوریج|بدبو|smell/i.test(normalized);
  const prolonged = duration?.amount >= 3;
  const urgency = riskyIssue
    ? {
        label: 'high',
        confidence: 0.87,
        reasons: [
          'Potential public-health risk',
          ...(prolonged ? [`Prolonged issue (${duration.amount} days)`] : []),
        ],
        safety_rule: null,
      }
    : {
        label: 'medium',
        confidence: 0.64,
        reasons: category.id === 'other' ? [] : ['Service disruption reported'],
        safety_rule: null,
      };
  const departmentId = DEPARTMENTS[category.id] ?? DEPARTMENTS.other;
  const departmentAlternatives = category.id === 'sewerage' ? [['drainage_dept', 0.06]] : [];
  let languageConfidence = language.confidence;
  let categoryConfidence = category.confidence;
  let urgencyConfidence = urgency.confidence;
  let departmentConfidence = category.id === 'other' ? 0.38 : 0.91;

  if (options.forceLowConfidence) {
    languageConfidence = 0.42;
    categoryConfidence = 0.44;
    urgencyConfidence = 0.46;
    departmentConfidence = 0.43;
  }

  const categoryTop3 =
    category.id === 'sewerage'
      ? [
          ['sewerage', categoryConfidence],
          ['drainage', 0.06],
          ['sanitation', 0.02],
        ]
      : [
          [category.id, categoryConfidence],
          ['other', 0.06],
          ['sanitation', 0.02],
        ];
  const explanation =
    category.id === 'sewerage'
      ? 'Indicators: gutter, overflow, smell'
      : category.id === 'other'
        ? 'Indicators: no strong category keywords'
        : `Indicators: ${category.id.replaceAll('-', ' ')}`;

  return {
    language: language.label,
    language_confidence: languageConfidence,
    normalised_text: normalized,
    category: {
      label: category.id,
      confidence: categoryConfidence,
      top3: categoryTop3,
    },
    urgency: {
      label: urgency.label,
      confidence: urgencyConfidence,
      reasons: urgency.reasons,
      safety_rule: urgency.safety_rule,
    },
    department: {
      label: departmentId,
      confidence: departmentConfidence,
      alternatives: departmentAlternatives,
    },
    entities: extractEntities(originalText, category),
    similar: findSimilar(
      originalText,
      category,
      language.label,
      options.complaints ?? [],
      options.locality,
    ),
    explanation,
    model_versions: {
      classifier: 'v1.3',
      extractor: 'v0.9',
      embedding: 'v1.0',
    },
    needs_human_review:
      options.forceLowConfidence ||
      languageConfidence < 0.6 ||
      categoryConfidence < 0.7 ||
      departmentConfidence < 0.75,
  };
}
