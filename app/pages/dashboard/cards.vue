<template>
  <div class="cards-page-container">
    <div class="cards-header">
      <h2>Cards</h2>
      <p>Request a physical or virtual card for your Tavrix Bank account.</p>
    </div>

    <!-- Card Type Selection -->
    <div class="card-type-grid">
      <!-- Virtual Card -->
      <div class="card-type-panel">
        <div class="panel-visual virtual-visual">
          <div class="mini-card virtual-card-bg">
            <div class="mc-top">
              <div class="mc-chip"></div>
              <span class="mc-logo">Tavrix</span>
            </div>
            <div class="mc-number">•••• •••• •••• ••••</div>
            <div class="mc-bottom">
              <span class="mc-label">Virtual Card</span>
              <Icon name="lucide:wifi" class="w-4 h-4 text-white opacity-70" />
            </div>
          </div>
        </div>

        <div class="panel-content">
          <div class="panel-title-row">
            <div class="panel-icon virtual-icon">
              <Icon name="lucide:smartphone" class="w-5 h-5" />
            </div>
            <div>
              <h3>Virtual Card</h3>
              <p>Instant online-only card for digital purchases</p>
            </div>
          </div>

          <ul class="feature-list">
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Instant activation after approval</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Use for online shopping &amp; subscriptions</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Custom spending limits</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Freeze &amp; unfreeze anytime</li>
          </ul>

          <!-- Status Section -->
          <div v-if="virtualCard.status === 'APPROVED'" class="approved-card-block virtual-approved-block">
            <div class="approved-card-visual virtual-card-bg">
              <div class="mc-top">
                <div class="mc-chip"></div>
                <span class="mc-logo">Tavrix</span>
              </div>
              <div class="mc-number">4532 •••• •••• {{ virtualCard.lastFour }}</div>
              <div class="mc-bottom">
                <span class="mc-label">{{ fullName }}</span>
                <span class="mc-exp">12/28</span>
              </div>
            </div>
            <span class="status-pill approved">Active</span>
          </div>

          <div v-else-if="virtualCard.status === 'PENDING'" class="pending-block">
            <Icon name="lucide:clock" class="w-5 h-5 text-amber-500" />
            <span>Request pending admin approval…</span>
          </div>

          <button
            v-else
            class="request-btn virtual-btn"
            @click="openModal('virtual')"
          >
            <Icon name="lucide:plus-circle" class="w-4 h-4" />
            Request Virtual Card
          </button>
        </div>
      </div>

      <!-- Physical Card -->
      <div class="card-type-panel">
        <div class="panel-visual physical-visual">
          <div class="mini-card physical-card-bg">
            <div class="mc-top">
              <div class="mc-chip"></div>
              <span class="mc-logo">Tavrix</span>
            </div>
            <div class="mc-number">•••• •••• •••• ••••</div>
            <div class="mc-bottom">
              <span class="mc-label">Physical Card</span>
              <Icon name="lucide:credit-card" class="w-4 h-4 text-white opacity-70" />
            </div>
          </div>
        </div>

        <div class="panel-content">
          <div class="panel-title-row">
            <div class="panel-icon physical-icon">
              <Icon name="lucide:credit-card" class="w-5 h-5" />
            </div>
            <div>
              <h3>Physical Card</h3>
              <p>Delivered to your address for in-store &amp; ATM use</p>
            </div>
          </div>

          <ul class="feature-list">
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Use at any ATM or point-of-sale</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Contactless &amp; chip payments</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Delivered in 5–10 business days</li>
            <li><Icon name="lucide:check" class="w-4 h-4 text-emerald-500" /> Zero annual fee</li>
          </ul>

          <!-- Status Section -->
          <div v-if="physicalCard.status === 'APPROVED'" class="approved-card-block physical-approved-block">
            <div class="approved-card-visual physical-card-bg">
              <div class="mc-top">
                <div class="mc-chip"></div>
                <span class="mc-logo">Tavrix</span>
              </div>
              <div class="mc-number">5412 •••• •••• {{ physicalCard.lastFour }}</div>
              <div class="mc-bottom">
                <span class="mc-label">{{ fullName }}</span>
                <span class="mc-exp">12/28</span>
              </div>
            </div>
            <span class="status-pill approved">Active</span>
          </div>

          <div v-else-if="physicalCard.status === 'PENDING'" class="pending-block">
            <Icon name="lucide:clock" class="w-5 h-5 text-amber-500" />
            <span>Request pending admin approval…</span>
          </div>

          <button
            v-else
            class="request-btn physical-btn"
            @click="openModal('physical')"
          >
            <Icon name="lucide:plus-circle" class="w-4 h-4" />
            Request Physical Card
          </button>
        </div>
      </div>
    </div>

    <!-- REQUEST MODAL -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <Icon
            :name="modalType === 'virtual' ? 'lucide:smartphone' : 'lucide:credit-card'"
            class="modal-icon"
          />
          <h2>Request {{ modalType === 'virtual' ? 'Virtual' : 'Physical' }} Card</h2>
          <button class="modal-close" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>

        <form @submit.prevent="submitRequest" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="cardPurpose">Card Purpose / Label</label>
            <input
              id="cardPurpose"
              type="text"
              v-model="form.purpose"
              placeholder="e.g. Online Shopping, Travel"
              class="form-input"
              required
            />
          </div>

          <div v-if="modalType === 'physical'" class="form-group">
            <label class="form-label" for="deliveryAddress">Delivery Address</label>
            <textarea
              id="deliveryAddress"
              v-model="form.address"
              placeholder="Enter your full delivery address"
              class="form-input form-textarea"
              rows="3"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="cardTheme">Preferred Card Theme</label>
            <select id="cardTheme" v-model="form.theme" class="form-input form-select">
              <option value="standard">Standard Blue</option>
              <option value="gold">Premium Gold</option>
              <option value="obsidian">Obsidian Black</option>
              <option value="neon">Neon Purple</option>
            </select>
          </div>

          <p class="modal-note">
            <Icon name="lucide:info" class="w-4 h-4 text-blue-500" />
            Your request will be reviewed by admin.
            {{ modalType === 'virtual' ? 'You\'ll be notified once approved.' : 'Card will be shipped within 5–10 business days after approval.' }}
          </p>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ layout: 'dashboard' })
