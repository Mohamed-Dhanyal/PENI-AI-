const { chromium } = require('playwright')
const fs = require('fs')
const path = require('path')

const OUT = path.resolve(__dirname, '../report-screenshots')
fs.mkdirSync(OUT, { recursive: true })

const shots = []
async function capture(page, name, wait = 800) {
  await page.waitForTimeout(wait)
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  shots.push(file)
  console.log('✓', file)
}

async function login(page) {
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(1000)
  const email = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]')
  if (email) {
    await email.fill('dinesh@sd.taylors.edu.my')
    const password = await page.$('input[type="password"]')
    if (password) await password.fill('password123')
    const submit = await page.$('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")')
    if (submit) await submit.click()
    await page.waitForTimeout(3500)
  }
}

async function clickNav(page, label) {
  await page.click(`button:has-text("${label}")`)
  await page.waitForTimeout(700)
}

(async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

  // 1. Login screen (WebGL background visible before authentication)
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(2500)
  await capture(page, '01-login')

  // 2. Authenticate
  await login(page)

  // 3. Dashboard
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(1500)
  await capture(page, '02-dashboard')

  // 4. Modules list
  await clickNav(page, 'My Modules')
  await page.waitForSelector('.module-card', { timeout: 10000 })
  await capture(page, '03-modules-list')

  // 5. Module detail
  await page.click('.module-card')
  await page.waitForTimeout(1200)
  await capture(page, '04-module-detail-overview')

  await page.click('text=Weekly Materials')
  await page.waitForTimeout(900)
  await capture(page, '05-module-detail-materials')

  await page.click('text=Assignments')
  await page.waitForTimeout(900)
  await capture(page, '06-module-detail-assignments')

  // 7. Attendance
  await clickNav(page, 'Attendance')
  await capture(page, '07-attendance')

  // 8. Calendar
  await clickNav(page, 'My Calendar')
  await capture(page, '08-calendar')

  // 9. Messages
  await clickNav(page, 'My Messages')
  await capture(page, '09-messages')

  // 10. Study Plan via dashboard Credits Covered card
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(1000)
  await page.click('button:has-text("Credits Covered")')
  await page.waitForTimeout(1000)
  await capture(page, '10-study-plan')

  // 11. Peni AI with a sent message so the TTS button appears
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(800)
  await page.click('.peni-btn')
  await page.waitForSelector('.peni-input', { timeout: 10000 })
  await page.fill('.peni-input', 'How is my attendance?')
  await page.click('.peni-send')
  await page.waitForTimeout(2500)
  await capture(page, '11-peni-ai')

  await browser.close()
  console.log('\nCaptured', shots.length, 'screenshots to', OUT)
})()
