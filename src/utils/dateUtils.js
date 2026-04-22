// 节假日数据（示例数据，实际应用中可通过API获取或定期更新）
const holidays = [
  // 2024年节假日
  '2024-01-01', // 元旦
  '2024-02-10', // 春节
  '2024-02-11',
  '2024-02-12',
  '2024-02-13',
  '2024-02-14',
  '2024-02-15',
  '2024-02-16',
  '2024-04-04', // 清明节
  '2024-04-05',
  '2024-04-06',
  '2024-05-01', // 劳动节
  '2024-05-02',
  '2024-05-03',
  '2024-05-04',
  '2024-05-05',
  '2024-06-10', // 端午节
  '2024-06-11',
  '2024-06-12',
  '2024-09-17', // 中秋节
  '2024-09-18',
  '2024-10-01', // 国庆节
  '2024-10-02',
  '2024-10-03',
  '2024-10-04',
  '2024-10-05',
  '2024-10-06',
  '2024-10-07'
]

// 调休日数据（示例数据）
const workdays = [
  // 2024年调休日
  '2024-02-04', // 春节调休
  '2024-02-09',
  '2024-04-07', // 清明节调休
  '2024-04-28', // 劳动节调休
  '2024-05-11',
  '2024-06-08', // 端午节调休
  '2024-09-29', // 中秋节调休
  '2024-10-12' // 国庆节调休
]

/**
 * 检查日期是否为节假日
 * @param {Date} date - 要检查的日期
 * @returns {boolean} - 是否为节假日
 */
export function checkHoliday(date) {
  const dateStr = date.toISOString().split('T')[0]
  return holidays.includes(dateStr)
}

/**
 * 检查日期是否为调休日
 * @param {Date} date - 要检查的日期
 * @returns {boolean} - 是否为调休日
 */
export function checkWorkday(date) {
  const dateStr = date.toISOString().split('T')[0]
  return workdays.includes(dateStr)
}

/**
 * 检查日期是否为工作日（考虑工作模式）
 * @param {Date} date - 要检查的日期
 * @param {string} mode - 工作模式：weekday（工作日）、biweekly（大小周）、shift（轮班）
 * @returns {boolean} - 是否为工作日
 */
export function checkWorkMode(date, mode) {
  const dayOfWeek = date.getDay() // 0-6，0是周日
  const dateStr = date.toISOString().split('T')[0]
  
  // 首先检查是否为调休日
  if (workdays.includes(dateStr)) {
    return true
  }
  
  // 检查是否为节假日
  if (holidays.includes(dateStr)) {
    return false
  }
  
  switch (mode) {
    case 'weekday':
      // 周一到周五是工作日
      return dayOfWeek >= 1 && dayOfWeek <= 5
    
    case 'biweekly':
      // 大小周：计算当年的周数，偶数周双休，奇数周单休
      const weekNumber = getWeekNumber(date)
      if (dayOfWeek === 0) { // 周日
        return weekNumber % 2 === 1 // 奇数周周日上班
      }
      return dayOfWeek >= 1 && dayOfWeek <= 5 // 周一到周五上班
    
    case 'shift':
      // 轮班模式：简单实现，实际应用中可根据具体轮班表调整
      // 这里假设轮班模式为：1-2-3-4-5-6-0 循环，其中0表示休息
      const shiftCycle = [1, 2, 3, 4, 5, 6, 0]
      const dayOfYear = getDayOfYear(date)
      const shiftIndex = (dayOfYear - 1) % shiftCycle.length
      const shift = shiftCycle[shiftIndex]
      return shift !== 0
    
    default:
      return dayOfWeek >= 1 && dayOfWeek <= 5
  }
}

/**
 * 获取日期在当年的周数
 * @param {Date} date - 日期
 * @returns {number} - 周数
 */
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * 获取日期在当年的天数
 * @param {Date} date - 日期
 * @returns {number} - 天数
 */
function getDayOfYear(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000
  return Math.floor(pastDaysOfYear) + 1
}