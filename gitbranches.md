# 🌿 Branch Strategy

This repository follows a **multi-branch workflow** to safely manage development, testing, and deployment of the Panchang website and Telegram bot.

---

## 📌 Branch Overview

### 🚀 `deployed` (Production - Live)

* Contains the **currently deployed version** of the application.
* This is the version visible to users.
* Should always remain **stable and bug-free**.
* Only updated after proper testing.

---

### 🧪 `prod` (Staging / Testing)

* Contains the **next version of the application**.
* Used for testing new features before going live.
* Acts as a bridge between development and production.

---

### 🤖 `telegram-bot` (Feature Branch)

* Used for developing the **Telegram bot version** of the application.
* Built on top of the `prod` branch.
* Includes bot-specific logic and integrations.
* Changes are merged into `prod` after testing.

---

### 🧩 `master` (Base / Integration)

* Acts as a **base branch** for core development.
* Can be used for integrating features before moving to `prod`.
* May mirror `prod` depending on workflow.
