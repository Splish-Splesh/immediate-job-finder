import React, { useMemo, useState } from "react";
import "./index.css";

import {
  MapPin,
  Building2,
  Clock3,
  ShieldCheck,
  Search,
  MessageSquareText,
  ExternalLink,
  Filter,
} from "lucide-react";

/**
 * Clickable mock (MVP shell)
 * No backend; sample data only.
 */

const SAMPLE = {
  states: [
    {
      code: "NV",
      name: "Nevada",
      cities: [
        {
          name: "Las Vegas",
          metrics: {
            agencies: 28,
            avgInterviewDays: 2.4,
            avgStartDays: 5.2,
            topFastRoles: ["Warehouse", "Hospitality", "Admin", "IT Support"],
            cyberNote:
              "Fast hires in IT Support can reduce ticket backlog and prevent risky workarounds.",
          },
          agencies: [
            {
              name: "Silver State Staffing",
              type: "Temp-to-Hire",
              reach: "Local",
              address: "Mock address, Las Vegas, NV",
              website: "https://example.com",
              industries: ["Warehouse", "Hospitality", "Admin"],
              speed: { interviewDays: 1.5, startDays: 3.5 },
              notes:
                "Known for quick placements. Bring IDs, resume, and proof of eligibility.",
              roles: [
                {
                  title: "Warehouse Associate",
                  pay: "$17–$20/hr",
                  urgency: "High",
                  timeframe: "Interview 24–48h",
                  requirements: ["Reliable transport", "Can lift 50 lbs"],
                },
                {
                  title: "Front Desk Admin",
                  pay: "$18–$22/hr",
                  urgency: "Medium",
                  timeframe: "Interview 2–4 days",
                  requirements: ["MS Office", "Customer service"],
                },
              ],
            },
            {
              name: "Desert Tech Temps",
              type: "Contract",
              reach: "Regional",
              address: "Mock address, Las Vegas, NV",
              website: "https://example.com",
              industries: ["IT Support", "Help Desk", "Operations"],
              speed: { interviewDays: 3.2, startDays: 7.0 },
              notes:
                "Technical screening. Faster if you have A+/Network+ or equivalent.",
              roles: [
                {
                  title: "IT Support Technician (Tier 1)",
                  pay: "$22–$28/hr",
                  urgency: "High",
                  timeframe: "Interview 2–5 days",
                  requirements: ["Troubleshooting", "Ticketing systems"],
                  cyber:
                    "Role supports security hygiene: patching, access basics, endpoint health.",
                },
                {
                  title: "Data Entry (Ops)",
                  pay: "$17–$19/hr",
                  urgency: "Low",
                  timeframe: "Interview 5–10 days",
                  requirements: ["Accuracy", "Typing 50+ WPM"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      code: "TX",
      name: "Texas",
      cities: [
        {
          name: "Dallas",
          metrics: {
            agencies: 54,
            avgInterviewDays: 2.0,
            avgStartDays: 4.7,
            topFastRoles: [
              "Warehouse",
              "Customer Support",
              "IT Support",
              "Construction",
            ],
            cyberNote:
              "High volume market—good for A/B testing placement speed metrics.",
          },
          agencies: [
            {
              name: "Metro Rapid Staffing",
              type: "Temp-to-Hire",
              reach: "Metro",
              address: "Mock address, Dallas, TX",
              website: "https://example.com",
              industries: ["Customer Support", "Admin", "Warehouse"],
              speed: { interviewDays: 1.8, startDays: 4.2 },
              notes: "Walk-ins welcome. Bring resume and two references.",
              roles: [
                {
                  title: "Customer Support Rep",
                  pay: "$18–$23/hr",
                  urgency: "High",
                  timeframe: "Interview 24–72h",
                  requirements: ["Communication", "CRM basics"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const pillClass = (label) => {
  if (label === "Very Fast") return "pill pill-green";
  if (label === "Fast") return "pill pill-blue";
  if (label === "Moderate") return "pill pill-gray";
  return "pill pill-red";
};

const scorePill = (d) => {
  const interview = d?.interviewDays ?? 99;
  const start = d?.startDays ?? 99;
  const score = Math.max(0, 100 - interview * 12 - start * 6);
  if (score >= 78) return "Very Fast";
  if (score >= 60) return "Fast";
  if (score >= 45) return "Moderate";
  return "Slow";
};

function formatLocation(state, city) {
  if (!state) return "Select a state";
  if (!city) return `${state} — select a city`;
  return `${city}, ${state}`;
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      className={`tab ${active ? "tab-active" : ""}`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("browse");
  const [stateCode, setStateCode] = useState("NV");
  const [cityName, setCityName] = useState("Las Vegas");
  const [query, setQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showCyber, setShowCyber] = useState(true);

  const state = useMemo(
    () => SAMPLE.states.find((s) => s.code === stateCode),
    [stateCode]
  );
  const cities = state?.cities ?? [];

  const city = useMemo(
    () => cities.find((c) => c.name === cityName) ?? cities[0],
    [cities, cityName]
  );

  const allIndustries = useMemo(() => {
    const set = new Set();
    for (const c of cities) {
      for (const a of c.agencies) a.industries.forEach((i) => set.add(i));
    }
    return Array.from(set).sort();
  }, [cities]);

  const agencies = useMemo(() => {
    const list = (city?.agencies ?? []).map((a) => ({
      ...a,
      pill: scorePill(a.speed),
    }));

    const q = query.trim().toLowerCase();
    return list
      .filter((a) => {
        if (industryFilter !== "all" && !a.industries.includes(industryFilter))
          return false;
        if (!q) return true;
        const hay = [
          a.name,
          a.type,
          a.reach,
          ...(a.industries ?? []),
          ...((a.roles ?? []).map((r) => r.title)),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const sa = (a.speed?.interviewDays ?? 99) + (a.speed?.startDays ?? 99);
        const sb = (b.speed?.interviewDays ?? 99) + (b.speed?.startDays ?? 99);
        return sa - sb;
      });
  }, [city, query, industryFilter]);

  const locationLabel = formatLocation(stateCode, cityName);

  return (
    <div className="page">
      <header className="header">
        <div className="brand">
          <div className="logo">
            <Building2 size={18} />
          </div>
          <div>
            <div className="title">Immediate Job Finder</div>
            <div className="subtitle">
              Clickable mock • state/city temp agency map • speed-first placement
            </div>
          </div>
        </div>

        <div className="badges">
          <span className="pill pill-outline">
            <MapPin size={14} /> {locationLabel}
          </span>
          <span className="pill pill-outline">
            <Clock3 size={14} /> Focus: time-to-interview
          </span>
          <span className="pill pill-outline">
            <ShieldCheck size={14} /> Cyber-aware staffing
          </span>
        </div>
      </header>

      <main className="container">
        <div className="tabs">
          <TabButton active={tab === "browse"} onClick={() => setTab("browse")}>
            Browse
          </TabButton>
          <TabButton
            active={tab === "compare"}
            onClick={() => setTab("compare")}
          >
            Compare
          </TabButton>
          <TabButton
            active={tab === "feedback"}
            onClick={() => setTab("feedback")}
          >
            Dad Feedback
          </TabButton>
        </div>

        {tab === "browse" && (
          <div className="grid">
            <section className="card">
              <h2>Pick a location</h2>

              <label className="label">State</label>
              <select
                className="input"
                value={stateCode}
                onChange={(e) => {
                  const v = e.target.value;
                  setStateCode(v);
                  const next = SAMPLE.states.find((s) => s.code === v);
                  const firstCity = next?.cities?.[0]?.name;
                  if (firstCity) setCityName(firstCity);
                }}
              >
                {SAMPLE.states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <label className="label">City</label>
              <select
                className="input"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="divider" />

              <label className="label">Search</label>
              <div className="row">
                <div className="inputWrap">
                  <Search size={16} />
                  <input
                    className="input"
                    placeholder="agency, role, industry…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button className="btn btn-secondary" onClick={() => setQuery("")}>
                  Clear
                </button>
              </div>

              <label className="label">
                <Filter size={16} /> Industry filter
              </label>
              <select
                className="input"
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
              >
                <option value="all">All</option>
                {allIndustries.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>

              <div className="toggle">
                <div>
                  <div className="toggleTitle">Show cybersecurity notes</div>
                  <div className="toggleSub">
                    Keep it simple, but risk-aware.
                  </div>
                </div>
                <button
                  className={`btn ${showCyber ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setShowCyber((s) => !s)}
                >
                  {showCyber ? "On" : "Off"}
                </button>
              </div>

              <div className="divider" />

              <h3>City snapshot</h3>
              <div className="stats">
                <div className="stat">
                  <div className="statLabel">Agencies</div>
                  <div className="statValue">{city?.metrics?.agencies ?? "—"}</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Avg interview</div>
                  <div className="statValue">{city?.metrics?.avgInterviewDays ?? "—"}d</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Avg start</div>
                  <div className="statValue">{city?.metrics?.avgStartDays ?? "—"}d</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Fast roles</div>
                  <div className="statSmall">
                    {(city?.metrics?.topFastRoles ?? []).slice(0, 2).join(", ") ||
                      "—"}
                  </div>
                </div>
              </div>

              {showCyber && city?.metrics?.cyberNote && (
                <div className="note">
                  <div className="noteTitle">
                    <ShieldCheck size={16} /> Cybersecurity note
                  </div>
                  <div className="noteBody">{city.metrics.cyberNote}</div>
                </div>
              )}
            </section>

            <section className="stack">
              <div className="stackHead">
                <div>
                  <div className="cityTitle">{city?.name ?? "City"}</div>
                  <div className="muted">
                    Sorted by fastest placement (mock). Click an agency to review roles.
                  </div>
                </div>
                <span className="pill pill-outline">{agencies.length} agencies</span>
              </div>

              {agencies.map((a) => (
                <div key={a.name} className="card">
                  <div className="cardHead">
                    <div>
                      <div className="cardTitleRow">
                        <div className="cardTitle">{a.name}</div>
                        <span className={pillClass(a.pill)}>{a.pill}</span>
                      </div>
                      <div className="muted">
                        {a.type} • {a.reach} • {a.address}
                      </div>
                    </div>

                    <div className="right">
                      <span className="pill pill-blue">
                        <Clock3 size={14} /> Interview: {a.speed.interviewDays}d
                      </span>
                      <span className="pill pill-blue">
                        <Clock3 size={14} /> Start: {a.speed.startDays}d
                      </span>
                      <button
                        className="btn btn-outline"
                        onClick={() => window.open(a.website, "_blank")}
                      >
                        Website <ExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="tagRow">
                    {a.industries.map((i) => (
                      <span key={i} className="pill pill-outline">
                        {i}
                      </span>
                    ))}
                  </div>

                  <div className="muted">{a.notes}</div>

                  <div className="divider" />

                  <div className="roles">
                    {a.roles.map((r) => (
                      <div key={r.title} className="role">
                        <div className="roleTop">
                          <div>
                            <div className="roleTitle">{r.title}</div>
                            <div className="muted">
                              {r.pay} • {r.timeframe}
                            </div>
                          </div>
                          <span className="pill pill-outline">{r.urgency}</span>
                        </div>
                        <div className="muted small">
                          <b>Requirements:</b> {r.requirements.join(", ")}
                        </div>
                        {showCyber && r.cyber && (
                          <div className="note compact">
                            <div className="noteTitle">
                              <ShieldCheck size={14} /> Cyber note
                            </div>
                            <div className="noteBody">{r.cyber}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "compare" && (
          <div className="grid">
            <section className="card">
              <h2>Timeframe comparison (mock)</h2>
              <p className="muted">
                We treat job boards as a comparative signal, not the source of truth.
                We compare speed, reach, and friction.
              </p>
              <div className="divider" />
              <h3>Baseline (Temp agencies)</h3>
              <ul className="muted">
                <li>Shorter time-to-interview (often 1–5 days)</li>
                <li>Fewer decision layers</li>
                <li>Repeatable placement workflow</li>
              </ul>

              <h3 style={{ marginTop: 14 }}>Comparator (Indeed-style postings)</h3>
              <ul className="muted">
                <li>Wider reach, longer hiring cycles</li>
                <li>Noisy/duplicated listings</li>
                <li>More employer filtering</li>
              </ul>

              {showCyber && (
                <div className="note">
                  <div className="noteTitle">
                    <ShieldCheck size={16} /> Cybersecurity tie-in
                  </div>
                  <div className="noteBody">
                    Long vacancy time in IT/ops roles can increase risk: delayed patching,
                    backlog, weak access hygiene. We prioritize speed for these roles.
                  </div>
                </div>
              )}
            </section>

            <section className="card">
              <h2>City metrics snapshot</h2>
              <div className="stats">
                <div className="stat">
                  <div className="statLabel">Selected</div>
                  <div className="statSmall">{locationLabel}</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Avg interview</div>
                  <div className="statValue">{city?.metrics?.avgInterviewDays ?? "—"}d</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Avg start</div>
                  <div className="statValue">{city?.metrics?.avgStartDays ?? "—"}d</div>
                </div>
                <div className="stat">
                  <div className="statLabel">Comparator</div>
                  <div className="statSmall">Job boards: ~14–30d start</div>
                </div>
              </div>

              <div className="divider" />

              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Pilot plan (Dad validates)</div>
                  <div className="muted">Pick one state + 2 cities. Validate agency lists and real steps.</div>
                </div>
                <button className="btn btn-primary" onClick={() => setTab("feedback")}>
                  Provide feedback <MessageSquareText size={16} />
                </button>
              </div>
            </section>
          </div>
        )}

        {tab === "feedback" && (
          <div className="grid">
            <section className="card">
              <h2>What we need from you</h2>
              <p className="muted">
                This is a mock. The goal is to pressure-test the real-world workflow.
              </p>
              <div className="divider" />
              <ul className="muted">
                <li><b>Agency list accuracy:</b> which agencies matter in each city?</li>
                <li><b>Placement reality:</b> what docs, steps, and timelines are typical?</li>
                <li><b>Fast roles:</b> which roles get hired within 72 hours?</li>
                <li><b>Dealbreakers:</b> what slows hiring?</li>
                <li><b>Cyber note:</b> which tech roles are risky to leave vacant?</li>
              </ul>
            </section>

            <section className="card">
              <h2>Feedback form (mock)</h2>

              <label className="label">State</label>
              <select
                className="input"
                value={stateCode}
                onChange={(e) => {
                  const v = e.target.value;
                  setStateCode(v);
                  const next = SAMPLE.states.find((s) => s.code === v);
                  const firstCity = next?.cities?.[0]?.name;
                  if (firstCity) setCityName(firstCity);
                }}
              >
                {SAMPLE.states.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>

              <label className="label">City</label>
              <select
                className="input"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              >
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <label className="label">Which agencies should be listed here?</label>
              <input className="input" placeholder="Comma-separated agency names" />

              <label className="label">What’s the real placement process?</label>
              <input className="input" placeholder="IDs, background checks, orientations…" />

              <label className="label">Fastest roles in this city?</label>
              <input className="input" placeholder="Warehouse, hospitality, admin, help desk…" />

              <label className="label">What slows hiring?</label>
              <input className="input" placeholder="Late arrivals, missing docs, poor availability…" />

              <div className="toggle">
                <div>
                  <div className="toggleTitle">Include cyber risk notes</div>
                  <div className="toggleSub">Only for roles where vacancy increases exposure.</div>
                </div>
                <button
                  className={`btn ${showCyber ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setShowCyber((s) => !s)}
                >
                  {showCyber ? "On" : "Off"}
                </button>
              </div>

              <div className="row">
                <button className="btn btn-primary" type="button">
                  Submit (mock)
                </button>
                <button className="btn btn-outline" type="button" onClick={() => setTab("browse")}>
                  Back to browse
                </button>
              </div>

              <div className="muted small">
                This form doesn’t save yet—it's just a clickable shell.
              </div>
            </section>
          </div>
        )}

        <footer className="footer">
          Mock data only. Next step: replace sample agencies with real city/state lists and validate timelines.
        </footer>
      </main>
    </div>
  );
}
