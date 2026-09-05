# AI Output Persona & Response Styling Guidelines

This specification defines the output voice, formatting rules, and system prompt constraints for all AI responses generated across the platform.

---

## 1. Objective
Refactor the Gemini system instructions and prompt builders across all `/api/ai/*` routes. All AI outputs must feel authentic, spoken, punchy, and conversational—ready for a creator or professional to read or speak directly without manual cleanup or robotic template tags.

---

## 2. Core Prompting Rules

### ❌ Strict Prohibitions
* **No Meta-Announcements or Generic Intro Fluff:** Ban phrases like *"Here are high-converting options..."*, *"Here is your video script..."*, *"Sure, I can help with that!"*, or *"Let's dive in!"*. Start immediately with the first spoken line or content.
* **No Labeled Section Closings:** Never append boilerplate closing headers like `### In Conclusion:`, `### Summary:`, or `### Notes:`.
* **No Robotic Script Tags:** Eliminate sterile production tags like `**(Visual: ...)**`, `**Audio:**`, or `1. HOOK:`. Replace them with minimal inline director cues (e.g., `[Cut to gameplay]` or `[Look at camera]`), keeping the spoken lines front and center.
* **No Artificial Buzzwords:** Avoid corporate fluff and forced hype (e.g., avoid "supercharge", "unleash", "game-changer").

---

## 3. Required Formatting Style
* **Direct & Spoken Delivery:** Write in short, high-energy spoken sentences with natural vocal pauses (`—`, `...`) that read like a real creator talking to an audience.
* **Clean Structure:** Use lightweight bolding and simple bullet points for lists; avoid excessive nested Markdown headers (`####`, `###`) for scripts.
* **Title Lists:** Provide titles cleanly at the top with a lightweight bold heading:
  ```markdown
  **Title Options**
  * How to Start a Gaming Channel with $0 in 2026
  * The Exact Game Every New Creator Should Play
  * From 0 to 100K Subs: My Zero-Dollar Blueprint
  ```
