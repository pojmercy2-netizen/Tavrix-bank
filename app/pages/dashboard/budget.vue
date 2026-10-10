<template>
  <div class="dashboard-page-container">
    <div class="dashboard-page-header">
      <h2>Budget & Tools</h2>
      <p>Track your spending, set limits, and reach your financial goals.</p>
    </div>

    <div class="page-grid">
      <!-- Spending Breakdown -->
      <div class="dashboard-card">
        <div class="card-header-main">
          <h3>Monthly Spending Breakdown</h3>
        </div>
        <div class="chart-flex-container">
          <div class="donut-chart" :style="{ background: conicGradient }">
            <div class="donut-inner">
              <h4>{{ formatCurrency(totalSpent) }}</h4>
              <p>Total Spent</p>
            </div>
          </div>
          
          <div class="chart-legend">
            <div v-for="budget in budgets" :key="budget.id" class="legend-item">
              <div class="legend-label">
                <span class="dot" :style="{ backgroundColor: budget.color }"></span>
                <span>{{ budget.category }}</span>
              </div>
              <span class="legend-amount">{{ formatCurrency(budget.spent) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Budget Limits -->
      <div class="dashboard-card">
        <div class="card-header-main">
          <h3>Budget Limits</h3>
          <button class="text-btn flex items-center gap-1" @click="openBudgetModal">
            <Icon name="i-lucide-edit-2" class="w-4 h-4" /> Edit
          </button>
        </div>
        
        <div class="progress-list">
          <div v-for="budget in budgets" :key="budget.id" class="progress-item">
            <div class="progress-header">
              <span class="progress-category">{{ budget.category }}</span>
              <span :class="['progress-values', { 'text-red': budget.spent > budget.limit }]">
                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.limit) }}
              </span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ 
                width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`, 
                backgroundColor: budget.spent > budget.limit ? '#ef4444' : budget.color 
              }"></div>
            </div>
            <span v-if="budget.spent > budget.limit" class="warning-text">
              <Icon name="i-lucide-alert-triangle" class="w-3 h-3" /> Over budget by {{ formatCurrency(budget.spent - budget.limit) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Financial Goals -->
      <div class="dashboard-card col-span-full">
        <div class="card-header-main">
          <h3>Financial Goals</h3>
          <button class="btn btn-primary btn-sm flex items-center gap-1" @click="showGoalModal = true">
            <Icon name="i-lucide-plus" class="w-4 h-4" /> Create Goal
          </button>
        </div>
        
        <div class="goals-grid">
          <div v-for="goal in goals" :key="goal.id" class="goal-card">
            <div class="goal-header">
              <div class="goal-icon-wrapper" :style="{ backgroundColor: `${goal.color}15`, color: goal.color }">
                <Icon :name="goal.icon" class="w-6 h-6" />
              </div>
              <h4>{{ goal.name }}</h4>
            </div>
            <h2 class="goal-amount">{{ formatCurrency(goal.current) }}</h2>
            <p class="goal-subtext">of {{ formatCurrency(goal.target) }} goal</p>
            
            <div class="goal-progress-info">
              <span>{{ ((goal.current / goal.target) * 100).toFixed(0) }}%</span>
              <span>{{ formatCurrency(goal.target - goal.current) }} left</span>
            </div>
            <div class="goal-progress-bar-bg">
              <div class="goal-progress-bar-fill" :style="{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%`, backgroundColor: goal.color }"></div>
            </div>
          </div>

          <div class="goal-card-create" @click="showGoalModal = true">
            <div class="create-icon-wrapper">
              <Icon name="i-lucide-trending-up" class="w-6 h-6 text-slate-400" />
            </div>
            <span>Start a new goal</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Budget Modal -->
    <div v-if="showBudgetModal" class="modal-overlay" @click.self="showBudgetModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Budget Limits</h2>
          <button class="modal-close" @click="showBudgetModal = false">
            <Icon name="i-lucide-x" class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="handleSaveBudget" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="categorySelect">Select Category</label>
            <select id="categorySelect" @change="onBudgetSelect" class="form-input" defaultValue="">
              <option value="" disabled>Select a category</option>
              <option v-for="b in budgets" :key="b.id" :value="b.id">
                {{ b.category }} (Current Limit: ${{ b.limit }})
              </option>
            </select>
          </div>

          <div v-if="editingBudget" class="form-group">
            <label class="form-label" for="newLimit">New Limit for {{ editingBudget.category }} ($)</label>
            <input 
              id="newLimit"
              type="number" 
              v-model.number="editingBudgetLimit"
              step="1"
              min="1"
              class="form-input"
              required
            />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showBudgetModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="!editingBudget">Save Limits</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Goal Modal -->
    <div v-if="showGoalModal" class="modal-overlay" @click.self="showGoalModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create Financial Goal</h2>
          <button class="modal-close" @click="showGoalModal = false">
            <Icon name="i-lucide-x" class="w-6 h-6" />
          </button>
        </div>
        <form @submit.prevent="handleCreateGoal" class="modal-form">
          <div class="form-group">
            <label class="form-label" for="goalName">Goal Name</label>
            <input 
              id="goalName"
              type="text" 
              placeholder="e.g. New Car, Vacation" 
              v-model="goalName"
              class="form-input"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label" for="goalTarget">Target Amount ($)</label>
              <input 
                id="goalTarget"
                type="number" 
                placeholder="10000" 
                v-model.number="goalTarget"
                min="1"
                class="form-input"
                required
              />
            </div>
            <div class="form-group flex-1">
              <label class="form-label" for="goalCurrent">Current Saved ($)</label>
              <input 
                id="goalCurrent"
                type="number" 
                placeholder="1500" 
                v-model.number="goalCurrent"
                min="0"
                class="form-input"
                required
              />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Theme Color</label>
            <div class="color-options">
              <div 
                v-for="color in colorChoices" 
                :key="color"
                @click="selectedColor = color"
                :style="{ backgroundColor: color }"
                :class="['color-dot', { active: selectedColor === color }]"
              ></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showGoalModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Goal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'dashboard'
})

