---
description: Deploy the application to Vercel
---

# Deploy to Vercel

This workflow deploys the current Vite/React application to Vercel.

## Prerequisites
- A Vercel account (https://vercel.com)

## Steps

1.  **Build the Project**
    Ensure the project builds correctly.
    ```bash
    npm run build
    ```

2.  **Login to Vercel**
    You need to authenticate with Vercel. This will open a browser window or ask for a token.
    ```bash
    npx vercel login
    ```

3.  **Deploy**
    Run the deployment command. Follow the prompts (select default for most options).
    ```bash
    npx vercel
    ```

4.  **Production Deploy** (Optional)
    Once the preview looks good, deploy to production.
    ```bash
    npx vercel --prod
    ```
