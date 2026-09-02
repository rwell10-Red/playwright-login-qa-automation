# login.html — Line by Line Explanation

**File location:** `login_app/templates/login.html`
**Purpose:** The main login page — the page every Playwright test starts from. Built with plain HTML and CSS inside a single file. Flask's Jinja2 template engine adds dynamic behavior using `{{ }}` and `{% %}` syntax. This page handles 6 of the 10 test cases visually.

---

## Head Section

```html
<!DOCTYPE html>
```
**Line 1** — Declares this as an HTML5 document. Tells the browser which version of HTML to use. Required on every HTML page.

---

```html
<html lang="en">
```
**Line 2** — Opens the root HTML element. `lang="en"` declares the page language as English — used by screen readers and accessibility tools. Part of WCAG accessibility compliance.

---

```html
<meta charset="UTF-8" />
```
**Line 4** — Sets the character encoding to UTF-8. This allows the page to display any character — letters, symbols, emoji — without distortion. Always required.

---

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
**Line 5** — The mobile responsive meta tag. **Critical for TC_LOGIN_010.**
- `width=device-width` — sets the page width to match the device screen width instead of defaulting to a desktop width
- `initial-scale=1.0` — prevents the browser from zooming in or out on load
- Without this line, the page would appear tiny on mobile with a zoomed-out desktop layout

---

```html
<title>Login — QA Practice App</title>
```
**Line 6** — Sets the browser tab title. Playwright can also assert on the page title if needed.

---

## CSS Styles

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```
**Line 9** — CSS reset applied to every element.
- `box-sizing: border-box` — makes element widths include padding and borders, not add to them. Prevents layout surprises.
- `margin: 0; padding: 0` — removes default browser spacing so styling starts from a consistent baseline.
- `*::before, *::after` — also applies to pseudo-elements that browsers add automatically.

---

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
```
**Lines 11–19** — Styles the page body.
- `font-family: -apple-system, ...` — system font stack. Uses the native font for iOS, macOS, Windows, Android — no web font download needed.
- `background: #f0f2f5` — light gray background color.
- `min-height: 100vh` — body is at least the full viewport height (vh = viewport height units).
- `display: flex; align-items: center; justify-content: center` — centers the login card both vertically and horizontally on the screen using CSS Flexbox.
- `padding: 1rem` — adds space around the card on small screens so it does not touch the edges.

---

```css
.card {
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 24px rgba(0,0,0,.10);
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
}
```
**Lines 22–29** — Styles the white login card container.
- `border-radius: 10px` — rounded corners.
- `box-shadow: 0 4px 24px rgba(0,0,0,.10)` — subtle shadow for depth. `rgba(0,0,0,.10)` = black at 10% opacity.
- `width: 100%` — takes full width on small screens.
- `max-width: 420px` — caps at 420px on large screens — the card never stretches too wide.

---

```css
.alert--error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
.alert--warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
.alert--success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
.alert--info    { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
```
**Lines 54–57** — Four alert color variants using CSS modifier classes.
- `alert--error` — red. Used for invalid credentials (TC_LOGIN_002).
- `alert--warning` — amber. Used for session expired messages (TC_LOGIN_008).
- `alert--success` — green. Used for password updated confirmation (TC_LOGIN_006).
- `alert--info` — blue. Used for neutral messages and flash notifications.
- The `--` naming convention follows BEM (Block Element Modifier) — a standard CSS naming methodology.

---

```css
.lockout {
  text-align: center;
  padding: 1rem 0;
}
.lockout__icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
.lockout h2 { font-size: 1.1rem; color: #b91c1c; margin-bottom: 0.5rem; }
```
**Lines 60–72** — Styles the account lockout panel. **TC_LOGIN_005.**
- Centers the lock emoji, heading, and message
- Red heading color matches the severity of being locked out
- This panel replaces the login form entirely when `lockout=True` is passed from `app.py`

---

