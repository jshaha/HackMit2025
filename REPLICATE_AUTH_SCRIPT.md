# Script to Replicate Supabase Authentication in HTML Project

Copy and paste this entire script into Cursor for your other project to replicate the exact sign-in experience.

## Setup Instructions

1. **Install Supabase JS library** (add to your HTML files):
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```

2. **Set up environment variables** - Create a `.env` file or configure these in your hosting platform:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Configure Supabase OAuth redirect URL**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > URL Configuration
   - Add your site's URL to "Redirect URLs" (e.g., `http://localhost:3000`, `https://yourdomain.com`)

## Files to Create/Update

### 1. Create `auth.js` - Core Authentication Logic

```javascript
// auth.js - Supabase Authentication Module
class SupabaseAuth {
  constructor() {
    // Initialize Supabase client
    // Replace these with your actual Supabase credentials
    this.supabaseUrl = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
    this.supabaseAnonKey = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
    
    if (!this.supabaseUrl || !this.supabaseAnonKey || 
        this.supabaseUrl === 'YOUR_SUPABASE_URL' || 
        this.supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
      console.error('❌ Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
    
    this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
    this.user = null;
    this.session = null;
    this.loading = true;
    this.error = null;
    this.listeners = [];
    
    this.init();
  }
  
  init() {
    // Get initial session
    this.supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Session error:', error);
        this.error = error;
      } else {
        this.session = session;
        this.user = session?.user ?? null;
        console.log('✅ Initial session loaded:', this.user?.email);
      }
      this.loading = false;
      this.notifyListeners();
    });
    
    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      this.session = session;
      this.user = session?.user ?? null;
      this.loading = false;
      this.notifyListeners();
    });
  }
  
  // Subscribe to auth state changes
  onAuthStateChange(callback) {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.user, this.session, this.loading);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
  
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.user, this.session, this.loading);
    });
  }
  
  async signUp(email, password) {
    this.loading = true;
    this.error = null;
    
    console.log('📝 Signing up user:', { email });
    
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    
    console.log('📝 Sign up result:', { data, error });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      this.error = error;
    } else {
      console.log('✅ Sign up successful');
    }
    
    this.loading = false;
    this.notifyListeners();
    return { data, error };
  }
  
  async signIn(email, password) {
    this.loading = true;
    this.error = null;
    
    console.log('🔑 Signing in user:', { email });
    
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔑 Sign in result:', { data, error });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      this.error = error;
    } else {
      console.log('✅ Sign in successful');
    }
    
    this.loading = false;
    this.notifyListeners();
    return { data, error };
  }
  
  async signOut() {
    this.loading = true;
    this.error = null;
    
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      this.error = error;
    } else {
      console.log('✅ Sign out successful');
    }
    
    this.loading = false;
    this.notifyListeners();
    return { error };
  }
  
  async signInWithGoogle() {
    this.loading = true;
    this.error = null;
    
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    
    if (error) {
      console.error('❌ Google sign in error:', error);
      this.error = error;
      this.loading = false;
      this.notifyListeners();
    }
    // Note: OAuth redirects, so we don't set loading to false here
    
    return { data, error };
  }
  
  get isAuthenticated() {
    return !!this.user;
  }
}

// Create global auth instance
const auth = new SupabaseAuth();
```

