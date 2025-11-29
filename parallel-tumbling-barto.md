# Google Sign-In Integration with Keycloak - Implementation Plan

## ✅ USER SYNCHRONIZATION UPDATE (2025-11-29)

**RESOLVED:** Users are now automatically created/updated in the backend database on every login.

**Implementation:**
- Modified [AuthCallback.jsx:65-69](src/pages/AuthCallback.jsx#L65-L69) to call `getCurrentUser()` after token exchange
- `getCurrentUser()` calls `/api/account` endpoint which triggers backend auto-sync
- Backend [UserService.syncUserWithIdP()](../../el-api/src/main/java/com/oussamabenberkane/espritlivre/service/UserService.java#L101-L140) creates/updates user records
- User profile data (firstName, lastName, email, imageUrl, etc.) synced from Keycloak to PostgreSQL database

**Flow:**
1. User authenticates with Google → Keycloak creates account
2. Frontend receives tokens
3. **Frontend calls `/api/account`** (NEW STEP)
4. Backend auto-syncs user to database
5. User can now place orders, save favorites, etc.

---

# Google Sign-In Integration with Keycloak - Implementation Plan

## Executive Summary

Replace the temporary password-based authentication with real Google Sign-In using Keycloak as an identity broker. This implementation uses OAuth2 Authorization Code Flow with PKCE for security, removes password grant entirely, and keeps the implementation simple with frontend-only logout and no automatic token refresh.

## Overview

Replace the temporary password-based authentication with real Google Sign-In using Keycloak as an identity broker. Both login and registration will use Google OAuth through Keycloak's Identity Provider integration.

**Key Decisions Made:**
- ✅ Create new Google Cloud Project from scratch
- ✅ Remove password grant immediately (clean break)
- ✅ Frontend-only logout (simple and fast)
- ✅ No automatic token refresh (keep it simple)
- ✅ Error messages with automatic redirect to sign-in page
- ✅ Production redirect URIs to be configured during deployment

## Recommended Approach

**Manual OAuth2 Authorization Code Flow with PKCE** (without keycloak-js adapter)

### Rationale:
- **Lightweight**: No heavy Keycloak client library dependencies (~50KB savings)
- **Full Control**: Complete visibility into OAuth flow for debugging and customization
- **Existing Compatibility**: Maintains current localStorage token keys and `authStateChanged` event system
- **Modern Security**: PKCE (Proof Key for Code Exchange) provides security without exposing client secrets
- **Framework Agnostic**: Pure JavaScript implementation that's easy to understand and maintain
- **Simple & Clean**: Remove password grant immediately, frontend-only logout, no complex token refresh

## Architecture

### OAuth Flow Diagram
```
User clicks "Continue with Google"
  ↓
Generate PKCE code_verifier & code_challenge
  ↓
Redirect to Keycloak: /auth?kc_idp_hint=google
  ↓
Keycloak redirects to Google OAuth
  ↓
User authenticates with Google
  ↓
Google → Keycloak → Creates/links user account
  ↓
Keycloak redirects to /auth/callback?code=XXX&state=YYY
  ↓
Exchange code for tokens (with PKCE code_verifier)
  ↓
Store tokens, dispatch authStateChanged event
  ↓
Navigate to saved redirect URL or home
```

---

## PART 1: Backend Configuration

### 1.1 Create Google Cloud Project and Obtain OAuth2 Credentials

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: "Esprit Livre"
4. Click **Create**

**Step 2: Configure OAuth Consent Screen**
1. Navigate to **APIs & Services > OAuth consent screen**
2. User Type: **External**
3. Click **Create**
4. Fill in required fields:
   - App name: "Esprit Livre"
   - User support email: [your-email@example.com]
   - Developer contact email: [your-email@example.com]
5. Click **Save and Continue**
6. Scopes: Click **Save and Continue** (use default scopes)
7. Test users (optional for development): Add your Gmail for testing
8. Click **Save and Continue**
9. Summary: Review and click **Back to Dashboard**

**Step 3: Create OAuth 2.0 Client ID**
1. Navigate to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "Esprit Livre Web Client"
5. Authorized JavaScript origins:
   ```
   http://localhost:9080
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:9080/realms/jhipster/broker/google/endpoint
   ```
   (Note: You'll add production URLs when deploying)
7. Click **Create**
8. **IMPORTANT:** Copy and save the **Client ID** and **Client Secret** - you'll need these for Keycloak configuration

### 1.2 Configure Google Identity Provider in Keycloak

**Access Keycloak Admin Console:**
- URL: `http://localhost:9080/admin`
- Login: admin/admin
- Realm: jhipster

**Add Google IDP:**
1. Navigate to **Identity Providers**
2. Click **Add provider > Google**
3. Configure:
   - **Alias:** `google`
   - **Enabled:** ON
   - **Store Tokens:** ON
   - **Trust Email:** ON
   - **Client ID:** [Your Google Client ID]
   - **Client Secret:** [Your Google Client Secret]
   - **Default Scopes:** `openid profile email`
4. Click **Save**
5. Note the **Redirect URI** (should be `http://localhost:9080/realms/jhipster/broker/google/endpoint`)

**Add Attribute Mappers (Optional but Recommended):**
1. Go to **Identity Providers > google > Mappers**
2. Add these mappers:
   - **Email:** `email` → user attribute `email`
   - **First Name:** `given_name` → user attribute `firstName`
   - **Last Name:** `family_name` → user attribute `lastName`
   - **Picture:** `picture` → user attribute `picture`

### 1.3 Update Keycloak Client Configuration

**Navigate to:** Clients > web_app

**Verify/Update Settings:**
- **Standard Flow Enabled:** ON
- **Direct Access Grants Enabled:** OFF (disable password grant)
- **Valid Redirect URIs:**
  ```
  http://localhost:5173/*
  http://localhost:5173/auth/callback
  ```
- **Valid Post Logout Redirect URIs:**
  ```
  http://localhost:5173/*
  ```
- **Web Origins:** `http://localhost:5173`

**Advanced Settings:**
- **Proof Key for Code Exchange Code Challenge Method:** S256 (PKCE)

### 1.4 Spring Boot Verification

**No code changes needed** - existing OAuth2 configuration in application.yml handles Google IDP automatically through Keycloak brokering.

---

## PART 2: Frontend Implementation

### 2.1 New Files to Create

#### File 1: `src/services/oauthService.js`
**Purpose:** Core OAuth2 Authorization Code Flow with PKCE implementation

**Key Functions:**
- `generatePKCE()` - Creates PKCE code_verifier and code_challenge
- `initiateGoogleLogin(redirectUri)` - Starts OAuth flow, redirects to Keycloak
- `exchangeCodeForTokens(code, redirectUri)` - Exchanges authorization code for tokens
- `validateState(receivedState)` - CSRF protection via state validation
- `refreshAccessToken(refreshToken)` - Refreshes expired access tokens
- `logoutFromKeycloak(idToken, redirectUri)` - Performs full Keycloak logout

**Implementation Details:**
- PKCE: Generate 64-character random code_verifier, SHA-256 hash to code_challenge
- State: Generate 32-character random state for CSRF protection
- Store code_verifier and state in sessionStorage (cleared after token exchange)
- Authorization URL includes `kc_idp_hint=google` to skip Keycloak login page

#### File 2: `src/pages/AuthCallback.jsx`
**Purpose:** Handles OAuth redirect, validates callback, exchanges code for tokens

**Flow:**
1. Extract `code`, `state`, `error` from URL query parameters
2. Validate state parameter (CSRF protection)
3. Exchange code for tokens using PKCE code_verifier
4. Store tokens in localStorage (`el_access_token`, `el_refresh_token`, `el_id_token`)
5. Dispatch `authStateChanged` custom event
6. Redirect to saved URL or home page

**Error Handling:**
- OAuth errors (user denied permissions)
- Invalid state (possible CSRF attack)
- Token exchange failures
- All errors show message and redirect to /auth after 3 seconds

### 2.2 Files to Modify

#### File 3: `src/services/authService.js`
**Changes:**
- Add `ID_TOKEN_KEY = 'el_id_token'` constant
- Add `getIdToken()` function
- **Simplify `logout()`** to only clear localStorage and dispatch event (frontend-only logout)
- **Remove `loginWithPassword()` function entirely** (clean break from password grant)
- **Remove `KEYCLOAK_CLIENT_SECRET`** from imports (no longer needed)

**Backward Compatibility:**
- Keep all existing function signatures except loginWithPassword
- Keep localStorage keys unchanged
- Keep `authStateChanged` event unchanged

#### File 4: `src/pages/SignIn.jsx`
**Changes:**
- Import `initiateGoogleLogin` from oauthService
- **Remove** `handleTemporarySignIn` function entirely
- **Update** `handleGoogleSignIn`:
  ```javascript
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await initiateGoogleLogin();
      // Note: This will redirect, so code after won't execute
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  ```
- Remove any reference to password grant flow

#### File 5: `src/pages/SignUp.jsx`
**Changes:**
- Import `initiateGoogleLogin` from oauthService
- Add loading and error state management
- **Update** `handleGoogleSignUp` to call `initiateGoogleLogin()`
- Same implementation as SignIn (Keycloak handles account creation automatically)

#### File 6: `src/App.jsx`
**Changes:**
- Import `AuthCallback` component
- Add route: `<Route path="/auth/callback" element={<AuthCallback />} />`

### 2.3 Token Refresh (Simplified Approach)

**Note:** We'll keep token refresh simple for now. If tokens expire, users will be logged out and need to sign in again. This is simpler and avoids complex token management logic.

**Future Enhancement (Optional):**
If you want to add automatic token refresh later, you can implement an interceptor in `apiClient.js` that catches 401 responses and refreshes tokens. For now, we'll skip this complexity.

---

## PART 3: Integration Flows

### 3.1 First-Time Google Sign-In (Registration)
1. User clicks "Continue with Google" on SignUp page
2. PKCE parameters generated and stored in sessionStorage
3. Redirect to Keycloak with `kc_idp_hint=google`
4. Keycloak redirects to Google OAuth
5. User authenticates with Google
6. Google redirects back to Keycloak
7. **Keycloak creates new user** with Google email/name (auto-registration)
8. Keycloak redirects to `/auth/callback?code=XXX`
9. Code exchanged for tokens with PKCE verification
10. User logged in, redirected to home

### 3.2 Returning User Login
- Same flow as registration
- Keycloak recognizes existing user
- Skip account creation step
- Direct login

### 3.3 Token Refresh (Simplified)
- Access tokens expire in 5 minutes (configurable in Keycloak)
- If token expires, user will be logged out automatically on next API call
- No automatic refresh implemented (keeping it simple)
- User will need to sign in again with Google (quick and seamless)

### 3.4 Logout (Frontend-Only)
1. Clear localStorage tokens (el_access_token, el_refresh_token, el_id_token)
2. Dispatch `authStateChanged` event
3. Redirect to home page or /auth
4. **Note:** Session remains active on Keycloak/Google, but user appears logged out in frontend
5. Next sign-in will be fast (Google may auto-authenticate if still logged in)

---

## PART 4: Security Features

### PKCE (Proof Key for Code Exchange)
- Prevents authorization code interception attacks
- No client secret exposed in frontend
- Code verifier stored in sessionStorage, cleared after use

### State Parameter
- CSRF protection
- Random 32-character string
- Validated on callback

### Token Storage
- Access token, refresh token, ID token in localStorage
- Keys: `el_access_token`, `el_refresh_token`, `el_id_token`
- Custom event system (`authStateChanged`) for cross-tab authentication sync

---

## PART 5: Testing Strategy

### Backend Testing
1. Verify Google IDP appears on Keycloak login page
2. Test manual login via Keycloak Admin Console
3. Verify user created in Keycloak Users section
4. Check user attributes (email, firstName, lastName)

### Frontend Testing
1. **Sign In Flow:**
   - Click "Continue with Google" → Redirects to Google
   - Authenticate → Redirects to /auth/callback
   - Verify tokens in localStorage
   - Verify Navbar shows authenticated state

2. **Sign Up Flow:**
   - Same as sign in (Keycloak handles registration)
   - Verify new user created

3. **Protected Routes:**
   - Access protected route while logged out → Redirect to /auth
   - Sign in → Redirect back to protected route

4. **Token Refresh:**
   - Wait for token expiration or manually expire
   - Make API call → Auto-refresh → Success

5. **Logout:**
   - Click logout → Clear tokens → Redirect to Keycloak logout → Redirect home

6. **Error Handling:**
   - Deny Google permissions → Error message → Redirect to /auth
   - Invalid state parameter → Error message
   - Network errors → Graceful failure

---

## PART 6: Implementation Checklist

### Backend
- [ ] Obtain Google OAuth credentials (Client ID & Secret)
- [ ] Configure Google IDP in Keycloak Admin Console
- [ ] Add attribute mappers for email, firstName, lastName
- [ ] Update web_app client redirect URIs
- [ ] Enable PKCE in web_app client
- [ ] Disable Direct Access Grants in web_app client
- [ ] Test Google login via Keycloak Admin Console

### Frontend
- [ ] Create `src/services/oauthService.js`
- [ ] Create `src/pages/AuthCallback.jsx`
- [ ] Update `src/services/authService.js` (ID token, refresh, logout)
- [ ] Update `src/pages/SignIn.jsx` (remove password grant)
- [ ] Update `src/pages/SignUp.jsx` (add Google OAuth)
- [ ] Update `src/App.jsx` (add callback route)
- [ ] Test complete sign-in flow
- [ ] Test complete sign-up flow
- [ ] Test logout flow
- [ ] Test protected route redirection
- [ ] Test token refresh (optional)

---

## PART 7: Implementation Strategy

### Single-Phase Clean Implementation
- Create new OAuth service files
- Update existing auth service (remove password grant entirely)
- Update SignIn and SignUp pages
- Add callback route
- Test thoroughly
- Deploy

**Rationale:** Since you want to keep everything simple and remove password grant immediately (Option A), we'll implement Google OAuth as the only authentication method from the start. This avoids complexity of maintaining both methods.

---

## Critical Files Summary

### New Files (Create)
1. `src/services/oauthService.js` - OAuth2 PKCE implementation
2. `src/pages/AuthCallback.jsx` - OAuth callback handler

### Modified Files
1. **[src/services/authService.js](src/services/authService.js)** - Add ID token storage, simplify logout, remove password grant
2. **[src/pages/SignIn.jsx](src/pages/SignIn.jsx)** - Replace password grant with Google OAuth
3. **[src/pages/SignUp.jsx](src/pages/SignUp.jsx)** - Add Google OAuth for registration
4. **[src/App.jsx](src/App.jsx)** - Add /auth/callback route

### Configuration Required
1. **Google Cloud Console** - Create project and OAuth credentials
2. **Keycloak Admin Console** - Add Google IDP, configure mappers
3. **Keycloak Client (web_app)** - Update redirect URIs, enable PKCE, disable Direct Access Grants

---

## Expected Outcomes

1. Users can sign in with their Google account
2. New users automatically registered via Google sign-in
3. Secure OAuth2 flow with PKCE (no client secret in frontend)
4. Simple token management (no automatic refresh)
5. Frontend-only logout (quick and simple)
6. Existing auth-dependent features continue working (favorites, cart, profile)
7. Clean codebase with password grant completely removed

---

## Troubleshooting

### "Redirect URI mismatch"
- Verify exact match between frontend callback URL and Keycloak client config
- Check: `http://localhost:5173/auth/callback`

### "Invalid state parameter"
- Clear sessionStorage and try again
- Check browser console for errors

### "Token exchange failed"
- Verify PKCE enabled in Keycloak client
- Check sessionStorage for code_verifier
- Verify redirect_uri matches exactly

### Google button does nothing
- Check browser console for errors
- Verify crypto.subtle API available (requires HTTPS or localhost)
- Check PKCE generation function
