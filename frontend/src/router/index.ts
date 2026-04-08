import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useAdminStore } from '../stores/admin';
import { useEmployeeStore } from '../stores/employee';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/pricing',
      name: 'Pricing',
      component: () => import('../views/PricingView.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('../views/CheckoutView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/candidate/onboarding',
      name: 'Onboarding',
      component: () => import('../views/candidate/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout/success',
      name: 'CheckoutSuccess',
      component: () => import('../views/CheckoutSuccessView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/candidate/invoice/:id',
      name: 'CandidateInvoice',
      component: () => import('../views/candidate/InvoiceView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/candidate/forgot-password',
      name: 'ForgotPassword',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/candidate/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/candidate',
      component: () => import('../components/CandidateLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/candidate/applications' },
        {
          path: 'applications',
          name: 'Applications',
          component: () => import('../views/candidate/ApplicationsView.vue'),
        },
        {
          path: 'cv',
          name: 'CV',
          component: () => import('../views/candidate/CVBuilderView.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('../views/candidate/ProfileView.vue'),
        },
        {
          path: 'files',
          name: 'Files',
          component: () => import('../views/candidate/FilesView.vue'),
        },
        {
          path: 'faq',
          name: 'FAQ',
          component: () => import('../views/candidate/FaqView.vue'),
        },
      ],
    },
    // ── Employee portal ──
    {
      path: '/employee/login',
      name: 'EmployeeLogin',
      component: () => import('../views/employee/EmployeeLoginView.vue'),
    },
    {
      path: '/employee',
      component: () => import('../components/EmployeeLayout.vue'),
      meta: { requiresEmployee: true },
      children: [
        { path: '', redirect: '/employee/dashboard' },
        { path: 'dashboard', name: 'EmployeeDashboard', component: () => import('../views/employee/DashboardView.vue') },
        { path: 'candidates', name: 'EmployeeCandidates', component: () => import('../views/employee/CandidatesView.vue') },
        { path: 'candidates/:id', name: 'EmployeeCandidateDetail', component: () => import('../views/employee/CandidateDetailView.vue') },
        { path: 'job-discovery', name: 'EmployeeJobDiscovery', component: () => import('../views/employee/JobDiscoveryView.vue') },
        { path: 'settings', name: 'EmployeeSettings', component: () => import('../views/employee/SettingsView.vue') },
      ],
    },
    // ── Super Admin portal ──
    {
      path: '/superadmin/login',
      name: 'AdminLogin',
      component: () => import('../views/superadmin/AdminLoginView.vue'),
    },
    {
      path: '/superadmin',
      component: () => import('../components/SuperAdminLayout.vue'),
      meta: { requiresAdmin: true },
      children: [
        { path: '', redirect: '/superadmin/overview' },
        { path: 'overview', name: 'AdminOverview', component: () => import('../views/superadmin/OverviewView.vue') },
        { path: 'transactions', name: 'AdminTransactions', component: () => import('../views/superadmin/TransactionsView.vue') },
        { path: 'candidates', name: 'AdminCandidates', component: () => import('../views/superadmin/CandidatesView.vue') },
        { path: 'employees', name: 'AdminEmployees', component: () => import('../views/superadmin/EmployeesView.vue') },
        { path: 'plans', name: 'AdminPlans', component: () => import('../views/superadmin/PlansView.vue') },
        { path: 'performance', name: 'AdminPerformance', component: () => import('../views/superadmin/PerformanceView.vue') },
        { path: 'job-discovery', name: 'AdminJobDiscovery', component: () => import('../views/superadmin/JobDiscoveryView.vue') },
        { path: 'ai-config', name: 'AdminAIConfig', component: () => import('../views/superadmin/AIConfigView.vue') },
        { path: 'audit-log', name: 'AdminAuditLog', component: () => import('../views/superadmin/AuditLogView.vue') },
        { path: 'system-settings', name: 'AdminSystemSettings', component: () => import('../views/superadmin/SystemSettingsView.vue') },
        { path: 'profile', name: 'AdminProfile', component: () => import('../views/superadmin/AdminProfileView.vue') },
        { path: 'settings', name: 'AdminSettings', component: () => import('../views/superadmin/AdminSettingsView.vue') },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();

  // Admin routes
  if (to.meta.requiresAdmin) {
    const adminStore = useAdminStore();
    if (!adminStore.token) return next({ name: 'AdminLogin' });
    return next();
  }

  // Employee routes
  if (to.meta.requiresEmployee) {
    const employeeStore = useEmployeeStore();
    if (!employeeStore.token) return next({ name: 'EmployeeLogin' });
    return next();
  }

  if (to.meta.requiresAuth && !auth.token) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && auth.token) {
    next('/candidate/applications');
  } else {
    next();
  }
});

export default router;
