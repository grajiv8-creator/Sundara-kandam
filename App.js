import { useState, useEffect, useRef } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const PADALAMS = [
  { id: 1, name: "கடல் தாவு படலம்", nameEn: "Crossing the Ocean", totalVerses: 52 },
  { id: 2, name: "இலங்கை காண் படலம்", nameEn: "Seeing Lanka", totalVerses: 44 },
  { id: 3, name: "சீதை தேடு படலம்", nameEn: "Searching for Sita", totalVerses: 68 },
  { id: 4, name: "தூது படலம்", nameEn: "The Embassy", totalVerses: 71 },
  { id: 5, name: "நகர் எரி படலம்", nameEn: "Burning of Lanka", totalVerses: 39 },
];

const TOTAL_VERSES = PADALAMS.reduce((s, p) => s + p.totalVerses, 0);

const FAMILY_COLORS = ["#c2440c", "#7c5c1e", "#1a6b4a", "#2a4f8c", "#7b3080"];

// ─── Storage helpers ─────────────────────────────────────────────────────────

function loadStorage(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function fetchPasuram(padalamId, verseNum, padalamName, padalamNameEn, signal) {
  const prompt = `You are a scholar of Tamil classical literature, specifically Kamba Ramayanam.

Return ONLY a valid JSON object (no markdown, no explanation, no code fences) with this exact structure:
{
  "tamilText": "<the Tamil verse text in Tamil script>",
  "meaning": "<clear English meaning/translation of this verse>",
  "context": "<one sentence about what happens in the narrative at this point>"
}

Generate verse number ${verseNum} from Padalam ${padalamId} ("${padalamName}" / "${padalamNameEn}") of Kamba Ramayanam's Sundara Kandam.

The Tamil text should be authentic Kamba Ramayanam style (classical Tamil, akaval/viruttam metre). The meaning should be clear and beautiful in English. Keep context to one sentence.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  const raw = data.content?.[0]?.text || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function globalVerseIndex(padalamId, verseNum) {
  let idx = 0;
  for (const p of PADALAMS) {
    if (p.id === padalamId) return idx + verseNum - 1;
    idx += p.totalVerses;
  }
  return 0;
}

function verseFromGlobal(globalIdx) {
  let idx = 0;
  for (const p of PADALAMS) {
    if (globalIdx < idx + p.totalVerses) return { padalamId: p.id, verseNum: globalIdx - idx + 1 };
    idx += p.totalVerses;
  }
  return { padalamId: 5, verseNum: PADALAMS[4].totalVerses };
}

// ─── Components ──────────────────────────────────────────────────────────────

function Flame() {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style={{ display: "inline-block" }}>
      <ellipse cx="14" cy="32" rx="7" ry="4" fill="#f97316" opacity="0.3" />
      <path d="M14 2 C14 2 22 10 20 18 C18 24 22 26 20 30 C18 34 10 34 8 30 C6 26 10 24 8 18 C6 10 14 2 14 2Z" fill="url(#flameGrad)" />
      <path d="M14 12 C14 12 18 17 17 21 C16 25 18 27 17 29 C16 31 12 31 11 29 C10 27 12 25 11 21 C10 17 14 12 14 12Z" fill="#fef3c7" opacity="0.7" />
      <defs>
        <linearGradient id="flameGrad" x1="14" y1="2" x2="14" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbbf24" />
          <stop offset="0.5" stopColor="#f97316" />
          <stop offset="1" stopColor="#c2440c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function OmSymbol() {
  return <span style={{ fontSize: 22, color: "#c2440c", opacity: 0.7, fontFamily: "serif" }}>ॐ</span>;
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  // Members
  const [members, setMembers] = useState(() => loadStorage("sk_members", []));
  const [activeMember, setActiveMember] = useState(() => loadStorage("sk_activeMember", null));
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  // Progress: { memberId: { "padalamId-verseNum": true } }
  const [progress, setProgress] = useState(() => loadStorage("sk_progress", {}));

  // Reading state
  const [curPadalam, setCurPadalam] = useState(1);
  const [curVerse, setCurVerse] = useState(1);
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("read"); // read | progress | family

  const abortRef = useRef(null);

  // Persist
  useEffect(() => saveStorage("sk_members", members), [members]);
  useEffect(() => saveStorage("sk_activeMember", activeMember), [activeMember]);
  useEffect(() => saveStorage("sk_progress", progress), [progress]);

  // Load verse when padalam/verse changes
  useEffect(() => {
    if (!activeMember) return;
    setVerseData(null);
    setError(null);
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const p = PADALAMS.find(x => x.id === curPadalam);
    fetchPasuram(curPadalam, curVerse, p.name, p.nameEn, ctrl.signal)
      .then(d => { setVerseData(d); setLoading(false); })
      .catch(e => { if (e.name !== "AbortError") { setError("Could not load verse. Please try again."); setLoading(false); } });
    return () => ctrl.abort();
  }, [curPadalam, curVerse, activeMember]);

  // Derived
  const member = members.find(m => m.id === activeMember);
  const memberProgress = progress[activeMember] || {};
  const isRead = memberProgress[`${curPadalam}-${curVerse}`];
  const totalRead = Object.keys(memberProgress).length;
  const pct = Math.round((totalRead / TOTAL_VERSES) * 100);

  function markRead() {
    const key = `${curPadalam}-${curVerse}`;
    setProgress(prev => ({
      ...prev,
      [activeMember]: { ...(prev[activeMember] || {}), [key]: true }
    }));
  }

  function goNext() {
    const p = PADALAMS.find(x => x.id === curPadalam);
    if (curVerse < p.totalVerses) {
      setCurVerse(v => v + 1);
    } else {
      const nextP = PADALAMS.find(x => x.id === curPadalam + 1);
      if (nextP) { setCurPadalam(nextP.id); setCurVerse(1); }
    }
  }

  function goPrev() {
    if (curVerse > 1) {
      setCurVerse(v => v - 1);
    } else {
      const prevP = PADALAMS.find(x => x.id === curPadalam - 1);
      if (prevP) { setCurPadalam(prevP.id); setCurVerse(prevP.totalVerses); }
    }
  }

  function addMember() {
    if (!newMemberName.trim()) return;
    const id = Date.now().toString();
    const colorIdx = members.length % FAMILY_COLORS.length;
    const m = { id, name: newMemberName.trim(), colorIdx };
    setMembers(prev => [...prev, m]);
    setActiveMember(id);
    setNewMemberName("");
    setShowAddMember(false);
    setView("read");
  }

  function jumpToNextUnread() {
    for (let g = 0; g < TOTAL_VERSES; g++) {
      const { padalamId, verseNum } = verseFromGlobal(g);
      if (!memberProgress[`${padalamId}-${verseNum}`]) {
        setCurPadalam(padalamId);
        setCurVerse(verseNum);
        setView("read");
        return;
      }
    }
  }

  // ── Login / Member select screen ──────────────────────────────────────────
  if (!activeMember || !member) {
    return (
      <div style={S.root}>
        <div style={S.bgTexture} />
        <div style={S.loginWrap}>
          <div style={S.loginCard}>
            <OmSymbol />
            <div style={S.loginTitle}>சுந்தர காண்டம்</div>
            <div style={S.loginSub}>Sundara Kandam · Kamba Ramayanam</div>
            <div style={S.loginDivider} />
            {members.length > 0 && (
              <>
                <div style={S.loginWho}>Who is reading today?</div>
                <div style={S.memberGrid}>
                  {members.map(m => (
                    <button key={m.id} onClick={() => setActiveMember(m.id)} style={{
                      ...S.memberBtn,
                      borderColor: FAMILY_COLORS[m.colorIdx],
                      color: FAMILY_COLORS[m.colorIdx],
                    }}>
                      <div style={{ ...S.memberDot, background: FAMILY_COLORS[m.colorIdx] }} />
                      {m.name}
                      <div style={S.memberRead}>
                        {Object.keys(progress[m.id] || {}).length} / {TOTAL_VERSES} read
                      </div>
                    </button>
                  ))}
                </div>
                <div style={S.orDivider}><span>or</span></div>
              </>
            )}
            {!showAddMember ? (
              <button onClick={() => setShowAddMember(true)} style={S.addMemberBtn}>
                + Add Family Member
              </button>
            ) : (
              <div style={S.addMemberForm}>
                <input
                  autoFocus
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addMember()}
                  placeholder="Enter your name..."
                  style={S.memberInput}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowAddMember(false)} style={S.cancelBtn}>Cancel</button>
                  <button onClick={addMember} style={S.saveBtn}>Start Reading →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main reading app ───────────────────────────────────────────────────────
  const curP = PADALAMS.find(x => x.id === curPadalam);

  return (
    <div style={S.root}>
      <div style={S.bgTexture} />

      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div style={S.appName}>சுந்தர காண்டம்</div>
          <div style={S.appNameEn}>Sundara Kandam</div>
        </div>
        <button onClick={() => setActiveMember(null)} style={{
          ...S.memberTag,
          borderColor: FAMILY_COLORS[member.colorIdx],
          color: FAMILY_COLORS[member.colorIdx],
        }}>
          <div style={{ ...S.memberDot, background: FAMILY_COLORS[member.colorIdx], width: 8, height: 8 }} />
          {member.name}
        </button>
      </div>

      {/* Progress bar */}
      <div style={S.progressBarWrap}>
        <div style={{ ...S.progressBar, width: `${pct}%`, background: FAMILY_COLORS[member.colorIdx] }} />
      </div>
      <div style={S.progressLabel}>{totalRead} of {TOTAL_VERSES} verses read · {pct}% complete</div>

      {/* Nav */}
      <div style={S.nav}>
        {[["read", "📖 Read"], ["progress", "📊 Progress"], ["family", "👨‍👩‍👧 Family"]].map(([v, label]) => (
          <button key={v} onClick={() => setView(v)}
            style={{ ...S.navBtn, ...(view === v ? { ...S.navBtnActive, borderBottomColor: FAMILY_COLORS[member.colorIdx] } : {}) }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── READ VIEW ── */}
      {view === "read" && (
        <div style={S.readWrap}>
          {/* Padalam selector */}
          <div style={S.padalamRow}>
            {PADALAMS.map(p => (
              <button key={p.id} onClick={() => { setCurPadalam(p.id); setCurVerse(1); }}
                style={{
                  ...S.padalamChip,
                  background: curPadalam === p.id ? FAMILY_COLORS[member.colorIdx] : "#1a0a00",
                  color: curPadalam === p.id ? "#fff8f0" : "#a07050",
                  borderColor: curPadalam === p.id ? FAMILY_COLORS[member.colorIdx] : "#3a2010",
                }}>
                {p.id}
              </button>
            ))}
          </div>

          {/* Padalam title */}
          <div style={S.padalamTitle}>
            <div style={S.padalamTamilName}>{curP.name}</div>
            <div style={S.padalamEnName}>{curP.nameEn}</div>
          </div>

          {/* Verse card */}
          <div style={S.verseCard}>
            <div style={S.verseNumRow}>
              <Flame />
              <span style={S.verseNum}>பாடல் {curVerse}</span>
              <span style={S.verseNumEn}>Verse {curVerse} of {curP.totalVerses}</span>
              <Flame />
            </div>

            {loading && (
              <div style={S.loadingWrap}>
                <div style={S.spinner} />
                <div style={S.loadingText}>Loading pasuram...</div>
              </div>
            )}

            {error && (
              <div style={S.errorWrap}>
                <div style={S.errorText}>{error}</div>
                <button onClick={() => { setError(null); setLoading(true); const p = PADALAMS.find(x => x.id === curPadalam); fetchPasuram(curPadalam, curVerse, p.name, p.nameEn, new AbortController().signal).then(d => { setVerseData(d); setLoading(false); }).catch(() => { setError("Failed again. Please try."); setLoading(false); }); }} style={S.retryBtn}>Try Again</button>
              </div>
            )}

            {verseData && !loading && (
              <>
                <div style={S.tamilSection}>
                  <div style={S.sectionLabel}>தமிழ்</div>
                  <div style={S.tamilText}>{verseData.tamilText}</div>
                </div>
                <div style={S.dividerLine} />
                <div style={S.meaningSection}>
                  <div style={S.sectionLabel}>English Meaning</div>
                  <div style={S.meaningText}>{verseData.meaning}</div>
                </div>
                {verseData.context && (
                  <div style={S.contextSection}>
                    <div style={S.contextText}>📍 {verseData.context}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mark read + nav */}
          {verseData && !loading && (
            <button onClick={markRead} style={{
              ...S.markReadBtn,
              background: isRead ? "#1a3a1a" : FAMILY_COLORS[member.colorIdx],
              borderColor: isRead ? "#2a5a2a" : FAMILY_COLORS[member.colorIdx],
              color: isRead ? "#4ade80" : "#fff8f0",
            }}>
              {isRead ? "✓ Marked as Read" : "Mark as Read"}
            </button>
          )}

          <div style={S.navBtns}>
            <button onClick={goPrev} style={S.arrowBtn} disabled={curPadalam === 1 && curVerse === 1}>
              ← Previous
            </button>
            <button onClick={jumpToNextUnread} style={{ ...S.arrowBtn, color: FAMILY_COLORS[member.colorIdx], borderColor: FAMILY_COLORS[member.colorIdx] }}>
              Next Unread →
            </button>
            <button onClick={goNext} style={S.arrowBtn} disabled={curPadalam === 5 && curVerse === PADALAMS[4].totalVerses}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── PROGRESS VIEW ── */}
      {view === "progress" && (
        <div style={S.progressWrap}>
          <div style={S.progressHeader}>My Reading Progress</div>
          {PADALAMS.map(p => {
            const readInP = Object.keys(memberProgress).filter(k => k.startsWith(`${p.id}-`)).length;
            const pPct = Math.round((readInP / p.totalVerses) * 100);
            return (
              <div key={p.id} style={S.padalamProgressCard}>
                <div style={S.pPTitle}>{p.name}</div>
                <div style={S.pPSubtitle}>{p.nameEn}</div>
                <div style={S.pPBarWrap}>
                  <div style={{ ...S.pPBar, width: `${pPct}%`, background: FAMILY_COLORS[member.colorIdx] }} />
                </div>
                <div style={S.pPStats}>{readInP} / {p.totalVerses} verses · {pPct}%</div>
                <div style={S.pPDots}>
                  {Array.from({ length: p.totalVerses }, (_, i) => {
                    const k = `${p.id}-${i + 1}`;
                    return (
                      <div key={k} onClick={() => { setCurPadalam(p.id); setCurVerse(i + 1); setView("read"); }}
                        style={{
                          ...S.verseDot,
                          background: memberProgress[k] ? FAMILY_COLORS[member.colorIdx] : "#2a1a08",
                          border: (curPadalam === p.id && curVerse === i + 1) ? `1.5px solid ${FAMILY_COLORS[member.colorIdx]}` : "1.5px solid #3a2010",
                          cursor: "pointer",
                        }} />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── FAMILY VIEW ── */}
      {view === "family" && (
        <div style={S.familyWrap}>
          <div style={S.progressHeader}>Family Progress</div>
          {members.map(m => {
            const mp = progress[m.id] || {};
            const n = Object.keys(mp).length;
            const fp = Math.round((n / TOTAL_VERSES) * 100);
            return (
              <div key={m.id} style={S.familyCard}>
                <div style={{ ...S.familyDot, background: FAMILY_COLORS[m.colorIdx] }} />
                <div style={{ flex: 1 }}>
                  <div style={S.familyName}>{m.name}</div>
                  <div style={S.pPBarWrap}>
                    <div style={{ ...S.pPBar, width: `${fp}%`, background: FAMILY_COLORS[m.colorIdx] }} />
                  </div>
                  <div style={S.familyStats}>{n} of {TOTAL_VERSES} verses · {fp}% complete</div>
                </div>
                {m.id !== activeMember && (
                  <button onClick={() => setActiveMember(m.id)} style={{ ...S.switchBtn, borderColor: FAMILY_COLORS[m.colorIdx], color: FAMILY_COLORS[m.colorIdx] }}>
                    Switch
                  </button>
                )}
              </div>
            );
          })}
          <button onClick={() => setShowAddMember(true)} style={S.addMemberBtn2}>
            + Add Family Member
          </button>
          {showAddMember && (
            <div style={S.addMemberForm}>
              <input autoFocus value={newMemberName} onChange={e => setNewMemberName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addMember()}
                placeholder="Enter name..." style={S.memberInput} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAddMember(false)} style={S.cancelBtn}>Cancel</button>
                <button onClick={addMember} style={S.saveBtn}>Add →</button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #100800; }
        button:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: { minHeight: "100vh", background: "#100800", color: "#f5e6d0", fontFamily: "'Crimson Pro', Georgia, serif", maxWidth: 520, margin: "0 auto", paddingBottom: 60, position: "relative" },
  bgTexture: { position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 0%, #3a1a0088 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 },

  // Login
  loginWrap: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 },
  loginCard: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 20, padding: 36, maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, boxShadow: "0 0 60px #c2440c22" },
  loginTitle: { fontSize: 32, fontFamily: "'Noto Serif Tamil', serif", color: "#f5c87a", letterSpacing: "0.05em", textAlign: "center" },
  loginSub: { fontSize: 14, color: "#a07050", letterSpacing: "0.1em", textAlign: "center" },
  loginDivider: { width: "60%", height: 1, background: "#3a2010", margin: "8px 0" },
  loginWho: { fontSize: 16, color: "#c8a060", margin: "4px 0" },
  memberGrid: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  memberBtn: { background: "#120900", border: "1.5px solid", borderRadius: 12, padding: "14px 18px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 17, display: "flex", alignItems: "center", gap: 10, width: "100%" },
  memberDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  memberRead: { marginLeft: "auto", fontSize: 12, color: "#806040", fontStyle: "italic" },
  orDivider: { color: "#604030", fontSize: 13, textAlign: "center", width: "100%", position: "relative" },
  addMemberBtn: { background: "transparent", border: "1.5px dashed #3a2010", color: "#a07050", padding: "14px 24px", borderRadius: 12, cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15, width: "100%" },
  addMemberForm: { display: "flex", flexDirection: "column", gap: 10, width: "100%" },
  memberInput: { padding: "12px 16px", background: "#0a0500", border: "1.5px solid #3a2010", borderRadius: 10, color: "#f5e6d0", fontSize: 16, fontFamily: "'Crimson Pro', serif", outline: "none", width: "100%" },
  cancelBtn: { flex: 1, padding: 12, background: "transparent", border: "1.5px solid #3a2010", borderRadius: 10, color: "#806040", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15 },
  saveBtn: { flex: 2, padding: 12, background: "#c2440c", border: "none", borderRadius: 10, color: "#fff8f0", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15, fontWeight: 600 },

  // Header
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 20px 12px", position: "relative", zIndex: 1 },
  headerLeft: {},
  appName: { fontSize: 26, fontFamily: "'Noto Serif Tamil', serif", color: "#f5c87a", letterSpacing: "0.05em" },
  appNameEn: { fontSize: 12, color: "#806040", letterSpacing: "0.12em", marginTop: 2 },
  memberTag: { display: "flex", alignItems: "center", gap: 6, background: "#120900", border: "1.5px solid", borderRadius: 20, padding: "6px 14px", fontSize: 14, fontFamily: "'Crimson Pro', serif", cursor: "pointer" },

  // Progress bar
  progressBarWrap: { height: 3, background: "#2a1508", margin: "0 20px", borderRadius: 99, overflow: "hidden", position: "relative", zIndex: 1 },
  progressBar: { height: "100%", borderRadius: 99, transition: "width 0.6s ease" },
  progressLabel: { fontSize: 12, color: "#806040", padding: "6px 20px 0", letterSpacing: "0.05em", position: "relative", zIndex: 1 },

  // Nav
  nav: { display: "flex", borderBottom: "1px solid #2a1508", margin: "12px 0 0", position: "relative", zIndex: 1 },
  navBtn: { flex: 1, padding: "12px 4px", background: "transparent", border: "none", borderBottom: "2px solid transparent", color: "#806040", fontSize: 14, cursor: "pointer", fontFamily: "'Crimson Pro', serif", transition: "all 0.2s" },
  navBtnActive: { color: "#f5c87a", borderBottom: "2px solid" },

  // Read
  readWrap: { padding: "16px 16px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 },
  padalamRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  padalamChip: { width: 42, height: 42, borderRadius: "50%", border: "1.5px solid", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" },
  padalamTitle: { textAlign: "center", padding: "4px 0" },
  padalamTamilName: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 20, color: "#f5c87a" },
  padalamEnName: { fontSize: 14, color: "#a07050", fontStyle: "italic", marginTop: 4 },

  verseCard: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 18, padding: "24px 20px", boxShadow: "0 4px 40px #00000060", animation: "fadeIn 0.4s ease" },
  verseNumRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 },
  verseNum: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 18, color: "#f5c87a" },
  verseNumEn: { fontSize: 13, color: "#806040", fontStyle: "italic" },

  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" },
  spinner: { width: 36, height: 36, borderRadius: "50%", border: "3px solid #3a2010", borderTopColor: "#c2440c", animation: "spin 0.8s linear infinite" },
  loadingText: { color: "#806040", fontStyle: "italic", fontSize: 15 },
  errorWrap: { textAlign: "center", padding: "24px 0" },
  errorText: { color: "#f87171", marginBottom: 12 },
  retryBtn: { background: "#c2440c", border: "none", borderRadius: 8, color: "#fff", padding: "8px 20px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15 },

  tamilSection: { marginBottom: 18 },
  sectionLabel: { fontSize: 11, letterSpacing: "0.2em", color: "#806040", marginBottom: 10, textTransform: "uppercase" },
  tamilText: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 20, lineHeight: 1.9, color: "#f5e6d0", letterSpacing: "0.03em" },
  dividerLine: { height: 1, background: "#3a2010", margin: "18px 0" },
  meaningSection: { marginBottom: 14 },
  meaningText: { fontSize: 18, lineHeight: 1.75, color: "#d4b896", fontStyle: "italic" },
  contextSection: { marginTop: 14, background: "#0f0700", borderRadius: 10, padding: "12px 14px" },
  contextText: { fontSize: 14, color: "#9a7050", lineHeight: 1.6 },

  markReadBtn: { border: "1.5px solid", borderRadius: 12, padding: "14px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 16, fontWeight: 600, transition: "all 0.2s", textAlign: "center", width: "100%" },
  navBtns: { display: "flex", gap: 8 },
  arrowBtn: { flex: 1, background: "transparent", border: "1.5px solid #3a2010", borderRadius: 10, color: "#a07050", padding: "11px 8px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 14, transition: "all 0.2s" },

  // Progress view
  progressWrap: { padding: "16px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 },
  progressHeader: { fontSize: 20, color: "#f5c87a", fontWeight: 600, marginBottom: 4 },
  padalamProgressCard: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 16, padding: "18px" },
  pPTitle: { fontFamily: "'Noto Serif Tamil', serif", fontSize: 18, color: "#f5c87a", marginBottom: 4 },
  pPSubtitle: { fontSize: 13, color: "#806040", fontStyle: "italic", marginBottom: 12 },
  pPBarWrap: { height: 4, background: "#2a1508", borderRadius: 99, overflow: "hidden", marginBottom: 6 },
  pPBar: { height: "100%", borderRadius: 99, transition: "width 0.5s ease" },
  pPStats: { fontSize: 12, color: "#806040", marginBottom: 12 },
  pPDots: { display: "flex", flexWrap: "wrap", gap: 5 },
  verseDot: { width: 14, height: 14, borderRadius: 3, transition: "all 0.2s" },

  // Family view
  familyWrap: { padding: "16px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 14 },
  familyCard: { background: "#1a0c00", border: "1px solid #3a2010", borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 },
  familyDot: { width: 14, height: 14, borderRadius: "50%", flexShrink: 0 },
  familyName: { fontSize: 18, color: "#f5e6d0", marginBottom: 8, fontWeight: 600 },
  familyStats: { fontSize: 12, color: "#806040", marginTop: 6 },
  switchBtn: { background: "transparent", border: "1.5px solid", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 13, flexShrink: 0 },
  addMemberBtn2: { background: "transparent", border: "1.5px dashed #3a2010", color: "#a07050", padding: "14px", borderRadius: 12, cursor: "pointer", fontFamily: "'Crimson Pro', serif", fontSize: 15, textAlign: "center" },
};
