<template>
  <div class="app-container">
    <div class="header">
      <h1>智能闹钟</h1>
      <p class="date">{{ today }}</p>
    </div>

    <div class="main-content">
      <div class="status-card" :class="statusClass">
        <div class="status-icon">{{ statusIcon }}</div>
        <div class="status-text">
          <h2>{{ todayStatus }}</h2>
          <p>{{ statusDescription }}</p>
        </div>
      </div>

      <div class="alarm-card">
        <div class="time-display">
          <input type="time" v-model="alarmTime" class="time-input" />
        </div>

        <div class="work-mode">
          <label>工作模式</label>
          <div class="mode-buttons">
            <button
              v-for="mode in workModes"
              :key="mode.value"
              :class="{ active: workMode === mode.value }"
              @click="workMode = mode.value"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="alarm-toggle">
          <span class="toggle-label">{{ isAlarmActive ? '闹钟开启' : '闹钟关闭' }}</span>
          <button class="toggle-btn" :class="{ on: isAlarmActive }" @click="toggleAlarm">
            <span class="toggle-ball"></span>
          </button>
        </div>
      </div>

      <div class="info-card">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-label">今日</span>
          <span class="info-value">{{ dayOfWeek }}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">⏰</span>
          <span class="info-label">响铃</span>
          <span class="info-value">{{ alarmTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📊</span>
          <span class="info-label">模式</span>
          <span class="info-value">{{ currentModeLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { checkHoliday, checkWorkMode, checkWorkday } from './utils/dateUtils.js'

const alarmTime = ref('07:30')
const workMode = ref('weekday')
const isAlarmActive = ref(true)

const workModes = [
  { value: 'weekday', label: '工作日' },
  { value: 'biweekly', label: '大小周' },
  { value: 'shift', label: '轮班制' }
]

const today = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric'
  })
})

const dayOfWeek = computed(() => {
  const date = new Date()
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[date.getDay()]
})

const isHoliday = computed(() => checkHoliday(new Date()))
const isWorkDay = computed(() => checkWorkday(new Date()))
const isWorkModeActive = computed(() => checkWorkMode(new Date(), workMode.value))

const todayStatus = computed(() => {
  if (isHoliday.value) return '假日'
  if (isWorkDay.value) return '调休'
  if (isWorkModeActive.value) return '工作日'
  return '休息日'
})

const statusClass = computed(() => {
  if (isHoliday.value) return 'holiday'
  if (isWorkDay.value || isWorkModeActive.value) return 'workday'
  return 'restday'
})

const statusIcon = computed(() => {
  if (isHoliday.value) return '🎉'
  if (isWorkDay.value || isWorkModeActive.value) return '💼'
  return '🌴'
})

const statusDescription = computed(() => {
  if (!isAlarmActive.value) return '闹钟已关闭'
  if (isHoliday.value) return '假期愉快，闹钟静音'
  if (isWorkDay.value || isWorkModeActive.value) return `闹钟将在 ${alarmTime.value} 响起`
  return '休息日，闹钟不响'
})

const currentModeLabel = computed(() => {
  const mode = workModes.find(m => m.value === workMode.value)
  return mode ? mode.label : '工作日'
})

const toggleAlarm = () => {
  isAlarmActive.value = !isAlarmActive.value
  saveSettings()
}

const saveSettings = () => {
  const settings = {
    alarmTime: alarmTime.value,
    workMode: workMode.value,
    isAlarmActive: isAlarmActive.value
  }
  localStorage.setItem('alarmSettings', JSON.stringify(settings))
}

const loadSettings = () => {
  const settings = localStorage.getItem('alarmSettings')
  if (settings) {
    const parsed = JSON.parse(settings)
    alarmTime.value = parsed.alarmTime || '07:30'
    workMode.value = parsed.workMode || 'weekday'
    isAlarmActive.value = parsed.isAlarmActive !== false
  }
}

watch([alarmTime, workMode], () => {
  saveSettings()
})

onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  color: white;
  padding: 20px 0;
}

.header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.header .date {
  font-size: 16px;
  opacity: 0.9;
}

.main-content {
  max-width: 400px;
  margin: 0 auto;
}

.status-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  transition: transform 0.3s ease;
}

.status-card:active {
  transform: scale(0.98);
}

.status-icon {
  font-size: 48px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f0f0;
}

.status-card.holiday .status-icon {
  background: #fff3e0;
}

.status-card.workday .status-icon {
  background: #e3f2fd;
}

.status-card.restday .status-icon {
  background: #e8f5e9;
}

.status-text h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 4px;
}

.status-text p {
  font-size: 14px;
  color: #666;
}

.alarm-card {
  background: white;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.time-display {
  text-align: center;
  margin-bottom: 30px;
}

.time-input {
  font-size: 48px;
  font-weight: 300;
  border: none;
  background: transparent;
  color: #333;
  text-align: center;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.time-input:focus {
  outline: none;
  background: #f5f5f5;
}

.work-mode {
  margin-bottom: 30px;
}

.work-mode label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
}

.mode-buttons {
  display: flex;
  gap: 10px;
}

.mode-buttons button {
  flex: 1;
  padding: 12px 8px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-buttons button.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.mode-buttons button:active {
  transform: scale(0.95);
}

.alarm-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.toggle-label {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.toggle-btn {
  width: 60px;
  height: 34px;
  border-radius: 17px;
  background: #e0e0e0;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background 0.3s ease;
}

.toggle-btn.on {
  background: #4CAF50;
}

.toggle-ball {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: transform 0.3s ease;
}

.toggle-btn.on .toggle-ball {
  transform: translateX(26px);
}

.info-card {
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  text-align: center;
  color: white;
}

.info-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.info-label {
  font-size: 12px;
  opacity: 0.8;
  display: block;
  margin-bottom: 4px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}
</style>