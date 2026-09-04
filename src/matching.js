export function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("zh-CN");
}

export function searchableText(member) {
  return normalize([
    member.name,
    member.nickname,
    member.occupation,
    member.location,
    ...(Array.isArray(member.skills) ? member.skills : []),
    ...(Array.isArray(member.ai_skills) ? member.ai_skills : []),
    ...(Array.isArray(member.ai_search_terms) ? member.ai_search_terms : []),
    member.experience,
    member.intro,
    member.x_account,
    member.wechat,
    member.telegram,
    member.email,
  ].filter(Boolean).join(" "));
}

function listify(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function includesLoose(source, target) {
  const left = normalize(source);
  const right = normalize(target);
  return Boolean(left && right && (left.includes(right) || right.includes(left)));
}

export function rankMembers(members, intent, originalQuery) {
  const names = listify(intent?.names || intent?.name);
  const skills = listify(intent?.skills);
  const locations = listify(intent?.locations || intent?.location);
  const occupations = listify(intent?.occupations || intent?.occupation);
  const experienceKeywords = listify(intent?.experience_keywords);
  const freeKeywords = listify(intent?.keywords);
  const fallbackTerms = normalize(originalQuery)
    .split(/[\s，,、；;。！？!?]+/)
    .filter((term) => term.length > 1);
  const hasStructuredIntent = Boolean(
    names.length
    || skills.length
    || locations.length
    || occupations.length
    || experienceKeywords.length
    || freeKeywords.length,
  );

  return members.map((member) => {
    let score = 0;
    const reasons = [];
    const memberSkills = [
      ...(Array.isArray(member.skills) ? member.skills : []),
      ...(Array.isArray(member.ai_skills) ? member.ai_skills : []),
      ...(Array.isArray(member.ai_search_terms) ? member.ai_search_terms : []),
    ];
    const profileText = searchableText(member);
    const conditions = [];

    names.forEach((name) => {
      conditions.push(() => {
        if (normalize(member.name) === normalize(name) || normalize(member.nickname) === normalize(name)) {
          score += 14;
          reasons.push({ key: "nameMatch", value: name });
          return true;
        }
        if (includesLoose(member.name, name) || includesLoose(member.nickname, name)) {
          score += 9;
          reasons.push({ key: "nameClose", value: name });
          return true;
        }
        return false;
      });
    });

    skills.forEach((skill) => {
      conditions.push(() => {
        const matched = memberSkills.find((item) => includesLoose(item, skill));
        if (matched) {
          score += 6;
          reasons.push({ key: "skillMatch", value: matched });
          return true;
        }
        if (includesLoose(member.experience, skill) || includesLoose(member.intro, skill)) {
          score += 3;
          reasons.push({ key: "experienceSkill", value: skill });
          return true;
        }
        return false;
      });
    });

    locations.forEach((location) => {
      conditions.push(() => {
        if (!includesLoose(member.location, location)) return false;
        score += 5;
        reasons.push({ key: "locationMatch", value: member.location });
        return true;
      });
    });

    occupations.forEach((occupation) => {
      conditions.push(() => {
        if (!includesLoose(member.occupation, occupation)) return false;
        score += 5;
        reasons.push({ key: "occupationMatch", value: member.occupation });
        return true;
      });
    });

    experienceKeywords.forEach((keyword) => {
      conditions.push(() => {
        const matched = includesLoose(member.experience, keyword)
          || includesLoose(member.intro, keyword)
          || memberSkills.some((item) => includesLoose(item, keyword));
        if (!matched) return false;
        score += 4;
        reasons.push({ key: "experienceMatch", value: keyword });
        return true;
      });
    });

    freeKeywords.forEach((keyword) => {
      conditions.push(() => {
        if (!profileText.includes(normalize(keyword))) return false;
        score += 2;
        reasons.push({ key: "keywordMatch", value: keyword });
        return true;
      });
    });

    if (!hasStructuredIntent) {
      fallbackTerms.forEach((term) => {
        conditions.push(() => {
          if (!profileText.includes(term)) return false;
          score += 2;
          reasons.push({ key: "keywordMatch", value: term });
          return true;
        });
      });
    }

    const matchesEveryCondition = conditions.length > 0 && conditions.every((condition) => condition());
    return { member, score, reasons: reasons.slice(0, 3), matchesEveryCondition };
  })
    .filter((item) => item.matchesEveryCondition)
    .sort((a, b) => b.score - a.score || String(a.member.name).localeCompare(String(b.member.name), "zh-CN"))
    .slice(0, 5);
}
