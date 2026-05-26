# Deployment Guide

This guide will help you deploy **Hi Bot Code** to your custom domain `https://code.hibot.space`.

## Prerequisites

- A GitHub account (for most deployment options)
- Access to your domain's DNS settings

---

## Option 1: GitHub Pages (Recommended)

**Easiest and free, perfect for static sites.**

### Steps:

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hi Bot Code"
   git branch -M main
   git remote add origin https://github.com/yourusername/Hi Bot Code.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from branch `main` → `/` (root)
   - Click Save

3. **Configure Custom Domain:**
   - In the same Pages settings, add `code.hibot.space` to the Custom domain field
   - GitHub will automatically use your `CNAME` file

4. **Update DNS Settings:**
   - Go to your domain registrar (where you manage DNS for `hibot.space` or your subdomain)
   - Add these DNS records:
     ```
     Type: A
     Name: @ (or leave blank)
     Value: 185.199.108.153
     
     Type: A
     Name: @ (or leave blank)
     Value: 185.199.109.153
     
     Type: A
     Name: @ (or leave blank)
     Value: 185.199.110.153
     
     Type: A
     Name: @ (or leave blank)
     Value: 185.199.111.153
     
     Type: CNAME
     Name: html
     Value: yourusername.github.io
     ```

5. **Enable HTTPS:**
   - Back in GitHub Pages settings
   - Check "Enforce HTTPS" (wait a few minutes for the certificate)

**Done!** Your site will be live at `https://code.hibot.space` in 5-10 minutes.

---

## Option 2: Netlify

**Super fast deployment with automatic HTTPS.**

### Steps:

1. **Push to GitHub** (same as Option 1, step 1)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Build settings:
     - Build command: (leave empty)
     - Publish directory: (leave empty or use `.`)
   - Click "Deploy site"

3. **Configure Custom Domain:**
   - Site settings → Domain management
   - Add custom domain: `code.hibot.space`
   - Netlify will provide DNS records

4. **Update DNS Settings:**
   - Add the CNAME record Netlify provides:
     ```
     Type: CNAME
     Name: html
     Value: [your-site].netlify.app
     ```

5. **HTTPS:** Automatically enabled by Netlify

**Done!** Live in minutes.

---

## Option 3: Vercel

**Great for developers, instant deployments.**

### Steps:

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   cd /workspaces/Hi Bot Code
   vercel
   ```
   Follow the prompts.

3. **Or deploy via GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - **Root Directory:** Either leave the default **repository root** (a root `vercel.json` installs and builds inside `hibot-code` and sets **Output Directory** to `hibot-code`) **or** set **Project Settings → General → Root Directory** to `hibot-code` for a simpler layout (then only `hibot-code/vercel.json` applies).
   - **Framework Preset:** Should be **Other** (this repo is static HTML + a small Rollup bundle, not Next.js). `vercel.json` sets `"framework": null` so Vercel does not run `next build` or require `next` in `package.json`.
   - Click **Deploy**

4. **Configure Custom Domain:**
   - Project Settings → Domains
   - Add `code.hibot.space`
   - Vercel provides DNS records

5. **Update DNS Settings:**
   - Add the CNAME record:
     ```
     Type: CNAME
     Name: html
     Value: cname.vercel-dns.com
     ```

**Done!** Deployed with automatic HTTPS.

---

## Option 4: Cloudflare Pages

**Fast global CDN with great performance.**

### Steps:

1. **Push to GitHub** (same as Option 1, step 1)

2. **Deploy to Cloudflare Pages:**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect to GitHub
   - Build settings: (leave empty for static site)
   - Deploy

3. **Configure Custom Domain:**
   - Project → Custom domains
   - Add `code.hibot.space`
   - If your domain is on Cloudflare, DNS is automatic
   - Otherwise, add CNAME record provided

**Done!** Fast global delivery with Cloudflare's CDN.

---

## DNS Configuration Summary

For most providers, you'll need to add:

```
Type: CNAME
Name: html
Value: [your-hosting-provider's-domain]
TTL: 3600 (or Auto)
```

### DNS Propagation

- DNS changes can take 5 minutes to 48 hours to propagate globally
- Usually complete within 15-30 minutes
- Check status: [dnschecker.org](https://dnschecker.org)

---

## Testing Your Deployment

1. **Check HTTPS:** Visit `https://code.hibot.space` (ensure https://)
2. **Test functionality:**
   - Change text in the Edit Panel
   - Update colors
   - Click "Update Code from Panel"
   - Verify live preview updates
   - Test "Pop-out" button
3. **Mobile test:** Check on phone/tablet
4. **Performance test:** [PageSpeed Insights](https://pagespeed.web.dev/)

---

## Troubleshooting

### Site not loading?
- Wait 15-30 minutes for DNS propagation
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check DNS with: `nslookup code.hibot.space`

### HTTPS not working?
- Wait for SSL certificate provisioning (5-30 minutes)
- Ensure "Enforce HTTPS" is enabled
- Check for mixed content errors in browser console

### Changes not appearing?
- Clear CDN cache in your hosting dashboard
- Hard refresh browser (Ctrl+F5)
- Check deployment logs for errors

---

## Updating Your Site

After making changes:

```bash
git add .
git commit -m "Update: description of changes"
git push
```

Most platforms auto-deploy on push. Check your hosting dashboard for build status.

---

## Performance Tips

Your site is already optimized:
- ✅ Single HTML file (no external requests)
- ✅ Minimal CSS/JS
- ✅ No dependencies
- ✅ No tracking scripts

**Expected performance:** 100/100 on PageSpeed Insights!

---

## Support

- **GitHub Issues:** [Create an issue](https://github.com/yourusername/Hi Bot Code/issues)
- **DNS Help:** Contact your domain registrar's support
- **Hosting Help:** Check your hosting provider's documentation

---

**Good luck with your deployment! 🚀**