useHead({
  title: 'Budget & Tools | Tavrix Bank'
})

interface Budget {
  id: number
  category: string
  spent: number
  limit: number
  color: string
  icon: string
}

interface Goal {
  id: number
  name: string
  current: number
  target: number
  color: string
  icon: string
}

const budgets = ref<Budget[]>([
  { id: 1, category: 'Shopping', spent: 450.25, limit: 400.00, color: '#ef4444', icon: 'i-lucide-shopping-bag' },
  { id: 2, category: 'Dining', spent: 236.50, limit: 300.00, color: '#f59e0b', icon: 'i-lucide-coffee' },
  { id: 3, category: 'Transport', spent: 180.40, limit: 250.00, color: '#3b82f6', icon: 'i-lucide-car' },
  { id: 4, category: 'Utilities', spent: 165.30, limit: 200.00, color: '#8b5cf6', icon: 'i-lucide-home' }
])

const goals = ref<Goal[]>([
  { id: 1, name: 'House Downpayment', current: 15000, target: 40000, color: '#3b82f6', icon: 'i-lucide-home' }
])

const showBudgetModal = ref(false)
const showGoalModal = ref(false)

// Edit budget limit form
const editingBudget = ref<Budget | null>(null)
const editingBudgetLimit = ref<number | ''>('')

const openBudgetModal = () => {
  editingBudget.value = null
  editingBudgetLimit.value = ''
  showBudgetModal.value = true
}

const onBudgetSelect = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const budget = budgets.value.find(b => b.id === Number(target.value))
  if (budget) {
    editingBudget.value = budget
    editingBudgetLimit.value = budget.limit
  }
}

const handleSaveBudget = () => {
  if (editingBudget.value && editingBudgetLimit.value) {
    editingBudget.value.limit = Number(editingBudgetLimit.value)
    showBudgetModal.value = false
  }
}

// Create goal form
const goalName = ref('')
const goalTarget = ref<number | ''>('')
const goalCurrent = ref<number | ''>('')
const selectedColor = ref('#10b981')
const colorChoices = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const handleCreateGoal = () => {
  if (!goalName.value || !goalTarget.value || goalCurrent.value === '') return

  const newGoal: Goal = {
    id: Date.now(),
    name: goalName.value,
    current: Number(goalCurrent.value),
    target: Number(goalTarget.value),
    color: selectedColor.value,
    icon: 'i-lucide-trending-up'
  }

  goals.value = [...goals.value, newGoal]
  goalName.value = ''
  goalTarget.value = ''
  goalCurrent.value = ''
  selectedColor.value = '#10b981'
  showGoalModal.value = false
}

// Calculations
const totalSpent = computed(() => {
  return budgets.value.reduce((acc, b) => acc + b.spent, 0)
})

