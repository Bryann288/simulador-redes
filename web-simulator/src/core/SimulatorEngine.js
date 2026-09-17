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
        output: "% Invalid input detected at '^' marker.\n(En modo de configuración debes usar 'do write memory' o regresar con 'end' a modo '#')."
      };
    }

    const hasBannerStep = validRaw.some(v => v.startsWith("banner") || v.startsWith("welcome-message"));
    const isBannerMatch = hasBannerStep && (rawCmd.startsWith("banner") || rawCmd.startsWith("welcome-message"));

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
      this.history.push({ cmd, success: false });
      return { 
        success: false, 
        output: "% Unknown command or wrong CLI mode." 
      };
    }
  }
}
