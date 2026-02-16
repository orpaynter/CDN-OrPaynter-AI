# Security Policy

## Repository Status

This repository is a **demonstration/template application** for showcasing Netlify platform features with Next.js. It contains no sensitive data, credentials, or proprietary information.

## Security Audit

A comprehensive security audit was conducted on February 16, 2026. See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for the full report.

**Summary:**
- ✅ No hardcoded secrets or credentials
- ✅ No dependency vulnerabilities (npm audit: 0 issues)
- ✅ Environment variables properly managed
- ✅ Security headers implemented
- ✅ Safe for public visibility

## Reporting a Vulnerability

If you discover a security vulnerability in this repository, please:

1. **Do NOT** open a public issue
2. Email the repository maintainer directly
3. Provide details about the vulnerability:
   - Type of issue (XSS, SQL injection, etc.)
   - Location of the affected code
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## Supported Versions

This is a demonstration project. Security updates will be applied as needed to:
- Dependencies (via Renovate bot)
- Next.js framework updates
- Netlify platform changes

## Security Best Practices

This repository demonstrates several security best practices:

### 1. Environment Variables
- All sensitive configuration belongs in environment variables
- `.env*` files are excluded via `.gitignore`
- Never commit secrets to version control

### 2. Security Headers
Implemented in `middleware.js`:
```javascript
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### 3. Input Validation
- Upload functionality can be disabled via `NEXT_PUBLIC_DISABLE_UPLOADS`
- Server actions validate and sanitize data

### 4. Dependency Management
- Dependencies are regularly updated via Renovate
- `npm audit` is run to check for vulnerabilities
- Only trusted packages from npm registry are used

## Privacy Considerations

This application:
- Does NOT collect personal data
- Does NOT use analytics or tracking
- Does NOT store user credentials
- Uses Netlify Blob Store for demo data only (non-sensitive shape parameters)

## Making This Repository Private

This repository is safe to remain public. However, you should consider making it private if you:

1. Add user authentication or personal data
2. Include proprietary business logic
3. Integrate with sensitive third-party services
4. Deploy it with production secrets or real data

**How to make private:**
1. Go to repository Settings
2. Scroll to "Danger Zone"  
3. Click "Change repository visibility"
4. Select "Make private"

## Defense in Depth

Even though this is a public template, we follow security best practices:
- ✅ Principle of least privilege
- ✅ Secure by default
- ✅ No secrets in code
- ✅ Regular dependency updates
- ✅ Security headers
- ✅ Access control demonstrations

## Contact

For security concerns specific to this repository, please use GitHub's security advisory feature or contact the repository maintainer.

For Netlify platform security issues, please see [Netlify's Security Policy](https://www.netlify.com/security/).

---

**Last Updated:** February 16, 2026  
**Next Audit:** As needed when significant changes are made
