# YDHM Logistics REST API

Flask + PostgreSQL API for the logistics dashboard MVP.

## Configuration

Copy `.env.example` to `.env` in this directory. Generate separate values for
`POSTGRES_PASSWORD` and `JWT_SECRET_KEY`:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Use the PostgreSQL secret in both `POSTGRES_PASSWORD` and the password portion
of `DATABASE_URL`. Use a different generated value for `JWT_SECRET_KEY`.
The API requires a 64-character hexadecimal JWT key and will refuse to start
without it. Keep `.env` private; it is excluded from Git.

The Compose database port is bound to localhost only.

## Setup

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
flask --app app create-admin
python app.py
```

On first startup the API creates tables and seeds operational demo data, but no
users or default passwords. Create the first manager account with the
interactive `flask --app app create-admin` command. It prompts for the password
without echoing it and requires at least 12 characters.

Default API URL: `http://127.0.0.1:5000`.

The React app uses the Vite proxy, so frontend requests to `/api/*` are
forwarded to this backend while developing.

## Main Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/bootstrap`
- `GET /api/loads`
- `POST /api/loads`
- `PATCH /api/loads/<load_id>`
- `POST /api/loads/<load_id>/assign`
- `POST /api/loads/<load_id>/status`
- `GET /api/documents`
- `POST /api/documents`
- `POST /api/documents/<document_id>/approve`
- `GET /api/invoices`
- `POST /api/invoices/<invoice_id>/issue`
- `GET /api/incidents`
- `POST /api/incidents`
- `POST /api/incidents/<incident_id>/resolve`
- `GET /api/tracking/<load_id>`
- `GET /api/users`
- `GET /api/audit`
