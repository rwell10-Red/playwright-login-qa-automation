# dashboard.html — Line by Line Explanation

**File location:** `login_app/templates/dashboard.html`
**Purpose:** The protected page users land on after a successful login. Only accessible when logged in — visiting it without a session triggers a redirect back to login. Contains the welcome message Playwright asserts on, the logout button, and reference cards explaining which test cases this page covers.

---

## Head Section

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dashboard — QA Practice App</title>
```
**Lines 1–7** — Standard HTML head. Same pattern as `login.html`:
- `DOCTYPE html` — HTML5 declaration
- `lang="en"` — English language declaration for accessibility
- `charset="UTF-8"` — universal character encoding
- `viewport` meta — enables mobile responsive layout for **TC_LOGIN_010**
- `title` — browser tab title, different from login page so testers can tell which tab they are on

---

## CSS Styles

```css
.navbar {
  background: #1a1a2e;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}
```
**Lines 18–25** — Styles the top navigation bar.
- `background: #1a1a2e` — dark navy color, visually distinct from the login page so it is obvious the user is logged in
- `display: flex; align-items: center; justify-content: space-between` — Flexbox layout: app name on the left, user name and logout button on the right
- `height: 60px` — fixed height navbar

---

```css
.btn-logout {
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  min-width: 44px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
```
**Lines 33–48** — Styles the logout button.
- `background: #ef4444` — red, communicating a destructive/exit action
- `min-height: 44px; min-width: 44px` — WCAG 2.1 minimum touch target size. TC_LOGIN_010 checks this.
- `text-decoration: none` — removes the underline since this is an `<a>` tag styled as a button
- `display: inline-flex; align-items: center` — vertically centers the button text

---

```css
.welcome-message {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,.08);
  padding: 2rem;
  margin-bottom: 1.5rem;
}
```
**Lines 55–62** — Styles the welcome card. **TC_LOGIN_001.**
- White card with rounded corners and a soft shadow — visually prominent so it is the first thing the user sees
- Playwright asserts the `#welcome-section` and `#welcome-heading` inside this are visible after login

---

```css
.badge {
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
  margin-top: 0.5rem;
}
```
**Lines 72–81** — Styles the "Session Active" badge inside the welcome card.
- Green background with dark green text — communicates active/healthy state
- `border-radius: 99px` — pill shape (very large radius on a small element creates rounded ends)
- Shows the checkmark `✓ Session Active` to reinforce that the login succeeded

---

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
}
```
**Lines 84–88** — CSS Grid layout for the QA reference cards.
- `display: grid` — activates CSS Grid layout
- `repeat(auto-fill, minmax(240px, 1fr))` — automatically fills the row with as many columns as fit, each at least 240px wide and stretching equally. On desktop: 3–4 columns. On mobile: 1 column.
- `gap: 1rem` — 1rem space between each card

---

```css
@media (max-width: 480px) {
  .navbar { padding: 0 1rem; }
  .container { margin: 1.5rem auto; }
}
```
**Lines 108–111** — Mobile responsive adjustments. **TC_LOGIN_010.**
- Reduces navbar padding on small screens
- Reduces top margin on the content container

---

## HTML Body

```html
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <span class="navbar__brand">QA Practice App</span>
  <div style="display:flex; align-items:center; gap:1rem;">
    <span class="navbar__user" id="nav-user-name">{{ user.name }}</span>
    <a href="{{ url_for('logout') }}" class="btn-logout" id="logout-btn">Log out</a>
  </div>
</nav>
```
**Lines 116–122** — The navigation bar.
- `role="navigation"` — ARIA landmark role for screen readers
- `aria-label="Main navigation"` — describes which navigation this is (page could have multiple navs)
- `{{ user.name }}` — Jinja2 outputs the logged-in user's name. `user` is passed from `app.py` as `current_user`. Shows "Test User" for the main test account.
- `id="nav-user-name"` — available for Playwright assertions if needed
- `{{ url_for('logout') }}` — generates the `/logout` URL
- `id="logout-btn"` — Playwright clicks this in TC_LOGIN_001 cleanup and TC_LOGIN_009: `page.click('#logout-btn')`

---

```html
<main class="container" role="main">
```
**Line 124** — Main content area.
- `<main>` — HTML5 semantic element for primary content
- `role="main"` — ARIA landmark for screen readers

---

```html
<section class="welcome-message" id="welcome-section">
  <h2 id="welcome-heading">Welcome, {{ user.name }}!</h2>
  <p>You are successfully logged in to the QA Practice App.</p>
  <span class="badge">&#10003; Session Active</span>
</section>
```
**Lines 127–132** — The welcome message section. **TC_LOGIN_001.**
- `id="welcome-section"` — Playwright asserts: `expect(page.locator('#welcome-section')).toBeVisible()`
- `id="welcome-heading"` — Playwright asserts: `expect(page.locator('#welcome-heading')).toContainText('Welcome')`
- `{{ user.name }}` — dynamic content from Flask. Outputs "Welcome, Test User!" for the test account.
- `&#10003;` — HTML entity for the checkmark character ✓
- These two IDs are the primary assertions in TC_LOGIN_001, TC_LOGIN_009, and TC_LOGIN_010

---

```html
<div class="info-card">
  <h3>TC_LOGIN_001</h3>
  <p>Valid login — this dashboard confirms a successful authentication redirect.</p>
</div>
```
**Lines 136–139** — First QA reference card.
- Four cards explain the four test cases this dashboard page is involved in
- These are informational only — not tested by Playwright
- Useful when running tests manually or demonstrating the app to stakeholders
- Each card has a left indigo border (`border-left: 4px solid #4f46e5`) for visual structure

---

```html
<div class="info-card">
  <h3>TC_LOGIN_007</h3>
  <p>Remember Me — close and reopen your browser. If you land here without logging in,
  the persistent cookie is working.</p>
</div>
```
**Lines 141–144** — Remember Me reference card.
- Explains how to manually verify TC_LOGIN_007 without running Playwright
- Close the browser entirely (not just the tab) and reopen — if this page loads, the cookie worked

---

```html
<div class="info-card">
  <h3>TC_LOGIN_008</h3>
  <p>Session Timeout — leave this page idle for 30 minutes.</p>
</div>
```
**Lines 146–149** — Session Timeout reference card.
- Explains the manual verification approach for TC_LOGIN_008
- In Playwright, we simulate this by clearing cookies instead of waiting 30 minutes

---

```html
<div class="info-card">
  <h3>TC_LOGIN_009</h3>
  <p>Multi-Tab — open this app in a second tab, log out in this one,
  then try to navigate in the other tab.</p>
</div>
```
**Lines 151–154** — Multi-Tab reference card.
- Explains the manual verification approach for TC_LOGIN_009
- In Playwright, we automate this using `browser.newContext()` and two page objects