```css
input[type="email"],
input[type="password"],
input[type="text"] {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #111827;
  background: #fff;
  transition: border-color .2s;
  min-height: 44px;
}
```
**Lines 83–96** — Styles all input fields.
- `width: 100%` — inputs stretch to fill their container.
- `min-height: 44px` — **WCAG 2.1 requirement**. Touch targets must be at least 44×44 CSS pixels. TC_LOGIN_010 Playwright tests assert this value.
- `transition: border-color .2s` — smooth animated color change when the field is focused.
- `border: 1.5px solid #d1d5db` — visible gray border in default state.

---

```css
input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79,70,229,.15);
}
```
**Lines 98–102** — Focus state styling. When a user clicks into a field:
- `outline: none` — removes the browser's default blue outline.
- `border-color: #4f46e5` — turns the border indigo.
- `box-shadow: 0 0 0 3px rgba(79,70,229,.15)` — adds a soft indigo glow ring. Important for accessibility — visible focus indicators are required by WCAG 2.1 AA.

---

```css
input.is-invalid { border-color: #ef4444; }
.field-error {
  font-size: 0.78rem;
  color: #dc2626;
  margin-top: 0.3rem;
  display: block;
}
```
**Lines 104–110** — Validation error styles. **TC_LOGIN_003.**
- `is-invalid` class added by Jinja2 template when `errors.email` or `errors.password` exist
- Turns the border red
- `.field-error` styles the error text below the field — small, red

---

```css
.btn {
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}
```
**Lines 124–135** — Base button styles.
- `display: block; width: 100%` — button spans the full card width.
- `min-height: 44px` — WCAG touch target minimum. Playwright asserts this in TC_LOGIN_010.
- `cursor: pointer` — shows the hand cursor on hover so users know it is clickable.

---

```css
@media (max-width: 480px) {
  .card { padding: 2rem 1.25rem; }
}
```
**Lines 163–165** — Mobile media query. **TC_LOGIN_010.**
- Applies only when the screen is 480px wide or narrower.
- Reduces card padding on small screens so content has more horizontal space.
- `@media` rules are how CSS applies different styles at different screen sizes — this is responsive design.

---

## HTML Body

```html
<main class="card" role="main">
```
**Line 169** — The main container element.
- `<main>` — semantic HTML5 element marking the primary content area. Screen readers use this to skip navigation.
- `role="main"` — ARIA role, reinforces the semantic meaning for older assistive technologies.

---

```html
{% with messages = get_flashed_messages(with_categories=true) %}
  {% if messages %}
    <ul class="flashes" aria-live="polite">
      {% for category, message in messages %}
        <li class="alert alert--{{ category }}">{{ message }}</li>
      {% endfor %}
    </ul>
  {% endif %}
{% endwith %}
```
**Lines 178–186** — Flask flash message block.
- `{% with %}` — Jinja2 block that creates a temporary variable
- `get_flashed_messages(with_categories=true)` — Flask function that retrieves any queued messages (e.g., "You have been logged out." from `app.py`)
- `{% if messages %}` — only renders the list if there are messages
- `{% for category, message in messages %}` — loops through each message
- `alert--{{ category }}` — dynamically applies the color class: `alert--info`, `alert--warning`, etc.
- `aria-live="polite"` — tells screen readers to announce new content added to this list without interrupting current speech

---

```html
{% if lockout %}
  <div class="lockout" id="lockout-message" role="alert">
    <div class="lockout__icon" aria-hidden="true">🔒</div>
    <h2>Account Locked</h2>
    <p>
      Your account has been locked due to too many failed attempts.<br>
      Please <a href="{{ url_for('forgot_password') }}">reset your password</a>
      or contact support.
    </p>
  </div>
{% else %}
```
**Lines 188–200** — Account lockout panel. **TC_LOGIN_005.**
- `{% if lockout %}` — Jinja2 conditional. Only shown when `app.py` passes `lockout=True`
- `id="lockout-message"` — Playwright locates this element: `page.locator('#lockout-message')`
- `role="alert"` — ARIA role telling screen readers to announce this immediately
- `aria-hidden="true"` on the emoji — hides decorative emoji from screen readers
- `{{ url_for('forgot_password') }}` — Jinja2 generates the correct URL for the forgot password route
- The `{% else %}` block contains the normal login form — only one or the other is rendered

