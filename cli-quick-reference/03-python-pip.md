# Python and pip — Running the App and Installing Packages

Python runs the Flask app. pip is Python's package installer.

---

## Running the Flask App
```bash
python login_app/app.py
```
Runs the Flask login application. Starts a development web server at
http://127.0.0.1:5000. Leave this running in its own terminal while tests execute.

Output when successful:
```
Database seeded with test users.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

Stop it with Ctrl+C.

Common typo caught in this project: `app.p` instead of `app.py` — always include
the full `.py` extension. Use Tab completion to avoid this: type `app` then Tab.

---

## Running the Verification Script
```bash
python verify.py
```
Runs the smoke-test script that checks all Flask routes without a browser. Prints
a pass/fail summary. Used to confirm the app is healthy before running Playwright.

---

## pip install
```bash
pip install sqlalchemy flask-sqlalchemy
pip install trcli
pip install -r requirements.txt
```
Installs Python packages.
- `pip install <package>` — install one or more named packages
- `pip install -r requirements.txt` — install everything listed in a requirements
  file (used by the CI pipeline to set up the Flask app)

Packages installed in this project: sqlalchemy, flask-sqlalchemy, trcli.

---

## pip show
```bash
pip show flask
pip show flask-login
```
Shows details about an installed package (version, location, dependencies). Used to
check what was already installed on the machine.

---

## pip list
```bash
pip list
```
Lists every installed Python package with its version. Used to survey the machine's
available tools at the start of the project.

---

## python -m
```bash
python -m json.tool
```
Runs a Python module as a script. `-m json.tool` is Python's built-in JSON
formatter — used to pretty-print the raw JSON from the TestRail API so it is
readable (see curl reference).

---

## Checking Python Modules Are Importable
```bash
python -c "import flask, flask_login, flask_sqlalchemy; print('All modules OK')"
```
- `-c` runs a line of Python code directly
- Used to confirm the Flask dependencies import correctly before running the app
