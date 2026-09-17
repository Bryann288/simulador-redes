import { normalizeCommand } from "./SimulatorEngine";

export class SandboxEngine {
  constructor(deviceType = "cisco") {
    this.setDevice(deviceType);
  }

  setDevice(deviceType) {
    this.device = deviceType; // 'cisco', 'teldat', 'datacom'
    this.mode = this.getInitialMode(deviceType);
    this.history = [];
    this.subinterface = null;
    this.activeInterface = null;
    this.activeVlan = null;

    // Simulated device state
    this.state = {
      hostname: this.getDefaultHostname(deviceType),
      secretSet: false,
      vlans: new Set([1]),
      interfaces: {},
      routes: [],
      saved: false,
      restarted: false,
      datacomVlan1RemovedPorts: new Set(),
      commandLog: []
    };
  }

  getDefaultHostname(deviceType) {
    switch (deviceType) {
      case "cisco": return "Router";
      case "teldat": return "TELDAT";
      case "datacom": return "DATACOM-SW";
      default: return "DEVICE";
    }
  }

  getInitialMode(deviceType) {
    switch (deviceType) {
      case "cisco": return "user_exec";
      case "teldat": return "root";
      case "datacom": return "user_exec";
      default: return "user_exec";
    }
  }

  getCurrentPrompt() {
    const h = this.state.hostname;
    if (this.device === "cisco") {
      switch (this.mode) {
        case "user_exec": return `${h}>`;
        case "priv_exec": return `${h}#`;
        case "config": return `${h}(config)#`;
        case "config_if": return `${h}(config-if)#`;
        case "config_vlan": return `${h}(config-vlan)#`;
        default: return `${h}#`;
      }
    } else if (this.device === "teldat") {
      switch (this.mode) {
        case "root": return "*";
        case "config": return "Config>";
        case "system_config": return "System config>";
        case "if_config": return `${this.activeInterface || "eth0/0"} config>`;
        case "ip_config": return "IP config>";
        case "monitor": return "+";
        case "ip_monitor": return "IP+";
        default: return "*";
      }
    } else if (this.device === "datacom") {
      switch (this.mode) {
        case "user_exec": return `${h}>`;
        case "priv_exec": return `${h}#`;
        case "config": return `${h}(config)#`;
        case "config_vlan": return `${h}(config-vlan)#`;
        case "config_if": return `${h}(config-if)#`;
        default: return `${h}#`;
      }
    }
    return ">";
  }

  processCommand(rawCmd) {
    const trimmed = rawCmd.trim();
    if (!trimmed) return { success: false, output: "" };

    const norm = normalizeCommand(trimmed);
    const parts = norm.split(" ");
    const action = parts[0];

    this.state.commandLog.push({ raw: trimmed, norm, mode: this.mode });

    // Handle per-device logic
    let result = { success: false, output: "% Unknown command or wrong CLI mode." };

    if (this.device === "cisco") {
      result = this.handleCisco(trimmed, norm, parts);
    } else if (this.device === "teldat") {
      result = this.handleTeldat(trimmed, norm, parts);
    } else if (this.device === "datacom") {
      result = this.handleDatacom(trimmed, norm, parts);
    }

    this.history.push({
      prompt: this.getCurrentPrompt(),
      cmd: trimmed,
      ...result
    });

    return result;
  }

