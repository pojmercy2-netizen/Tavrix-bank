<template>
  <section id="faq" class="faq-section">
    <div class="container">
      <div class="faq-inner">
        <!-- Header -->
        <div class="faq-header">
          <span class="faq-eyebrow">FAQ</span>
          <h2 class="faq-title">Frequently Asked <span class="text-gradient">Questions</span></h2>
          <p class="faq-subtitle">Everything you need to know about Tavrix Bank. Can't find your answer? <a href="#contact" class="faq-contact-link">Contact our team.</a></p>
        </div>

        <!-- Accordion -->
        <div class="faq-list">
          <div
            v-for="(item, i) in faqs"
            :key="i"
            class="faq-item"
            :class="{ open: openIndex === i }"
            @click="toggle(i)"
          >
            <div class="faq-question">
              <span>{{ item.question }}</span>
              <div class="faq-chevron">
                <Icon name="lucide:chevron-down" :size="20" />
              </div>
            </div>
            <div class="faq-answer">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const openIndex = ref<number | null>(0)
const toggle = (i: number) => { openIndex.value = openIndex.value === i ? null : i }

const supportEmail = ref('support@tavrixbank.com')
const supportPhone = ref('+16064625390')
const whatsappNumber = ref('+16064625390')

const { data: initialSettings } = await useAsyncData('faq-settings', () => $fetch<any>('/api/settings'), {
  default: () => null
})

if (initialSettings.value?.data) {
  const data = initialSettings.value.data?.data ?? initialSettings.value.data
  if (data?.supportEmail) supportEmail.value = data.supportEmail
  if (data?.supportPhone) supportPhone.value = data.supportPhone
  if (data?.whatsappNumber) whatsappNumber.value = data.whatsappNumber
}

onMounted(async () => {
  try {
    const res = await $fetch<any>('/api/settings')
    if (res?.success && res?.data) {
      const data = res.data?.data ?? res.data
      if (data.supportEmail) supportEmail.value = data.supportEmail
      if (data.supportPhone) supportPhone.value = data.supportPhone
      if (data.whatsappNumber) whatsappNumber.value = data.whatsappNumber
    }
  } catch (err) {
    // Fallback quietly to default
  }
})

const faqs = computed(() => [
  {
    question: 'How do I open a Tavrix Bank account?',
    answer: 'Opening an account takes less than 5 minutes. Simply click "Open an Account", provide your personal details, verify your identity with a government-issued ID, and your account will be ready instantly.'
  },
  {
    question: 'Is my money safe with Tavrix Bank?',
    answer: 'Absolutely. Tavrix Bank is FDIC insured up to $250,000 per depositor. We also use military-grade 256-bit AES encryption and multi-factor authentication to protect every account and transaction.'
  },
  {
    question: 'What fees does Tavrix Bank charge?',
    answer: 'We believe in radical transparency. Our checking accounts have zero monthly fees, zero minimum balance requirements, and zero ATM fees at 40,000+ locations. Foreign exchange uses real interbank rates with no markup.'
  },
  {
    question: 'How do international money transfers work?',
    answer: 'You can send money to 120+ countries in minutes. Transfers use live interbank exchange rates with a flat, disclosed fee. Recipients can receive funds directly into a bank account or mobile wallet.'
  },
  {
    question: 'Can I get a virtual card immediately after signing up?',
    answer: 'Yes! Once your account is verified, you can instantly generate a virtual card from your dashboard. Use it immediately for online purchases, subscriptions, or anywhere digital payments are accepted.'
  },
  {
    question: 'What types of loans does Tavrix Bank offer?',
    answer: 'We offer personal loans, auto loans, mortgages, and business financing. Loan applications are processed digitally and most personal loan decisions are made in under 24 hours at competitive fixed rates.'
  },
  {
    question: 'How do I contact customer support?',
    answer: `Our support team is available 24/7 via WhatsApp (${whatsappNumber.value || supportPhone.value}), email at ${supportEmail.value}, or by calling ${supportPhone.value}. Average response time is under 2 minutes for WhatsApp and under 4 hours for email.`
  }
])
</script>

<style scoped>
.faq-section {
  padding: 100px 0;
  background: var(--color-background-light);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .faq-section { padding: 64px 0; }
}

@media (max-width: 480px) {
  .faq-section { padding: 48px 0; }
}

.dark .faq-section {
  background: var(--color-background-light);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.faq-inner {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 80px;
  align-items: start;
}

@media (max-width: 900px) {
  .faq-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 480px) {
  .faq-inner { gap: 28px; }
}

/* Header */
.faq-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 100px;
}

@media (max-width: 900px) {
  .faq-header { position: static; text-align: center; }
}

.faq-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.dark .faq-eyebrow { color: #60a5fa; }

.faq-title {
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dark .faq-title { color: #ffffff; }

.text-gradient {
  background: linear-gradient(135deg, #0066FF, #6366f1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dark .text-gradient {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.faq-subtitle {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.faq-contact-link {
  color: var(--color-secondary);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dark .faq-contact-link { color: #60a5fa; }

/* Accordion */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}

.dark .faq-item {
  background: rgba(17, 34, 64, 0.4);
  border-color: rgba(255, 255, 255, 0.06);
}

.faq-item.open {
  border-color: rgba(0, 102, 255, 0.35);
  box-shadow: 0 8px 30px rgba(0, 102, 255, 0.07);
}

.dark .faq-item.open {
  border-color: rgba(96, 165, 250, 0.3);
  box-shadow: 0 8px 30px rgba(0, 102, 255, 0.12);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 24px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-main);
  user-select: none;
}

@media (max-width: 480px) {
  .faq-question {
    padding: 16px 18px;
    font-size: 14px;
    gap: 12px;
  }
  .faq-answer p {
    padding: 0 18px 18px;
    font-size: 13px;
  }
}

.dark .faq-question { color: #ffffff; }

.faq-chevron {
  flex-shrink: 0;
  color: var(--color-text-muted);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.2s;
}

.faq-item.open .faq-chevron {
  transform: rotate(180deg);
  color: var(--color-secondary);
}

.dark .faq-item.open .faq-chevron { color: #60a5fa; }

.faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.faq-item.open .faq-answer {
  max-height: 400px;
}

.faq-answer p {
  padding: 0 24px 22px;
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.dark .faq-answer p { color: rgba(255, 255, 255, 0.6); }
</style>