const conicGradient = computed(() => {
  const total = totalSpent.value
  let currentPercentage = 0
  const gradientParts = budgets.value.map(b => {
    const start = currentPercentage
    const spentPercent = (b.spent / total) * 100
    currentPercentage += spentPercent
    return `${b.color} ${start.toFixed(1)}% ${currentPercentage.toFixed(1)}%`
  })
  return `conic-gradient(${gradientParts.join(', ')})`
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}
</script>

<style scoped>
.dashboard-page-container {
  max-width: 1000px;
  margin: 0 auto;
}

.dashboard-page-header {
  margin-bottom: 24px;
}

.dashboard-page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}

.dark .dashboard-page-header h2 {
  color: var(--color-text-light);
}

.dashboard-page-header p {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .dashboard-page-header p {
  color: #94a3b8;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.col-span-full {
  grid-column: 1 / -1;
}

.dashboard-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  padding: 24px;
}

.dark .dashboard-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.card-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.dark .card-header-main {
  border-bottom-color: var(--color-border-dark);
}

.card-header-main h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

.dark .card-header-main h3 {
  color: var(--color-text-light);
}

.text-btn {
  color: var(--color-secondary);
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.text-btn:hover {
  background-color: rgba(0, 102, 255, 0.05);
}

.dark .text-btn:hover {
  background-color: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
}

.chart-flex-container {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 16px;
}

@media (max-width: 480px) {
  .chart-flex-container {
    flex-direction: column;
  }
}

.donut-chart {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
}

.donut-inner {
  width: 110px;
  height: 110px;
  background-color: var(--color-surface);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.dark .donut-inner {
  background-color: var(--color-background-dark-card);
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
}

.dark .donut-inner p {
  color: #94a3b8;
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.legend-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-main);
}

.dark .legend-label {
  color: #e2e8f0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-amount {
  font-weight: 600;
  color: var(--color-text-main);
}

.dark .legend-amount {
  color: var(--color-text-light);
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 16px;
}

.progress-item {
  display: flex;
  flex-direction: column;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.progress-category {
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-main);
}

.dark .progress-category {
  color: #e2e8f0;
}

.progress-values {
  font-size: 13px;
  color: var(--color-text-muted);
}

.dark .progress-values {
  color: #94a3b8;
}

.progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.dark .progress-bar-bg {
  background-color: var(--color-border-dark);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-error);
  font-size: 12px;
  margin-top: 6px;
  font-weight: 500;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.goal-card {
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background-color: var(--color-surface);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.dark .goal-card {
  background-color: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.goal-icon-wrapper {
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goal-header h4 {
  color: var(--color-text-main);
  font-size: 15px;
  font-weight: 600;
}

.dark .goal-header h4 {
  color: var(--color-text-light);
}

.goal-amount {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.dark .goal-amount {
  color: var(--color-text-light);
}

.goal-subtext {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-bottom: 16px;
}

.dark .goal-subtext {
  color: #94a3b8;
}

.goal-progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
  margin-bottom: 6px;
}

.dark .goal-progress-info {
  color: #94a3b8;
}

.goal-progress-bar-bg {
  width: 100%;
  height: 8px;
  background-color: var(--color-background-subtle);
  border-radius: 4px;
  overflow: hidden;
}

.dark .goal-progress-bar-bg {
  background-color: var(--color-background-dark-subtle);
}

.goal-progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

.goal-card-create {
  padding: 24px;
  border: 2px dashed var(--color-border);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  background: var(--color-background-subtle);
  transition: all 0.2s;
  min-height: 180px;
}

.dark .goal-card-create {
  background: var(--color-background-dark-subtle);
  border-color: var(--color-border-dark);
}

.goal-card-create:hover {
  border-color: var(--color-secondary);
}

.dark .goal-card-create:hover {
  border-color: #60a5fa;
}

.create-icon-wrapper {
  padding: 10px;
  background: var(--color-surface);
  border-radius: 50%;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.dark .create-icon-wrapper {
  background: var(--color-surface-dark);
}

.goal-card-create span {
  color: var(--color-text-main);
  font-weight: 600;
  font-size: 14px;
}

.dark .goal-card-create span {
  color: #e2e8f0;
}

/* Modals */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.modal-content {
  background: var(--color-surface);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border);
}

.dark .modal-content {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}

.dark .modal-header h2 {
  color: var(--color-text-light);
}

.modal-close {
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.modal-close:hover {
  background-color: var(--color-background-subtle);
  color: var(--color-primary);
}

.dark .modal-close:hover {
  background-color: var(--color-background-dark-subtle);
  color: var(--color-text-light);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.color-options {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.color-dot.active {
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.dark .color-dot.active {
  border-color: #ffffff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
}

.text-red {
  color: var(--color-error);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