  handleCisco(raw, norm, parts) {
    const mode = this.mode;

    // Navigation & General
    if (mode === "user_exec") {
      if (norm === "enable") {
        this.mode = "priv_exec";
        return { success: true, output: "" };
      }
      if (norm.startsWith("show")) return { success: true, output: "% Must be in privileged mode for full show details." };
    }

    if (mode === "priv_exec") {
      if (norm === "configure terminal") {
        this.mode = "config";
        return { success: true, output: "Enter configuration commands, one per line. End with CNTL/Z." };
      }
      if (norm === "disable") {
        this.mode = "user_exec";
        return { success: true, output: "" };
      }
      if (norm.startsWith("show ip route")) {
        const routesCount = this.state.routes.length;
        let out = "Codes: C - connected, S - static, R - RIP\n\nGateway of last resort is not set\n\n";
        if (routesCount === 0) {
          out += "      10.0.0.0/8 is variably subnetted, 1 subnets, 1 masks\nC        10.0.12.0/30 is directly connected, GigabitEthernet0/0";
        } else {
          this.state.routes.forEach(r => {
            out += `S     ${r.network}/${r.mask} [1/0] via ${r.nextHop}\n`;
          });
        }
        return { success: true, output: out };
      }
      if (norm.startsWith("show ip arp")) {
        return { success: true, output: "Protocol  Address          Age (min)  Hardware Addr   Type   Interface\nInternet  10.0.12.1               -   001a.a1b2.c3d4  ARPA   Vlan1\nInternet  10.0.12.2               5   002b.c2d3.e4f5  ARPA   Vlan1" };
      }
      if (norm.startsWith("show")) {
        return { success: true, output: "Configuration / interface table output displayed." };
      }
      if (norm.startsWith("ping")) {
        return { success: true, output: "Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to target, timeout is 2 seconds:\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms" };
      }
      if (norm === "write memory" || norm === "copy running-config startup-config") {
        this.state.saved = true;
        return { success: true, output: "Building configuration...\n[OK]" };
      }
    }

    if (mode === "config") {
      if (norm === "exit" || norm === "end") {
        this.mode = "priv_exec";
        return { success: true, output: "" };
      }
      if (norm.startsWith("hostname ")) {
        const name = parts[1];
        if (name) {
          this.state.hostname = name.toUpperCase();
          return { success: true, output: "" };
        }
      }
      if (norm.startsWith("enable secret ")) {
        this.state.secretSet = true;
        return { success: true, output: "" };
      }
      if (norm.startsWith("banner motd") || norm.startsWith("banner ")) {
        this.state.bannerSet = true;
        return { success: true, output: "" };
      }
      if (norm.startsWith("vlan ")) {
        const vlanId = parseInt(parts[1], 10);
        if (!isNaN(vlanId)) {
          this.state.vlans.add(vlanId);
          this.activeVlan = vlanId;
          this.mode = "config_vlan";
          return { success: true, output: "" };
        }
      }
      if (norm.startsWith("interface ")) {
        const ifName = parts.slice(1).join("");
        this.activeInterface = ifName;
        if (!this.state.interfaces[ifName]) {
          this.state.interfaces[ifName] = { ip: null, isUp: false, vlan: null, portSecurity: false };
        }
        this.mode = "config_if";
        return { success: true, output: "" };
      }
      if (norm.startsWith("ip route ")) {
        const pfx = parts[2];
        const mask = parts[3];
        const nh = parts[4];
        const ad = parts[5] || "1";
        this.state.routes.push({ network: pfx, mask, nextHop: nh, ad });
        return { success: true, output: "" };
      }
    }

    if (mode === "config_if") {
      if (norm === "exit") {
        this.mode = "config";
        this.activeInterface = null;
        return { success: true, output: "" };
      }
      if (norm === "end") {
        this.mode = "priv_exec";
        this.activeInterface = null;
        return { success: true, output: "" };
      }
      if (norm.startsWith("ip address ")) {
        const ip = parts[2];
        const mask = parts[3];
        if (this.activeInterface) {
          this.state.interfaces[this.activeInterface].ip = `${ip}/${mask}`;
        }
        return { success: true, output: "" };
      }
      if (norm === "no shutdown") {
        if (this.activeInterface) {
          this.state.interfaces[this.activeInterface].isUp = true;
        }
        return { success: true, output: `% Interface ${this.activeInterface}, changed state to up\n% LINEPROTO-5-UPDOWN: Line protocol on Interface ${this.activeInterface}, changed state to up` };
      }
      if (norm.startsWith("switchport mode ")) {
        if (this.activeInterface) {
          this.state.interfaces[this.activeInterface].mode = parts[2];
        }
        return { success: true, output: "" };
      }
      if (norm.startsWith("switchport access vlan ")) {
        const vl = parseInt(parts[3], 10);
        if (this.activeInterface) {
          this.state.interfaces[this.activeInterface].vlan = vl;
        }
        return { success: true, output: "" };
      }
      if (norm.startsWith("switchport port-security")) {
        if (this.activeInterface) {
          this.state.interfaces[this.activeInterface].portSecurity = true;
        }
        return { success: true, output: "" };
      }
    }

    if (mode === "config_vlan") {
      if (norm === "exit" || norm === "end") {
        this.mode = "config";
        this.activeVlan = null;
        return { success: true, output: "" };
      }
      if (norm.startsWith("name ")) {
        return { success: true, output: "" };
      }
    }

    return { success: false, output: "% Invalid input detected at marker or unknown command." };
  }

