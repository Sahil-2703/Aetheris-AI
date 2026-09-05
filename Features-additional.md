# ⚡ AutoAgent SaaS Architecture Engine

An event-driven, autonomous graph-loop platform designed for content creators, developers, startups, and operations teams. Replacing turn-by-turn manual prompting with autonomous **Perceive → Reason → Act → Observe** state machine loops.

---

## 🚀 Platform Workflows & Automation Matrix

| Persona | Status | Trigger Event | Autonomous Loop Action | Output / End State |
| :--- | :--- | :--- | :--- | :--- |
| **Content Creators** | `STABLE` | New media upload OR Instagram/YouTube API webhook | Auto-generates captions/hashtags, selects background audio, posts media, compares sentiment, and handles auto-DMs. | **Hands-Free Multi-Platform Publishing & Audience Growth Engine.** |
| **Developers** | `BETA` | GitHub PR creation or local development error logs | Evaluates build failures, fixes TypeScript/test errors in sandbox, and submits self-healing PRs. | **Automated PR Review & Self-Healing Codebase (Beta).** |
| **Startups / Freelancers** | `STABLE` | Typeform lead submission OR Stripe payment event | Qualifies leads, checks calendar availability, builds custom PDF agreement, and dispatches invoice link. | **24/7 Client Onboarding & Automated Invoicing.** |
| **Employees / Ops** | `STABLE` | Inbound PDF email attachment OR raw Zoom call upload | Parses structured data directly into CRM/Database and publishes daily executive summaries. | **Zero-Friction Admin & CRM Synchronization.** |

---

## 📸 Content Creator Automation Engine

### 1. Autonomous Publishing & Media Pipeline
* **Multi-Platform Posting:** Automatically resizes, formats, and posts media directly to Instagram (Reels/Posts) and YouTube (Shorts/Videos).
* **Smart Captions & Audio Selection:** Generates SEO-optimized captions, tags, and automatically overlays context-matching trending background music when required.

### 2. Analytics & Sentiment Comparison Engine
* **Positive vs. Negative Sentiment Analysis:** Real-time classification matrix comparing positive audience engagement against negative or critical feedback.
* **Comment Triage & Auto-Replies:**
  * **Lead Intent:** Converts comments (e.g., *"SEND GUIDE"*) into automated direct messages (DMs) carrying downloadable resource links.
  * **Spam Mitigation:** Automatically flags and hides spam or malicious links via platform Data APIs.
* **Analytics Dashboard:** Centralized view tracking likes, reach, comment volume, and audience sentiment trajectory over time.

#### Sample Sentiment Comparison & Action Matrix:
| Platform | Incoming Comment Sample | Sentiment Tag | Automated Action / Loop Response |
| :--- | :--- | :--- | :--- |
| **Instagram** | *"Loved this breakdown! Can you send me the template link?"* | `POSITIVE` `[Lead Intent]` | Triggers DM API to send PDF download link & auto-replies: *"Check your DMs! 📩"* |
| **YouTube** | *"Audio is super quiet at 04:12, hard to hear on mobile."* | `NEGATIVE` `[Quality Issue]` | Logs issue to analytics dashboard, flags video timestamp, auto-replies: *"Thanks for feedback! Fixing audio."* |
| **Instagram** | *"This technique doesn't work for Next.js 15 apps..."* | `NEUTRAL` `[Tech Inquiry]` | Passes comment to agent doc-search: drafts technical response for creator quick-approval. |
| **YouTube** | *"Check my profile for cheap crypto signals!"* | `SPAM` `[Malicious]` | Automatically hides comment via YouTube Data API & flags user account. |

---

## 💻 Developer Mode (BETA)

> ⚠️ **Developer features are currently in BETA.** We are continuously optimizing autonomous sandbox executions, compilation stability, and type-checking loops.

The developer engine runs an in-workspace daemon watching for file saves or failed CI runs:
1. **File System Listener:** Captures modified files via `chokidar` or `watchdog`.
2. **Deterministic Verification:** Triggers test runners (`npm run type-check`, `vitest`, `pytest`) instantly upon file saves.
3. **Self-Healing Loop:** Feeds `stderr` stack traces directly back to the LLM agent to rewrite and re-test code until exit code `0` is achieved (up to $N=8$ attempts).

---

## 🎨 Dashboard Architecture: Persistent Collapsible Sidebar

To prevent full-page refreshes when switching between active AI conversations, social analytics, and development logs, the platform implements a client-side state-managed collapsible sidebar.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ NAVBAR                                              [ ☰ Toggle Sidebar ]│
├──────────────┬─────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN SPA APPLICATION VIEW (No Page Reload)              │
│ (Collapsible)│                                                         │
│              │ ┌─────────────────────────────────────────────────────┐ │
│ 💬 Active    │ │ Active Conversation / Creator Workflow Engine       │ │
│    Threads   │ │                                                     │ │
│              │ │  [ Video Upload ] ──► [ Generate Caption ]          │ │
│ 📊 Creator   │ │  [ Pick Music ]   ──► [ Auto-Post to IG/YouTube ]   │ │
│    Analytics │ │                                                     │ │
│              │ └─────────────────────────────────────────────────────┘ │
│ ⚙️ Settings   │                                                         │
└──────────────┴─────────────────────────────────────────────────────────┘
```