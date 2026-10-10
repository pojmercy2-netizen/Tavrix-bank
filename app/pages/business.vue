<template>
  <div class="page-wrapper">
    <PageHeader 
      title="Business Banking" 
      subtitle="Powerful financial tools to help your business scale, from startups to large corporations." 
    />
    
    <section class="page-content">
      <div class="container">
        <div class="content-grid">
          <ContentCard 
            icon="i-lucide-briefcase" 
            title="Small Business" 
            text="Checking accounts, payment processing, and essential tools tailored for growing small businesses." 
            btnText="Get Started" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-landmark" 
            title="Commercial Banking" 
            text="Treasury management, complex lending solutions, and dedicated relationship managers." 
            btnText="Contact Sales" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-building-2" 
            title="Merchant Services" 
            text="Accept payments anywhere securely with our modern Point of Sale systems and e-commerce integrations." 
            btnText="View Solutions" 
            btnLink="/register" 
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Business Banking | Tavrix Bank'
})
</script>

<style scoped>
.page-wrapper {
  min-height: 100%;
}

.page-content {
  padding: 80px 0;
  background-color: var(--color-background-subtle);
  min-height: 400px;
}

.dark .page-content {
  background-color: var(--color-background-dark);
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