### 2. Create `login.html` - Login Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .auth-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      padding: 40px;
      width: 100%;
      max-width: 420px;
    }
    
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .auth-header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .auth-header p {
      color: #6b7280;
      font-size: 14px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #9ca3af;
    }
    
    .form-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .btn-outline {
      background: white;
      color: #374151;
      border: 1px solid #d1d5db;
    }
    
    .btn-outline:hover:not(:disabled) {
      background: #f9fafb;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
      border: 1px solid #fecaca;
    }
    
    .divider {
      display: flex;
      align-items: center;
      margin: 24px 0;
      color: #9ca3af;
      font-size: 12px;
      text-transform: uppercase;
    }
    
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }
    
    .divider span {
      padding: 0 12px;
    }
    
    .toggle-link {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #6b7280;
    }
    
    .toggle-link button {
      background: none;
      border: none;
      color: #3b82f6;
      cursor: pointer;
      text-decoration: underline;
      font-size: 14px;
    }
    
    .toggle-link button:hover {
      color: #2563eb;
    }
    
    .google-icon {
      width: 18px;
      height: 18px;
    }
    
    .loading {
      opacity: 0.6;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="auth-container" id="authContainer">
    <div class="auth-header">
      <h1 id="authTitle">Sign In</h1>
      <p id="authSubtitle">Welcome back! Please sign in to your account.</p>
    </div>
    
    <form id="authForm" class="loading">
      <div id="errorMessage" class="error-message" style="display: none;"></div>
      
      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <input 
            type="email" 
            id="email" 
            class="form-input" 
            placeholder="Enter your email"
            required
          />
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <div class="input-wrapper">
          <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input 
            type="password" 
            id="password" 
            class="form-input" 
            placeholder="Enter your password"
            required
          />
        </div>
      </div>
      
      <button type="submit" class="btn btn-primary" id="submitBtn">
        Sign In
      </button>
    </form>
    
    <div class="divider">
      <span>Or continue with</span>
    </div>
    
    <button class="btn btn-outline" id="googleBtn">
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Google
    </button>
    
    <div class="toggle-link">
      <span id="toggleText">Don't have an account? </span>
      <button type="button" id="toggleBtn">Sign up</button>
    </div>
  </div>
  
  <script>
    // Set your Supabase credentials here or via environment variables
    window.SUPABASE_URL = 'YOUR_SUPABASE_URL';
    window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  </script>
  <script src="auth.js"></script>
  <script>
    // Login page logic
    let isSignUp = false;
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const googleBtn = document.getElementById('googleBtn');
    const toggleBtn = document.getElementById('toggleBtn');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const toggleText = document.getElementById('toggleText');
    const errorMessage = document.getElementById('errorMessage');
    const authContainer = document.getElementById('authContainer');
    
    // Update UI based on auth state
    auth.onAuthStateChange((user, session, loading) => {
      if (loading) {
        authForm.classList.add('loading');
        submitBtn.disabled = true;
        googleBtn.disabled = true;
      } else {
        authForm.classList.remove('loading');
        submitBtn.disabled = false;
        googleBtn.disabled = false;
        
        if (user) {
          // User is authenticated, redirect to main page
          window.location.href = 'index.html';
        }
      }
    });
    
    // Handle form submission
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.style.display = 'none';
      
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      if (!email || !password) {
        showError('Please fill in all fields');
        return;
      }
      
      submitBtn.disabled = true;
      submitBtn.textContent = isSignUp ? 'Signing up...' : 'Signing in...';
      
      try {
        const { error } = isSignUp
          ? await auth.signUp(email, password)
          : await auth.signIn(email, password);
        
        if (error) {
          showError(`${error.message} (Code: ${error.status || 'unknown'})`);
          submitBtn.disabled = false;
          submitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
        } else {
          // Success - redirect will happen via auth state change
          emailInput.value = '';
          passwordInput.value = '';
        }
      } catch (err) {
        showError(`Unexpected error: ${err.message || 'Unknown error'}`);
        submitBtn.disabled = false;
        submitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
      }
    });
    
    // Handle Google sign in
    googleBtn.addEventListener('click', async () => {
      errorMessage.style.display = 'none';
      googleBtn.disabled = true;
      googleBtn.textContent = 'Redirecting...';
      
      const { error } = await auth.signInWithGoogle();
      if (error) {
        showError(error.message);
        googleBtn.disabled = false;
        googleBtn.innerHTML = `
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        `;
      }
    });
    
    // Toggle between sign in and sign up
    toggleBtn.addEventListener('click', () => {
      isSignUp = !isSignUp;
      authTitle.textContent = isSignUp ? 'Create Account' : 'Sign In';
      authSubtitle.textContent = isSignUp 
        ? 'Create a new account to get started.' 
        : 'Welcome back! Please sign in to your account.';
      submitBtn.textContent = isSignUp ? 'Sign Up' : 'Sign In';
      toggleText.textContent = isSignUp ? 'Already have an account? ' : "Don't have an account? ";
      toggleBtn.textContent = isSignUp ? 'Sign in' : 'Sign up';
      errorMessage.style.display = 'none';
      emailInput.value = '';
      passwordInput.value = '';
    });
    
    function showError(message) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
  </script>
