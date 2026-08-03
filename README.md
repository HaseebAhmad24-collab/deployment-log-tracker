# Deployment Log Tracker

Full-stack app for logging deployments: a message plus a screenshot, stored in
MySQL (RDS) and S3. List view generates fresh signed S3 URLs on every request.

## Project structure

```
/backend
  /src
    config.js       # loads all secrets from process.env (see note below)
    db.js           # MySQL pool + schema bootstrap
    s3.js           # S3 upload/delete/signed-url helpers
    routes/logs.js  # POST/GET/DELETE /api/logs
    app.js          # Express app (CORS, routes, error handling)
    server.js       # entry point
  .env.example
  package.json
/frontend
  /src
    App.jsx
    components/AddLogForm.jsx
    components/LogList.jsx
    api.js
  .env.example
  package.json
```

## Requirements

- Node.js 18+
- A MySQL database (e.g. AWS RDS) reachable from the machine running the backend
- An S3 bucket and AWS credentials (IAM user or role) with `s3:PutObject`,
  `s3:GetObject`, `s3:DeleteObject` on that bucket

The backend creates the `deployment_logs` table automatically on startup if it
doesn't exist, so no manual migration is required (the DB itself must already
exist).

## Setup — backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env with your real values
npm start          # or: npm run dev (auto-restarts on file changes)
```

Backend listens on `PORT` (default `5000`).

## Setup — frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
npm run dev
```

Frontend runs on `http://localhost:5173` by default (Vite).

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DB_HOST` | MySQL/RDS host endpoint |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `AWS_REGION` | AWS region the S3 bucket lives in |
| `AWS_ACCESS_KEY_ID` | AWS access key (optional — omit to use the default credential provider chain, e.g. an IAM role) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (optional, same as above) |
| `S3_BUCKET_NAME` | S3 bucket used to store uploaded images |
| `PORT` | Port the Express server listens on (default `5000`) |
| `CORS_ORIGIN` | Origin allowed to call the API (the frontend's URL) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:5000` |

## Running locally

1. Start MySQL/RDS and make sure the database in `DB_NAME` exists.
2. Start the backend: `cd backend && npm start`.
3. Start the frontend: `cd frontend && npm run dev`.
4. Open `http://localhost:5173`, add a log with a message + image, confirm it
   appears in the list with a working image, then delete it and confirm it's
   gone from both the list and (if you check) the S3 bucket.

## API documentation

Base path: `/api/logs`

### `POST /api/logs`

Add a deployment log entry.

- **Request**: `multipart/form-data`
  - `message` (text, required, non-empty)
  - `image` (file, required, jpg/jpeg/png only, max 5MB)
- **Response** `201 Created`:
  ```json
  {
    "id": 1,
    "message": "Deployed backend v1.2.3 to production",
    "image_key": "b3f1c2a4-....jpg",
    "created_at": "2026-08-02T10:00:00.000Z"
  }
  ```
- **Errors**: `400` (missing message/image, invalid file type, file too large), `500`

### `GET /api/logs`

List all deployment logs, most recent first, each with a freshly generated
signed S3 URL (expires in 1 hour).

- **Response** `200 OK`:
  ```json
  [
    {
      "id": 1,
      "message": "Deployed backend v1.2.3 to production",
      "image_url": "https://<bucket>.s3.<region>.amazonaws.com/....jpg?X-Amz-Signature=...",
      "created_at": "2026-08-02T10:00:00.000Z"
    }
  ]
  ```
- **Errors**: `500`

### `DELETE /api/logs/:id`

Delete a log entry: removes the S3 object and the database row.

- **Response** `200 OK`:
  ```json
  { "success": true, "message": "Deployment log deleted" }
  ```
- **Errors**: `404` (id not found), `500`

## Secrets Manager in production

`backend/src/config.js` is the single place that resolves configuration. It
currently reads everything from `process.env` (populated by `.env` locally,
or by real environment variables set via PM2/systemd in production). To
switch to AWS Secrets Manager:

1. In `config.js`, replace the body of `loadSecrets()` with a call to
   `SecretsManagerClient` / `GetSecretValueCommand` to fetch a JSON secret
   containing the same keys (DB host/user/password/name, AWS region, bucket
   name).
2. Merge the returned values into the same `config` object shape that's
   returned today.

Because every other module (`db.js`, `s3.js`, routes) only ever imports
`config` from `config.js` and never reads `process.env` directly, no other
file needs to change.

## Notes

- No Docker/containers — run directly with `node`/`npm`. In production, use
  PM2 or a systemd unit to keep the backend process alive.
- Images are never served via a public/permanent S3 URL — only the
  `image_key` is stored, and a signed URL is generated fresh on each
  `GET /api/logs` call.
