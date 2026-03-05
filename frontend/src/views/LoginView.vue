<template>
  <div class="login-root">
    <!-- Left Panel -->
    <div class="left-panel">
      <!-- Logo -->
      <div class="logo-container">
        <img src="/images/logo/arbeitly-logo.png" alt="Arbeitly" class="logo" />
      </div>

      <!-- Content -->
      <div class="form-content">
        <!-- Header -->
        <div class="header">
          <h1 class="title">
            Get <span class="title-accent">Started</span>
          </h1>
          <p class="subtitle">Sign in or create your Arbeitly account</p>
        </div>

        <!-- Form Card -->
        <div class="form-card">
          <div class="card-glow" />

          <form class="form-fields" @submit.prevent="handlePasswordlessLogin">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="email-input"
            />
            <button type="submit" class="continue-btn" :disabled="loading">
              <svg
                v-if="loading"
                class="spinner"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span v-else>Continue</span>
            </button>
          </form>

          <div class="divider">
            <div class="divider-line" />
            <span class="divider-text">or</span>
            <div class="divider-line" />
          </div>

          <div class="social-buttons">
            <button class="social-btn" @click="handleMicrosoftLogin">
              <svg class="social-icon" width="20" height="20" viewBox="0 0 23 23">
                <rect fill="#f25022" x="1" y="1" width="10" height="10" />
                <rect fill="#00a4ef" x="1" y="12" width="10" height="10" />
                <rect fill="#7fba00" x="12" y="1" width="10" height="10" />
                <rect fill="#ffb900" x="12" y="12" width="10" height="10" />
              </svg>
              Continue with Microsoft
            </button>
            <button class="social-btn" @click="handleGoogleLogin">
              <svg class="social-icon" width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p class="privacy-text">
          By continuing, you acknowledge Arbeitly's
          <a href="#" class="privacy-link" @click.prevent>Privacy Policy</a>.
        </p>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <img
        src="/images/login-image.png"
        alt=""
        class="right-image"
      />
      <div class="right-overlay" />
      <div class="dot-pattern" />

      <div class="right-content">
        <div class="center-icon">
          <div class="center-icon-inner" />
          <Briefcase :size="56" :stroke-width="1.5" class="center-icon-svg" />
        </div>

        <div class="feature-pills">
          <div class="pill">
            <div class="pill-icon-wrap">
              <SearchCheck :size="20" :stroke-width="1.5" />
            </div>
            <span>Automated Job Search</span>
          </div>
          <div class="pill">
            <div class="pill-icon-wrap">
              <FileText :size="20" :stroke-width="1.5" />
            </div>
            <span>CV Optimization</span>
          </div>
          <div class="pill">
            <div class="pill-icon-wrap">
              <BarChart3 :size="20" :stroke-width="1.5" />
            </div>
            <span>Application Tracking</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="#00e5ff" location="top">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Briefcase, SearchCheck, FileText, BarChart3 } from "lucide-vue-next";

const email = ref("");
const loading = ref(false);
const snackbar = ref(false);
const snackbarText = ref("");

function showSnackbar(text: string) {
  snackbarText.value = text;
  snackbar.value = true;
}

async function handlePasswordlessLogin() {
  if (!email.value || !/.+@.+\..+/.test(email.value)) return;
  loading.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  loading.value = false;
  showSnackbar(`Magic link sent to ${email.value}`);
}

function handleGoogleLogin() {
  showSnackbar("Google sign-in (mock)");
}

function handleMicrosoftLogin() {
  showSnackbar("Microsoft sign-in (mock)");
}
</script>

<style scoped>
/* ── Root ── */
.login-root {
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background-color: #09090b;
  color: #fafafa;
  font-family: "Inter", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Left Panel ── */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 3rem;
  justify-content: center;
  min-height: 100vh;
}

@media (min-width: 1024px) {
  .left-panel {
    padding: 6rem;
  }
}

.logo-container {
  position: absolute;
  top: 2rem;
  left: 2rem;
}

@media (min-width: 640px) {
  .logo-container {
    top: 3rem;
    left: 3rem;
  }
}

.logo {
  height: 2.5rem;
  width: auto;
}

/* ── Form Content ── */
.form-content {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 4rem;
}

@media (min-width: 1024px) {
  .form-content {
    margin-top: 0;
  }
}

.header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.title {
  font-size: 2.25rem;
  font-weight: 500;
  letter-spacing: -0.025em;
  color: #f4f4f5;
  font-style: italic;
}

@media (min-width: 768px) {
  .title {
    font-size: 3rem;
  }
}

.title-accent {
  color: #22d3ee;
}

.subtitle {
  font-size: 1rem;
  color: #a1a1aa;
}

/* ── Form Card ── */
.form-card {
  background: rgba(24, 24, 27, 0.4);
  border: 1px solid rgba(39, 39, 42, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
}

@media (min-width: 640px) {
  .form-card {
    padding: 2rem;
  }
}

.card-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 75%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 229, 255, 0.5), transparent);
}

/* ── Form Fields ── */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.email-input {
  width: 100%;
  background: rgba(9, 9, 11, 0.5);
  border: 1px solid #27272a;
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  color: #e4e4e7;
  outline: none;
  transition: all 0.2s;
}

.email-input::placeholder {
  color: #71717a;
}

.email-input:focus {
  box-shadow: 0 0 0 2px rgba(0, 229, 255, 0.4);
  border-color: #00e5ff;
}

.continue-btn {
  width: 100%;
  background: linear-gradient(135deg, #00b8d4, #00e5ff);
  color: #09090b;
  border: none;
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #00e5ff, #18ffff);
}

.continue-btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Divider ── */
.divider {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(39, 39, 42, 0.8);
}

.divider-text {
  font-size: 0.75rem;
  color: #71717a;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

/* ── Social Buttons ── */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.social-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(9, 9, 11, 0.3);
  border: 1px solid #27272a;
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #d4d4d8;
  cursor: pointer;
  transition: all 0.2s;
}

.social-btn:hover {
  background: rgba(39, 39, 42, 0.5);
  border-color: #3f3f46;
}

.social-icon {
  flex-shrink: 0;
}

/* ── Privacy ── */
.privacy-text {
  font-size: 0.75rem;
  color: #71717a;
  text-align: center;
  padding: 0 1rem;
}

.privacy-link {
  color: #a1a1aa;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: #3f3f46;
  transition: all 0.2s;
}

.privacy-link:hover {
  color: #e4e4e7;
  text-decoration-color: #a1a1aa;
}

/* ── Right Panel ── */
.right-panel {
  display: none;
  flex: 1;
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1024px) {
  .right-panel {
    display: flex;
  }
}

.right-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 131, 143, 0.75) 0%, rgba(9, 9, 11, 0.65) 100%);
  mix-blend-mode: multiply;
}

.dot-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.12;
  background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0);
  background-size: 64px 64px;
}

/* ── Right Content ── */
.right-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
  padding: 3rem;
}

.center-icon {
  width: 7rem;
  height: 7rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
}

.center-icon-inner {
  position: absolute;
  inset: 0;
  border-radius: 2rem;
  background: linear-gradient(to top right, rgba(255, 255, 255, 0.05), transparent);
}

.center-icon-svg {
  color: white;
  position: relative;
  z-index: 10;
}

/* ── Feature Pills ── */
.feature-pills {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.pill {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: default;
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.pill:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.pill-icon-wrap {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.625rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(207, 250, 254, 1);
}
</style>
