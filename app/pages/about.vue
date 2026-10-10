<template>
  <div class="page-wrapper">
    <PageHeader 
      title="About Tavrix Bank" 
      subtitle="We are committed to empowering our customers and strengthening our communities through innovative banking." 
    />
    
    <section class="page-content">
      <div class="container">
        <div class="content-grid">
          <ContentCard 
            icon="i-lucide-target" 
            title="Our Mission" 
            text="To deliver exceptional financial solutions that simplify lives, foster growth, and secure the financial futures of our clients." 
          />
          
          <ContentCard 
            icon="i-lucide-heart" 
            title="Community First" 
            text="We reinvest heavily in the local communities we serve, supporting small businesses and funding local educational initiatives." 
          />
          
          <ContentCard 
            icon="i-lucide-users" 
            title="Leadership Team" 
            text="Our executive team brings decades of financial experience and a commitment to transparency, integrity, and innovation." 
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'About Us | Tavrix Bank'
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
