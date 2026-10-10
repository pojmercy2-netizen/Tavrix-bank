<template>
  <div>
    <PageLoader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
body, nav, header, footer, aside, .dashboard-card, .btn, .nav-link, .sidebar-link, .bottom-nav-item, .payment-method-card {
  transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
/* Prevent transition on images and icons */
img, svg {
  transition: none !important;
}
</style>
