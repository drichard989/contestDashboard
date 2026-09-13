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
    const situation = competition?.situation || event?.situation || {};
    const possessionId = String(situation.possession || "").trim();
    const possessionCompetitor = competitors.find(item => {
      const ids = [item?.id, item?.team?.id, item?.team?.uid]
        .filter(value => value != null)
        .map(value => String(value));
      return possessionId && ids.includes(possessionId);
    }) || competitors.find(item => (
      possessionId && String(item?.team?.abbreviation || "").toUpperCase() === possessionId.toUpperCase()
    ));
    const possessionText = String(situation.possessionText || "")
      .replace(/\s+has\s+the\s+ball.*$/i, "")
      .replace(/\s+with\s+the\s+ball.*$/i, "")
      .replace(/['’]s\s+ball.*$/i, "")
      .replace(/\s+ball.*$/i, "")
      .trim();
    const down = Number(situation.down);
    const distance = Number(situation.distance);
    const downDistanceText = String(
      situation.downDistanceText || situation.shortDownDistanceText || ""
    ).trim() || (
      Number.isInteger(down) && down > 0
        ? `${down === 1 ? "1st" : down === 2 ? "2nd" : down === 3 ? "3rd" : "4th"} & ${Number.isFinite(distance) ? distance : "?"}`
        : null
    );

    return {
      id: String(event?.id || `event-${index}`),
      state,
      statusText,
      statusName,
      startTime: event?.date || null,
      period: Number(status.period || statusType.period || 0) || null,
      // Keep ESPN's clock as reported. The dashboard never decrements it locally.
      clock: status.displayClock || status.clock || null,
      situation: {
        possessionAbbr: possessionCompetitor?.team?.abbreviation
          ? String(possessionCompetitor.team.abbreviation)
          : null,
        possessionName: possessionCompetitor?.team?.displayName
          || possessionCompetitor?.team?.shortDisplayName
          || possessionCompetitor?.team?.name
          || possessionText
          || null,
        down: Number.isInteger(down) && down > 0 ? down : null,
        distance: Number.isFinite(distance) ? distance : null,
        downDistanceText: downDistanceText ? String(downDistanceText) : null
      },
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
