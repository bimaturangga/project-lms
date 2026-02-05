# Troubleshooting Certificate Generation

## Problem: "Empty blob received" Error

### Quick Fix (Run this first!)

**Option 1: Using PowerShell Script**

```powershell
.\restart-dev.ps1
```

**Option 2: Manual Steps**

```powershell
# 1. Kill all Node.js processes
Get-Process node | Stop-Process -Force

# 2. Remove lock file
Remove-Item -Path ".next\dev\lock" -Force -ErrorAction SilentlyContinue

# 3. Restart dev server
npm run dev
```

### Root Causes

1. **Multiple Dev Server Instances**
   - Symptom: Error "Unable to acquire lock"
   - Solution: Kill all node processes before restart

2. **Wrong Port**
   - Dev server might start on different port (3001 instead of 3000)
   - Check terminal output for actual port
   - Update browser URL accordingly

3. **Stale Browser Cache**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Try incognito mode

### Debugging Steps

1. **Check Server Logs**
   Look for these log lines in terminal:

   ```
   ================================================================================
   [Certificate API] ========== NEW REQUEST ==========
   [PDF Generator] Starting PDF generation...
   [Certificate API] PDF buffer size: XXXXX
   [Certificate API] ✓ Returning PDF response successfully
   ```

2. **Check Browser Console**
   Should show:

   ```
   Fetching certificate: xxx for user: xxx
   Response status: 200 OK
   Blob details: { type: 'application/pdf', size: XXXXX }
   ```

3. **If PDF buffer size is 0**
   - Check jsPDF is installed: `npm list jspdf`
   - Reinstall if needed: `npm install jspdf`

4. **If certificate not found**
   - Verify user has completed a course
   - Check certificate exists in database
   - Check certificate ID matches

### Still Not Working?

1. Check environment variables:

   ```powershell
   # In project root
   cat .env.local
   ```

   Make sure `NEXT_PUBLIC_CONVEX_URL` is set

2. Restart Convex dev:

   ```powershell
   npx convex dev
   ```

3. Check Convex dashboard for certificate data

4. Try accessing API directly:
   ```
   http://localhost:3000/api/certificates/generate?certificateId=XXX&userId=YYY
   ```

### Emergency Fallback

If all else fails, the system will generate a fallback PDF with error message. This means the API is working but PDF generation has issues.

Check server logs for:

```
[PDF Generator] ERROR during PDF generation
[PDF Generator] Creating fallback PDF...
```

This indicates an issue with:

- Theme color format
- Logo URL/base64 encoding
- Course/user data format
