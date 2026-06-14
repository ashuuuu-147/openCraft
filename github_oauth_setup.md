# 🛠️ GitHub OAuth Configuration Guide for OpenCraft

This guide helps you set up **Real GitHub Authentication** for both your local development environment and your production Vercel app.

The OpenCraft backend detects when these values are set and automatically switches from the simulated "Mock Login" dialog to the real GitHub authorization flow.

---

## 🌎 1. Set Up GitHub OAuth Apps

Because local development and production use different URLs, you will need to create **two separate** OAuth Applications in your GitHub settings.

### 💻 A. Create OAuth App for Local Development
1. Go to your GitHub profile settings: **GitHub ➔ Settings ➔ Developer Settings ➔ OAuth Apps** (or click [GitHub Developer Settings](https://github.com/settings/developers)).
2. Click **Register a new application** (or **New OAuth App**).
3. Fill in the fields:
   - **Application name:** `OpenCraft - Local Dev`
   - **Homepage URL:** `http://localhost:3000`
   - **Application description:** (Optional) Local development copy of OpenCraft.
   - **Authorization callback URL:** `http://localhost:3000/login`
4. Click **Register application**.
5. Copy your **Client ID**.
6. Click **Generate a new client secret** and copy the secret immediately (it won't be displayed again).

---

### 🚀 B. Create OAuth App for Production (Vercel)
1. Go to your GitHub profile settings: **GitHub ➔ Settings ➔ Developer Settings ➔ OAuth Apps** (or click [GitHub Developer Settings](https://github.com/settings/developers)).
2. Click **Register a new application** (or **New OAuth App**).
3. Fill in the fields:
   - **Application name:** `OpenCraft Production`
   - **Homepage URL:** `https://opencrafttt.vercel.app`
   - **Application description:** Production copy of OpenCraft.
   - **Authorization callback URL:** `https://opencrafttt.vercel.app/login`
4. Click **Register application**.
5. Copy your **Client ID**.
6. Click **Generate a new client secret** and copy the secret.

---

## ⚙️ 2. Configure Environment Variables

Now, add these secrets to your app configuration so the backend can use them.

### 💻 A. Local Development
1. Open the [backend/.env](file:///d:/startup/backend/.env) file.
2. Fill in the variables you copied from your **Local Dev** app:
   ```env
   GITHUB_CLIENT_ID="your_local_client_id_here"
   GITHUB_CLIENT_SECRET="your_local_client_secret_here"
   ```
3. Restart your local server (`npm run dev`). The frontend login button will now redirect to the real GitHub login page!

### 🚀 B. Production Deployment (Railway)
1. Go to your **Railway Dashboard** and click on your backend service.
2. Go to the **Variables** tab.
3. Add/edit the following variables with the credentials from your **Production** app:
   - `GITHUB_CLIENT_ID` = `your_production_client_id_here`
   - `GITHUB_CLIENT_SECRET` = `your_production_client_secret_here`
4. Railway will automatically redeploy the backend with the new variables. Once redeployed, the login button on `https://opencrafttt.vercel.app` will use real GitHub OAuth!

---

## 🔍 3. Verification

Once variables are set, OpenCraft handles the rest:
- **Mock Login fallback** remains active whenever credentials are not configured.
- Clicking the **Connect with GitHub OAuth** button redirects to GitHub's authorization screen.
- On authorization, GitHub sends you back to the callback URL (`/login?code=...`), and the app exchanges it automatically for a JWT token, signing you in.
