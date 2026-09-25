/**
 * SAVE 90-Day Transition Clock — (1) did you receive a servicer 90-day notice?
 * yes/no/unsure, (2) notice date if yes, (3) date to count from (defaults to today)
 * → days left / past deadline / waiting for notice share card + auto-enroll
 * Standard/Tiered Standard explainer.
 * Brand: SAVE 90-Day Transition Clock only. Uses only what the user types — no FSA scrape.
 * Not plan advice. Not forgiveness advice. Not a servicer tool.
 * Never invents payment $ or a “best” plan. Your notice controls your deadline.
 *
 * ui_refresh 2026-09-25: phone-first layout + plain-language copy. Date math, phases,
 * percentages, validation rules and share-hash format are unchanged from the
 * previous release (see ui_refresh/checks/equivalence.js).
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
    "ED: starting July 1, servicers send 90-day notices; borrowers who don’t switch plans are automatically enrolled into the Standard Repayment Plan or the new Tiered Standard Plan — your specific deadline is on your notice. Business Insider Sep 10 2026: September 29 is the first deadline for certain borrowers who got notices in early July. Student Loan Planner (ED June 2026 court filing): no borrower has to leave SAVE until September 29 2026 at the earliest. For understanding only — not plan advice.";

  const DISCLAIMER_SHORT =
    "Not plan advice · not forgiveness advice · not a servicer tool · your notice controls your deadline · we never invent a payment amount or a “best” plan";

  /** Examples — labeled sample dates. Not pulled from any servicer. */
  const SEEDS = [
    {
      id: "jul1-first-wave",
      label: "Jul 1 notice → Sep 29 (first wave)",
      sub: "Example · about 16 days left when checked Sep 13",
      noticeStatus: "yes",
      noticeDate: "2026-07-01",
      viewDate: "2026-09-13",
      noteLabel: "Example: Jul 1 notice (first wave)",
    },
    {
      id: "waiting",
      label: "Waiting for notice",
      sub: "Example · no notice yet, so no deadline to show",
      noticeStatus: "no",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Example: waiting for notice",
    },
    {
      id: "past-deadline",
      label: "Past deadline",
      sub: "Example · Jul 1 notice, checked Oct 1",
      noticeStatus: "yes",
      noticeDate: "2026-07-01",
      viewDate: "2026-10-01",
      noteLabel: "Example: past deadline",
    },
    {
      id: "unsure",
      label: "Not sure about a notice",
      sub: "Example · check your servicer or letter; no date guessed",
      noticeStatus: "unsure",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Example: not sure about notice",
    },
    {
      id: "mid-wave",
      label: "Later notice · Aug 15",
      sub: "Example · later wave · deadline Nov 13",
      noticeStatus: "yes",
      noticeDate: "2026-08-15",
      viewDate: "2026-09-13",
      noteLabel: "Example: later notice (Aug 15)",
    },
    {
      id: "empty-miss",
      label: "Missing notice date",
      sub: "Example · notice = yes but no date entered → we ask for it",
      noticeStatus: "yes",
      noticeDate: "",
      viewDate: "2026-09-13",
      noteLabel: "Example: missing notice date",
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
        sub: "No 90-day notice from your servicer yet, so no deadline yet",
        ringLabel: "WAIT",
        daysLabel: "Waiting for notice",
        headline: "Waiting for your servicer’s notice",
        flag: "We can’t give you a deadline until your notice letter or email arrives.",
      };
    }
    if (phase === "unsure") {
      return {
        phase: "unsure",
        pill: "Unsure · check your notice",
        cls: "unsure",
        sub: "Check whether you got a 90-day notice",
        ringLabel: "?",
        daysLabel: "Unsure",
        headline: "Not sure if you got a notice",
        flag: "Check your servicer’s letters and emails. We won’t guess a deadline.",
      };
    }
    if (phase === "countdown") {
      const n = daysLeft;
      return {
        phase: "countdown",
        pill: n === 1 ? "1 day left" : n + " days left",
        cls: n <= 7 ? "danger" : "ok",
        sub: "Deadline = your notice date + 90 days",
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
          " until your deadline (" +
          fmtDate(deadline) +
          "). The date on your notice is what counts — not a public calendar alone.",
      };
    }
    if (phase === "today") {
      return {
        phase: "today",
        pill: "Deadline today",
        cls: "danger",
        sub: "Your 90-day window from your notice ends today",
        ringLabel: "0",
        daysLabel: "Deadline today",
        headline: "Your 90-day deadline is today",
        flag:
          "Your notice date + 90 days lands on " +
          fmtDate(deadline) +
          ". This page doesn’t enroll you or pick a plan.",
      };
    }
    // past
    const elapsed = Math.abs(daysLeft);
    return {
      phase: "past",
      pill: "Past deadline",
      cls: "danger",
      sub: "Your 90-day deadline from your notice has passed",
      ringLabel: "PAST",
      daysLabel: "Past deadline",
      headline: "Your deadline from your notice has passed",
      flag:
        elapsed +
        " calendar day" +
        (elapsed === 1 ? "" : "s") +
        " past " +
        fmtDate(deadline) +
        ". We don’t make up a late option or a payment amount.",
    };
  }

  function autoEnrollStrip() {
    return "If you do nothing, ED says you are automatically enrolled into the Standard Repayment Plan or the new Tiered Standard Plan. That’s ED’s wording — not a plan recommendation from this page.";
  }

  function validate(input) {
    const status = input.noticeStatus || "unsure";
    if (!parseISODate(input.viewDate)) {
      return "Pick a date to count from (the view date — usually today). We won’t guess the days left.";
    }
    if (status === "yes") {
      if (!parseISODate(input.noticeDate)) {
        return "You said you have a 90-day notice — enter the notice date from the letter or email. We won’t guess a deadline.";
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
        ? "You said you haven’t received a 90-day notice from your servicer yet. ED: notices started July 1 and continue in waves through late 2026. The earliest public deadline for any borrower is Sep 29 2026 (ED court filing / Student Loan Planner; Business Insider Sep 10). We won’t guess your deadline before your notice arrives."
        : phase === "unsure"
          ? "You said you’re not sure whether you got a notice. Check your email and servicer account for a 90-day transition notice. Your specific deadline is the one on your notice — we won’t guess it."
          : "Your deadline = your notice date + 90 calendar days (as ED describes it). This page uses only the date you entered. It does not log in to your FSA (Federal Student Aid) account, pick a plan such as IBR, PAYE or RAP, or make up a payment amount.";

    const action =
      "Compare legal repayment options at StudentAid.gov/idr and read studentaid.gov court-actions. If you choose a plan, enroll through your servicer or StudentAid.gov — this page does not enroll you and does not recommend a plan.";

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

  /** Plain sentence about the public first-wave date, relative to the count-from date. */
  function firstWaveSentence(firstWaveLeft) {
    return firstWaveLeft == null
      ? ""
      : firstWaveLeft > 0
        ? " The earliest first-wave deadline, " +
          FIRST_WAVE_LABEL +
          ", is " +
          firstWaveLeft +
          " day" +
          (firstWaveLeft === 1 ? "" : "s") +
          " from the date you picked (a public date — your notice still controls)."
        : firstWaveLeft === 0
          ? " The earliest first-wave deadline is today (" + FIRST_WAVE_LABEL + ")."
          : " The earliest first-wave deadline, " + FIRST_WAVE_LABEL + ", has passed; later notice waves still apply.";
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
    // Value is kept when hidden so switching back to "yes" restores it.
    const wrap = $("noticeDateWrap");
    if (wrap) wrap.hidden = !yes;
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
        renderCard({ writeHash: true });
        $("status").textContent = "Showing example: " + s.label;
        scrollToCard();
      });
      box.appendChild(btn);
    });
  }

  /** Put text into el, turning known source names into their (existing) links. */
  const LINKS = [
    ["studentaid.gov court-actions", STUDENTAID_COURT],
    ["StudentAid.gov/idr", STUDENTAID_IDR],
  ];
  function setLinkedText(el, text) {
    el.textContent = "";
    let rest = String(text);
    while (rest) {
      let hit = null;
      LINKS.forEach(([k, url]) => {
        const i = rest.indexOf(k);
        if (i !== -1 && (!hit || i < hit.i)) hit = { i: i, k: k, url: url };
      });
      if (!hit) {
        el.appendChild(document.createTextNode(rest));
        break;
      }
      if (hit.i) el.appendChild(document.createTextNode(rest.slice(0, hit.i)));
      const a = document.createElement("a");
      a.href = hit.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = hit.k;
      el.appendChild(a);
      rest = rest.slice(hit.i + hit.k.length);
    }
  }

  function noticeStatusText(status) {
    return status === "yes" ? "Yes" : status === "no" ? "No — waiting" : "Unsure";
  }

  function setBig(num, unit, cls, isWord) {
    $("bigNum").textContent = num;
    $("bigNum").className = "big-num" + (isWord ? " is-word" : "");
    $("bigUnit").textContent = unit;
    $("bigLine").className = "big " + (cls || "");
  }

  function scrollToCard() {
    const el = $("cardSection");
    if (!el || !el.getBoundingClientRect) return;
    const r = el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.6) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /**
   * opts.writeHash — update the address bar (only after a user action or when the page
   * was opened from a share link, so a #toggle-goatcounter visit is never overwritten).
   */
  function renderCard(opts) {
    const o = opts || {};
    const input = readInputs();
    const err = validate(input);
    const hash = encodeHash(input);
    $("shareUrl").value = location.href.split("#")[0] + hash;

    if (err) {
      setBig("—", "", "unsure", true);
      $("deadlineLine").textContent = "";
      $("daysBar").hidden = true;
      $("windowLine").textContent = "";
      $("dlHeadline").textContent = err;
      $("cardMeta").textContent = "";
      $("status").textContent = err;
      return false;
    }

    const c = compute(input);
    if (o.announce) {
      $("status").textContent = "Answer ready — share it, copy it, or save it as an image.";
    } else if (o.clearStatus) {
      $("status").textContent = "";
    }

    const metaBits = [];
    if (input.noteLabel) metaBits.push(input.noteLabel);
    $("cardMeta").textContent = metaBits.join(" · ");

    // Big answer
    if (c.phase === "countdown") {
      setBig(String(c.daysLeft), c.daysLeft === 1 ? "day left" : "days left", c.clock.cls, false);
    } else if (c.phase === "today") {
      setBig("Today", "is your deadline", c.clock.cls, true);
    } else if (c.phase === "past") {
      setBig(c.clock.daysLabel, "", c.clock.cls, true);
    } else {
      setBig(c.clock.daysLabel, "", c.clock.cls, true);
    }

    $("deadlineLine").textContent = c.deadline
      ? "Your deadline: " + fmtDate(c.deadline) + " (notice + 90 days)"
      : "No personal deadline until you enter your notice date";

    // Progress bar (days remaining out of 90)
    const bar = $("daysBar");
    const windowEl = $("windowLine");
    if (c.phase === "countdown" || c.phase === "today") {
      bar.hidden = false;
      bar.style.setProperty("--pct", String(c.pct));
      bar.className = "bar " + (c.phase === "today" || c.daysLeft <= 7 ? "danger" : "ok");
      windowEl.textContent =
        c.phase === "today"
          ? "Last calendar day of your 90-day window"
          : c.daysLeft + " of " + c.span + " days remain in your notice window";
    } else {
      bar.hidden = true;
      windowEl.textContent =
        c.phase === "past" ? "" : c.phase === "waiting"
          ? "Waiting — earliest first-wave deadline " + FIRST_WAVE_LABEL
          : "Confirm your notice before relying on any public date";
    }

    // One sentence of meaning
    $("dlHeadline").textContent = c.clock.flag;

    $("autoEnrollStrip").textContent = c.autoEnroll;
    setLinkedText($("actionLine"), c.action);

    $("rNotice").textContent =
      c.noticeStatus === "yes"
        ? "Yes · " + (c.noticeDate ? fmtDate(c.noticeDate) : "—")
        : c.noticeStatus === "no"
          ? "No · waiting"
          : "Unsure";
    $("rDeadline").textContent = c.deadline ? fmtDate(c.deadline) : "—";
    $("rFirstWave").textContent = FIRST_WAVE_LABEL;
    $("rView").textContent = fmtDate(c.viewDate);

    $("decoderLine").textContent = c.decoder + firstWaveSentence(c.firstWaveLeft);
    $("citeLine").textContent = CITE_ONE_LINER + " " + DISCLAIMER_SHORT + ".";

    if (o.writeHash && location.hash !== hash) {
      history.replaceState(null, "", hash);
    }
    return true;
  }

  function clearAll() {
    applyInputs({
      noticeStatus: "unsure",
      noticeDate: "",
      viewDate: todayISO(),
      noteLabel: "",
    });
    if (location.hash.startsWith("#p=")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    renderCard({});
    $("status").textContent = "Cleared.";
  }

  function summaryText() {
    const input = readInputs();
    const err = validate(input);
    if (err) return err;
    const c = compute(input);
    const lines = [
      "SAVE 90-Day Transition Clock",
      "Got a notice: " + noticeStatusText(c.noticeStatus),
      c.noticeDate ? "Notice date: " + fmtDate(c.noticeDate) : null,
      "Counting from: " + fmtDate(c.viewDate),
      c.deadline ? "Deadline (notice + 90 days): " + fmtDate(c.deadline) : null,
      "Status: " + c.clock.pill + " · " + c.clock.sub,
      "Earliest first-wave deadline: " + FIRST_WAVE_LABEL,
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

  /** Clipboard with a fallback for older browsers / non-secure contexts. */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext !== false) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* fall through */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function showLinkBox() {
    const box = $("shareBox");
    if (box) box.open = true;
    const inp = $("shareUrl");
    if (inp) {
      inp.focus();
      inp.select();
    }
  }

  async function copySummary() {
    if (await copyText(summaryText())) {
      $("status").textContent = "Summary copied.";
    } else {
      $("status").textContent = "Couldn’t copy — select the link below instead.";
      showLinkBox();
    }
  }

  async function shareLink() {
    if (!renderCard({ writeHash: true })) return;
    const url = $("shareUrl").value;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SAVE 90-Day Transition Clock",
          text: "Enter your SAVE 90-day notice date — how many days are left before automatic enrollment?",
          url: url,
        });
        $("status").textContent = "Share sheet opened.";
        return;
      }
    } catch (e) {
      if (e && e.name === "AbortError") {
        $("status").textContent = "Share cancelled.";
        return;
      }
    }
    if (await copyText(url)) {
      $("status").textContent = "Link copied — paste it anywhere.";
    } else {
      $("status").textContent = "Sharing isn’t available here — copy the link below.";
      showLinkBox();
    }
  }

  async function copyShare() {
    renderCard({ writeHash: true });
    if (await copyText($("shareUrl").value)) {
      $("status").textContent = "Link copied.";
    } else {
      $("status").textContent = "Couldn’t copy — select the link below.";
      showLinkBox();
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

  const SANS = "system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

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

    // Light, calm image that reads well in a chat thread.
    ctx.fillStyle = "#f6f6f3";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, 36, 36, W - 72, H - 72, 24);
    ctx.fill();
    ctx.strokeStyle = "#d5dae0";
    ctx.lineWidth = 2;
    ctx.stroke();

    let y = 90;
    ctx.fillStyle = "#4a5360";
    ctx.font = "600 22px " + SANS;
    ctx.fillText("SAVE 90-Day Transition Clock", 72, y);
    y += 30;
    if (input.noteLabel) {
      ctx.font = "400 20px " + SANS;
      ctx.fillText(input.noteLabel, 72, y);
    }
    y += 140;

    const color =
      c.clock.cls === "danger" ? "#b0261d" : c.clock.cls === "ok" ? "#1b7340" : c.clock.cls === "warn" ? "#85560a" : "#16191d";
    ctx.fillStyle = color;
    if (c.phase === "countdown") {
      ctx.font = "800 140px " + SANS;
      const num = String(c.daysLeft);
      ctx.fillText(num, 68, y);
      const w = ctx.measureText(num).width;
      ctx.fillStyle = "#16191d";
      ctx.font = "700 40px " + SANS;
      ctx.fillText(c.daysLeft === 1 ? "day left" : "days left", 68 + w + 20, y);
    } else {
      ctx.font = "800 72px " + SANS;
      y = wrapText(ctx, c.clock.daysLabel, 68, y - 40, W - 144, 80) - 40;
    }
    y += 60;

    ctx.fillStyle = "#16191d";
    ctx.font = "700 30px " + SANS;
    y = wrapText(
      ctx,
      c.deadline
        ? "Your deadline: " + fmtDate(c.deadline) + " (notice + 90 days)"
        : "No personal deadline until you enter your notice date",
      72, y, W - 144, 38
    );
    y += 14;

    ctx.fillStyle = "#16191d";
    ctx.font = "400 24px " + SANS;
    y = wrapText(ctx, c.clock.flag, 72, y, W - 144, 32);
    y += 18;

    ctx.fillStyle = "#fff5dc";
    roundRect(ctx, 64, y, W - 128, 150, 16);
    ctx.fill();
    ctx.strokeStyle = "#e2bd5b";
    ctx.stroke();
    ctx.fillStyle = "#16191d";
    ctx.font = "400 22px " + SANS;
    wrapText(ctx, c.autoEnroll, 88, y + 40, W - 176, 30);
    y += 180;

    ctx.fillStyle = "#16191d";
    ctx.font = "700 22px " + SANS;
    ctx.fillText("What to do next", 72, y);
    y += 32;
    ctx.font = "400 21px " + SANS;
    y = wrapText(ctx, c.action, 72, y, W - 144, 29);
    y += 16;

    ctx.fillStyle = "#4a5360";
    ctx.font = "400 19px " + SANS;
    const meta =
      "Counting from " +
      fmtDate(c.viewDate) +
      (c.noticeDate ? " · Notice " + fmtDate(c.noticeDate) : "") +
      " · Earliest first-wave deadline " +
      FIRST_WAVE_LABEL;
    y = wrapText(ctx, meta, 72, y, W - 144, 26);

    ctx.fillStyle = "#4a5360";
    ctx.font = "400 17px " + SANS;
    wrapText(ctx, DISCLAIMER_SHORT, 72, H - 110, W - 144, 24);
    ctx.fillText(
      "Uses only the date you entered · no FSA login · StudentAid.gov/idr · court-actions",
      72,
      H - 60
    );

    canvas.toBlob(function (blob) {
      if (!blob) {
        $("status").textContent = "Couldn’t create the image.";
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
      $("status").textContent = "Image saved.";
    });
  }

  function bind() {
    if (!$("viewDate").value) $("viewDate").value = todayISO();
    syncNoticeDateField();
    renderChips();

    const live = () => renderCard({ writeHash: true, clearStatus: true });
    $("noticeStatus").addEventListener("change", () => {
      syncNoticeDateField();
      live();
    });
    ["noticeDate", "viewDate"].forEach((id) => $(id).addEventListener("change", live));
    $("noteLabel").addEventListener("input", live);
    $("cardBtn").addEventListener("click", () => {
      renderCard({ writeHash: true, announce: true });
      scrollToCard();
    });
    $("clearBtn").addEventListener("click", clearAll);
    $("copySummary").addEventListener("click", copySummary);
    $("shareBtn").addEventListener("click", shareLink);
    $("copyShare").addEventListener("click", copyShare);
    $("pngBtn").addEventListener("click", exportPng);

    window.addEventListener("hashchange", () => {
      const p = decodeHash();
      if (p) {
        applyInputs(p);
        renderCard({ writeHash: true });
      }
    });

    const fromHash = decodeHash();
    if (fromHash) {
      applyInputs(fromHash);
      renderCard({ writeHash: true });
    } else {
      // Show an answer straight away with the default inputs (today’s date).
      renderCard({});
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
      firstWaveSentence: firstWaveSentence,
      DISCLAIMER_SHORT: DISCLAIMER_SHORT,
      CITE_ONE_LINER: CITE_ONE_LINER,
      ED_PRESS: ED_PRESS,
      BI_SEP10: BI_SEP10,
      SLP_TIMELINE: SLP_TIMELINE,
      STUDENTAID_IDR: STUDENTAID_IDR,
      STUDENTAID_COURT: STUDENTAID_COURT,
    };
  }
})();
