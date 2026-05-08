import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000/emails";

const CATEGORY_COLORS = {
  "Payment Problem": { bg: "#fff1f0", text: "#cf1322", dot: "#ff4d4f" },
  "Refund Request": { bg: "#fff7e6", text: "#d46b08", dot: "#ffa940" },
  "Shipping Issue": { bg: "#e6f4ff", text: "#0958d9", dot: "#4096ff" },
  "Account Support": { bg: "#f6ffed", text: "#389e0d", dot: "#73d13d" },
  "Technical Bug": { bg: "#f9f0ff", text: "#531dab", dot: "#9254de" },
  "General Inquiry": { bg: "#f0f5ff", text: "#1d39c4", dot: "#597ef7" },
};

function getCategoryStyle(category) {
  return (
    CATEGORY_COLORS[category] || {
      bg: "#fafafa",
      text: "#595959",
      dot: "#8c8c8c",
    }
  );
}

function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85 ? "#52c41a" : pct >= 65 ? "#faad14" : "#ff4d4f";
  return (
    <div className="conf-wrap">
      <div className="conf-track">
        <div
          className="conf-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="conf-label" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
      <div className="stat-glow" />
    </div>
  );
}

export default function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL);
      setEmails(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err.message ||
          "Failed to reach the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(emails.map((e) => e.category))].sort();
    return ["All", ...cats];
  }, [emails]);

  const filtered = useMemo(() => {
    return emails.filter((e) => {
      const matchSearch = e.subject
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "All" || e.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [emails, search, categoryFilter]);

  const stats = useMemo(() => {
    if (!emails.length) return { total: 0, topCategory: "—", avgConf: "—" };
    const freq = {};
    let confSum = 0;
    emails.forEach((e) => {
      freq[e.category] = (freq[e.category] || 0) + 1;
      confSum += e.confidence;
    });
    const topCategory = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    const avgConf = ((confSum / emails.length) * 100).toFixed(1) + "%";
    return { total: emails.length, topCategory, avgConf };
  }, [emails]);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="app">
      {/* Background decoration */}
      <div className="bg-grid" />
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="9" height="9" rx="2" fill="currentColor" opacity=".9"/>
                <rect x="13" y="2" width="9" height="9" rx="2" fill="currentColor" opacity=".5"/>
                <rect x="2" y="13" width="9" height="9" rx="2" fill="currentColor" opacity=".5"/>
                <rect x="13" y="13" width="9" height="9" rx="2" fill="currentColor" opacity=".2"/>
              </svg>
            </div>
            <div>
              <h1 className="title">Email AI Dashboard</h1>
              <p className="subtitle">
                Real-time classification &amp; intelligent routing
              </p>
            </div>
          </div>
          <div className="header-right">
            {lastUpdated && (
              <span className="last-updated">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              className={`refresh-btn ${loading ? "loading" : ""}`}
              onClick={fetchEmails}
              disabled={loading}
            >
              <svg
                className="refresh-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="stats-row">
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            }
            label="Total Emails"
            value={stats.total}
            accent="#4f46e5"
          />
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            }
            label="Top Category"
            value={stats.topCategory}
            accent="#0ea5e9"
          />
          <StatCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            }
            label="Avg. Confidence"
            value={stats.avgConf}
            accent="#10b981"
          />
        </section>

        {/* Filters */}
        <div className="toolbar">
          <div className="search-wrap">
            <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip ${categoryFilter === cat ? "active" : ""}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
                {cat !== "All" && (
                  <span className="chip-count">
                    {emails.filter((e) => e.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table area */}
        <div className="table-card">
          {loading && (
            <div className="overlay">
              <div className="spinner-wrap">
                <div className="spinner" />
                <p className="spinner-text">Fetching emails…</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p className="error-title">Connection Error</p>
              <p className="error-msg">{error}</p>
              <button className="retry-btn" onClick={fetchEmails}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="table-header-meta">
                <span className="result-count">
                  {filtered.length} of {emails.length} emails
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p className="empty-title">No emails found</p>
                  <p className="empty-sub">
                    Try adjusting your search or filter.
                  </p>
                </div>
              ) : (
                <div className="table-scroll">
                  <table className="email-table">
                    <thead>
                      <tr>
                        <th>#ID</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Confidence</th>
                        <th>Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((email, i) => {
                        const style = getCategoryStyle(email.category);
                        return (
                          <tr
                            key={email.id}
                            className="email-row"
                            style={{ animationDelay: `${i * 40}ms` }}
                          >
                            <td className="td-id">
                              <span className="id-badge">#{email.id}</span>
                            </td>
                            <td className="td-subject">
                              <span className="subject-text">{email.subject}</span>
                              {email.body && (
                                <span className="body-preview">{email.body}</span>
                              )}
                            </td>
                            <td className="td-category">
                              <span
                                className="category-badge"
                                style={{
                                  background: style.bg,
                                  color: style.text,
                                }}
                              >
                                <span
                                  className="cat-dot"
                                  style={{ background: style.dot }}
                                />
                                {email.category}
                              </span>
                            </td>
                            <td className="td-confidence">
                              <ConfidenceBar value={email.confidence} />
                            </td>
                            <td className="td-date">
                              {formatDate(email.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="footer">
          Powered by Claude AI · Email Classification Engine
        </footer>
      </div>
    </div>
  );
}
