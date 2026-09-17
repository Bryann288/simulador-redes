export function normalizeCommand(cmdStr) {
  if (!cmdStr) return "";
  let cmd = cmdStr.trim().replace(/\s+/g, " ").toLowerCase();

  // Cisco & Datacom abbreviations
  cmd = cmd.replace(/^conf\s+t$/, "configure terminal");
  cmd = cmd.replace(/^config\s+t$/, "configure terminal");
  cmd = cmd.replace(/^conf\s+term$/, "configure terminal");
  cmd = cmd.replace(/^ena$/, "enable");
  cmd = cmd.replace(/^en$/, "enable");
  cmd = cmd.replace(/^int\s+fa0$/, "interface fastethernet0");
  cmd = cmd.replace(/^int\s+fa\s*0$/, "interface fastethernet0");
  cmd = cmd.replace(/^int\s+fa1$/, "interface fastethernet1");
  cmd = cmd.replace(/^int\s+fa\s*1$/, "interface fastethernet1");
  cmd = cmd.replace(/^int\s+gi0$/, "interface gigabitethernet0");
  cmd = cmd.replace(/^int\s+gi\s*0$/, "interface gigabitethernet0");
  cmd = cmd.replace(/^int\s+g0$/, "interface gigabitethernet0");
  cmd = cmd.replace(/^int\s+gi0\/0$/, "interface gigabitethernet0/0");
  cmd = cmd.replace(/^int\s+vlan\s*(\d+)$/, "interface vlan$1");
  cmd = cmd.replace(/^ip\s+addr\s+/, "ip address ");
  cmd = cmd.replace(/^ip\s+add\s+/, "ip address ");
  cmd = cmd.replace(/^no\s+sh$/, "no shutdown");
  cmd = cmd.replace(/^no\s+shut$/, "no shutdown");
  cmd = cmd.replace(/^sh\s+ip\s+ro$/, "show ip route");
  cmd = cmd.replace(/^sh\s+ip\s+ro\s+stat$/, "show ip route static");
  cmd = cmd.replace(/^sh\s+ip\s+route\s+stat$/, "show ip route static");
  cmd = cmd.replace(/^sh\s+ip\s+arp$/, "show ip arp");
  cmd = cmd.replace(/^sh\s+vlan$/, "show vlan");
  cmd = cmd.replace(/^sh\s+mac$/, "show mac-address-table");
  cmd = cmd.replace(/^wr$/, "write memory");
  cmd = cmd.replace(/^wr\s+mem$/, "write memory");
  cmd = cmd.replace(/^copy\s+run\s+start$/, "copy running-config startup-config");
  cmd = cmd.replace(/^do\s+wr$/, "do write memory");
  cmd = cmd.replace(/^do\s+wr\s+mem$/, "do write memory");
  cmd = cmd.replace(/^do\s+copy\s+run\s+start$/, "do copy running-config startup-config");

  // Password encryption
  cmd = cmd.replace(/^service\s+password-encryption$/, "service password-encryption");
  cmd = cmd.replace(/^serv\s+password-encryption$/, "service password-encryption");
  cmd = cmd.replace(/^service\s+pass$/, "service password-encryption");
  cmd = cmd.replace(/^serv\s+pass$/, "service password-encryption");
  cmd = cmd.replace(/^service\s+password$/, "service password-encryption");
  cmd = cmd.replace(/^password-encryption$/, "service password-encryption");

  // Teldat CIT abbreviations
  cmd = cmd.replace(/^\*\s*p\s*4$/, "* p 4");
  cmd = cmd.replace(/^\*\s*p\s*3$/, "* p 3");
  cmd = cmd.replace(/^p\s*4$/, "* p 4");
  cmd = cmd.replace(/^p\s*3$/, "* p 3");
  cmd = cmd.replace(/^proc\s+4$/, "* p 4");
  cmd = cmd.replace(/^proc\s+3$/, "* p 3");
  cmd = cmd.replace(/^net\s+eth0\/0$/, "network ethernet0/0");
  cmd = cmd.replace(/^net\s+ethernet0\/0$/, "network ethernet0/0");
  cmd = cmd.replace(/^net\s+eth0\/1$/, "network ethernet0/1");
  cmd = cmd.replace(/^net\s+ethernet0\/1$/, "network ethernet0/1");
  cmd = cmd.replace(/^net\s+ethernet0\/0\.(\d+)$/, "network ethernet0/0.$1");
  cmd = cmd.replace(/^prot\s+ip$/, "protocol ip");
  cmd = cmd.replace(/^dump\s+ro$/, "dump-routing-table");
  cmd = cmd.replace(/^stat\s+ro$/, "static-routes");

  return cmd;
}

