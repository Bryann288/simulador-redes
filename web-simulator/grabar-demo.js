import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('====================================================');
  console.log('🎬 Iniciando grabación dinámica con cursor virtual y navegación...');
  console.log('====================================================\n');

  const outputDir = path.resolve('./videos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const isHeadless = process.env.HEADLESS === 'true';
  const browser = await chromium.launch({
    headless: isHeadless,
    slowMo: 25
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  const URL = 'http://localhost:5173';
  console.log(`🌐 Cargando plataforma: ${URL}`);

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => page.goto(URL));

  // Inyectar cursor virtual de alta visibilidad con onda expansiva de clic
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'virtual-mouse-pointer';
    cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(14, 165, 233, 0.45);
      border: 2px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.95), 0 2px 8px rgba(0,0,0,0.6);
      pointer-events: none;
      z-index: 9999999;
      transform: translate(-50%, -50%);
      transition: transform 0.12s ease, background 0.12s ease;
    `;
    document.body.appendChild(cursor);

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes ripple-wave {
        0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; border-color: #38bdf8; }
        100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; border-color: #0284c7; }
      }
      .click-ripple {
        position: fixed;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #38bdf8;
        background: rgba(56, 189, 248, 0.25);
        pointer-events: none;
        z-index: 9999998;
        animation: ripple-wave 0.45s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    window.triggerRipple = (x, y) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 500);
    };

    window.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });

    window.addEventListener('mousedown', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.75)';
      cursor.style.background = 'rgba(56, 189, 248, 0.85)';
    });

    window.addEventListener('mouseup', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.background = 'rgba(14, 165, 233, 0.45)';
    });
  });

  // Funciones de navegación suave con mouse
  const moveMouseTo = async (locator, steps = 15) => {
    const box = await locator.boundingBox();
    if (!box) return null;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y, { steps });
    return { x, y };
  };

  const clickWithMouse = async (locator, delayAfter = 400) => {
    const coords = await moveMouseTo(locator);
    if (!coords) return;
    await page.waitForTimeout(100);
    await page.evaluate(({ x, y }) => window.triggerRipple(x, y), coords);
    await locator.click();
    await page.waitForTimeout(delayAfter);
  };

  // 1. Escena inicial (1.5s) - Muestra título y topología
  console.log('📌 1. Explorando barra superior y topología...');
  await page.mouse.move(300, 30, { steps: 10 });
  await page.waitForTimeout(1000);

  // 2. Abrir Modal de Parámetros de Red / Examen
  console.log('🖱️ 2. Abriendo modal de direccionamiento y segmentación de red...');
  const examBtn = page.locator('button:has-text("Parámetros de Red")').first();
  await clickWithMouse(examBtn, 800);

  // Seleccionar preset o explorar VLAN
  console.log('🔍 3. Inspeccionando perfiles de red...');
  const presetCard = page.locator('button:has-text("Examen B:")').first();
  if (await presetCard.isVisible()) {
    await clickWithMouse(presetCard, 600);
  }

  // Cerrar/Aplicar modal
  const applyBtn = page.locator('button:has-text("Aplicar Parámetros de Red")').first();
  await clickWithMouse(applyBtn, 800);

  // 3. Interactuar directamente con el Diagrama de Topología
  console.log('🗺️ 4. Navegando mediante clics en nodos de la topología...');
  const teldatNode = page.locator('text="TELDAT-RS123"').first();
  if (await teldatNode.isVisible()) {
    await clickWithMouse(teldatNode, 900);
  }

  const ciscoNode = page.locator('text="CISCO-860VAE"').first();
  if (await ciscoNode.isVisible()) {
    await clickWithMouse(ciscoNode, 900);
  }

  // 4. Escribir comandos en terminal con ritmo ágil
  console.log('⌨️ 5. Ejecutando comandos guiados en terminal...');
  const terminalInput = page.locator('input[type="text"]').first();
  await clickWithMouse(terminalInput, 200);

  const quickType = async (cmd, delay = 35) => {
    const activeInput = page.locator('input[type="text"]').first();
    await activeInput.fill('');
    await activeInput.pressSequentially(cmd, { delay });
    await page.waitForTimeout(150);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
  };

  await quickType('enable');
  await quickType('conf t');
  await quickType('hostname CISCO_AS100');
  await quickType('enable secret cisco123');
  await quickType('service password-encryption');
  await quickType('banner motd #ACCESO RESTRINGIDO#');
  await quickType('do write memory'); // Demuestra guardado rápido desde config
  await page.waitForTimeout(1500); // Apreciar tarjeta de éxito verde

  // 5. Conmutar a Modo Libre & Auditoría (Sandbox)
  console.log('⚡ 6. Conmutando a Modo Libre (Sandbox) y Auditoría Técnica...');
  const sandboxTab = page.locator('button:has-text("Consola Libre & Auditoría")').first();
  await clickWithMouse(sandboxTab, 1000);

  // Escribir en Sandbox
  const sandboxInput = page.locator('input[type="text"]').first();
  await clickWithMouse(sandboxInput, 200);

  await quickType('configure terminal');
  await quickType('service password-encryption');
  await quickType('interface FastEthernet 0');
  await quickType('ip address 192.168.1.1 255.255.255.0');
  await quickType('no shutdown');
  await quickType('end');
  await quickType('write memory');

  // 6. Hacer clic en "Auditar Configuración"
  console.log('📊 7. Ejecutando auditoría técnica en vivo con mouse...');
  const auditBtn = page.locator('button:has-text("Auditar Configuración")').first();
  await clickWithMouse(auditBtn, 2000); // Pausa para ver la puntuación e índice de cumplimiento

  // 7. Finalización y guardado
  console.log('💾 8. Empaquetando video...');
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalDest = path.join(outputDir, 'demo-simulador-redes.webm');
    try {
      fs.copyFileSync(videoPath, finalDest);
      console.log('\n====================================================');
      console.log('🎉 ¡NUEVO VIDEO DINÁMICO GRABADO CON ÉXITO!');
      console.log(`📁 Archivo generado: ${finalDest}`);
      console.log('   (Incluye cursor virtual, interacción con topología, modal de red y auditoría)');
      console.log('====================================================\n');
    } catch {
      console.log(`Video guardado en: ${videoPath}`);
    }
  }
})();
