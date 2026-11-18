export const aiFixtures = Object.freeze({
  categoryHighConfidence: Object.freeze({
    id: 'ai-fix-cat-01',
    field: 'Category',
    value: 'Sewerage & Drainage',
    confidence: 0.91,
    threshold: 0.70,
    reasons: Object.freeze([
      'Indicators: gutter, overflow, bad smell',
      'Mentioned duration: 3 days continuous',
      "Urdu/Roman Urdu keyword match: 'gutter overflow'",
    ]),
    safetyRule: null,
    alternatives: Object.freeze([
      Object.freeze({ label: 'Water Supply', confidence: 0.06 }),
      Object.freeze({ label: 'Solid Waste Management', confidence: 0.02 }),
      Object.freeze({ label: 'Road Infrastructure', confidence: 0.01 }),
    ]),
    modelVersion: 'classifier v1.3',
  }),

  departmentBelowThreshold: Object.freeze({
    id: 'ai-fix-dept-02',
    field: 'Department',
    value: 'Sewerage Dept',
    confidence: 0.58,
    threshold: 0.75,
    reasons: Object.freeze([
      'Address references multiple municipal boundary zones',
      'Boundary between WASA and Cantonment Board ambiguous',
      'Civic boundary mapping confidence below auto-route threshold',
    ]),
    safetyRule: null,
    alternatives: Object.freeze([
      Object.freeze({ label: 'Cantonment Board', confidence: 0.35 }),
      Object.freeze({ label: 'WASA Lahore', confidence: 0.07 }),
    ]),
    modelVersion: 'dept-router v2.0',
  }),

  emergencySafetyRule: Object.freeze({
    id: 'ai-fix-safety-03',
    field: 'Urgency & Safety',
    value: 'Critical Urgency',
    confidence: 0.94,
    threshold: 0.70,
    reasons: Object.freeze([
      'Live electric wire hanging within reach of pedestrians',
      'High public footfall zone near community school',
    ]),
    safetyRule:
      'Applied Safety Rule: Exposed live electrical wire (Rescue 1122 & LESCO priority escalation)',
    alternatives: Object.freeze([
      Object.freeze({ label: 'High Urgency', confidence: 0.05 }),
    ]),
    modelVersion: 'safety-policy v1.1',
  }),
});
