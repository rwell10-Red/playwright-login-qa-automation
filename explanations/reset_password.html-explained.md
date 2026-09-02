# reset_password.html — Line by Line Explanation

**File location:** `login_app/templates/reset_password.html`
**Purpose:** The page where a user sets their new password after clicking a reset link from their email (or terminal in this local project). Only reachable via a valid, unexpired token URL. Part of the TC_LOGIN_006 forgot password flow.

---

## Head Section

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password — QA Practice App</title>
```
**Lines 1–7** — Standard HTML5 head.
- `viewport` meta — mobile responsive, consistent with all other templates
- `title` — "Reset Password" clearly identifies this page

---

## CSS Styles

```css
.alert--error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
```
**Line 35** — Only the error alert is needed on this page. Three error conditions can trigger it:
1. One or both password fields are empty
2. The two password fields do not match
3. The new password is less than 8 characters

---

```css
input[type="password"] {
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
**Lines 51–61** — Password input field styling. Same approach as all other inputs across the app.
- `min-height: 44px` — WCAG 2.1 touch target minimum
- `type="password"` selector — both fields on this page are password type, so one rule styles both

---

```css
.hint {
  font-size: 0.78rem;
  color: #6b7280;
  margin-top: 0.3rem;
}
```
**Lines 63–67** — Hint text style shown below the new password field.
- Small, gray, supplementary text
- Displays "Minimum 8 characters" to guide the user before they submit

---

```css
@media (max-width: 480px) {
  .card { padding: 2rem 1.25rem; }
}
```
**Lines 78–80** — Mobile padding adjustment. Consistent with all other pages.

---

## HTML Body

```html
<main class="card" role="main">
  <div class="card__logo">
    <h1>Set New Password</h1>
    <p>Choose a strong password for your account</p>
  </div>
```
**Lines 85–90** — Page header.
- "Set New Password" is clear and action-oriented — the user knows exactly what to do
- Subtitle provides supporting context

---

```html
{% if error %}
  <div class="alert alert--error" id="error-message" role="alert">{{ error }}</div>
{% endif %}
```
**Lines 92–94** — Error message block.
- `{% if error %}` — only rendered when `app.py` passes an error string back to this template
- Three possible error messages:
  - `"Both fields are required."` — if either field is empty
  - `"Passwords do not match."` — if the two fields have different values
  - `"Password must be at least 8 characters."` — if the password is too short
- `id="error-message"` — standard ID used consistently across all error elements in this project
- `role="alert"` — announces the error to screen readers immediately

---

```html
<form method="POST" action="{{ url_for('reset_password', token=token) }}" id="reset-password-form">
```
**Line 96** — The reset password form.
- `method="POST"` — new password data sent securely in the request body, not in the URL
- `action="{{ url_for('reset_password', token=token) }}"` — Jinja2 generates the URL with the token embedded, e.g., `/reset-password/V35slaoc...`. The token is passed to this template from `app.py` as the `token` variable.
- Without the token in the action URL, the form submission would not know which user is resetting their password
- `id="reset-password-form"` — available for Playwright to locate and interact with

---

```html
<div class="form__group">
  <label for="password">New password</label>
  <input
    type="password"
    id="password"
    name="password"
    placeholder="••••••••"
    autocomplete="new-password"
    aria-required="true"
  />
  <span class="hint">Minimum 8 characters</span>
</div>
```
**Lines 97–108** — New password input field.
- `type="password"` — masks the characters as dots
- `id="password"` — Playwright can fill this field for reset flow automation
- `name="password"` — server reads this with `request.form.get('password', '')`
- `placeholder="••••••••"` — visual placeholder showing the field is for a password (dots, not text)
- `autocomplete="new-password"` — tells the browser this is a new password being set, not an existing one being entered. Password managers use this to offer to save the new password.
- `aria-required="true"` — accessibility: marks the field as required
- `<span class="hint">Minimum 8 characters</span>` — helpful hint below the field. `app.py` validates `len(new_password) >= 8` server-side.

---

```html
<div class="form__group">
  <label for="confirm_password">Confirm new password</label>
  <input
    type="password"
    id="confirm_password"
    name="confirm_password"
    placeholder="••••••••"
    autocomplete="new-password"
    aria-required="true"
  />
</div>
```
**Lines 110–120** — Confirm password field.
- `id="confirm_password"` — separate ID from the first password field
- `name="confirm_password"` — server reads this with `request.form.get('confirm_password', '')`
- `app.py` compares `new_password != confirm_password` and returns an error if they differ
- No hint text needed — the label "Confirm new password" is self-explanatory
- `autocomplete="new-password"` — same value as the first password field; tells the browser this is the confirmation of the same new password

---

```html
<button type="submit" class="btn btn--primary" id="reset-submit-btn">
  Update Password
</button>
```
**Lines 122–124** — Submit button.
- `type="submit"` — clicking this submits the form to `app.py`'s `reset_password` route
- `id="reset-submit-btn"` — Playwright can click this for end-to-end reset flow automation
- "Update Password" — clear action label. More specific than "Submit" or "Save".
- `class="btn btn--primary"` — full-width indigo button, consistent with all other primary actions

---

## What Happens After Submission

When this form is submitted, `app.py`'s `reset_password()` function:
1. Validates both fields are filled
2. Checks passwords match
3. Checks password is at least 8 characters
4. Calls `user.set_password(new_password)` — hashes and stores the new password
5. Sets `reset_token = None` — invalidates the token (single-use)
6. Sets `reset_token_expiry = None` — clears the expiry
7. Calls `user.reset_failed_attempts()` — unlocks the account if it was locked
8. Commits to the database
9. Flashes "Your password has been updated. Please log in."
10. Redirects to `/login` with a 302

This completes the full TC_LOGIN_006 workflow: forgot password → email (terminal) → reset link → new password → login.
