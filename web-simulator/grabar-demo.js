import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('====================================================');
  console.log('🎬 Iniciando grabación de video demo en alta definición...');
  console.log('====================================================\n');

  const outputDir = path.resolve('./videos');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Iniciar Chromium (headless por variable de entorno o visible por defecto)
  const isHeadless = process.env.HEADLESS === 'true';
  const browser = await chromium.launch({
    headless: isHeadless,
    slowMo: 40
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  // URL del simulador local (Vite)
  const URL = 'http://localhost:5173';
  console.log(`🌐 Navegando a: ${URL}`);

  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 15000 });
  } catch {
    console.log('⚠️ Esperando carga inicial de la página...');
    await page.goto(URL);
  }

  // 1. Pausa de introducción: muestra la interfaz limpia y el diagrama de topología
  console.log('📸 1. Escena inicial: Interfaz y topología...');
  await page.waitForTimeout(2000);

  // Localizador del input de la terminal
  const terminalInput = page.locator('input[type="text"]').first();
  await terminalInput.waitFor({ state: 'visible', timeout: 5000 });
  await terminalInput.click();

  // Función auxiliar para teclear con cadencia humana
  const typeCommand = async (cmd, delayMs = 65) => {
    console.log(`⌨️  Tecleando: "${cmd}"`);
    await terminalInput.fill('');
    await terminalInput.pressSequentially(cmd, { delay: delayMs });
    await page.waitForTimeout(400);
    await page.keyboard.press('Enter');
  };

  // 2. Comando erróneo para lucir el nuevo diagnóstico contextual realista de Cisco
  console.log('\n🔍 2. Demostrando diagnóstico de error realista...');
  await typeCommand('ping 8.8.8.8');
  await page.waitForTimeout(2500); // Pausa para leer el puntero '^' y diagnóstico

  // 3. Flujo guiado de Cisco 860VAE (Reto C1 con contraseña, encriptación y banner)
  console.log('\n🚀 3. Ejecutando configuración de Cisco IOS con mejores prácticas...');
  await typeCommand('enable');
  await page.waitForTimeout(1000);

  await typeCommand('conf t');
  await page.waitForTimeout(1000);

  await typeCommand('hostname CISCO_AS100');
  await page.waitForTimeout(1000);

  await typeCommand('enable secret cisco123');
  await page.waitForTimeout(1000);

  // Nuevo comando: encriptación global de claves
  await typeCommand('service password-encryption');
  await page.waitForTimeout(1200);

  // Banner MOTD de seguridad perimetral
  await typeCommand('banner motd #ACCESO RESTRINGIDO - PERSONAL AUTORIZADO#');
  await page.waitForTimeout(1200);

  // Nuevo comando de salida limpia: end
  await typeCommand('end');
  await page.waitForTimeout(1000);

  // Guardado permanente en NVRAM
  await typeCommand('write memory');
  await page.waitForTimeout(3000); // Pausa para apreciar la tarjeta de reto completado

  // 4. Conmutar a módulo Datacom DmOS
  console.log('\n🔄 4. Cambiando a módulo de Switch Datacom DmOS...');
  const datacomTab = page.locator('button:has-text("Datacom DmOS")').first();
  if (await datacomTab.isVisible()) {
    await datacomTab.click();
    await page.waitForTimeout(2000);

    await terminalInput.click();
    await typeCommand('enable');
    await page.waitForTimeout(1000);
    await typeCommand('config');
    await page.waitForTimeout(2500);
  }

  // 5. Cierre y guardado del video
  console.log('\n💾 5. Finalizando grabación y empaquetando video...');
  const video = page.video();
  await context.close();
  await browser.close();

  if (video) {
    const videoPath = await video.path();
    const finalDest = path.join(outputDir, 'demo-simulador-redes.webm');
    
    // Copiar a nombre representativo
    try {
      fs.copyFileSync(videoPath, finalDest);
      console.log('====================================================');
      console.log(`🎉 ¡GRABACIÓN COMPLETADA CON ÉXITO!`);
      console.log(`📁 Video listo en: ${finalDest}`);
      console.log('   (Formato .webm de alta definición 1280x720, ideal para LinkedIn y portafolio)');
      console.log('====================================================');
    } catch {
      console.log(`🎉 ¡Video guardado en: ${videoPath}!`);
    }
  }
})();
