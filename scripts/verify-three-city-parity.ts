import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { enquiryService } from '../src/services/enquiryService';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\kthar\\.gemini\\antigravity\\brain\\9076861a-2010-4a7c-a3c7-3851ba7daeeb\\screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkServerReady(port: number): Promise<boolean> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/`);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function sendCDP(ws: WebSocket, method: string, params: any = {}): Promise<any> {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const handleMsg = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handleMsg);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handleMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function setViewportAndCapture(
  ws: WebSocket,
  width: number,
  height: number,
  outputPath: string
) {
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await wait(800);

  const res = await sendCDP(ws, 'Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  });

  const buffer = Buffer.from(res.data, 'base64');
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  console.log('=============================================================================');
  console.log('KAARYAN LABS — THREE-CITY & VELLORE ADS RELEASE READINESS ACCEPTANCE SUITE');
  console.log('=============================================================================\n');

  console.log('▶ 1. Launching Vite Preview Server on Port 4173...');
  const preview = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--port', '4173', '--host', '127.0.0.1']);

  preview.stdout?.on('data', (d) => console.log('preview stdout:', d.toString()));
  preview.stderr?.on('data', (d) => console.log('preview stderr:', d.toString()));

  let ready = false;
  for (let i = 0; i < 30; i++) {
    await wait(400);
    ready = await checkServerReady(4173);
    if (ready) break;
  }

  if (!ready) {
    console.error('❌ Failed to reach Vite preview server on 127.0.0.1:4173');
    preview.kill();
    process.exit(1);
  }
  console.log('✅ Vite preview server online on port 4173.');

  console.log('\n▶ 2. Launching Headless Chrome with Remote Debugging (port 9225)...');
  const tmpProfile = path.join(process.cwd(), '.tmp-parity-chrome');
  if (fs.existsSync(tmpProfile)) {
    fs.rmSync(tmpProfile, { recursive: true, force: true });
  }

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    `--user-data-dir=${tmpProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
  ]);

  let cdpReady = false;
  let pageDebuggerUrl = '';
  for (let i = 0; i < 30; i++) {
    await wait(400);
    try {
      const targetsRes = await fetch('http://127.0.0.1:9225/json/list');
      if (targetsRes.ok) {
        const targets: any = await targetsRes.json();
        const pageTarget = targets.find((t: any) => t.type === 'page') || targets[0];
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          pageDebuggerUrl = pageTarget.webSocketDebuggerUrl;
          cdpReady = true;
          break;
        }
      }
    } catch {}
  }

  if (!cdpReady || !pageDebuggerUrl) {
    console.error('❌ Failed to connect to Chrome DevTools Protocol on port 9225');
    chrome.kill();
    preview.kill();
    process.exit(1);
  }
  console.log('✅ Chrome DevTools Protocol page connected at:', pageDebuggerUrl);

  const ws = new WebSocket(pageDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  await sendCDP(ws, 'Page.enable');
  await sendCDP(ws, 'DOM.enable');
  await sendCDP(ws, 'Runtime.enable');
  await sendCDP(ws, 'Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const assertionResults: { journey: string; passed: boolean; details: string }[] = [];

  try {
    // -------------------------------------------------------------------------
    // JOURNEY 1: CHITTOOR ADS (AP-03)
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 1: Verifying Chittoor Ads Default Page (/city/chittoor)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor' });
    await wait(2000);

    const chittoorCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const title = document.title;
          const phoneFound = text.includes('94402 18456');
          const brandFound = text.includes('Chittoor Ads') || text.includes('CHITTOOR ADS');
          const codeFound = text.includes('AP-03');
          return { title, phoneFound, brandFound, codeFound };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Chittoor Metadata Check:', chittoorCheck.result.value);
    const chittoorPass = chittoorCheck.result.value.phoneFound && chittoorCheck.result.value.codeFound;
    assertionResults.push({
      journey: 'Chittoor Ads Branding & Phone',
      passed: chittoorPass,
      details: `Phone: ${chittoorCheck.result.value.phoneFound}, Code: ${chittoorCheck.result.value.codeFound}, Title: ${chittoorCheck.result.value.title}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'city_chittoor_1440px.png')
    );
    console.log('   📸 Captured: city_chittoor_1440px.png');

    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'city_chittoor_390px.png')
    );
    console.log('   📸 Captured: city_chittoor_390px.png');

    // -------------------------------------------------------------------------
    // JOURNEY 2: VELLORE ADS (TN-23) — Content Isolation & Parity
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 2: Verifying Vellore Ads Homepage (/city/vellore)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore' });
    await wait(2000);

    const velloreCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const title = document.title;
          const vellorePhone = text.includes('81899 85559');
          const velloreEmail = text.includes('info@velloreads.com');
          const velloreCode = text.includes('TN-23');
          // Check NO Chittoor leakages
          const chittoorPhoneLeak = text.includes('94402 18456');
          const mangoMandisLeak = text.includes('Mango Mandis');
          const kanipakamCabsLeak = text.includes('Kanipakam Cabs');

          // Check Vellore Parity Sections (Sanitized without invented specs)
          const theatresSection = text.includes('Balaji Cinemas') || text.includes('Vishnu Cinemas') || text.includes('Entertainment Directory');
          const attractionsSection = text.includes('Vellore Fort') || text.includes('Sripuram Golden Temple') || text.includes('Explore Vellore Heritage');
          const quickEnquiry = text.includes('Need a Local Service in Vellore') || text.includes('Request Free Callback & Quotes');

          return {
            title,
            vellorePhone,
            velloreEmail,
            velloreCode,
            chittoorPhoneLeak,
            mangoMandisLeak,
            kanipakamCabsLeak,
            theatresSection,
            attractionsSection,
            quickEnquiry
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Vellore Evaluation Results:', velloreCheck.result.value);
    const v = velloreCheck.result.value;
    const vellorePass =
      v.vellorePhone &&
      v.velloreCode &&
      !v.chittoorPhoneLeak &&
      !v.mangoMandisLeak &&
      !v.kanipakamCabsLeak &&
      v.theatresSection &&
      v.attractionsSection &&
      v.quickEnquiry;

    assertionResults.push({
      journey: 'Vellore Ads Isolation & Legacy Parity',
      passed: vellorePass,
      details: `Vellore Phone: ${v.vellorePhone}, Code: ${v.velloreCode}, No Chittoor Phone: ${!v.chittoorPhoneLeak}, Theatres: ${v.theatresSection}, Attractions: ${v.attractionsSection}, Callback: ${v.quickEnquiry}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'city_vellore_1440px.png')
    );
    console.log('   📸 Captured: city_vellore_1440px.png');

    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'city_vellore_390px.png')
    );
    console.log('   📸 Captured: city_vellore_390px.png');

    // Scroll to theatres and attractions
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `window.scrollBy({ top: 1200, behavior: 'instant' });`,
    });
    await wait(600);
    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'vellore_theatres_and_attractions_1440px.png')
    );
    console.log('   📸 Captured: vellore_theatres_and_attractions_1440px.png');

    // -------------------------------------------------------------------------
    // JOURNEY 3: BENGALURU ADS (KA-01) — Content Isolation & Unverified Phone Removal
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 3: Verifying Bengaluru Ads Homepage (/city/bengaluru)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/bengaluru' });
    await wait(2000);

    const bengaluruCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const title = document.title;
          const blrCode = text.includes('KA-01');
          const blrEmail = text.includes('support@bengaluruads.com');
          const chittoorPhoneLeak = text.includes('94402 18456');
          const vellorePhoneLeak = text.includes('81899 85559');
          // Fake Bengaluru phone was +91 80 4123 4567 — must NOT be displayed in footer or chatbot
          const fakePhoneLeak = text.includes('4123 4567');
          const showsPendingHotline = text.includes('Online Portal Desk (Hotline Pending Setup)');

          return {
            title,
            blrCode,
            blrEmail,
            chittoorPhoneLeak,
            vellorePhoneLeak,
            fakePhoneLeak,
            showsPendingHotline
          };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Bengaluru Evaluation Results:', bengaluruCheck.result.value);
    const b = bengaluruCheck.result.value;
    const bengaluruPass = b.blrCode && !b.chittoorPhoneLeak && !b.vellorePhoneLeak && !b.fakePhoneLeak && b.showsPendingHotline;

    assertionResults.push({
      journey: 'Bengaluru Ads Isolation & Phone Verification',
      passed: bengaluruPass,
      details: `Bengaluru Code: ${b.blrCode}, Pending Hotline: ${b.showsPendingHotline}, No Fake Phone: ${!b.fakePhoneLeak}, No Chittoor Phone: ${!b.chittoorPhoneLeak}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'city_bengaluru_1440px.png')
    );
    console.log('   📸 Captured: city_bengaluru_1440px.png');

    await setViewportAndCapture(
      ws,
      390,
      844,
      path.join(ARTIFACT_DIR, 'city_bengaluru_390px.png')
    );
    console.log('   📸 Captured: city_bengaluru_390px.png');

    // -------------------------------------------------------------------------
    // JOURNEY 4: DIRECT BUSINESS ROUTE (/city/vellore/business/v-001)
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 4: Verifying Direct Business Deep Link (/city/vellore/business/v-001)...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore/business/v-001' });
    await wait(2200);

    const directCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const hasTitle = text.includes('Sample Medical Diagnostic Listing (Preview)') || text.includes('Diagnostic');
          const hasPreviewBadge = text.includes('Directory Preview Item') || text.includes('New Listing • Unrated');
          const hasNoFakeReviews = !text.includes('S. Ramanjaneyulu') && !text.includes('Based on 142');
          return { hasTitle, hasPreviewBadge, hasNoFakeReviews };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Direct Link Modal Check:', directCheck.result.value);
    const directPass = directCheck.result.value.hasTitle && directCheck.result.value.hasNoFakeReviews;
    assertionResults.push({
      journey: 'Direct Business Route & Mock Fixture Sanitization',
      passed: directPass,
      details: `Direct business modal opened with preview designation: ${directCheck.result.value.hasTitle}, zero fake reviews: ${directCheck.result.value.hasNoFakeReviews}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'vellore_business_direct_v001_1440px.png')
    );
    console.log('   📸 Captured: vellore_business_direct_v001_1440px.png');

    // -------------------------------------------------------------------------
    // JOURNEY 5: UNAPPROVED PRICING REMOVED & FRANCHISE OPPORTUNITY MODAL
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 5: Verifying Unapproved Pricing Removal & Franchise Modal on Vellore...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/vellore' });
    await wait(1800);

    // Verify footer DOES NOT have unapproved customer-facing pricing package buttons
    const unapprovedPricingCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const has999 = text.includes('₹999') || text.includes('999/year');
          const has2499 = text.includes('₹2,499') || text.includes('2,499/month');
          const hasAdvertisePlanBtn = Array.from(document.querySelectorAll('button')).some(b =>
            b.innerText.includes('Advertise & Business Plans')
          );
          return { has999, has2499, hasAdvertisePlanBtn };
        })()
      `,
      returnByValue: true,
    });

    const up = unapprovedPricingCheck.result.value;
    const pricingPass = !up.has999 && !up.has2499 && !up.hasAdvertisePlanBtn;
    assertionResults.push({
      journey: 'Unapproved Pricing Removal from Customer UI',
      passed: pricingPass,
      details: `No ₹999 unapproved price: ${!up.has999}, No ₹2,499: ${!up.has2499}, No unapproved plans button in footer: ${!up.hasAdvertisePlanBtn}`,
    });

    // Open Franchise Modal from Footer
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const franchiseBtn = btns.find(b => b.innerText.includes('Franchise Opportunities') || b.innerText.includes('Franchise'));
          if (franchiseBtn) {
            franchiseBtn.click();
            return true;
          }
          return false;
        })()
      `,
    });

    await wait(1000);
    const franchiseCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          return text.includes('City Franchise & Regional Growth') && text.includes('Tamil Nadu');
        })()
      `,
      returnByValue: true,
    });

    assertionResults.push({
      journey: 'Vellore Ads Franchise Opportunity Modal',
      passed: franchiseCheck.result.value,
      details: `Franchise modal opened with regional growth content: ${franchiseCheck.result.value}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'vellore_franchise_modal_1440px.png')
    );
    console.log('   📸 Captured: vellore_franchise_modal_1440px.png');

    // Close franchise modal
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const close = document.querySelector('button[aria-label="Close franchise modal"]');
          if (close) (close as HTMLElement).click();
        })()
      `,
    });
    await wait(500);

    // -------------------------------------------------------------------------
    // JOURNEY 6: EMERGENCY HELPLINE MODAL ON VELLORE
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 6: Verifying Vellore Emergency Services Modal (CMC, TANGEDCO)...');
    await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const emerBtn = btns.find(b => b.innerText.includes('24x7 Emergency') || b.innerText.includes('Emergency Helplines') || b.innerText.includes('Emergency'));
          if (emerBtn) emerBtn.click();
        })()
      `,
    });
    await wait(1000);

    const emergencyCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const hasCMC = text.includes('CMC Hospital Emergency') || text.includes('0416-2281000');
          const hasTangedco = text.includes('TANGEDCO') || text.includes('94987 94987');
          const hasTamil = text.includes('வேலூர்');
          return { hasCMC, hasTangedco, hasTamil };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Vellore Emergency Helplines Check:', emergencyCheck.result.value);
    const em = emergencyCheck.result.value;
    assertionResults.push({
      journey: 'Vellore Dedicated Emergency Helplines (CMC & TANGEDCO)',
      passed: em.hasCMC && em.hasTangedco,
      details: `CMC: ${em.hasCMC}, TANGEDCO: ${em.hasTangedco}, Tamil Script: ${em.hasTamil}`,
    });

    await setViewportAndCapture(
      ws,
      1440,
      900,
      path.join(ARTIFACT_DIR, 'vellore_emergency_modal_1440px.png')
    );
    console.log('   📸 Captured: vellore_emergency_modal_1440px.png');

    // -------------------------------------------------------------------------
    // JOURNEY 7: STATIC SEO PRERENDERING VALIDATION
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 7: Verifying Raw Static HTML SEO Prerendering...');
    const distDir = path.join(process.cwd(), 'dist');
    const chittoorHtml = fs.readFileSync(path.join(distDir, 'city', 'chittoor', 'index.html'), 'utf-8');
    const velloreHtml = fs.readFileSync(path.join(distDir, 'city', 'vellore', 'index.html'), 'utf-8');
    const blrHtml = fs.readFileSync(path.join(distDir, 'city', 'bengaluru', 'index.html'), 'utf-8');

    const chittoorOk = chittoorHtml.includes('AP-03') && chittoorHtml.includes('canonical') && chittoorHtml.includes('/city/chittoor');
    const velloreOk = velloreHtml.includes('TN-23') && velloreHtml.includes('canonical') && velloreHtml.includes('/city/vellore');
    const blrOk = blrHtml.includes('KA-01') && blrHtml.includes('canonical') && blrHtml.includes('/city/bengaluru');

    const ssgPass = chittoorOk && velloreOk && blrOk;
    assertionResults.push({
      journey: 'City SEO Static Prerender Verification',
      passed: ssgPass,
      details: `Chittoor AP-03 Canonical: ${chittoorOk}, Vellore TN-23 Canonical: ${velloreOk}, Bengaluru KA-01 Canonical: ${blrOk}`,
    });

    // -------------------------------------------------------------------------
    // JOURNEY 8: HOMEPAGE QUICK ENQUIRY SCHEMA & VALIDATION CHECK
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 8: Verifying General Service Lead Submission Validation...');
    const emptyLeadRes = await enquiryService.submitGeneralLead({
      cityId: 'vellore',
      categoryId: 'healthcare',
      areaId: 'bagayam',
      customerName: '',
      customerPhone: '9840012345',
      message: 'Need general checkup',
    });

    const invalidPhoneRes = await enquiryService.submitGeneralLead({
      cityId: 'vellore',
      categoryId: 'healthcare',
      areaId: 'bagayam',
      customerName: 'Kumar',
      customerPhone: '123',
      message: 'Need general checkup',
    });

    const validLeadRes = await enquiryService.submitGeneralLead({
      cityId: 'vellore',
      categoryId: 'healthcare',
      areaId: 'bagayam',
      customerName: 'Kumar Raman',
      customerPhone: '9840012345',
      message: 'Need diagnostic blood test home collection quote',
    });

    const validationPass = !emptyLeadRes.success && !invalidPhoneRes.success && validLeadRes.success;
    assertionResults.push({
      journey: 'Homepage Quick Enquiry Validation & Decoupled Lead Routing',
      passed: validationPass,
      details: `Rejects empty name: ${!emptyLeadRes.success}, Rejects bad phone: ${!invalidPhoneRes.success}, Accepts valid lead without dummy business UUID: ${validLeadRes.success}`,
    });

    // -------------------------------------------------------------------------
    // JOURNEY 9: BUSINESS OWNER DASHBOARD SECURITY & ACCESS GATE
    // -------------------------------------------------------------------------
    console.log('\n▶ Journey 9: Verifying Business Owner Dashboard Access & Security Gate...');
    await sendCDP(ws, 'Page.navigate', { url: 'http://127.0.0.1:4173/city/chittoor/dashboard' });
    await wait(2000);

    const chittoorGateCheck = await sendCDP(ws, 'Runtime.evaluate', {
      expression: `
        (() => {
          const text = document.body.innerText;
          const hasPortalHeading = text.includes('Business Owner & Merchant Portal');
          const hasAuthRequired = text.includes('Merchant Authentication Required');
          const hasSignInBtn = text.includes('Sign In as Merchant');
          const hasCityBadge = text.includes('Chittoor (AP-03)');
          return { hasPortalHeading, hasAuthRequired, hasSignInBtn, hasCityBadge };
        })()
      `,
      returnByValue: true,
    });

    console.log('   Chittoor Dashboard Gate Check:', chittoorGateCheck.result.value);
    const cGate = chittoorGateCheck.result.value;
    const gatePass = cGate.hasPortalHeading && cGate.hasAuthRequired && cGate.hasSignInBtn && cGate.hasCityBadge;

    assertionResults.push({
      journey: 'Business Owner Dashboard Authentication Gate & Isolation',
      passed: gatePass,
      details: `Portal Heading: ${cGate.hasPortalHeading}, Auth Required: ${cGate.hasAuthRequired}, Sign-in CTA: ${cGate.hasSignInBtn}, Scoped Badge: ${cGate.hasCityBadge}`,
    });

  } catch (err) {
    console.error('❌ Error during browser test execution:', err);
    assertionResults.push({
      journey: 'Test Suite Execution',
      passed: false,
      details: String(err),
    });
  } finally {
    console.log('\n▶ Cleaning up headless test processes...');
    ws.close();
    chrome.kill();
    preview.kill();

    if (fs.existsSync(tmpProfile)) {
      try {
        fs.rmSync(tmpProfile, { recursive: true, force: true });
      } catch {}
    }
  }

  console.log('\n=============================================================================');
  console.log('THREE-CITY AUDIT EXECUTION SUMMARY');
  console.log('=============================================================================');
  let allPassed = true;
  for (const r of assertionResults) {
    const icon = r.passed ? '✅ PASS' : '❌ FAIL';
    if (!r.passed) allPassed = false;
    console.log(`${icon} | ${r.journey} -> ${r.details}`);
  }

  if (allPassed) {
    console.log('\n🎉 ALL ACCEPTANCE ASSERTIONS PASSED! Exit code 0.');
    process.exit(0);
  } else {
    console.error('\n⚠️ SOME ASSERTIONS FAILED. Exit code 1.');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal runner error:', e);
  process.exit(1);
});