export function getCliErrorDiagnostics(cmd, rawCmd, normalizedCmd, prompt, module = "") {
  const p = prompt || "";
  const mod = (module || "").toLowerCase();
  const isCisco = mod.includes("cisco") || p.includes("CISCO");
  const isTeldat = mod.includes("teldat") || p.includes("*") || p.includes("Config>") || p.includes("config>");
  const isDatacom = mod.includes("datacom") || p.includes("DATACOM");

  // 1. CISCO IOS DIAGNOSTICS
  if (isCisco) {
    // Mode: User EXEC ('>')
    if (p.endsWith(">")) {
      if (normalizedCmd.startsWith("configure terminal") || normalizedCmd.startsWith("conf")) {
        return "% Command requires privileged mode.\n(Estás en Modo Usuario '>'. Ingresa primero a modo privilegiado con 'enable').";
      }
      if (normalizedCmd.startsWith("interface") || normalizedCmd.startsWith("hostname") || normalizedCmd.startsWith("vlan") || normalizedCmd.startsWith("service password") || normalizedCmd.startsWith("banner")) {
        return "% Unknown command or permission denied.\n(Error de jerarquía: Estás en Modo Usuario '>'. Debes ingresar a Modo Privilegiado con 'enable' y luego a '(config)#' con 'configure terminal').";
      }
      if (rawCmd === "write memory" || rawCmd === "wr") {
        return "% Command requires privileged mode.\n(Para guardar en NVRAM debes estar en Modo Privilegiado '#').";
      }
      return "% Unknown command or computer name, or unable to find computer address.\n(Comando no reconocido en Modo Usuario '>').";
    }

    // Mode: Privileged EXEC ('#')
    if (p.endsWith("#") && !p.includes("(config")) {
      if (normalizedCmd.startsWith("ip address") || normalizedCmd.startsWith("switchport") || normalizedCmd === "no shutdown") {
        return "          ^\n% Invalid input detected at '^' marker.\n(Error de jerarquía: Debes ingresar a configuración global con 'configure terminal' y luego a la interfaz específica con 'interface <id>').";
      }
      if (normalizedCmd.startsWith("hostname") || normalizedCmd.startsWith("vlan") || normalizedCmd.startsWith("enable secret") || normalizedCmd.startsWith("service password") || normalizedCmd.startsWith("banner")) {
        return "          ^\n% Invalid input detected at '^' marker.\n(Error de jerarquía: Este comando requiere modo de configuración global. Ejecuta primero 'configure terminal').";
      }
      if (rawCmd === "end" || rawCmd === "exit") {
        return "% Ya estás en el nivel raíz de ejecución (#). Si deseas cerrar sesión usa 'disable' o 'logout'.";
      }
      return "          ^\n% Invalid input detected at '^' marker.\n(Comando o sintaxis no válida en Modo Privilegiado '#').";
    }

    // Mode: Global Config ('(config)#')
    if (p.endsWith("(config)#")) {
      if (rawCmd === "write memory" || rawCmd === "wr" || rawCmd === "wr mem" || rawCmd === "copy run start") {
        return "          ^\n% Invalid input detected at '^' marker.\n(Error de modo Cisco IOS: 'write memory' solo es válido en Modo Privilegiado '#'. Usa 'do write memory' para guardar sin salir o sal primero con 'end').";
      }
      if (normalizedCmd.startsWith("ip address") || normalizedCmd.startsWith("switchport") || normalizedCmd === "no shutdown") {
        return "          ^\n% Incomplete command or wrong CLI hierarchy.\n(Error de interfaz: No puedes configurar parámetros de puerto en configuración global. Ingresa primero a la interfaz con 'interface <id>', ej: 'interface Vlan100' o 'interface FastEthernet0').";
      }
      if (normalizedCmd.startsWith("show")) {
        return "          ^\n% Invalid input detected at '^' marker.\n(Los comandos de inspección 'show' requieren anteponer 'do' en modo config, ej: 'do " + rawCmd + "').";
      }
      if (rawCmd === "end" || rawCmd === "exit") {
        return "% Parámetros pendientes en configuración global.\n(Debes completar la directiva solicitada antes de salir con 'end' o 'exit').";
      }
      return "          ^\n% Invalid input detected at '^' marker.\n(Sintaxis incorrecta o comando no aplicable en configuración global).";
    }

    // Mode: Interface or Submode ('(config-if)#', '(config-vlan)#', etc.)
    if (p.includes("(config-if") || p.includes("(config-vlan") || p.includes("(config-subif")) {
      if (normalizedCmd.startsWith("hostname") || normalizedCmd.startsWith("enable secret") || normalizedCmd.startsWith("service password") || normalizedCmd.startsWith("banner")) {
        return "          ^\n% Invalid command at interface level.\n(Error de contexto: Este parámetro es de configuración global. Sal primero de la interfaz con 'exit' a modo '(config)#' o regresa con 'end').";
      }
      if (rawCmd === "write memory" || rawCmd === "wr" || rawCmd === "wr mem" || rawCmd === "copy run start") {
        return "          ^\n% Invalid input detected at '^' marker.\n(Error de modo Cisco IOS: 'write memory' solo es válido en Modo Privilegiado '#'. Estando dentro de una interfaz debes anteponer 'do' ('do wr') o salir con 'end').";
      }
      if (normalizedCmd.startsWith("configure terminal") || normalizedCmd.startsWith("conf t")) {
        return "% Already in configuration mode.\n(Ya te encuentras dentro del modo de configuración. Para salir a la raíz usa 'end' o 'exit').";
      }
      if (normalizedCmd.startsWith("show")) {
        return "          ^\n% Invalid input detected at '^' marker.\n(Usa 'do " + rawCmd + "' para inspeccionar tablas sin salir de la interfaz).";
      }
      if (rawCmd === "end") {
        return "% Aviso de navegación Cisco IOS:\n(El comando 'end' te regresa directamente a Modo Privilegiado '#'. Si necesitas continuar en configuración global '(config)#', usa 'exit').";
      }
      return "          ^\n% Invalid input detected at '^' marker.\n(Comando o parámetro no reconocido dentro de esta interfaz o submodo).";
    }
  }

  // 2. TELDAT CIT DIAGNOSTICS
  if (isTeldat) {
    if (p.trim() === "*") {
      if (rawCmd.startsWith("net") || rawCmd.startsWith("prot") || rawCmd.startsWith("add") || rawCmd.startsWith("save") || rawCmd.startsWith("restart")) {
        return "-- Command not recognized in root monitor (*).\n(En Teldat CIT debes ingresar primero al Proceso 4 de configuración de red con '* p 4' o al Proceso 3 de monitoreo con '* p 3').";
      }
      return "-- Command not recognized in root monitor (*).\n(Escribe '* p 4' para acceder al motor de configuración).";
    }
    if (p.includes("Config>")) {
      if (rawCmd.startsWith("add ip-address") || rawCmd.startsWith("ip address")) {
        return "-- Parameter out of context.\n(En Teldat CIT debes ingresar primero a la interfaz de red con 'network ethernet0/0' antes de asignar direcciones IP).";
      }
      if (rawCmd.startsWith("add route") || rawCmd.startsWith("route")) {
        return "-- Parameter out of context.\n(Para enrutamiento estático en Teldat debes entrar primero al menú IP con 'protocol ip').";
      }
      return "-- Command not recognized in Config>.\n(Opciones válidas: 'network <interfaz>', 'protocol ip', 'system', 'save', 'restart', 'exit').";
    }
    if (p.includes("config>")) {
      if (rawCmd.startsWith("protocol") || rawCmd.startsWith("system") || rawCmd === "restart" || rawCmd === "save") {
        return "-- Command not available at interface level.\n(Sal primero con 'exit' al menú 'Config>' para ejecutar comandos globales).";
      }
      return "-- Parameter not recognized for this interface.\n(Revisa la sintaxis o escribe 'exit' para volver a Config>).";
    }
    if (p.includes("IP config>")) {
      if (rawCmd.startsWith("network")) {
        return "-- Cannot change network from IP protocol menu.\n(Sal con 'exit' a 'Config>' para cambiar de interfaz).";
      }
      return "-- IP command syntax error.\n(Ejemplo: 'route 192.168.100.0 255.255.255.0 10.0.12.1 1').";
    }
  }

  // 3. DATACOM DmOS DIAGNOSTICS
  if (isDatacom) {
    if (p.endsWith(">")) {
      return "% Error: Command requires privileged mode.\n(Ingrese a modo privilegiado ejecutando 'enable').";
    }
    if (p.endsWith("#") && !p.includes("(config")) {
      if (normalizedCmd.startsWith("interface") || normalizedCmd.startsWith("hostname") || normalizedCmd.startsWith("vlan") || normalizedCmd.startsWith("banner")) {
        return "% Error: Command only available in configuration mode.\n(Ingrese a modo de configuración con 'conf' o 'configure terminal').";
      }
      return "% Error: Unrecognized command in EXEC mode.";
    }
    if (p.endsWith("(config)#")) {
      if (rawCmd.startsWith("set-member") || rawCmd.startsWith("no set-member")) {
        return "% Error: Port membership must be configured inside VLAN.\n(Debe ingresar primero a la VLAN con 'interface vlan <id>' para asociar puertos).";
      }
      if (rawCmd.startsWith("switchport")) {
        return "% Error: Switchport settings require interface context.\n(Debe ingresar primero al puerto físico con 'interface ethernet 1/5').";
      }
      if (rawCmd === "copy run start" || rawCmd === "copy running-config startup-config" || rawCmd === "write memory") {
        return "% Error: Save command belongs to privileged EXEC mode (#).\n(Salga a modo '#' con 'end' o 'exit' para guardar permanentemente).";
      }
      return "% Error: Syntax error or command unavailable in global config.";
    }
    if (p.includes("(config-vlan)#") || p.includes("(config-if)#")) {
      if (normalizedCmd.startsWith("hostname") || normalizedCmd.startsWith("banner")) {
        return "% Error: Command cannot be executed from this context.\n(Salga a configuración global con 'exit' o regrese con 'end').";
      }
      if (rawCmd === "copy run start" || rawCmd === "write memory") {
        return "% Error: Save command belongs to privileged EXEC mode (#).\n(Regrese con 'end' a modo '#' para guardar la configuración).";
      }
      return "% Error: Invalid parameter or command out of context.";
    }
  }

  return "% Invalid input detected or wrong CLI mode.\n(Verifica la sintaxis o el nivel jerárquico del comando).";
}