  handleTeldat(raw, norm, parts) {
    const mode = this.mode;

    if (mode === "root") {
      if (norm === "* p 4" || norm === "p 4") {
        this.mode = "config";
        return { success: true, output: "-- Teldat Configuration Process (P4) Active --" };
      }
      if (norm === "* p 3" || norm === "p 3") {
        this.mode = "monitor";
        return { success: true, output: "-- Teldat Monitoring Process (P3) Active --" };
      }
    }

    if (mode === "config") {
      if (norm === "exit" || norm === "ctrl+p") {
        this.mode = "root";
        return { success: true, output: "" };
      }
      if (norm === "system") {
        this.mode = "system_config";
        return { success: true, output: "" };
      }
      if (norm.startsWith("add device eth-subinterface ")) {
        const ifName = parts[3];
        const vlan = parts[4];
        this.state.interfaces[`${ifName}.${vlan}`] = { ip: null, isUp: true, vlan, dot1q: true };
        return { success: true, output: `Subinterface device ${ifName}.${vlan} added successfully.` };
      }
      if (norm.startsWith("network ")) {
        const devName = parts[1];
        this.activeInterface = devName;
        this.mode = "if_config";
        return { success: true, output: "" };
      }
      if (norm === "protocol ip") {
        this.mode = "ip_config";
        return { success: true, output: "" };
      }
      if (norm === "save") {
        this.state.saved = true;
        return { success: true, output: "Configuration saved to flash memory." };
      }
      if (norm === "restart") {
        this.state.restarted = true;
        return { success: true, output: "System restarting routing and interfaces...\nRouting tables successfully updated in active RAM." };
      }
    }

    if (mode === "system_config") {
      if (norm === "exit") {
        this.mode = "config";
        return { success: true, output: "" };
      }
      if (norm.startsWith("name ")) {
        this.state.hostname = parts[1].toUpperCase();
        return { success: true, output: "" };
      }
      if (norm.startsWith("banner ") || norm.startsWith("welcome-message ")) {
        this.state.bannerSet = true;
        return { success: true, output: "" };
      }
    }

    if (mode === "if_config") {
      if (norm === "exit") {
        this.mode = "config";
        this.activeInterface = null;
        return { success: true, output: "" };
      }
      if (norm.startsWith("ip address ")) {
        const ip = parts[2];
        const mask = parts[3];
        if (this.activeInterface && this.state.interfaces[this.activeInterface]) {
          this.state.interfaces[this.activeInterface].ip = `${ip}/${mask}`;
        }
        return { success: true, output: "" };
      }
      if (norm.startsWith("encapsulation dot1q ")) {
        return { success: true, output: "" };
      }
    }

    if (mode === "ip_config") {
      if (norm === "exit") {
        this.mode = "config";
        return { success: true, output: "" };
      }
      if (norm.startsWith("route ")) {
        const dest = parts[1];
        const mask = parts[2];
        const gw = parts[3];
        const metric = parts[4] || "1";
        this.state.routes.push({ network: dest, mask, nextHop: gw, metric });
        return { success: true, output: "" };
      }
    }

    if (mode === "monitor") {
      if (norm === "exit" || norm === "ctrl+p") {
        this.mode = "root";
        return { success: true, output: "" };
      }
      if (norm === "protocol ip") {
        this.mode = "ip_monitor";
        return { success: true, output: "" };
      }
    }

    if (mode === "ip_monitor") {
      if (norm === "exit") {
        this.mode = "monitor";
        return { success: true, output: "" };
      }
      if (norm === "dump-routing-table") {
        let out = "Destination      Mask             Gateway          Interface  Cost\n";
        out += "10.0.12.0        255.255.255.252  DIRECT           eth0/0     0\n";
        if (this.state.restarted) {
          this.state.routes.forEach(r => {
            out += `${r.network.padEnd(16)} ${r.mask.padEnd(16)} ${r.nextHop.padEnd(16)} eth0/0.200 ${r.metric || 1}\n`;
          });
        }
        return { success: true, output: out };
      }
      if (norm === "static-routes") {
        return { success: true, output: `Static routes active in memory: ${this.state.restarted ? this.state.routes.length : 0} (Pending restart: ${!this.state.restarted && this.state.routes.length > 0 ? "YES" : "NO"})` };
      }
    }

    return { success: false, output: "% Command not recognized in this process/menu." };
  }