---

```html
{% if error %}
  <div class="alert alert--error" id="error-message" role="alert">
    {{ error }}
  </div>
{% endif %}
```
**Lines 203–207** — Generic error banner. **TC_LOGIN_002 and TC_LOGIN_004.**
- `{% if error %}` — only renders when `app.py` passes an `error` string
- `id="error-message"` — Playwright locates and asserts this: `page.locator('#error-message')`
- `{{ error }}` — outputs the error message text, e.g., "Invalid email or password. Please try again."
- `role="alert"` — screen readers announce this immediately when it appears

---

```html
<form method="POST" action="{{ url_for('login') }}" novalidate id="login-form">
```
**Line 209** — The login form element.
- `method="POST"` — form data is sent in the request body (not the URL)
- `action="{{ url_for('login') }}"` — Jinja2 generates `/login` as the form submission URL
- `novalidate` — disables browser's built-in HTML5 validation so Flask's server-side validation runs instead (TC_LOGIN_003 tests server-side validation specifically)
- `id="login-form"` — Playwright checks `page.locator('#login-form').toBeVisible()` to confirm the form is shown

---

```html
<input
  type="email"
  id="email"
  name="email"
  value="{{ email or '' }}"
  placeholder="you@example.com"
  autocomplete="email"
  aria-required="true"
  aria-describedby="email-error"
  class="{{ 'is-invalid' if errors and errors.email else '' }}"
/>
```
**Lines 216–226** — The email input field.
- `type="email"` — tells browsers this is an email field (triggers email keyboard on mobile)
- `id="email"` — Playwright fills this field: `page.fill('#email', 'user@example.com')`
- `name="email"` — the key used in `request.form.get('email')` on the server
- `value="{{ email or '' }}"` — if there was a validation error, re-populates the field with the previously entered email so the user does not have to retype it
- `autocomplete="email"` — browser can auto-fill saved email addresses
- `aria-required="true"` — accessibility: tells screen readers this field is required
- `aria-describedby="email-error"` — accessibility: links this field to its error message so screen readers read the error when the field is focused
- `class="{{ 'is-invalid' if errors and errors.email else '' }}"` — Jinja2 conditional: adds `is-invalid` class (red border) only when there is an email error

---

```html
{% if errors and errors.email %}
  <span class="field-error" id="email-error" role="alert">{{ errors.email }}</span>
{% else %}
  <span class="field-error" id="email-error"></span>
{% endif %}
```
**Lines 227–231** — Email field error message. **TC_LOGIN_003.**
- `id="email-error"` — Playwright asserts: `page.locator('#email-error').toContainText('Email is required')`
- The empty `<span>` is always rendered (even when no error) so Playwright can always locate `#email-error` without it throwing a "not found" error
- `role="alert"` — announces the error to screen readers when it appears

---

```html
<input type="checkbox" id="remember_me" name="remember_me" />
<label for="remember_me">Remember me</label>
```
**Lines 248–249** — The Remember Me checkbox. **TC_LOGIN_007.**
- `id="remember_me"` — Playwright checks this: `page.check('#remember_me')`
- `name="remember_me"` — when checked, sends `remember_me=on` in the form POST. `app.py` reads: `request.form.get('remember_me') == 'on'`
- `for="remember_me"` on the label — clicking the label also toggles the checkbox (accessibility and usability)

---

```html
<button type="submit" class="btn btn--primary" id="login-btn">
  Log in
</button>
```
**Lines 252–254** — The login submit button.
- `type="submit"` — clicking this submits the form
- `id="login-btn"` — Playwright clicks this: `page.click('#login-btn')`
- `class="btn btn--primary"` — applies the full-width indigo button styles

---

```html
<a href="{{ url_for('forgot_password') }}" id="forgot-password-link">
  Forgot your password?
</a>
```
**Lines 259–261** — Forgot password link. **TC_LOGIN_006.**
- `{{ url_for('forgot_password') }}` — Jinja2 generates `/forgot-password`
- `id="forgot-password-link"` — Playwright clicks this: `page.click('#forgot-password-link')`
