import { culturalKeywordMap, activityKeywordMap, passionKeywordMap, outcomesKeywordMap } from './keywordMaps.js';

export function calculateScore(org, res) {
  let score = 0;
  const cats = (org.categories || []).map(c => String(c).toLowerCase());
  const name = (org.name || '').toLowerCase();
  const desc = (org.description || '').toLowerCase();
  const hasCat = (c) => cats.includes(c.toLowerCase());
  const textHas = (kw) => name.includes(kw) || desc.includes(kw);

  // 1. Category matches from Q1
  (res.primaryInterests || []).forEach(ci => {
    if (hasCat(ci)) score += 100;
  });

  // 2. Academic Focus keywords
  if (res.academicFocus) {
    const keywords = res.academicFocus.split(/[\s,;]+/).filter(k => k.length > 2);
    keywords.forEach(k => {
      const kw = k.toLowerCase();
      if (name.includes(kw)) score += 5;
      cats.forEach(c => { if (c.includes(kw)) score += 3; });
      const matches = desc.match(new RegExp(kw, 'g'));
      if (matches) score += matches.length * 1;
    });
  }

  // 3. Activity Preferences
  (res.activityPrefs || []).forEach(code => {
    (activityKeywordMap[code] || []).forEach(kw => {
      if (textHas(kw)) score += 15;
    });
    if (code === 'volunteer' && hasCat('Advocacy/Service')) score += 15;
    if (code === 'networking' && hasCat('Professional/Academic/Honor Society')) score += 15;
    if (code === 'compete-travel' && hasCat('Sport Club')) score += 15;
  });

  // 4. Cultural & Identity Focus
  if ((res.culturalFocus || []).length && !res.culturalFocus.includes('none')) {
    if (hasCat('Cultural')) score += 100;
    res.culturalFocus.forEach(tag => {
      (culturalKeywordMap[tag] || []).forEach(kw => {
        if (textHas(kw)) score += 8;
      });
    });
  }

  // 5. Spiritual considerations
  if (res.spiritual === 'very') {
    if (hasCat('Religious/Faith Based')) score += 100;
    if (textHas('ministry') || textHas('worship') || textHas('church') || textHas('bible')) score += 20;
  } else if (res.spiritual === 'somewhat') {
    if (hasCat('Religious/Faith Based')) score += 50;
  } else if (res.spiritual === 'not') {
    if (hasCat('Religious/Faith Based')) score -= 10;
  }

  // 6. Size preference
  if (res.sizePreference && typeof org.memberCount !== 'undefined') {
    const m = Number(org.memberCount || 0);
    const matches =
      (res.sizePreference === 'large' && m > 50) ||
      (res.sizePreference === 'medium' && m >= 20 && m <= 50) ||
      (res.sizePreference === 'small' && m < 20);
    if (matches) score += 20;
  }

  // 7. Greek life interest
  if (res.greekInterest === 'yes') {
    if (hasCat('Fraternity & Sorority')) score += 100;
  } else if (res.greekInterest === 'maybe') {
    if (hasCat('Fraternity & Sorority')) score += 40;
  } else if (res.greekInterest === 'no') {
    if (hasCat('Fraternity & Sorority')) score -= 60;
  }

  // 8. Meeting structure
  if (res.meetingStructure === 'regular') {
    if (org.meetingTime) score += 15;
  } else if (res.meetingStructure === 'event') {
    if (hasCat('Special Interest') || textHas('event') || textHas('social')) score += 15;
  }

  // 9. Passion areas
  if (res.passion) {
    (passionKeywordMap[res.passion] || []).forEach(kw => { if (textHas(kw)) score += 10; });
    if (res.passion === 'environment' && textHas('sustainability')) score += 10;
    if (res.passion === 'arts' && (hasCat('Special Interest') || textHas('art'))) score += 10;
    if (res.passion === 'education' && (textHas('mentor')||textHas('teach'))) score += 10;
    if (res.passion === 'justice' && (hasCat('Advocacy/Service') || textHas('advocacy'))) score += 10;
  }

  // 10. Desired outcomes
  (res.outcomes || []).forEach(key => {
    const cfg = outcomesKeywordMap[key];
    (cfg?.keywords || []).forEach(kw => { if (textHas(kw)) score += 8; });
    (cfg?.categoryHints || []).forEach(ch => { if (hasCat(ch)) score += 12; });
  });

  return score;
}
