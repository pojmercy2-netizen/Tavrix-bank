<template>
  <div class="page-wrapper">
    <PageHeader 
      title="Personal Banking" 
      subtitle="Manage your daily finances with intuitive tools and rewarding accounts designed around your life." 
    />
    
    <section class="page-content">
      <div class="container">
        <div class="content-grid">
          <ContentCard 
            icon="i-lucide-wallet" 
            title="Everyday Checking" 
            text="No hidden fees, early direct deposit, and access to over 40,000 fee-free ATMs nationwide." 
            btnText="Open Checking" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-pie-chart" 
            title="High-Yield Savings" 
            text="Make your money work harder for you with our highly competitive interest rates and auto-save tools." 
            btnText="Start Saving" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-credit-card" 
            title="Credit Cards" 
            text="Earn cash back on every purchase, enjoy 0% introductory APRs, and build your credit securely." 
            btnText="Compare Cards" 
            btnLink="/register" 
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Personal Banking | Tavrix Bank'
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