  handleDatacom(raw, norm, parts) {
    const mode = this.mode;

    if (mode === "user_exec") {
      if (norm === "enable") {
        this.mode = "priv_exec";
        return { success: true, output: "" };
      }
    }

    if (mode === "priv_exec") {
      if (norm === "configure terminal") {
        this.mode = "config";
        return { success: true, output: "" };
      }
      if (norm === "copy running-config startup-config" || norm === "write memory") {
        this.state.saved = true;
        return { success: true, output: "Configuration committed and saved to startup-config." };
      }
      if (norm.startsWith("show mac")) {
        return { success: true, output: "Vlan  Mac Address         Type     Ports\n----  -----------------   -------  -----\n100   00:1a:2b:3c:4d:5e   DYNAMIC  eth 1/5\n200   00:2a:3b:4c:5d:6e   DYNAMIC  eth 1/1" };
      }
      if (norm.startsWith("show vlan")) {
        return { success: true, output: "VLAN  Name                             Status    Ports\n----  -------------------------------- --------- -------------------------------\n1     default                          active    \n100   VLAN0100                         active    eth1/5(U), eth1/1(T)\n200   VLAN0200                         active    eth1/1(T)" };
      }
    }

    if (mode === "config") {
      if (norm === "exit") {
        this.mode = "priv_exec";
        return { success: true, output: "" };
      }
      if (norm.startsWith("hostname ")) {
        this.state.hostname = parts[1].toUpperCase();
        return { success: true, output: "" };
      }
      if (norm.startsWith("banner motd ") || norm.startsWith("banner ")) {
        this.state.bannerSet = true;
        return { success: true, output: "" };
      }
      if (norm.startsWith("interface vlan")) {
        const vlId = parts[parts.length - 1];
        this.activeVlan = parseInt(vlId, 10);
        this.state.vlans.add(this.activeVlan);
        this.mode = "config_vlan";
        return { success: true, output: "" };
      }
      if (norm.startsWith("interface ethernet")) {
        const port = parts.slice(2).join(" ");
        this.activeInterface = port;
        this.mode = "config_if";
        return { success: true, output: "" };
      }
    }

    if (mode === "config_vlan") {
      if (norm === "exit") {
        this.mode = "config";
        this.activeVlan = null;
        return { success: true, output: "" };
      }
      if (norm.startsWith("no set-member ethernet ")) {
        const port = parts.slice(3).join(" ");
        if (this.activeVlan === 1) {
          this.state.datacomVlan1RemovedPorts.add(port);
        }
        return { success: true, output: `Port ${port} removed from VLAN ${this.activeVlan}.` };
      }
      if (norm.startsWith("set-member untagged ethernet ")) {
        const port = parts.slice(3).join(" ");
        return { success: true, output: `Port ${port} added as untagged to VLAN ${this.activeVlan}.` };
      }
      if (norm.startsWith("set-member tagged ethernet ")) {
        const port = parts.slice(3).join(" ");
        return { success: true, output: `Port ${port} added as tagged (802.1Q) to VLAN ${this.activeVlan}.` };
      }
    }

    if (mode === "config_if") {
      if (norm === "exit") {
        this.mode = "config";
        this.activeInterface = null;
        return { success: true, output: "" };
      }
      if (norm.startsWith("switchport native vlan ")) {
        return { success: true, output: "" };
      }
    }

    return { success: false, output: "% Error: syntax error or command unavailable in this mode." };
  }