</body>
</html>
```

### 3. Update `index.html` - Main Page with Auth

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your App</title>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .user-email {
      font-size: 14px;
      color: #6b7280;
    }
    
    .btn {
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background: white;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .btn:hover {
      background: #f9fafb;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .btn-primary:hover {
      background: #2563eb;
    }
    
    .main-content {
      padding: 40px 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .auth-section {
      text-align: center;
      padding: 60px 20px;
    }
    
    .auth-section h1 {
      font-size: 32px;
      margin-bottom: 16px;
      color: #1a1a1a;
    }
    
    .auth-section p {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div id="app">
    <!-- Header will be populated by JavaScript -->
    <header class="header" id="header" style="display: none;">
      <h1>Your App</h1>
      <div class="user-info" id="userInfo"></div>
    </header>
    
    <!-- Main content -->
    <main class="main-content" id="mainContent">
      <div class="auth-section">
        <h1>Welcome</h1>
        <p>Please sign in to continue</p>
        <button class="btn btn-primary" onclick="window.location.href='login.html'">
          Sign In
        </button>
      </div>
    </main>
  </div>
  
  <script>
    // Set your Supabase credentials here or via environment variables
    window.SUPABASE_URL = 'YOUR_SUPABASE_URL';
    window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
  </script>
  <script src="auth.js"></script>
  <script>
    // Main page logic
    const header = document.getElementById('header');
    const userInfo = document.getElementById('userInfo');
    const mainContent = document.getElementById('mainContent');
    
    // Update UI based on auth state
    auth.onAuthStateChange((user, session, loading) => {
      if (loading) {
        // Show loading state if needed
        return;
      }
      
      if (user) {
        // User is authenticated
        header.style.display = 'flex';
        userInfo.innerHTML = `
          <span class="user-email">Welcome, ${user.email}</span>
          <button class="btn" onclick="handleLogout()">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        `;
        mainContent.innerHTML = `
          <h2>Your Content Here</h2>
          <p>User is authenticated: ${user.email}</p>
        `;
      } else {
        // User is not authenticated
        header.style.display = 'none';
        mainContent.innerHTML = `
          <div class="auth-section">
            <h1>Welcome</h1>
            <p>Please sign in to continue</p>
            <button class="btn btn-primary" onclick="window.location.href='login.html'">
              Sign In
            </button>
          </div>
        `;
      }
    });
    
    async function handleLogout() {
      await auth.signOut();
      // Redirect will happen via auth state change
    }
  </script>
</body>
</html>
```

## Configuration Steps

1. **Replace Supabase credentials** in both HTML files:
   - Find `YOUR_SUPABASE_URL` and replace with your actual Supabase project URL
   - Find `YOUR_SUPABASE_ANON_KEY` and replace with your actual Supabase anon key

2. **Set up Supabase OAuth** (for Google sign-in):
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your OAuth credentials (Client ID and Client Secret from Google Cloud Console)
   - Add redirect URL: `https://yourdomain.com` (or `http://localhost:3000` for local dev)

3. **Test the flow**:
   - Open `login.html` in your browser
   - Try signing up with email/password
   - Try signing in with existing credentials
   - Try Google OAuth sign-in
   - Verify redirect to `index.html` after successful auth
   - Test logout functionality

## Features Replicated

✅ Email/password sign in  
✅ Email/password sign up  
✅ Toggle between sign in and sign up modes  
✅ Google OAuth sign in  
✅ Sign out functionality  
✅ Session persistence  
✅ Auth state management  
✅ Error handling and display  
✅ Loading states  
✅ User email display when authenticated  
✅ Automatic redirect after authentication  

## Notes

- The authentication state persists across page refreshes
- OAuth redirects back to the same page after authentication
- All console logging matches the original implementation
- Error messages display in the same format as the React version
- The UI styling closely matches the original design