useHead({ title: 'Cards | Tavrix Bank' })

const auth = useAuth()
const fullName = computed(() => {
  if (!import.meta.client) return 'Card Holder'
  const userStr = localStorage.getItem('user')
  if (userStr) {
    const u = JSON.parse(userStr)
    return u.fullName || u.full_name || 'Card Holder'
  }
  return auth.user.value?.fullName || 'Card Holder'
})

interface CardRecord {
  status: 'NONE' | 'PENDING' | 'APPROVED'
  lastFour: string
}

const virtualCard = ref<CardRecord>({ status: 'NONE', lastFour: '' })
const physicalCard = ref<CardRecord>({ status: 'NONE', lastFour: '' })

const showModal = ref(false)
const modalType = ref<'virtual' | 'physical'>('virtual')

const form = ref({ purpose: '', address: '', theme: 'standard' })

const loadCards = async () => {
  const res = await auth.apiCall<any>('/dashboard/cards', 'GET')
  if (res.success && res.data) {
    const cardsList: any[] = res.data?.data ?? res.data ?? []
    
    // Find virtual card
    const vc = cardsList.find((c: any) => c.cardType === 'virtual')
    if (vc) {
      virtualCard.value = {
        status: vc.status === 'active' || vc.status === 'frozen' ? 'APPROVED' : 'NONE',
        lastFour: vc.cardNumber ? vc.cardNumber.slice(-4) : '0000'
      }
    } else {
      virtualCard.value = { status: 'NONE', lastFour: '' }
    }

    // Find physical card (debit or credit)
    const pc = cardsList.find((c: any) => c.cardType === 'debit' || c.cardType === 'credit')
    if (pc) {
      physicalCard.value = {
        status: pc.status === 'active' || pc.status === 'frozen' ? 'APPROVED' : 'NONE',
        lastFour: pc.cardNumber ? pc.cardNumber.slice(-4) : '0000'
      }
    } else {
      physicalCard.value = { status: 'NONE', lastFour: '' }
    }
  }
}

onMounted(() => {
  loadCards()
})

