import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

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
      path: '/checkout-success',
      name: 'CheckoutSuccess',
      component: () => import('../views/CheckoutSuccessView.vue'),
    },
    {
      path: '/checkout-cancel',
      name: 'CheckoutCancel',
      component: () => import('../views/CheckoutCancelView.vue'),
    },
    {
      path: '/auth/callback',
      name: 'Auth0Callback',
      component: () => import('../views/Auth0CallbackView.vue'),
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
        {
          path: 'onboarding',
          name: 'Onboarding',
          component: () => import('../views/candidate/OnboardingView.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.token) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && auth.token) {
    next('/candidate/applications');
  } else {
    next();
  }
});

export default router;
