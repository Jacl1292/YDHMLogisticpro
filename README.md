# YDHM Logistics Corp.

The repository separates the Flask API (`backend/`) from the React application (`front/`).

## Requirements

- Node.js 20 or newer
- pnpm
- Python 3.10 or newer
- Docker Compose

## Frontend

```powershell
cd front
pnpm install
pnpm dev
```

The frontend runs at `http://127.0.0.1:5300`. From `front/`, use `pnpm build`,
`pnpm test`, or `pnpm preview` for the production build, tests, or preview.

Copy `front/.env.example` to `front/.env.local` and fill in the required values.
Client environment variables belong in `front/.env.local`. Values prefixed
with `VITE_` are embedded in the browser bundle and must not be treated as
server secrets. Restrict provider keys (such as Mapbox) to the required
origins, APIs, and quotas.

## Backend

Copy `backend/.env.example` to `backend/.env`. Generate separate secrets for
`POSTGRES_PASSWORD` and `JWT_SECRET_KEY` with:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Use the generated PostgreSQL secret in both `POSTGRES_PASSWORD` and the
password portion of `DATABASE_URL`; use a different value for `JWT_SECRET_KEY`.
Start the database and API:

```powershell
cd backend
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
flask --app app create-admin
python app.py
```

The API rejects missing or weak JWT signing keys. PostgreSQL is only published
on localhost. On first startup the API seeds operational demo data, but no
accounts or shared default passwords. Create the first manager with
`flask --app app create-admin`; the command prompts for a password without
echoing it and requires at least 12 characters.

The dashboard consumes `/api/*` through the Vite proxy while the API is running.

## Publishing checklist

- Never commit `.env`, `.env.local`, virtual environments, uploads, dependencies,
  build output, or database files.
- If any credential has ever been published or exposed, rotate it at its
  provider; removing it from the current files is not sufficient.
- Treat `VITE_` settings as public browser configuration, not secret storage.