const openModal = (type: 'virtual' | 'physical') => {
  modalType.value = type
  form.value = { purpose: '', address: '', theme: 'standard' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitRequest = async () => {
  const cardTypeVal = modalType.value === 'virtual' ? 'virtual' : 'debit'
  const res = await auth.apiCall<any>('/dashboard/cards', 'POST', {
    cardType: cardTypeVal,
    purpose: form.value.purpose
  })

  if (res.success) {
    await loadCards()
    closeModal()
    if (import.meta.client) {
      window.alert(`✓ ${modalType.value === 'virtual' ? 'Virtual' : 'Physical'} card generated successfully!`)
    }
  } else {
    if (import.meta.client) {
      window.alert(`Failed to create card: ${res.error || 'Unknown error'}`)
    }
  }
}
</script>

<style scoped>
.cards-page-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cards-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}
.dark .cards-header h2 { color: var(--color-text-light); }
.cards-header p { font-size: 14px; color: var(--color-text-muted); }
.dark .cards-header p { color: #94a3b8; }

/* Two-panel grid */
.card-type-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}
@media (max-width: 768px) {
  .card-type-grid { grid-template-columns: 1fr; }
}

.card-type-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
}
.dark .card-type-panel {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

/* Panel visual header */
.panel-visual {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.virtual-visual { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); }
.physical-visual { background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); }

/* Mini card inside panel */
.mini-card {
  width: 240px;
  height: 150px;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  box-shadow: 0 20px 40px rgba(0,0,0,0.35);
  position: relative;
  overflow: hidden;
}
.mini-card::before {
  content: '';
  position: absolute;
  top: -40%;
  left: -40%;
  width: 80%;
  height: 180%;
  background: rgba(255,255,255,0.07);
  border-radius: 50%;
}
.virtual-card-bg { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); }
.physical-card-bg { background: linear-gradient(135deg, #374151 0%, #111827 100%); }

.mc-top { display: flex; justify-content: space-between; align-items: center; }
.mc-chip {
  width: 30px; height: 22px;
  background: linear-gradient(135deg, #d4d4d8 0%, #a1a1aa 100%);
  border-radius: 4px;
}
.mc-logo { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
.mc-number { font-size: 13px; letter-spacing: 2px; font-family: monospace; }
.mc-bottom { display: flex; justify-content: space-between; align-items: center; }
.mc-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.mc-exp { font-size: 11px; }

/* Panel content */
.panel-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.panel-title-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.panel-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.virtual-icon { background: rgba(59,130,246,0.12); color: #3b82f6; }
.physical-icon { background: rgba(100,116,139,0.12); color: #64748b; }
.panel-title-row h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0 0 3px;
}
.dark .panel-title-row h3 { color: #f1f5f9; }
.panel-title-row p { font-size: 12px; color: var(--color-text-muted); margin: 0; }

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.dark .feature-list li { color: #94a3b8; }

/* Request button */
.request-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: all 0.2s;
  margin-top: auto;
}
.virtual-btn { background: #2563eb; color: #fff; }
.virtual-btn:hover { background: #1d4ed8; }
.physical-btn { background: #374151; color: #fff; }
.physical-btn:hover { background: #1f2937; }

/* Pending state */
.pending-block {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.25);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #d97706;
  margin-top: auto;
}

/* Approved card display */
.approved-card-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}
.approved-card-visual {
  width: 200px;
  height: 125px;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}
.status-pill {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-pill.approved {
  background: rgba(16,185,129,0.12);
  color: #10b981;
  border: 1px solid rgba(16,185,129,0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-box {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 460px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  overflow: hidden;
  animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
.dark .modal-box {
  background: #0f172a;
  border-color: var(--color-border-dark);
}
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.92) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.dark .modal-header { border-bottom-color: var(--color-border-dark); }
.modal-header h2 { flex: 1; font-size: 18px; font-weight: 700; color: var(--color-text-main); margin: 0; }
.dark .modal-header h2 { color: #f1f5f9; }
.modal-icon { width: 20px; height: 20px; color: var(--color-secondary); flex-shrink: 0; }
.modal-close {
  background: none; border: none; color: var(--color-text-muted);
  cursor: pointer; display: flex; align-items: center;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text-main); }
.dark .form-label { color: #cbd5e1; }
.form-input {
  width: 100%; padding: 10px 12px; border: 1px solid var(--color-border);
  border-radius: 8px; font-size: 14px; background: var(--color-background-page);
  color: var(--color-text-main); outline: none; font-family: var(--font-sans);
  box-sizing: border-box;
}
.dark .form-input { background: #1e293b; border-color: var(--color-border-dark); color: #f1f5f9; }
.form-textarea { resize: vertical; }
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 14px;
}

.modal-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  background: rgba(59,130,246,0.05);
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
}
.dark .modal-note { color: #94a3b8; }

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
