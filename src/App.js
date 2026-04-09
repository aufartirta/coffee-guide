import { useState, useEffect, useRef, useCallback } from "react";

const METHODS = [
  {
    id: "french",
    name: "French Press",
    ratio: 16,
    grind: "Medium-coarse",
    temp: "94°C",
    credit: "James Hoffmann · 2007 World Barista Champion",
    desc: "Hoffmann's signature technique produces a cleaner French Press by letting grounds settle before a gentle plunge — no sludge, full flavour.",
    steps: [
      { text: "Boil water and let it cool slightly to ~94°C. Coarsely grind your coffee (like breadcrumbs).", timer: null },
      { text: "Preheat the French Press with hot water, discard, then add your ground coffee.", timer: null },
      { text: "Start timer. Pour all the water over the grounds in one go. Do not stir.", timer: null },
      { text: "Steep undisturbed.", timer: 240 },
      { text: "At 4:00 — gently break the crust on top with a spoon. Give 2–3 slow stirs to sink floating grounds.", timer: 15 },
      { text: "Using two spoons, skim off the foam and floating particles from the surface.", timer: 30 },
      { text: "Let the coffee settle completely. Do not touch it.", timer: 300 },
      { text: "Insert the plunger just below the surface of the liquid — do not press down. This acts as a filter only.", timer: null },
      { text: "Pour slowly and gently into your cup. Leave the last bit behind. Enjoy!", timer: null },
    ]
  },
  {
    id: "v60",
    name: "V60 — 4:6 Method",
    ratio: 15,
    grind: "Coarse",
    temp: "92°C",
    credit: "Tetsu Kasuya · 2016 World Brewers Cup Champion",
    desc: "Kasuya's award-winning method divides water into 5 equal pours: the first 40% controls acidity & sweetness, the last 60% controls strength.",
    steps: [
      { text: "Place paper filter in V60, rinse thoroughly with hot water. Discard rinse. Set V60 on your server.", timer: null },
      { text: "Add coarsely ground coffee. Shake gently to level the bed. Tare your scale.", timer: null },
      { text: "Each pour = 3× the weight of your coffee (e.g. 20g coffee → 60g per pour). You'll do 5 equal pours total.", timer: null },
      { text: "Pour 1 — Start timer. Pour the first measure of water in a slow circular spiral. Complete in 10 seconds. Wait for the bed to run dry.", timer: 45 },
      { text: "Pour 2 — Pour the second measure in the same circular motion. Wait for the bed to run dry. (These 2 pours = 40% of total water.)", timer: 45 },
      { text: "Pour 3 — Pour the third measure. Wait for bed to run dry. (Now into the 60% strength phase.)", timer: 45 },
      { text: "Pour 4 — Pour the fourth measure. Wait for bed to run dry.", timer: 45 },
      { text: "Pour 5 — Pour the final measure. Let it fully drain.", timer: 60 },
      { text: "Total brew time should be around 3:30. Remove V60 and serve.", timer: null },
    ]
  },
  {
    id: "aero",
    name: "AeroPress",
    ratio: 13,
    grind: "Medium-fine",
    temp: "85–95°C",
    credit: "James Hoffmann · Ultimate AeroPress Recipe",
    desc: "Hoffmann's universal AeroPress recipe. No inverting, no complex stirring — just a vacuum seal steep and a gentle press that works beautifully with any coffee.",
    steps: [
      { text: "Insert a paper filter into the cap. Rinse the filter and cap with hot water.", timer: null },
      { text: "Add medium-fine ground coffee to the AeroPress chamber (standard upright position).", timer: null },
      { text: "Pour all your hot water over the grounds, filling to near the top.", timer: null },
      { text: "Place the plunger on top and pull it back slightly to create a vacuum seal. Do not press yet.", timer: null },
      { text: "Steep undisturbed.", timer: 120 },
      { text: "Remove the plunger. Give the AeroPress a gentle swirl to agitate the grounds evenly.", timer: null },
      { text: "Let the coffee settle for 30 seconds so fines sink to the bottom.", timer: 30 },
      { text: "Reinsert the plunger and press down very slowly over 30 seconds using minimal pressure. Stop when you hear a hiss.", timer: 30 },
      { text: "Do not press the puck dry. Remove the AeroPress. Serve and enjoy.", timer: null },
    ]
  },
  {
    id: "moka",
    name: "Moka Pot",
    ratio: 8,
    grind: "Medium-fine",
    temp: "Pre-boiled",
    credit: "James Hoffmann · Ultimate Moka Pot Technique",
    desc: "Hoffmann's key insight: start with pre-boiled water and use low heat. This avoids scorching the grounds and produces a balanced, less bitter cup.",
    steps: [
      { text: "Pre-boil water in a kettle — this is critical. Using cold water on the stove scorches the grounds.", timer: null },
      { text: "Grind coffee to medium-fine (coarser than espresso, finer than V60). Fill the filter basket and level off — do not tamp.", timer: null },
      { text: "Using a cloth or heat protection, fill the bottom chamber with the pre-boiled water up to just below the pressure valve.", timer: null },
      { text: "Assemble the Moka Pot. Place on low–medium heat. Keep the lid open so you can watch.", timer: null },
      { text: "As soon as coffee starts to flow into the upper chamber, turn off the heat (or move to a cold burner).", timer: null },
      { text: "The residual heat will push remaining water through. Watch and wait.", timer: 60 },
      { text: "When you hear a hissing/gurgling sound, it's done. Pour immediately to avoid over-extraction.", timer: null },
    ]
  },
  {
    id: "tubruk",
    name: "Kopi Tubruk",
    ratio: 12,
    grind: "Very fine",
    temp: "90–95°C",
    credit: "Traditional Indonesian Method",
    desc: "The oldest coffee tradition in Indonesia — brewed directly in the cup, grounds and all. Simple, bold, and deeply satisfying.",
    steps: [
      { text: "Add very finely ground coffee directly into your cup or glass.", timer: null },
      { text: "Add sugar to taste — traditionally quite sweet (palm sugar or regular white sugar).", timer: null },
      { text: "Pour hot water (90–95°C) over the coffee and sugar slowly.", timer: null },
      { text: "Stir gently once or twice to combine.", timer: null },
      { text: "Wait patiently for the grounds to fully settle to the bottom.", timer: 180 },
      { text: "Sip slowly and carefully from the top. Stop before you reach the sediment at the bottom — that part stays in the cup.", timer: null },
    ]
  },
];

