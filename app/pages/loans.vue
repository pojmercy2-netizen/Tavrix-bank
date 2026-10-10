<template>
  <div class="page-wrapper">
    <PageHeader 
      title="Loans & Mortgages" 
      subtitle="Competitive rates and flexible terms to help you achieve your biggest financial milestones." 
    />
    
    <section class="page-content">
      <div class="container">
        <div class="content-grid">
          <ContentCard 
            icon="i-lucide-home" 
            title="Mortgages" 
            text="Buy your dream home or refinance your current one with our streamlined, low-rate mortgage options." 
            btnText="View Rates" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-car" 
            title="Auto Loans" 
            text="Get pre-approved quickly for a new or used vehicle with flexible repayment terms." 
            btnText="Apply Now" 
            btnLink="/register" 
          />
          
          <ContentCard 
            icon="i-lucide-hand-coins" 
            title="Personal Loans" 
            text="Consolidate debt or fund major purchases with fixed-rate personal loans tailored to you." 
            btnText="Check Eligibility" 
            btnLink="/register" 
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Loans & Mortgages | Tavrix Bank'
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
