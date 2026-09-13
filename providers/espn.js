(() => {
  "use strict";

  window.CIRCA_PROVIDERS = window.CIRCA_PROVIDERS || {};

  function numericScore(value) {
    const score = Number(value);
    return Number.isFinite(score) ? score : 0;
  }

  function normalizeGame(event, index) {
    const competition = event?.competitions?.[0];
    const competitors = Array.isArray(competition?.competitors)
      ? competition.competitors
      : [];
    const home = competitors.find(item => item?.homeAway === "home") || competitors[0];
    const away = competitors.find(item => item?.homeAway === "away") || competitors[1];

    if (!home?.team?.abbreviation || !away?.team?.abbreviation) return null;

    const status = event?.status || competition?.status || {};
    const statusType = status?.type || {};
    const rawState = statusType.state || "pre";
    const state = rawState === "in" ? "in" : rawState === "post" ? "post" : "pre";
    const statusName = String(statusType.name || "").toUpperCase();
    const statusText = statusType.shortDetail || statusType.detail || statusType.description || "Scheduled";

    return {
      id: String(event?.id || `event-${index}`),
      state,
      statusText,
      statusName,
      startTime: event?.date || null,
      period: Number(status.period || statusType.period || 0) || null,
      clock: status.displayClock || status.clock || null,
      isPostponed: statusName.includes("POSTPONED") || /postponed/i.test(statusText),
      isCanceled: statusName.includes("CANCEL") || /canceled|cancelled/i.test(statusText),
      home: {
        abbr: String(home.team.abbreviation),
        name: home.team.displayName || home.team.name || home.team.abbreviation,
        score: numericScore(home.score)
      },
      away: {
        abbr: String(away.team.abbreviation),
        name: away.team.displayName || away.team.name || away.team.abbreviation,
        score: numericScore(away.score)
      }
    };
  }

  async function getScoreboard({ url, signal }) {
    const response = await fetch(url, { cache: "no-store", signal });
    if (!response.ok) throw new Error(`Score request failed (${response.status})`);

    let payload;
    try {
      payload = await response.json();
    } catch (_) {
      throw new Error("Score response was not valid JSON");
    }

    if (!payload || !Array.isArray(payload.events)) {
      throw new Error("Score response did not contain the expected games list");
    }

    const games = payload.events
      .map(normalizeGame)
      .filter(Boolean);

    return {
      games,
      skippedEvents: payload.events.length - games.length
    };
  }

  window.CIRCA_PROVIDERS.espn = { getScoreboard };
})();