const amber = { bg: "#FAEEDA", text: "#633806", border: "#854F0B" };
const green = { bg: "#EAF3DE", text: "#27500A", border: "#3B6D11" };
const gray = { bg: "#f5f4f0" };

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function buildFreshStates(method) {
  return method.steps.map(s => ({ done: false, remaining: s.timer, running: false }));
}

export default function App() {
  const [methodId, setMethodId] = useState("french");
  const [coffee, setCoffee] = useState(20);
  const [states, setStates] = useState(() => buildFreshStates(METHODS[0]));
  const intervalRef = useRef(null);
  const activeTimerIdx = useRef(null);

  const method = METHODS.find(m => m.id === methodId);
  const water = Math.round(coffee * method.ratio);
  const activeIdx = states.findIndex(s => !s.done);
  const allDone = states.every(s => s.done);

  const clearActiveTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      activeTimerIdx.current = null;
    }
  }, []);

  const switchMethod = useCallback((id) => {
    clearActiveTimer();
    setMethodId(id);
    setStates(buildFreshStates(METHODS.find(m => m.id === id)));
  }, [clearActiveTimer]);

  useEffect(() => {
    return () => clearActiveTimer();
  }, [clearActiveTimer]);

  function startTimer(i) {
    if (intervalRef.current) return;
    activeTimerIdx.current = i;
    setStates(prev => {
      const n = [...prev];
      n[i] = { ...n[i], running: true };
      return n;
    });
    intervalRef.current = setInterval(() => {
      setStates(prev => {
        const n = [...prev];
        const st = { ...n[i] };
        st.remaining = Math.max(0, st.remaining - 1);
        if (st.remaining === 0) {
          clearActiveTimer();
          st.running = false;
        }
        n[i] = st;
        return n;
      });
    }, 1000);
  }

  function pauseTimer(i) {
    clearActiveTimer();
    setStates(prev => {
      const n = [...prev];
      n[i] = { ...n[i], running: false };
      return n;
    });
  }

  function resetTimer(i) {
    clearActiveTimer();
    setStates(prev => {
      const n = [...prev];
      n[i] = { ...n[i], remaining: method.steps[i].timer, running: false };
      return n;
    });
  }

  function nextStep(i) {
    clearActiveTimer();
    setStates(prev => {
      const n = [...prev];
      n[i] = { ...n[i], done: true, running: false };
      return n;
    });
  }

  function reset() {
    clearActiveTimer();
    setStates(buildFreshStates(method));
  }

  return (
    <div style={{ padding: "1.25rem 1rem", maxWidth: 580, margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Coffee Brewing Guide ☕</h1>
        <p style={{ fontSize: 13, color: "#888", margin: "4px 0 0" }}>by Aufar Tirta</p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.25rem" }}>
        {METHODS.map(m => (
          <button key={m.id} onClick={() => switchMethod(m.id)} style={{
            padding: "6px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
            fontWeight: m.id === methodId ? 500 : 400,
            border: `0.5px solid ${m.id === methodId ? amber.border : "#ccc"}`,
            background: m.id === methodId ? amber.bg : "transparent",
            color: m.id === methodId ? amber.text : "#888",
          }}>{m.name}</button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: amber.text, background: amber.bg, display: "inline-block", borderRadius: 999, padding: "3px 10px", marginBottom: 8, fontWeight: 500 }}>
        {method.credit}
      </div>

      <p style={{ fontSize: 13, color: "#888", lineHeight: 1.65, marginBottom: "1.25rem" }}>{method.desc}</p>

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>Coffee</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="number" min={1} max={200} step={1} value={coffee}
              onChange={e => setCoffee(Math.max(1, parseInt(e.target.value) || 1))}
              style={{ width: 68, textAlign: "center", fontSize: 18, fontWeight: 500, padding: "6px 8px", border: "0.5px solid #ccc", borderRadius: 8, background: "transparent", color: "inherit" }} />
            <span style={{ fontSize: 13, color: "#888" }}>g</span>
          </div>
        </div>
        <div style={{ background: gray.bg, borderRadius: 10, padding: "8px 14px", minWidth: 120 }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Water</div>
          <div style={{ fontSize: 20, fontWeight: 500 }}>{water} ml</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>ratio 1:{method.ratio}</div>
        </div>
        <div style={{ background: gray.bg, borderRadius: 10, padding: "8px 14px" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grind</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{method.grind}</div>
          <div style={{ fontSize: 11, color: "#aaa" }}>{method.temp}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>Steps</span>
        <button onClick={reset} style={{ fontSize: 12, padding: "3px 12px", borderRadius: 999, border: "0.5px solid #ccc", background: "transparent", color: "#888", cursor: "pointer" }}>Reset</button>
      </div>

      {allDone ? (
        <div style={{ background: green.bg, border: `0.5px solid ${green.border}`, borderRadius: 12, padding: "18px 20px", textAlign: "center", color: green.text, fontWeight: 500 }}>
          All steps complete — enjoy your coffee!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {method.steps.map((step, i) => {
            const st = states[i];
            if (!st) return null;
            const isActive = i === activeIdx;
            const isDone = st.done;
            const timerDone = step.timer && st.remaining === 0;

            return (
              <div key={`${methodId}-${i}`} style={{
                border: `0.5px solid ${isActive ? amber.border : "#e0e0e0"}`,
                borderRadius: 12, padding: "12px 14px",
                opacity: isDone ? 0.4 : 1,
                background: isActive ? "#fffdf9" : "transparent",
                transition: "opacity 0.2s",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 500, borderRadius: 999,
                    padding: "2px 8px", whiteSpace: "nowrap", flexShrink: 0, marginTop: 1,
                    background: isDone ? "#f0f0ee" : isActive ? amber.bg : "#f5f4f0",
                    color: isDone ? "#aaa" : isActive ? amber.text : "#999",
                  }}>{isDone ? "done" : `step ${i + 1}`}</span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.6, color: isDone ? "#aaa" : "inherit" }}>{step.text}</span>
                </div>

                {step.timer && isActive && (
                  <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    {timerDone ? (
                      <>
                        <span style={{ color: green.text, fontWeight: 500, fontSize: 13 }}>Timer done!</span>
                        <button onClick={() => resetTimer(i)} style={{ fontSize: 12, padding: "3px 12px", borderRadius: 999, border: "0.5px solid #ccc", background: "transparent", cursor: "pointer", color: "inherit" }}>Reset</button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 22, fontWeight: 500, fontFamily: "monospace", minWidth: 54, color: amber.text }}>{fmt(st.remaining)}</span>
                        {!st.running
                          ? <button onClick={() => startTimer(i)} style={{ fontSize: 12, padding: "5px 16px", borderRadius: 999, border: `1px solid ${amber.border}`, background: amber.bg, color: amber.text, cursor: "pointer", fontWeight: 500 }}>Start</button>
                          : <button onClick={() => pauseTimer(i)} style={{ fontSize: 12, padding: "5px 16px", borderRadius: 999, border: "0.5px solid #ccc", background: "transparent", cursor: "pointer", color: "inherit" }}>Pause</button>
                        }
                        <button onClick={() => resetTimer(i)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 999, border: "0.5px solid #ccc", background: "transparent", cursor: "pointer", color: "inherit" }}>Reset</button>
                      </>
                    )}
                  </div>
                )}

                {isActive && (
                  <button onClick={() => nextStep(i)} style={{
                    marginTop: 10, fontSize: 13, padding: "5px 16px",
                    borderRadius: 999, border: `0.5px solid ${amber.border}`,
                    background: "transparent", color: amber.text, cursor: "pointer",
                  }}>{i === method.steps.length - 1 ? "Finish" : "Next step"}</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
