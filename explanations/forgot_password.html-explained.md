# forgot_password.html — Line by Line Explanation

**File location:** `login_app/templates/forgot_password.html`
**Purpose:** The forgot password page. Serves two states in one template: the request form (enter your email) and the confirmation state (neutral message after submission). Also used to display error messages for expired/invalid reset tokens. Directly covers TC_LOGIN_006.

---

## Head Section

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Forgot Password — QA Practice App</title>
```
**Lines 1–7** — Standard HTML5 head. Same pattern as other templates.
- `viewport` meta tag ensures mobile responsiveness — TC_LOGIN_010d tests this page on mobile
- Different `title` so browser tabs are distinguishable during multi-tab testing

---

## CSS Styles

The CSS in this file shares the same patterns as `login.html`. Rather than repeat identical explanations, the unique parts are highlighted below.

```css
.alert--error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert--success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.alert--info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
```
**Lines 47–49** — Three alert variants used on this page:
- `alert--error` — shown when the email field is empty OR when a reset token is invalid/expired
- `alert--info` — shown for the neutral confirmation message after email submission (TC_LOGIN_006)
- `alert--success` — available for success states (not directly used on this page but consistent with the design system)

---

```css
input[type="email"] {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #111827;
  min-height: 44px;
  transition: border-color .2s;
}
```
**Lines 64–74** — Email input field styling.
- `min-height: 44px` — WCAG touch target minimum. TC_LOGIN_010d asserts `emailBox.height >= 44`
- Same styling approach as `login.html` for visual consistency

---

```css
.btn--primary { background: #4f46e5; color: #fff; }
.btn--primary:hover { background: #4338ca; }
```
**Lines 82–83** — Submit button colors. Indigo on default, slightly darker on hover. Same as the login button for visual consistency across pages.

---

```css
@media (max-width: 480px) {
  .card { padding: 2rem 1.25rem; }
}
```
**Lines 93–95** — Mobile padding adjustment. Reduces card padding on screens 480px and below so content has more horizontal room. TC_LOGIN_010d checks this page on a 393px wide viewport.

---

## HTML Body

```html
<main class="card" role="main">
  <div class="card__logo">
    <h1>Forgot Password</h1>
    <p>Enter your email to receive a reset link</p>
  </div>
```
**Lines 99–104** — Page header inside the card.
- `<main>` with `role="main"` — semantic and ARIA landmark for accessibility
- The `<h1>` heading clearly states the purpose of the page
- The subtitle `<p>` gives the user instructions

---

```html
{% if error %}
  <div class="alert alert--error" id="error-message" role="alert">{{ error }}</div>
{% endif %}
```
**Lines 107–109** — Error message block.
- `{% if error %}` — Jinja2 conditional. Only rendered when `app.py` passes an `error` string.
- Two situations trigger this:
  1. The email field was submitted empty
  2. An invalid or expired reset token URL was visited
- `id="error-message"` — consistent ID across pages for Playwright to locate
- `role="alert"` — screen reader announces this immediately

---

```html
{% if message %}
  <div class="alert alert--info" id="reset-confirmation" role="status">
    {{ message }}
  </div>
  <div class="card__footer">
    <a href="{{ url_for('login') }}" id="back-to-login">&#8592; Back to login</a>
  </div>
{% else %}
  ... form ...
{% endif %}
```
**Lines 112–130** — The two-state template switch. **TC_LOGIN_006.**

**When `message` is set (after form submission):**
- `id="reset-confirmation"` — Playwright asserts: `expect(page.locator('#reset-confirmation')).toContainText('If this email is registered')`
- `role="status"` — ARIA role for non-urgent informational messages (less urgent than `role="alert"`)
- `{{ message }}` — outputs: "If this email is registered, you will receive a password reset link shortly."
- This same message is shown regardless of whether the email exists — prevents email enumeration
- `&#8592;` — HTML entity for the left arrow ← character
- `id="back-to-login"` — back navigation link after confirmation

**When `message` is NOT set (initial page load):**
- The `{% else %}` branch renders the email input form

---

```html
<form method="POST" action="{{ url_for('forgot_password') }}" id="forgot-password-form">
  <div class="form__group">
    <label for="email">Email address</label>
    <input
      type="email"
      id="email"
      name="email"
      placeholder="you@example.com"
      autocomplete="email"
      aria-required="true"
    />
  </div>
  <button type="submit" class="btn btn--primary" id="send-reset-btn">
    Send Reset Link
  </button>
</form>
```
**Lines 132–147** — The password reset request form.
- `id="forgot-password-form"` — Playwright asserts this is visible after clicking the forgot password link in TC_LOGIN_006
- `method="POST"` — form data sent in request body
- `action="{{ url_for('forgot_password') }}"` — submits back to the same `/forgot-password` route
- `id="email"` — Playwright fills this: `page.fill('#email', 'user@example.com')`
- `autocomplete="email"` — browser can auto-fill saved email
- `aria-required="true"` — accessibility attribute marking the field as required
- `id="send-reset-btn"` — Playwright clicks this: `page.click('#send-reset-btn')`. TC_LOGIN_010d also taps this on mobile.
- No `novalidate` attribute here — browser email validation is acceptable on this form since the server also validates

---

```html
<div class="card__footer">
  <a href="{{ url_for('login') }}" id="back-to-login">&#8592; Back to login</a>
</div>
```
**Lines 149–151** — Back to login link shown below the form.
- `id="back-to-login"` — Playwright can click this to navigate back
- `{{ url_for('login') }}` — generates `/login`
- This link appears in both the form state and the confirmation state (after submission)
