# Vercel Deployment Checklist

This repo is configured for a single Vercel project:

- React frontend: `school-erp`
- Express backend: one serverless function at `api/index.js`
- API URL in production: `/api`

## Vercel project settings

Use the repository root as the Vercel root directory.

Set these build settings:

- Install Command: `npm install`
- Build Command: `npm run vercel-build`
- Output Directory: `school-erp/build`

Do not set `REACT_APP_API_URL` in Production. The frontend already uses `/api` when built for production.

## Required environment variables

Add these in Vercel Project Settings -> Environment Variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`

Apply them to Production, Preview, and Development if you want all deployments to work.

## MongoDB Atlas access

If you use MongoDB Atlas, allow Vercel serverless functions to connect.

For the simplest setup, add this IP access entry in Atlas:

```text
0.0.0.0/0
```

Use a strong database username/password if you do this.

## Function count

The Hobby plan limit applies to bundled Vercel Functions. This project uses one Node.js function:

```text
api/index.js
```

All Express routes are handled inside that one function, so routes like `/api/auth/login`, `/api/students`, and `/api/extra-fees` do not create separate Vercel functions.

## Health check

After deployment, test:

```text
https://your-domain.vercel.app/api/health
```

Then test login from:

```text
https://your-domain.vercel.app/login
```
