<template>
  <div class="spending-chart-section">
    <div class="chart-container">
      <div class="donut-chart">
        <div class="donut-inner">
          <h4>$1,246.78</h4>
          <p>Total Spent</p>
        </div>
      </div>
      
      <div class="chart-legend">
        <div v-for="item in legendItems" :key="item.label" class="legend-item">
          <div class="legend-label">
            <span :class="['dot', item.dotClass]"></span>
            <span>{{ item.label }}</span>
          </div>
          <span class="legend-amount">{{ item.amount }}</span>
          <span class="legend-percent">{{ item.percent }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const legendItems = [
  { label: 'Shopping', amount: '$450.25', percent: '36%', dotClass: 'dot-blue' },
  { label: 'Dining', amount: '$236.50', percent: '19%', dotClass: 'dot-orange' },
  { label: 'Transportation', amount: '$180.40', percent: '14%', dotClass: 'dot-red' },
  { label: 'Bills & Utilities', amount: '$165.30', percent: '13%', dotClass: 'dot-purple' },
  { label: 'Entertainment', amount: '$102.33', percent: '8%', dotClass: 'dot-brown' },
  { label: 'Other', amount: '$112.00', percent: '9%', dotClass: 'dot-dark' }
]
</script>

<style scoped>
.spending-chart-section {
  width: 100%;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

@media (min-width: 640px) {
  .chart-container {
    flex-direction: row;
    justify-content: space-around;
  }
}

.donut-chart {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0% 36%, 
    #f97316 36% 55%, 
    #ef4444 55% 69%, 
    #a855f7 69% 82%, 
    #a16207 82% 90%, 
    #64748b 90% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
}

.donut-inner {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.dark .donut-inner {
  background: var(--color-background-dark-card);
}

.donut-inner h4 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-main);
}

.dark .donut-inner h4 {
  color: var(--color-text-light);
}

.donut-inner p {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.dark .donut-inner p {
  color: #94a3b8;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  padding: 4px 0;
  border-bottom: 1px dashed var(--color-border);
}

.dark .legend-item {
  border-bottom-color: var(--color-border-dark);
}

.legend-item:last-child {
  border-bottom: none;
}

.legend-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-main);
  font-weight: 500;
}

.dark .legend-label {
  color: var(--color-text-light);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-blue { background-color: #3b82f6; }
.dot-orange { background-color: #f97316; }
.dot-red { background-color: #ef4444; }
.dot-purple { background-color: #a855f7; }
.dot-brown { background-color: #a16207; }
.dot-dark { background-color: #64748b; }

.legend-amount {
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .legend-amount {
  color: var(--color-text-light);
}

.legend-percent {
  color: var(--color-text-muted);
  font-size: 11px;
  min-width: 32px;
  text-align: right;
}

.dark .legend-percent {
  color: #94a3b8;
}
</style>
