(() => {
  "use strict";

  const CFG = window.CIRCA_CONFIG || {};
  const STORAGE_KEY = "circa-picks-dashboard:v1";

  // ESPN abbreviations are included where obvious. Team-name aliases allow natural input.
  const TEAMS = [
    ["ARI", "Arizona Cardinals", ["cardinals","arizona"]],
    ["ATL", "Atlanta Falcons", ["falcons","atlanta"]],
    ["BAL", "Baltimore Ravens", ["ravens","baltimore"]],
    ["BUF", "Buffalo Bills", ["bills","buffalo"]],
    ["CAR", "Carolina Panthers", ["panthers","carolina"]],
    ["CHI", "Chicago Bears", ["bears","chicago"]],
    ["CIN", "Cincinnati Bengals", ["bengals","cincinnati"]],
    ["CLE", "Cleveland Browns", ["browns","cleveland"]],
    ["DAL", "Dallas Cowboys", ["cowboys","dallas"]],
    ["DEN", "Denver Broncos", ["broncos","denver"]],
    ["DET", "Detroit Lions", ["lions","detroit"]],
    ["GB", "Green Bay Packers", ["packers","green bay"]],
    ["HOU", "Houston Texans", ["texans","houston"]],
    ["IND", "Indianapolis Colts", ["colts","indianapolis"]],
    ["JAX", "Jacksonville Jaguars", ["jaguars","jacksonville","jags"]],
    ["KC", "Kansas City Chiefs", ["chiefs","kansas city"]],
    ["LV", "Las Vegas Raiders", ["raiders","las vegas","oakland"]],
    ["LAC", "Los Angeles Chargers", ["chargers","la chargers"]],
    ["LAR", "Los Angeles Rams", ["rams","la rams"]],
    ["MIA", "Miami Dolphins", ["dolphins","miami"]],
    ["MIN", "Minnesota Vikings", ["vikings","minnesota"]],
    ["NE", "New England Patriots", ["patriots","new england","pats"]],
    ["NO", "New Orleans Saints", ["saints","new orleans"]],
    ["NYG", "New York Giants", ["giants","ny giants"]],
    ["NYJ", "New York Jets", ["jets","ny jets"]],
    ["PHI", "Philadelphia Eagles", ["eagles","philadelphia","philly"]],
    ["PIT", "Pittsburgh Steelers", ["steelers","pittsburgh"]],
    ["SEA", "Seattle Seahawks", ["seahawks","seattle"]],
    ["SF", "San Francisco 49ers", ["49ers","niners","san francisco"]],
    ["TB", "Tampa Bay Buccaneers", ["buccaneers","bucs","tampa bay","tampa"]],
    ["TEN", "Tennessee Titans", ["titans","tennessee"]],
    ["WSH", "Washington Commanders", ["commanders","washington"]]
  ];

  const aliasMap = new Map();
  for (const [abbr, full, aliases] of TEAMS) {
    [abbr, full, ...aliases].forEach(a => aliasMap.set(normalize(a), { abbr, full }));
  }

  const els = {
    entryEditors: document.getElementById("entryEditors"),
    entryCards: document.getElementById("entryCards"),
    gamesBody: document.getElementById("gamesBody"),
    lastUpdated: document.getElementById("lastUpdated"),
    refreshBtn: document.getElementById("refreshBtn"),
    saveBtn: document.getElementById("saveBtn"),
    addEntryBtn: document.getElementById("addEntryBtn"),
    statusBanner: document.getElementById("statusBanner"),
    seasonInput: document.getElementById("seasonInput"),
    seasonTypeInput: document.getElementById("seasonTypeInput"),
    weekInput: document.getElementById("weekInput")
  };

  let state = loadState();
  let scoreboard = null;
  let timer = null;

  function normalize(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .replace(/[’']/g, "")
      .replace(/[.\-_]/g, " ")
      .replace(/\s+/g, " ");
  }

  function displaySpread(n) {
    if (Object.is(n, -0)) n = 0;
    return `${n > 0 ? "+" : ""}${Number.isInteger(n) ? n : n.toFixed(1).replace(".5", "½")}`;
  }

  function parsePick(line) {
    const raw = String(line || "").trim();
    if (!raw) return null;

    // Accept -3, +3, -3.5, +½, -3½, PK/pick/pick'em.
    const pk = /\s+(pk|pick(?:'em)?|pickem)$/i.exec(raw);
    if (pk) {
      const teamText = raw.slice(0, pk.index).trim();
      const team = aliasMap.get(normalize(teamText));
      return team ? { raw, team, spread: 0 } : { raw, error: `Unknown team: ${teamText}` };
    }

    const m = raw.match(/^(.*?)\s*([+-])\s*(\d+)?(?:\.5|½)?\s*$/);
    if (!m) return { raw, error: "Use format like Bears -3 or Texans +0.5" };

    const teamText = m[1].trim();
    const sign = m[2] === "-" ? -1 : 1;
    const whole = m[3] ? Number(m[3]) : 0;
    const hasHalf = /\.5|½/.test(raw.slice(m.index + m[1].length));
    const spread = sign * (whole + (hasHalf ? 0.5 : 0));
    const team = aliasMap.get(normalize(teamText));
    if (!team) return { raw, error: `Unknown team: ${teamText}` };
    return { raw, team, spread };
  }

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (stored && Array.isArray(stored.entries)) return stored;
    } catch (_) {}
    return {
      entries: structuredClone(CFG.starterEntries || [{ name: "Entry 1", picks: [] }]),
      season: CFG.defaultSeason ?? "",
      seasonType: CFG.defaultSeasonType ?? 2,
      week: CFG.defaultWeek ?? ""
    };
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function renderEditors() {
    els.entryEditors.innerHTML = "";
    state.entries.forEach((entry, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "entry-editor";
      wrap.innerHTML = `
        <div class="editor-head">
          <input class="entry-name" data-entry="${idx}" value="${escapeHtml(entry.name || `Entry ${idx+1}`)}" aria-label="Entry name">
          <button class="danger remove-entry" data-entry="${idx}" ${state.entries.length === 1 ? "disabled" : ""}>Remove</button>
        </div>
        <textarea data-entry="${idx}" class="entry-picks" spellcheck="false" aria-label="Picks">${escapeHtml((entry.picks || []).join("\n"))}</textarea>
      `;
      els.entryEditors.appendChild(wrap);
    });
    els.seasonInput.value = state.season ?? "";
    els.seasonTypeInput.value = String(state.seasonType ?? 2);
    els.weekInput.value = state.week ?? "";
  }

  function readEditorsIntoState() {
    state.entries = [...els.entryEditors.querySelectorAll(".entry-editor")].map((wrap, idx) => ({
      name: wrap.querySelector(".entry-name").value.trim() || `Entry ${idx+1}`,
      picks: wrap.querySelector(".entry-picks").value.split("\n").map(x => x.trim()).filter(Boolean)
    }));
    state.season = els.seasonInput.value ? Number(els.seasonInput.value) : "";
    state.seasonType = Number(els.seasonTypeInput.value || 2);
    state.week = els.weekInput.value ? Number(els.weekInput.value) : "";
  }

  function buildScoreboardUrl() {
    const url = new URL(CFG.espnScoreboardBase);
    if (state.season) url.searchParams.set("dates", String(state.season));
    if (state.week) {
      url.searchParams.set("week", String(state.week));
      url.searchParams.set("seasontype", String(state.seasonType || 2));
    }
    return url.toString();
  }

  async function refreshScores() {
    els.refreshBtn.disabled = true;
    setBanner("Refreshing live scores…", false);
    try {
      const res = await fetch(buildScoreboardUrl(), { cache: "no-store" });
      if (!res.ok) throw new Error(`Score request failed (${res.status})`);
      scoreboard = await res.json();
      setBanner("", false);
      renderDashboard();
      els.lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], {hour:"numeric", minute:"2-digit", second:"2-digit"})}`;
    } catch (err) {
      console.error(err);
      setBanner(
        `Could not refresh ESPN scores. Your saved picks are safe. ${err.message}. ` +
        `If this persists, see README.md for the recommended proxy/fallback path.`,
        true
      );
      renderDashboard();
    } finally {
      els.refreshBtn.disabled = false;
    }
  }

  function setBanner(text, show) {
    els.statusBanner.textContent = text;
    els.statusBanner.classList.toggle("hidden", !show && !text);
  }

  function getEvents() {
    return Array.isArray(scoreboard?.events) ? scoreboard.events : [];
  }

  function eventForTeam(abbr) {
    return getEvents().find(ev => {
      const competitors = ev?.competitions?.[0]?.competitors || [];
      return competitors.some(c => c?.team?.abbreviation === abbr);
    }) || null;
  }

  function parseEvent(ev, selectedAbbr) {
    if (!ev) return { found:false, state:"pre", statusText:"Game not found on loaded scoreboard" };
    const comp = ev?.competitions?.[0];
    const competitors = comp?.competitors || [];
    const selected = competitors.find(c => c?.team?.abbreviation === selectedAbbr);
    const opponent = competitors.find(c => c?.team?.abbreviation !== selectedAbbr);
    if (!selected || !opponent) return { found:false, state:"pre", statusText:"Game data incomplete" };

    const selectedScore = Number(selected.score || 0);
    const opponentScore = Number(opponent.score || 0);
    const stateName = ev?.status?.type?.state || "pre";
    const statusText = ev?.status?.type?.shortDetail || ev?.status?.type?.detail || "Scheduled";
    const date = ev?.date ? new Date(ev.date) : null;

    return {
      found:true,
      ev,
      state:stateName,
      statusText,
      date,
      selectedName:selected.team?.displayName || selected.team?.name || selectedAbbr,
      selectedAbbr,
      selectedScore,
      opponentName:opponent.team?.displayName || opponent.team?.name || opponent.team?.abbreviation,
      opponentAbbr:opponent.team?.abbreviation || "",
      opponentScore,
      homeAway:selected.homeAway,
      selectedWinner:selected.winner
    };
  }

  function gradePick(pick) {
    if (pick.error) return { status:"pending", label:"INPUT ERROR", detail:pick.error, margin:null };
    const g = parseEvent(eventForTeam(pick.team.abbr), pick.team.abbr);
    if (!g.found) return { status:"pending", label:"NOT FOUND", detail:g.statusText, margin:null, game:g };

    const margin = (g.selectedScore + pick.spread) - g.opponentScore;

    if (g.state === "pre") {
      return {
        status:"pending",
        label:"PENDING",
        detail: kickoffText(g),
        margin:null,
        game:g
      };
    }

    const status = margin > 0 ? "cover" : margin < 0 ? "lose" : "push";
    const label = g.state === "post"
      ? (status === "cover" ? "WIN" : status === "lose" ? "LOSS" : "PUSH")
      : (status === "cover" ? "COVERING" : status === "lose" ? "LOSING" : "PUSH");

    return {
      status,
      label,
      margin,
      detail:g.statusText,
      game:g
    };
  }

  function kickoffText(g) {
    if (!g?.date || Number.isNaN(g.date.getTime())) return g?.statusText || "Scheduled";
    return g.date.toLocaleString([], { weekday:"short", hour:"numeric", minute:"2-digit" });
  }

  function scoreText(grade) {
    const g = grade.game;
    if (!g?.found) return grade.detail || "—";
    if (g.state === "pre") return kickoffText(g);
    return `${g.selectedAbbr} ${g.selectedScore} – ${g.opponentScore} ${g.opponentAbbr} · ${g.statusText}`;
  }

  function marginText(grade) {
    if (grade.margin == null) return "—";
    const n = grade.margin;
    if (n === 0) return "0 (push)";
    return `${n > 0 ? "+" : ""}${Number.isInteger(n) ? n : n.toFixed(1)}`;
  }

  function renderDashboard() {
    const parsedEntries = state.entries.map(e => ({
      name:e.name,
      picks:(e.picks || []).map(parsePick).filter(Boolean)
    }));

    els.entryCards.innerHTML = "";
    for (const entry of parsedEntries) {
      const grades = entry.picks.map(p => ({ pick:p, grade:gradePick(p) }));
      const counts = { cover:0, lose:0, push:0, pending:0 };
      grades.forEach(x => counts[x.grade.status]++);

      const card = document.createElement("article");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${escapeHtml(entry.name)}</h3>
        <div class="entry-summary">
          <span class="count cover">${counts.cover} ${counts.cover === 1 ? "cover/win" : "covering/wins"}</span>
          <span class="count lose">${counts.lose} ${counts.lose === 1 ? "loss" : "losing/losses"}</span>
          <span class="count push">${counts.push} ${counts.push === 1 ? "push" : "pushes"}</span>
          <span class="count pending">${counts.pending} pending</span>
        </div>
        <ul class="pick-list">
          ${grades.map(({pick,grade}) => `
            <li class="pick-row">
              <div>
                <div class="pick-main">${pick.error ? escapeHtml(pick.raw) : `${escapeHtml(pick.team.full)} ${displaySpread(pick.spread)}`}</div>
                <div class="pick-sub">${escapeHtml(scoreText(grade))}${grade.margin != null ? ` · ATS margin ${escapeHtml(marginText(grade))}` : ""}</div>
              </div>
              <span class="badge ${grade.status}">${escapeHtml(grade.label)}</span>
            </li>`).join("")}
        </ul>
      `;
      els.entryCards.appendChild(card);
    }

    // Deduplicate selected picks by team + spread.
    const uniq = new Map();
    parsedEntries.flatMap(e => e.picks).forEach(p => {
      const key = p.error ? `error:${p.raw}` : `${p.team.abbr}:${p.spread}`;
      if (!uniq.has(key)) uniq.set(key, p);
    });

    els.gamesBody.innerHTML = [...uniq.values()].map(p => {
      const grade = gradePick(p);
      if (p.error) {
        return `<tr><td><strong>${escapeHtml(p.raw)}</strong></td><td>—</td><td>${escapeHtml(p.error)}</td><td><span class="badge pending">INPUT ERROR</span></td><td>—</td></tr>`;
      }
      const g = grade.game;
      const gameText = g?.found ? `${escapeHtml(g.selectedName)} vs ${escapeHtml(g.opponentName)}` : "Not found";
      return `
        <tr>
          <td><strong>${escapeHtml(p.team.full)} ${displaySpread(p.spread)}</strong></td>
          <td>${gameText}</td>
          <td>${escapeHtml(scoreText(grade))}</td>
          <td><span class="badge ${grade.status}">${escapeHtml(grade.label)}</span></td>
          <td>${escapeHtml(marginText(grade))}</td>
        </tr>`;
    }).join("");
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    })[c]);
  }

  els.addEntryBtn.addEventListener("click", () => {
    readEditorsIntoState();
    state.entries.push({ name:`Entry ${state.entries.length + 1}`, picks:[] });
    renderEditors();
  });

  els.entryEditors.addEventListener("click", e => {
    const btn = e.target.closest(".remove-entry");
    if (!btn || btn.disabled) return;
    readEditorsIntoState();
    state.entries.splice(Number(btn.dataset.entry), 1);
    renderEditors();
  });

  els.saveBtn.addEventListener("click", async () => {
    readEditorsIntoState();
    saveState();
    renderDashboard();
    await refreshScores();
  });

  els.refreshBtn.addEventListener("click", refreshScores);

  renderEditors();
  renderDashboard();
  refreshScores();

  clearInterval(timer);
  timer = setInterval(refreshScores, CFG.refreshMs || 30000);
})();