  // ==========================================
  // DUAL EVALUATION ENGINE (Syntax + Logic)
  // ==========================================
  evaluateConfiguration() {
    let score = 100;
    const achievements = [];
    const warnings = [];
    const errors = [];

    const cmds = this.state.commandLog;

    // Check 1: Hostname customization
    if (this.state.hostname !== this.getDefaultHostname(this.device)) {
      achievements.push("Identidad personalizada: Se definió hostname institucional.");
    } else {
      warnings.push("Mejora: El equipo aún conserva el hostname genérico de fábrica.");
      score -= 5;
    }

    // Check 2: Persistence (Saving)
    if (this.state.saved) {
      achievements.push("Persistencia garantizada: Se guardó la configuración en memoria permanente.");
    } else {
      warnings.push("Atención: No se ejecutó comando de guardado permanente (write memory / save / copy run start).");
      score -= 15;
    }

    // Check 3: Legal Warning Banner (Banner MOTD / Welcome message)
    if (this.state.bannerSet) {
      achievements.push("Cumplimiento y Seguridad Perimetral: Se configuró mensaje legal de advertencia (banner motd).");
    } else {
      warnings.push("Seguridad & Auditoría: Falta configurar el 'banner motd' de advertencia de acceso no autorizado.");
      score -= 5;
    }

    // Device-specific logic audits
    if (this.device === "cisco") {
      // Check Cisco Secret
      if (this.state.secretSet) {
        achievements.push("Seguridad de consola: Contraseña de enable protegida con hash.");
      } else {
        warnings.push("Seguridad: Modo privilegiado sin clave 'enable secret'.");
        score -= 10;
      }

      // Check Interface shutdown status
      Object.entries(this.state.interfaces).forEach(([ifName, data]) => {
        if (data.ip && !data.isUp) {
          errors.push(`Orden Lógico: Se asignó IP a '${ifName}', pero NO se ejecutó 'no shutdown'. La interfaz permanecerá inactiva.`);
          score -= 15;
        } else if (data.ip && data.isUp) {
          achievements.push(`Capa 3: Interfaz '${ifName}' configurada con IP y activada administrativamente.`);
        }

        // Check if vlan assigned was created
        if (data.vlan && !this.state.vlans.has(data.vlan)) {
          warnings.push(`Advertencia: Puerto asociado a VLAN ${data.vlan} sin haber creado previamente 'vlan ${data.vlan}'.`);
          score -= 10;
        }
      });
    }

    if (this.device === "teldat") {
      // Rule: In Teldat CIT, routes need save AND restart
      if (this.state.routes.length > 0) {
        if (!this.state.restarted) {
          errors.push("CRÍTICO EN TELDAT: Se configuraron rutas IP, pero NO se ejecutó 'restart'. La RAM operativa NO procesará los paquetes.");
          score -= 30;
        } else {
          achievements.push("Regla Crítica Teldat Cumplida: Se ejecutó 'restart' para sincronizar la tabla de enrutamiento activa.");
        }
      }
    }

    if (this.device === "datacom") {
      // Rule: Must remove port from VLAN 1 before assigning
      const hasAddedVlan100 = cmds.some(c => c.norm.includes("set-member untagged ethernet 1/5"));
      const hasRemovedVlan1 = this.state.datacomVlan1RemovedPorts.has("1/5") || this.state.datacomVlan1RemovedPorts.has("ethernet 1/5");

      if (hasAddedVlan100 && !hasRemovedVlan1) {
        errors.push("REGLA ESTRICTA DmOS: El puerto 1/5 fue asignado a VLAN 100 sin antes ejecutar 'no set-member ethernet 1/5' en la VLAN 1 nativa (riesgo de colisión untagged).");
        score -= 25;
      } else if (hasAddedVlan100 && hasRemovedVlan1) {
        achievements.push("Excelente práctica DmOS: Puerto limpiado de VLAN 1 antes de membresía untagged.");
      }
    }

    const finalScore = Math.max(0, score);

    return {
      score: finalScore,
      rating: finalScore >= 90 ? "EXCELENTE" : finalScore >= 70 ? "BUENO" : "REQUIERE MEJORAS",
      achievements,
      warnings,
      errors
    };
  }
}
