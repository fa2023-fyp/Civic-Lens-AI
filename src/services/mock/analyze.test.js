import { describe, expect, it } from 'vitest';
import { AI_STUB_LABEL, analyzeComplaint } from './analyze.js';
import { api } from '../api.js';

describe('simulated complaint analysis', () => {
  it('classifies the Roman Urdu sewerage example with the documented estimates', () => {
    const result = analyzeComplaint(
      'Gali mein 3 din se gutter overflow ho raha hai aur smell bohat zyada hai.',
    );

    expect(result.category).toMatchObject({ label: 'sewerage', confidence: 0.91 });
    expect(result.urgency).toMatchObject({ label: 'high', confidence: 0.87 });
    expect(result.urgency.reasons).toEqual([
      'Potential public-health risk',
      'Prolonged issue (3 days)',
    ]);
    expect(result.department.label).toBe('sewerage_dept');
    expect(Object.keys(result)).toEqual([
      'language',
      'language_confidence',
      'normalised_text',
      'category',
      'urgency',
      'department',
      'entities',
      'similar',
      'explanation',
      'model_versions',
      'needs_human_review',
    ]);
    expect(api.ai.label).toBe(AI_STUB_LABEL);
  });

  it.each(['3 din', 'teen din', '3 days', 'تین دن'])('extracts a duration from %s', (phrase) => {
    const result = analyzeComplaint(`Gali mein gutter overflow ${phrase} se hai.`);
    expect(result.entities).toContainEqual(
      expect.objectContaining({ type: 'duration', value: '3 days' }),
    );
  });

  it('finds cross-language street-lighting similarity in seeded complaints', () => {
    const result = analyzeComplaint('Street light band hai aur andhera hai.', {
      complaints: [
        {
          id: 'c-0987',
          categoryId: 'street-lighting',
          language: 'urdu',
          originalText: 'کونے کے پاس والی اسٹریٹ لائٹ کئی راتوں سے بند ہے۔',
        },
      ],
    });

    expect(result.category.label).toBe('street-lighting');
    expect(result.similar[0]).toMatchObject({
      complaint_id: 'c-0987',
      cross_language: true,
    });
  });

  it('forces estimates below review thresholds and flags gibberish for review', () => {
    const forced = analyzeComplaint('Gali mein gutter overflow ho raha hai.', {
      forceLowConfidence: true,
    });
    const gibberish = analyzeComplaint('xyz qwerty blorp zzz');

    expect(forced.needs_human_review).toBe(true);
    expect(forced.category.confidence).toBeLessThan(0.7);
    expect(forced.department.confidence).toBeLessThan(0.75);
    expect(gibberish.category.label).toBe('other');
    expect(gibberish.needs_human_review).toBe(true);
  });

  it('accepts a submission during downtime and retries analysis after recovery', async () => {
    const session = await api.auth.login({
      email: 'citizen@demo.civiclens.test',
      password: 'Demo123!',
    });
    await api.ai.setServiceDown(true);
    const complaint = await api.complaints.create(
      {
        text: 'Gali mein gutter overflow ho raha hai aur smell bohat zyada hai.',
        category: 'sewerage',
        locality: 'Model Town',
        language: 'roman_urdu',
      },
      { token: session.token },
    );

    expect(complaint.status).toBe('Pending Analysis');
    await expect(api.ai.analyze('Gali mein gutter overflow ho raha hai.')).rejects.toMatchObject({
      code: 'AI_SERVICE_DOWN',
    });

    await api.ai.setServiceDown(false);
    await new Promise((resolve) => setTimeout(resolve, 2600));
    const retried = await api.complaints.get(complaint.id, { token: session.token });
    expect(retried.status).not.toBe('Pending Analysis');
    expect(retried.aiAnalysis?.category.label).toBe('sewerage');
    await api.reset();
  }, 15_000);
});
