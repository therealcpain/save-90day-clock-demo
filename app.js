/**
 * SAVE 90-Day Transition Clock — paste (1) received servicer 90-day notice?
 * yes/no/unsure, (2) notice date if yes, (3) view date → days left / past deadline /
 * waiting for notice share card + auto-enroll Standard/Tiered Standard literacy.
 * Brand: SAVE 90-Day Transition Clock only. User paste only — no FSA scrape.
 * Not plan advice. Not forgiveness advice. Not a servicer tool.
 * Never invents payment $ or a “best” plan. Your notice controls your deadline.
 */
(function () {
  "use strict";

  const ED_PRESS =
    "https://www.ed.gov/about/news/press-release/us-department-of-education-announces-next-steps-borrowers-enrolled-unlawful-save-plan";
  const BI_SEP10 =
    "https://www.businessinsider.com/student-loan-borrowers-forced-most-expensive-repayment-plan-save-transition-2026-9";
  const SLP_TIMELINE =
    "https://www.studentloanplanner.com/save-plan-transition-timeline/";
  const STUDENTAID_IDR = "https://studentaid.gov/idr";
  const STUDENTAID_COURT =
    "https://studentaid.gov/announcements-events/court-actions";

  const NOTICE_WINDOW_DAYS = 90;
  const FIRST_WAVE_ISO = "2026-09-29";
  const FIRST_WAVE_LABEL = "Sep 29 2026";

  const CITE_ONE_LINER =
    "ED: starting July 1, servicers issue 90-day notices; borrowers who do not transition are automatically enrolled into the Standard Repayment Plan or the new Tiered Standard Plan — your specific deadline is on your notice. Business Insider Sep 10 2026: September 29 is the first deadline for certain early-July notice borrowers. Student Loan Planner (ED June 2026 court filing): no borrower required off SAVE until September 29 2026 at the earliest. Literacy only — not plan advice.";

  const DISCLAIMER_SHORT =
    "Not plan advice · not forgiveness advice · not a servicer tool · your notice controls your deadline · never invent payment $ or “best” plan";

  /** Teaching seeds — labeled. Not live servicer scrapes. */
  const SEEDS = [
    {
      id: "jul1-first-wave",
      label: "Jul 1 notice → Sep 29 first-wave",
      sub: "Teaching · ~16 days from Sep 13 view",
      noticeStatus: "yes",
      noticeDate: "2026-07-01",
      viewDate: "2026-09-13",
      noteLabel: "Jul 1 notice · first-wave teaching seed",
    },
    {
      id: "waiting",
      label: "Waiting for notice",
      sub: "Teaching · no notice yet · no invented deadline",
      noticeStatus: "no",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Waiting-for-notice teaching seed",
    },
    {
      id: "past-deadline",
      label: "Past deadline",
      sub: "Teaching · Jul 1 notice · view Oct 1",
      noticeStatus: "yes",
      noticeDate: "2026-07-01",
      viewDate: "2026-10-01",
      noteLabel: "Past-deadline teaching seed",
    },
    {
      id: "unsure",
      label: "Unsure notice",
      sub: "Teaching · check servicer / letter · no invented date",
      noticeStatus: "unsure",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Unsure-notice teaching seed",
    },
    {
      id: "mid-wave",
      label: "Mid-wave · Aug 15 notice",
      sub: "Teaching · later tranche · deadline Nov 13",
      noticeStatus: "yes",
      noticeDate: "2026-08-15",
      viewDate: "2026-09-13",
      noteLabel: "Mid-wave later-notice teaching seed",
    },
    {
      id: "empty-miss",
      label: "Empty / missing dates",
      sub: "Teaching · notice yes · blank date → honest miss",
      noticeStatus: "yes",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Honest-miss teaching seed",
    },
  ];

  const $ = (id) => document.getElementById(id);

  function parseISODate(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const parts = s.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (
      d.getFullYear() !== parts[0] ||
      d.getMonth() !== parts[1] - 1 ||
      d.getDate() !== parts[2]
    ) {
      return null;
    }
    return d;
  }

  function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isoFromDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function todayISO() {
    return isoFromDate(new Date());
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  /** Whole calendar days from a → b (local). Positive if b is after a. */
  function daysBetween(a, b) {
    const ua = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const ub = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((ub - ua) / 86400000);
  }

  function firstWaveDaysLeft(viewDate) {
    const cliff = parseISODate(FIRST_WAVE_ISO);
    if (!viewDate || !cliff) return null;
    return daysBetween(viewDate, cliff);
  }

  /**
   * daysLeft > 0 → countdown
   * daysLeft === 0 → deadline today
   * daysLeft < 0 → past deadline
   */
  function clockMeta(phase, daysLeft, deadline) {
    if (phase === "waiting") {
      return {
        phase: "waiting",
        pill: "Waiting for notice",
        cls: "warn",
        sub: "No servicer 90-day notice yet · no invented deadline",
        ringLabel: "WAIT",
        daysLabel: "Waiting for notice",
        headline: "Waiting for your servicer notice",
        flag: "WAITING FOR NOTICE · we will not invent a deadline before your letter/email arrives",
      };
    }
    if (phase === "unsure") {
      return {
        phase: "unsure",
        pill: "Unsure · check notice",
        cls: "unsure",
        sub: "Confirm whether you received a 90-day notice",
        ringLabel: "?",
        daysLabel: "Unsure",
        headline: "Notice status unsure",
        flag: "NOTICE UNSURE · check your servicer letter/email · we will not invent a deadline",
      };
    }
    if (phase === "countdown") {
      const n = daysLeft;
      return {
        phase: "countdown",
        pill: n === 1 ? "1 day left" : n + " days left",
        cls: n <= 7 ? "danger" : "ok",
        sub: "Deadline from your notice date + 90 days",
        ringLabel: String(n),
        daysLabel: n === 1 ? "1 day left" : n + " days left",
        headline:
          n === 1
            ? "1 day left on your 90-day clock"
            : n + " days left on your 90-day clock",
        flag:
          n +
          " calendar day" +
          (n === 1 ? "" : "s") +
          " remain until your notice-based deadline (" +
          fmtDate(deadline) +
          "). Your notice controls — not a public calendar alone.",
      };
    }
    if (phase === "today") {
      return {
        phase: "today",
        pill: "Deadline today",
        cls: "danger",
        sub: "Your notice-based 90-day window ends today",
        ringLabel: "0",
        daysLabel: "Deadline today",
        headline: "Your 90-day deadline is today",
        flag:
          "DEADLINE TODAY · notice date + 90 days lands on " +
          fmtDate(deadline) +
          " · this card does not enroll you or pick a plan",
      };
    }
    // past
    const elapsed = Math.abs(daysLeft);
    return {
      phase: "past",
      pill: "Past deadline",
      cls: "danger",
      sub: "Past your notice-based 90-day deadline",
      ringLabel: "PAST",
      daysLabel: "Past deadline",
      headline: "Past your notice-based deadline",
      flag:
        "PAST DEADLINE · " +
        elapsed +
        " calendar day" +
        (elapsed === 1 ? "" : "s") +
        " past " +
        fmtDate(deadline) +
        " · we do not invent a late path or a payment $",
    };
  }

  function autoEnrollStrip() {
    return "If you do nothing → ED says you are automatically enrolled into the Standard Repayment Plan or the new Tiered Standard Plan. That is ED language — not a plan recommendation from this card.";
  }

  function validate(input) {
    const status = input.noticeStatus || "unsure";
    if (!parseISODate(input.viewDate)) {
      return "Pick a view date (the day you’re looking) — the clock needs it. We will not invent days left.";
    }
    if (status === "yes") {
      if (!parseISODate(input.noticeDate)) {
        return "You marked that you received a 90-day notice — paste the notice date from the letter/email. We will not invent a deadline.";
      }
    }
    return null;
  }

  function compute(input) {
    const status = input.noticeStatus || "unsure";
    const viewDate = parseISODate(input.viewDate);
    const noticeDate = parseISODate(input.noticeDate);
    const firstWaveLeft = firstWaveDaysLeft(viewDate);

    let phase = "unsure";
    let deadline = null;
    let daysLeft = null;

    if (status === "no") {
      phase = "waiting";
    } else if (status === "unsure") {
      phase = "unsure";
    } else if (status === "yes" && noticeDate && viewDate) {
      deadline = addDays(noticeDate, NOTICE_WINDOW_DAYS);
      daysLeft = daysBetween(viewDate, deadline);
      if (daysLeft > 0) phase = "countdown";
      else if (daysLeft === 0) phase = "today";
      else phase = "past";
    }

    const clock = clockMeta(phase, daysLeft, deadline);
    const span = NOTICE_WINDOW_DAYS;
    let pct = 0;
    if (phase === "countdown") {
      pct = Math.max(2, Math.min(100, Math.round((daysLeft / span) * 100)));
    } else if (phase === "today") {
      pct = Math.max(2, Math.round((1 / span) * 100));
    } else if (phase === "past") {
      pct = 0;
    } else {
      pct = 0;
    }

    const decoder =
      phase === "waiting"
        ? "You marked that you have not received a servicer 90-day notice yet. ED: notices started July 1 and continue in waves through late 2026. The earliest public cliff for any borrower is Sep 29 2026 (ED court filing / Student Loan Planner; BI Sep 10). We will not invent your deadline before your notice arrives."
        : phase === "unsure"
          ? "You marked notice status unsure. Check your email / servicer account for a 90-day transition notice. Your specific deadline is the one on your notice — we will not invent it."
          : "Deadline = your notice date + 90 calendar days (ED framing). This card uses only the date you pasted. It does not log into FSA, pick IBR/PAYE/RAP, or invent a payment $.";

    const action =
      "Calm next step: compare legal repayment options at StudentAid.gov/idr and read studentaid.gov court-actions. Enroll (if you choose) via your servicer / StudentAid.gov — this card does not enroll you and does not recommend a plan.";

    return {
      noticeStatus: status,
      noticeDate: noticeDate,
      viewDate: viewDate,
      deadline: deadline,
      daysLeft: daysLeft,
      phase: phase,
      clock: clock,
      pct: pct,
      span: span,
      firstWaveLeft: firstWaveLeft,
      autoEnroll: autoEnrollStrip(),
      decoder: decoder,
      action: action,
      noteLabel: input.noteLabel || "",
    };
  }

  function encodeHash(input) {
    const parts = [
      input.noticeStatus || "unsure",
      input.noticeDate || "",
      input.viewDate || "",
      input.noteLabel || "",
    ];
    const raw = parts.join("|");
    try {
      return "#p=" + btoa(unescape(encodeURIComponent(raw)));
    } catch (e) {
      return "#p=" + encodeURIComponent(raw);
    }
  }

  function decodeHash() {
    const raw = location.hash || "";
    if (!raw.startsWith("#p=")) return null;
    try {
      let decoded;
      try {
        decoded = decodeURIComponent(escape(atob(raw.slice(3))));
      } catch (e) {
        decoded = decodeURIComponent(raw.slice(3));
      }
      const parts = decoded.split("|");
      if (parts.length < 1) return null;
      return {
        noticeStatus: parts[0] || "unsure",
        noticeDate: parts[1] || "",
        viewDate: parts[2] || "",
        noteLabel: parts[3] || "",
      };
    } catch (e) {
      return null;
    }
  }

  function readInputs() {
    return {
      noticeStatus: $("noticeStatus").value || "unsure",
      noticeDate: ($("noticeDate").value || "").trim(),
      viewDate: ($("viewDate").value || "").trim(),
      noteLabel: ($("noteLabel").value || "").trim(),
    };
  }

  function applyInputs(p) {
    $("noticeStatus").value = p.noticeStatus || "unsure";
    $("noticeDate").value = p.noticeDate || "";
    $("viewDate").value = p.viewDate || "";
    $("noteLabel").value = p.noteLabel || "";
    syncNoticeDateField();
  }

  function syncNoticeDateField() {
    const yes = $("noticeStatus").value === "yes";
    $("noticeDate").disabled = !yes;
    if (!yes) {
      // keep value for seed restore when toggling back; UI shows disabled
    }
    const wrap = $("noticeDateWrap");
    if (wrap) wrap.classList.toggle("dimmed", !yes);
  }

  function renderChips() {
    const box = $("seedChips");
    box.innerHTML = "";
    SEEDS.forEach((s) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "seed-chip";
      btn.setAttribute("role", "listitem");
      btn.innerHTML =
        s.label + '<span class="chip-sub">' + s.sub + "</span>";
      btn.addEventListener("click", () => {
        applyInputs(s);
        $("status").textContent = "Loaded seed: " + s.label;
        renderCard();
      });
      box.appendChild(btn);
    });
  }

  function renderSources() {
    $("sourceLinks").innerHTML =
      'Cites: <a href="' +
      ED_PRESS +
      '" target="_blank" rel="noopener noreferrer">ED next-steps press release</a>' +
      '<a href="' +
      BI_SEP10 +
      '" target="_blank" rel="noopener noreferrer">Business Insider Sep 10 2026</a>' +
      '<a href="' +
      SLP_TIMELINE +
      '" target="_blank" rel="noopener noreferrer">Student Loan Planner SAVE timeline</a>' +
      '<a href="' +
      STUDENTAID_IDR +
      '" target="_blank" rel="noopener noreferrer">StudentAid.gov/idr</a>' +
      '<a href="' +
      STUDENTAID_COURT +
      '" target="_blank" rel="noopener noreferrer">studentaid.gov court-actions</a>';
  }

  function renderCard() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      $("cardSection").hidden = true;
      $("status").textContent = err;
      return;
    }

    const c = compute(input);
    $("cardSection").hidden = false;
    $("shareBox").hidden = false;
    $("status").textContent = "Card ready — copy, share, or export PNG.";

    const metaBits = [];
    if (c.noticeStatus === "yes" && c.noticeDate) {
      metaBits.push("Notice: " + fmtDate(c.noticeDate));
    } else if (c.noticeStatus === "no") {
      metaBits.push("No notice yet");
    } else {
      metaBits.push("Notice: unsure");
    }
    if (input.noteLabel) metaBits.push(input.noteLabel);
    $("cardMeta").textContent = metaBits.join(" · ");

    $("dlHeadline").textContent = c.clock.headline;
    $("statusPill").textContent = c.clock.pill;
    $("statusPill").className = "verdict-k " + c.clock.cls;
    $("statusSub").textContent = c.clock.sub;

    $("viewDateDisp").textContent = fmtDate(c.viewDate);
    $("daysDisp").textContent = c.clock.daysLabel;
    $("deadlineLine").textContent = c.deadline
      ? "Your deadline: " + fmtDate(c.deadline) + " (notice + 90 days)"
      : "No personal deadline until your notice date is pasted";

    $("daysRingDisp").textContent = c.clock.ringLabel;
    $("daysRing").style.setProperty("--pct", String(c.pct));
    if (c.phase === "past" || c.phase === "today") {
      $("daysRing").className = "fee-ring danger";
    } else if (c.phase === "countdown" && c.daysLeft <= 7) {
      $("daysRing").className = "fee-ring danger";
    } else if (c.phase === "countdown") {
      $("daysRing").className = "fee-ring ok";
    } else if (c.phase === "waiting") {
      $("daysRing").className = "fee-ring";
    } else {
      $("daysRing").className = "fee-ring empty";
    }

    const windowEl = $("windowLine");
    if (c.phase === "past") {
      windowEl.className = "hero-sub danger";
      windowEl.textContent = "Past your notice-based deadline";
    } else if (c.phase === "today") {
      windowEl.className = "hero-sub danger";
      windowEl.textContent = "Last calendar day of your 90-day window";
    } else if (c.phase === "countdown") {
      windowEl.className = "hero-sub warn";
      windowEl.textContent =
        c.daysLeft + " of " + c.span + " days remain in your notice window";
    } else if (c.phase === "waiting") {
      windowEl.className = "hero-sub warn";
      windowEl.textContent = "Waiting — first-wave earliest cliff " + FIRST_WAVE_LABEL;
    } else {
      windowEl.className = "hero-sub";
      windowEl.textContent = "Confirm your notice before trusting any public cliff";
    }

    const flag = $("actionFlag");
    flag.textContent = c.clock.flag;
    flag.className = "look-enroll-flag " + c.clock.cls;

    $("autoEnrollStrip").textContent = c.autoEnroll;

    $("rNotice").textContent =
      c.noticeStatus === "yes"
        ? "Yes · " + (c.noticeDate ? fmtDate(c.noticeDate) : "—")
        : c.noticeStatus === "no"
          ? "No · waiting"
          : "Unsure";
    $("rDeadline").textContent = c.deadline ? fmtDate(c.deadline) : "—";
    $("rFirstWave").textContent = FIRST_WAVE_LABEL;
    $("rView").textContent = fmtDate(c.viewDate);

    const fw =
      c.firstWaveLeft == null
        ? ""
        : c.firstWaveLeft > 0
          ? " First-wave earliest cliff " +
            FIRST_WAVE_LABEL +
            " is " +
            c.firstWaveLeft +
            " day" +
            (c.firstWaveLeft === 1 ? "" : "s") +
            " from your view date (public callout — your notice still controls)."
          : c.firstWaveLeft === 0
            ? " First-wave earliest cliff is today (" + FIRST_WAVE_LABEL + ")."
            : " First-wave earliest cliff " + FIRST_WAVE_LABEL + " has passed; later notice waves still apply.";

    $("decoderLine").textContent = c.decoder + fw;
    $("actionLine").textContent = c.action;
    $("citeLine").textContent = CITE_ONE_LINER + " " + DISCLAIMER_SHORT + ".";

    const hash = encodeHash(input);
    if (location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    $("shareUrl").value = location.href.split("#")[0] + hash;
  }

  function clearAll() {
    applyInputs({
      noticeStatus: "unsure",
      noticeDate: "",
      viewDate: todayISO(),
      noteLabel: "",
    });
    $("cardSection").hidden = true;
    $("shareBox").hidden = true;
    $("status").textContent = "Cleared.";
    history.replaceState(null, "", location.pathname + location.search);
  }

  function summaryText() {
    const input = readInputs();
    const err = validate(input);
    if (err) return err;
    const c = compute(input);
    const lines = [
      "SAVE 90-Day Transition Clock",
      "Notice status: " + c.noticeStatus,
      c.noticeDate ? "Notice date: " + fmtDate(c.noticeDate) : null,
      "View date: " + fmtDate(c.viewDate),
      c.deadline ? "Deadline (notice + 90): " + fmtDate(c.deadline) : null,
      "Status: " + c.clock.pill + " · " + c.clock.sub,
      "First-wave earliest cliff: " + FIRST_WAVE_LABEL,
      "",
      c.autoEnroll,
      c.decoder,
      c.action,
      "",
      CITE_ONE_LINER,
      DISCLAIMER_SHORT,
    ];
    return lines.filter((x) => x != null).join("\n");
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText());
      $("status").textContent = "Summary copied.";
    } catch (e) {
      $("status").textContent = "Copy failed — select share URL instead.";
    }
  }

  async function shareLink() {
    renderCard();
    const url = $("shareUrl").value;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SAVE 90-Day Transition Clock",
          text: "Paste your SAVE 90-day notice date — days left before auto-enroll?",
          url: url,
        });
        $("status").textContent = "Share sheet opened.";
      } else {
        await navigator.clipboard.writeText(url);
        $("status").textContent = "Share link copied.";
      }
    } catch (e) {
      $("status").textContent = "Share cancelled or unavailable.";
    }
  }

  async function copyShare() {
    try {
      await navigator.clipboard.writeText($("shareUrl").value);
      $("status").textContent = "Share URL copied.";
    } catch (e) {
      $("status").textContent = "Copy failed.";
    }
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = String(text || "").split(/\s+/);
    let line = "";
    let yy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy);
        line = words[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, yy);
      yy += lineHeight;
    }
    return yy;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function exportPng() {
    const input = readInputs();
    const err = validate(input);
    if (err) {
      $("status").textContent = err;
      return;
    }
    const c = compute(input);
    const canvas = $("pngCanvas");
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "rgba(240,180,41,0.14)");
    g.addColorStop(0.55, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(62,207,142,0.08)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#121820";
    roundRect(ctx, 36, 36, W - 72, H - 72, 18);
    ctx.fill();
    ctx.strokeStyle = "#2e3a48";
    ctx.lineWidth = 2;
    ctx.stroke();

    let y = 78;
    ctx.fillStyle = "#8b9aab";
    ctx.font = "600 18px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("SAVE 90-Day Transition Clock", 64, y);
    y += 36;

    ctx.fillStyle = "#e8eef5";
    ctx.font = "700 34px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.clock.headline, 64, y, W - 128, 40);
    y += 18;

    // Giant days-left / status badge (text-primary)
    ctx.fillStyle = "#1a2330";
    roundRect(ctx, 64, y, W - 128, 120, 14);
    ctx.fill();
    ctx.fillStyle =
      c.clock.cls === "danger"
        ? "#ff6b6b"
        : c.clock.cls === "ok"
          ? "#3ecf8e"
          : "#f0b429";
    ctx.font = "700 56px IBM Plex Mono, monospace";
    ctx.fillText(c.clock.daysLabel, 88, y + 72);
    ctx.fillStyle = "#8b9aab";
    ctx.font = "500 18px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText(c.clock.sub, 88, y + 102);
    y += 140;

    ctx.fillStyle = "#e8eef5";
    ctx.font = "600 20px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("Status: " + c.clock.pill, 64, y);
    y += 32;

    ctx.fillStyle = "#b8c4d0";
    ctx.font = "400 18px IBM Plex Sans, system-ui, sans-serif";
    const meta =
      "View " +
      fmtDate(c.viewDate) +
      (c.noticeDate ? " · Notice " + fmtDate(c.noticeDate) : "") +
      (c.deadline ? " · Deadline " + fmtDate(c.deadline) : "") +
      " · First-wave cliff " +
      FIRST_WAVE_LABEL;
    y = wrapText(ctx, meta, 64, y, W - 128, 26);
    y += 18;

    ctx.fillStyle = "#1a2330";
    roundRect(ctx, 64, y, W - 128, 110, 12);
    ctx.fill();
    ctx.fillStyle = "#f0b429";
    ctx.font = "600 16px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText("Auto-enroll literacy (ED language)", 88, y + 28);
    ctx.fillStyle = "#e8eef5";
    ctx.font = "400 16px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.autoEnroll, 88, y + 52, W - 176, 22);
    y += 36;

    ctx.fillStyle = "#b8c4d0";
    ctx.font = "400 16px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, c.clock.flag, 64, y, W - 128, 22);
    y += 12;
    y = wrapText(ctx, c.action, 64, y, W - 128, 22);
    y += 20;

    ctx.fillStyle = "#8b9aab";
    ctx.font = "400 14px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, CITE_ONE_LINER, 64, y, W - 128, 20);
    y += 24;

    ctx.fillStyle = "#ff6b6b";
    ctx.font = "600 15px IBM Plex Sans, system-ui, sans-serif";
    y = wrapText(ctx, DISCLAIMER_SHORT, 64, y, W - 128, 20);

    ctx.fillStyle = "#5a6a7a";
    ctx.font = "400 13px IBM Plex Sans, system-ui, sans-serif";
    ctx.fillText(
      "User-pasted notice · no FSA login · StudentAid.gov/idr · court-actions",
      64,
      H - 56
    );

    canvas.toBlob(function (blob) {
      if (!blob) {
        $("status").textContent = "PNG export failed.";
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        "save-90day-clock-" +
        (input.noticeStatus || "unsure") +
        "-" +
        (input.viewDate || "view") +
        ".png";
      a.click();
      URL.revokeObjectURL(a.href);
      $("status").textContent = "PNG downloaded.";
    });
  }

  function bind() {
    if (!$("viewDate").value) $("viewDate").value = todayISO();
    syncNoticeDateField();
    renderChips();
    renderSources();

    $("noticeStatus").addEventListener("change", syncNoticeDateField);
    $("cardBtn").addEventListener("click", renderCard);
    $("clearBtn").addEventListener("click", clearAll);
    $("copySummary").addEventListener("click", copySummary);
    $("shareBtn").addEventListener("click", shareLink);
    $("copyShare").addEventListener("click", copyShare);
    $("pngBtn").addEventListener("click", exportPng);

    window.addEventListener("hashchange", () => {
      const p = decodeHash();
      if (p) {
        applyInputs(p);
        renderCard();
      }
    });

    const fromHash = decodeHash();
    if (fromHash) {
      applyInputs(fromHash);
      renderCard();
    }
  }

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bind);
    } else {
      bind();
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      SEEDS: SEEDS,
      NOTICE_WINDOW_DAYS: NOTICE_WINDOW_DAYS,
      FIRST_WAVE_ISO: FIRST_WAVE_ISO,
      FIRST_WAVE_LABEL: FIRST_WAVE_LABEL,
      parseISODate: parseISODate,
      addDays: addDays,
      daysBetween: daysBetween,
      firstWaveDaysLeft: firstWaveDaysLeft,
      clockMeta: clockMeta,
      autoEnrollStrip: autoEnrollStrip,
      validate: validate,
      compute: compute,
      fmtDate: fmtDate,
      DISCLAIMER_SHORT: DISCLAIMER_SHORT,
      CITE_ONE_LINER: CITE_ONE_LINER,
    };
  }
})();