export class SimulatorEngine {
  constructor(challenge) {
    this.challenge = challenge;
    this.currentStep = 0;
    this.history = [];
    this.isCompleted = false;
  }

  getCurrentPrompt() {
    if (this.isCompleted) return "OK#";
    return this.challenge.steps[this.currentStep].prompt;
  }

  getHint() {
    if (this.isCompleted) return "Directivas del desafío completadas satisfactoriamente.";
    return this.challenge.steps[this.currentStep].hint;
  }

  getExplanation() {
    if (this.isCompleted) return "Configuración validada con éxito. Procede al siguiente nivel del laboratorio.";
    return this.challenge.steps[this.currentStep].explanation;
  }

  processCommand(cmd) {
    if (this.isCompleted) {
      return { success: false, output: "% Desafío ya completado. Avanza al siguiente nivel." };
    }
    
    const rawCmd = cmd.trim().toLowerCase();
    const normalizedCmd = normalizeCommand(cmd);
    const step = this.challenge.steps[this.currentStep];

    const validNormalized = (step.valid_commands || []).map(v => normalizeCommand(v));
    const validRaw = (step.valid_commands || []).map(v => v.toLowerCase().trim());

    // Special Cisco IOS realism: Attempting 'write memory' directly in config mode without 'do'
    const isConfigPrompt = (step.prompt || "").includes("(config");
    const isSavingAttempt = rawCmd === "wr" || rawCmd === "write memory" || rawCmd === "wr mem" || rawCmd === "copy run start";
    if (isConfigPrompt && isSavingAttempt && !validRaw.includes(rawCmd) && !validNormalized.includes(normalizedCmd)) {
      this.history.push({ cmd, success: false });
      return {
        success: false,
        output: "          ^\n% Invalid input detected at '^' marker.\n(Error de modo Cisco IOS: 'write memory' pertenece a Modo Privilegiado '#'. Estando en config debes usar 'do write memory' o regresar con 'end')."
      };
    }

    const hasBannerStep = validRaw.some(v => v.startsWith("banner") || v.startsWith("welcome-message"));
    const isBannerMatch = hasBannerStep && (rawCmd.startsWith("banner") || rawCmd.startsWith("welcome-message"));

    // Check if current command matches this step
    const isMatch = validRaw.includes(rawCmd) || 
                    validNormalized.includes(normalizedCmd) ||
                    validNormalized.includes(rawCmd) ||
                    validRaw.includes(normalizedCmd) ||
                    isBannerMatch;

    if (isMatch) {
      this.history.push({ cmd, success: true });

      const isDoSave = rawCmd.startsWith("do wr") || rawCmd.startsWith("do write memory") || rawCmd.startsWith("do copy run start") || normalizedCmd.startsWith("do write memory") || normalizedCmd.startsWith("do copy running-config startup-config");
      const nextStep = this.challenge.steps[this.currentStep + 1];
      const nextStepIsSave = nextStep && (nextStep.valid_commands || []).some(v => v.toLowerCase().includes("write memory") || v.toLowerCase().includes("wr"));

      let output = "";
      if (isDoSave && nextStepIsSave) {
        // Smart skip: 'do write memory' fulfilled the save directly from config mode!
        this.currentStep += 2;
        output = "Building configuration...\n[OK]\n% Configuración guardada en NVRAM mediante comando 'do'.";
      } else {
        if (rawCmd === "write memory" || rawCmd === "wr" || isDoSave) {
          output = "Building configuration...\n[OK]";
        }
        this.currentStep++;
      }

      if (this.currentStep >= this.challenge.steps.length) {
        this.isCompleted = true;
      }
      return { success: true, output };
    } else {
      // Realism: Check if student directly jumped to next interface/target without typing exit first
      const isExitStep = validRaw.some(v => v === "exit" || v === "ex" || v === "end");
      const nextStep = this.challenge.steps[this.currentStep + 1];
      if (isExitStep && nextStep) {
        const nextValidNorm = (nextStep.valid_commands || []).map(v => normalizeCommand(v));
        const nextValidRaw = (nextStep.valid_commands || []).map(v => v.toLowerCase().trim());
        const matchesNext = nextValidRaw.includes(rawCmd) || nextValidNorm.includes(normalizedCmd) || nextValidNorm.includes(rawCmd);
        if (matchesNext) {
          this.history.push({ cmd, success: true });
          this.currentStep += 2;
          if (this.currentStep >= this.challenge.steps.length) {
            this.isCompleted = true;
          }
          return { success: true, output: "" };
        }
      }

      // Realistic contextual diagnostics
      this.history.push({ cmd, success: false });
      const diagnosticOutput = getCliErrorDiagnostics(cmd, rawCmd, normalizedCmd, step.prompt, this.challenge.module);
      return { 
        success: false, 
        output: diagnosticOutput
      };
    }
  }
}
