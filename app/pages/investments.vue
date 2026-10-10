<template>
  <div class="page-wrapper">
    <PageHeader 
      title="Investments" 
      subtitle="Grow your wealth with expert guidance and smart investment solutions designed for your future." 
    />
    
    <section class="page-content">
      <div class="container">
        <div class="content-grid">
          <ContentCard 
            icon="i-lucide-trending-up" 
            title="Wealth Management" 
            text="Personalized portfolio management from dedicated financial advisors to help you reach your goals." 
            btnText="Meet an Advisor" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-shield-check" 
            title="Retirement Planning" 
            text="Traditional IRAs, Roth IRAs, and rollover services to ensure you have the retirement you deserve." 
            btnText="Explore IRAs" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-bar-chart-3" 
            title="Self-Directed Trading" 
            text="Trade stocks, ETFs, and options commission-free on our award-winning brokerage platform." 
            btnText="Open Brokerage" 
            btnLink="/register" 
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Investments | Tavrix Bank'
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
