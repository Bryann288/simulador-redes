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

  // Teldat CIT abbreviations
  cmd = cmd.replace(/^\*\s*p\s*4$/, "* p 4");
  cmd = cmd.replace(/^\*\s*p\s*3$/, "* p 3");
  cmd = cmd.replace(/^p\s*4$/, "* p 4");
  cmd = cmd.replace(/^p\s*3$/, "* p 3");
  cmd = cmd.replace(/^proc\s+4$/, "* p 4");
  cmd = cmd.replace(/^proc\s+3$/, "* p 3");
  cmd = cmd.replace(/^net\s+eth0\/0$/, "network ethernet0/0");
  cmd = cmd.replace(/^net\s+ethernet0\/0$/, "network ethernet0/0");
  cmd = cmd.replace(/^net\s+ethernet0\/0\.200$/, "network ethernet0/0.200");
  cmd = cmd.replace(/^prot\s+ip$/, "protocol ip");

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
    if (this.isCompleted) return "✅ ¡Excelente trabajo! Has completado todos los pasos de este reto.";
    return this.challenge.steps[this.currentStep].hint;
  }

  getExplanation() {
    if (this.isCompleted) return "🌟 Reto finalizado con éxito. Puedes avanzar al siguiente nivel usando el botón o el menú superior.";
    return this.challenge.steps[this.currentStep].explanation;
  }

  processCommand(cmd) {
    if (this.isCompleted) {
      return { success: false, output: "% Reto ya completado. Pasa al siguiente reto para continuar." };
    }
    
    const rawCmd = cmd.trim().toLowerCase();
    const normalizedCmd = normalizeCommand(cmd);
    const step = this.challenge.steps[this.currentStep];

    const validNormalized = (step.valid_commands || []).map(v => normalizeCommand(v));
    const validRaw = (step.valid_commands || []).map(v => v.toLowerCase().trim());

    const isMatch = validRaw.includes(rawCmd) || 
                    validNormalized.includes(normalizedCmd) ||
                    validNormalized.includes(rawCmd) ||
                    validRaw.includes(normalizedCmd);

    if (isMatch) {
      this.history.push({ cmd, success: true });
      this.currentStep++;
      if (this.currentStep >= this.challenge.steps.length) {
        this.isCompleted = true;
      }
      return { success: true, output: "" };
    } else {
      this.history.push({ cmd, success: false });
      return { 
        success: false, 
        output: "% Unknown command or wrong CLI mode." 
      };
    }
  }
}
