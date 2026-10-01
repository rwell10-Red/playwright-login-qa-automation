# npm and Node — JavaScript Dependencies and Scripts

npm is Node.js's package manager. It installs JavaScript packages and runs scripts
defined in package.json.

---

## npm init
```bash
npm init -y
```
Creates a package.json file — the manifest for a Node project.
- `-y` — accept all defaults without prompts

Used once to initialize the project so Playwright could be installed locally.

---

## npm install
```bash
npm install --save-dev @playwright/test
npm ci
```
Installs JavaScript packages.
- `npm install --save-dev <package>` — installs a package and records it under
  devDependencies (development-only, not shipped to production)
- `@playwright/test` — the Playwright test runner package
- `npm ci` — "clean install" used in CI: installs exactly what package-lock.json
  specifies, faster and more reproducible than `npm install`

---

## npm test and npm run
```bash
npm test
npm run test:desktop
npm run test:mobile
npm run test:headed
npm run test:report
```
Runs scripts defined in the "scripts" section of package.json.
- `npm test` — special shortcut, runs the "test" script without needing "run"
- `npm run <name>` — runs any other named script

The scripts in this project map to Playwright commands:
```json
"scripts": {
  "test": "playwright test",
  "test:desktop": "playwright test --project=chromium-desktop",
  "test:mobile": "playwright test --project=mobile-chrome",
  "test:headed": "playwright test --headed",
  "test:report": "playwright show-report"
}
```
Scripts save typing and standardize commands across a team.

---

## npm list
```bash
npm list -g --depth=0
```
Lists installed packages.
- `-g` — global packages (installed system-wide, not per-project)
- `--depth=0` — top-level only, no nested dependencies

Used to check what was globally installed (found Playwright, Cypress, Appium).

---

## npx
```bash
npx playwright test
```
`npx` runs a package's command without needing it installed globally. It finds the
package in node_modules (or downloads it temporarily). This is why Playwright is
always invoked as `npx playwright ...`.
