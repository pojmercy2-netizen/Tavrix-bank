<template>
  <div :class="['balance-card', type === 'premium' ? 'premium-balance-card' : type]">
    <!-- Diagonal green accent line for premium card -->
    <div v-if="type === 'premium'" class="balance-card-diagonal" />

    <!-- Premium Card Layout -->
    <div v-if="type === 'premium'" class="premium-card-header">
      <div class="premium-card-left">
        <span class="premium-label-muted">TOTAL BALANCE</span>
        <div class="premium-balance-display">
          <h2 class="premium-balance-val">
            {{ isBalanceVisible ? formatCurrency(balance) : '$ ••••••' }}
          </h2>
          <button 
            type="button"
            class="premium-toggle-btn" 
            @click="toggleBalance" 
            :aria-label="isBalanceVisible ? 'Hide balance' : 'Show balance'"
          >
            <Icon :name="isBalanceVisible ? 'lucide:eye' : 'lucide:eye-off'" class="w-5 h-5" />
          </button>
        </div>
        <div class="premium-change-text">{{ subtitle }}</div>
      </div>

      <div class="premium-card-right" v-if="showKyc">
        <span :class="['kyc-pill', kycStatus.toLowerCase().replace(' ', '-')]">{{ kycStatus }}</span>
        <span class="premium-label-muted">KYC STATUS</span>
      </div>
    </div>

    <!-- Legacy / Default Card Layout -->
    <div v-else>
      <div class="card-header">
        <span class="account-name">{{ name }}</span>
        <span class="account-number">{{ accountNumber }}</span>
      </div>
      <h2 class="account-balance">{{ formatCurrency(balance) }}</h2>
      <span class="available-balance">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  accountNumber?: string
  balance: number
  subtitle: string
  type?: 'checking' | 'savings' | 'premium'
  showKyc?: boolean
}>(), {
  accountNumber: '',
  type: 'checking',
  showKyc: false
})

const isBalanceVisible = ref(true)
const kycStatus = ref('Unverified')

const toggleBalance = () => {
  isBalanceVisible.value = !isBalanceVisible.value
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const auth = useAuth()

onMounted(async () => {
  if (import.meta.client) {
    const status = localStorage.getItem('kyc_status')
    if (status) {
      kycStatus.value = status
    } else {
      localStorage.setItem('kyc_status', 'Unverified')
      kycStatus.value = 'Unverified'
    }

    if (props.showKyc) {
      try {
        // Use profile kycStatus as the most authoritative source
        // (admin approval writes directly to users.kycStatus)
        const profileRes = await auth.apiCall<any>('/dashboard/profile', 'GET')
        if (profileRes.success && profileRes.data) {
          const profileData = profileRes.data?.data ?? profileRes.data
          const raw = profileData.kycStatus as string | undefined
          let displayStatus = 'Unverified'
          if (raw === 'verified') displayStatus = 'Verified'
          else if (raw === 'pending') displayStatus = 'Pending Verification'
          else if (raw === 'rejected') displayStatus = 'Unverified'
          kycStatus.value = displayStatus
          localStorage.setItem('kyc_status', displayStatus)
        } else {
          // Fallback: read kycDocuments status
          const kycRes = await auth.apiCall<any>('/dashboard/kyc', 'GET')
          if (kycRes.success && kycRes.data) {
            const data = kycRes.data?.data ?? kycRes.data
            let displayStatus = 'Unverified'
            if (data.status === 'PENDING') displayStatus = 'Pending Verification'
            else if (data.status === 'APPROVED') displayStatus = 'Verified'
            kycStatus.value = displayStatus
            localStorage.setItem('kyc_status', displayStatus)
          }
        }
      } catch (err) {
        console.error('Error fetching KYC status:', err)
      }
    }
  }
})
</script>

<style scoped>
.balance-card {
  background: var(--color-surface);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
}

.dark .balance-card {
  background: var(--color-background-dark-card);
  border-color: var(--color-border-dark);
}

.balance-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: var(--color-secondary);
}

.balance-card.savings::before {
  background-color: var(--color-success);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.account-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.dark .account-name {
  color: #94a3b8;
}

.account-number {
  font-size: 14px;
  color: var(--color-text-muted);
  opacity: 0.8;
}

.dark .account-number {
  color: #94a3b8;
}

.account-balance {
  font-size: 40px;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.dark .account-balance {
  color: var(--color-text-light);
}

.available-balance {
  font-size: 14px;
  color: var(--color-text-muted);
}

.dark .available-balance {
  color: #94a3b8;
}

@media (max-width: 480px) {
  .balance-card {
    padding: 20px 16px;
  }
  .card-header {
    margin-bottom: 16px;
  }
  .account-name {
    font-size: 14px;
  }
  .account-balance {
    font-size: 26px;
    margin-bottom: 4px;
  }
  .available-balance {
    font-size: 12px;
  }
}
</style>
