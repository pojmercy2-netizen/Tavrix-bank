<template>
  <section id="contact" class="contact-section">
    <div class="container">
      <div class="contact-inner">
        <!-- Info column -->
        <div class="contact-info">
          <span class="contact-eyebrow">Get in Touch</span>
          <h2 class="contact-title">We'd love to <span class="text-gradient">hear from you</span></h2>
          <p class="contact-desc">Whether you have a question, a complaint, or just want to say hello — our team is always ready to help you.</p>

          <ul class="contact-channels">
            <li v-for="(channel, i) in channels" :key="i" class="channel-item">
              <div class="channel-icon-wrap">
                <Icon :name="channel.icon" :size="20" class="channel-icon" />
              </div>
              <div>
                <p class="channel-label">{{ channel.label }}</p>
                <a :href="channel.href" class="channel-value">{{ channel.value }}</a>
              </div>
            </li>
          </ul>

          <div class="office-hours">
            <Icon name="lucide:clock" :size="16" class="hours-icon" />
            <p>Support available <strong>24/7</strong> — 365 days a year</p>
          </div>
        </div>

        <!-- Form column -->
        <div class="contact-form-wrap">
          <form class="contact-form" @submit.prevent="submitForm">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="contact-first-name">First Name</label>
                <input id="contact-first-name" v-model="form.firstName" class="form-input" type="text" placeholder="John" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="contact-last-name">Last Name</label>
                <input id="contact-last-name" v-model="form.lastName" class="form-input" type="text" placeholder="Doe" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-email">Email Address</label>
              <input id="contact-email" v-model="form.email" class="form-input" type="email" placeholder="john@example.com" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-subject">Subject</label>
              <select id="contact-subject" v-model="form.subject" class="form-input form-select">
                <option value="">Select a topic…</option>
                <option value="account">Account Help</option>
                <option value="transfer">Transfers & Payments</option>
                <option value="loan">Loans & Credit</option>
                <option value="security">Security Concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="contact-message">Message</label>
              <textarea id="contact-message" v-model="form.message" class="form-input form-textarea" placeholder="Tell us how we can help…" rows="4" required />
            </div>
            <button type="submit" class="btn btn-primary submit-btn" :disabled="submitted">
              <Icon v-if="submitted" name="lucide:check-circle" :size="18" />
              <Icon v-else name="lucide:send" :size="18" />
              {{ submitted ? 'Message Sent!' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const form = reactive({ firstName: '', lastName: '', email: '', subject: '', message: '' })
const submitted = ref(false)

const supportEmail = ref('support@tavrixbank.com')
const supportPhone = ref('+1 (800) 555-0199')

const submitForm = () => {
  submitted.value = true
  setTimeout(() => { submitted.value = false }, 4000)
}

const channels = computed(() => [
  { icon: 'lucide:mail', label: 'Email Us', value: supportEmail.value, href: `mailto:${supportEmail.value}` },
  { icon: 'lucide:phone', label: 'Call Us', value: supportPhone.value, href: `tel:${supportPhone.value.replace(/[^+\d]/g, '')}` },
  { icon: 'lucide:map-pin', label: 'Head Office', value: '200 Park Avenue, New York, NY 10166', href: '#' }
])

onMounted(async () => {
  try {
    const res = await $fetch<any>('/api/settings')
    if (res.success && res.data) {
      const data = res.data?.data ?? res.data
      if (data.supportEmail) supportEmail.value = data.supportEmail
      if (data.supportPhone) supportPhone.value = data.supportPhone
    }
  } catch {
    // Fallback quietly
  }
})
</script>

<style scoped>
.contact-section {
  padding: 100px 0;
  background: var(--color-background-subtle);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 768px) {
  .contact-section { padding: 64px 0; }
}

@media (max-width: 480px) {
  .contact-section { padding: 48px 0; }
}

.dark .contact-section {
  background: var(--color-background-subtle);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.contact-inner {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 80px;
  align-items: start;
}

@media (max-width: 900px) {
  .contact-inner { grid-template-columns: 1fr; gap: 48px; }
}

/* Info side */
.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-eyebrow {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
}

.dark .contact-eyebrow { color: #60a5fa; }

.contact-title {
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 800;
  color: var(--color-text-main);
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dark .contact-title { color: #ffffff; }

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

.contact-desc {
  font-size: 15px;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.contact-channels {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 8px;
}

.channel-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.channel-item:hover {
  border-color: rgba(0, 102, 255, 0.3);
  box-shadow: 0 6px 20px rgba(0, 102, 255, 0.06);
}

.dark .channel-item {
  background: rgba(17, 34, 64, 0.4);
  border-color: rgba(255, 255, 255, 0.06);
}

.channel-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 102, 255, 0.08);
  border: 1px solid rgba(0, 102, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.channel-icon { color: var(--color-secondary); }
.dark .channel-icon { color: #60a5fa; }

.channel-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 2px;
}

.channel-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-main);
  text-decoration: none;
  transition: color 0.2s;
}

.channel-value:hover { color: var(--color-secondary); }

.dark .channel-value { color: #e2e8f0; }
.dark .channel-value:hover { color: #60a5fa; }

.office-hours {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 14px 18px;
  background: rgba(0, 102, 255, 0.05);
  border: 1px solid rgba(0, 102, 255, 0.12);
  border-radius: 10px;
}

.hours-icon { color: var(--color-secondary); flex-shrink: 0; }
.dark .hours-icon { color: #60a5fa; }

/* Form side */
.contact-form-wrap {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 40px;
}

@media (max-width: 640px) {
  .contact-form-wrap {
    padding: 24px 18px;
    border-radius: 16px;
  }
}

.dark .contact-form-wrap {
  background: rgba(17, 34, 64, 0.5);
  border-color: rgba(255, 255, 255, 0.07);
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 550px) {
  .form-row { grid-template-columns: 1fr; }
}

.form-select {
  appearance: none;
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  transition: all 0.3s ease;
}

.submit-btn:disabled {
  background: var(--color-success);
  cursor: default;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}
</style>
