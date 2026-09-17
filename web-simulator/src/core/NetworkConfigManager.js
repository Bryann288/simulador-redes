// Network Configuration & IP Profiles for Exam / Custom Scenarios

export const PRESET_PROFILES = [
  {
    id: "default",
    name: "Estándar de Laboratorio (192.168.x.x)",
    description: "LAN Cisco 192.168.100.0/24 · LAN Teldat 192.168.200.0/24 · WAN 10.0.12.0/30",
    config: {
      ciscoVlan: 100,
      teldatVlan: 200,
      ciscoLanNet: "192.168.100.0",
      ciscoLanMask: "255.255.255.0",
      ciscoLanGw: "192.168.100.1",
      ciscoPcIp: "192.168.100.10",
      teldatLanNet: "192.168.200.0",
      teldatLanMask: "255.255.255.0",
      teldatLanGw: "192.168.200.1",
      teldatPcIp: "192.168.200.10",
      wanNet: "10.0.12.0",
      wanMask: "255.255.255.252",
      wanCiscoIp: "10.0.12.1",
      wanTeldatIp: "10.0.12.2"
    }
  },
  {
    id: "class_b",
    name: "Empresarial Clase B (172.16.x.x)",
    description: "LAN Cisco 172.16.10.0/24 · LAN Teldat 172.16.20.0/24 · WAN 172.16.99.0/30",
    config: {
      ciscoVlan: 10,
      teldatVlan: 20,
      ciscoLanNet: "172.16.10.0",
      ciscoLanMask: "255.255.255.0",
      ciscoLanGw: "172.16.10.1",
      ciscoPcIp: "172.16.10.10",
      teldatLanNet: "172.16.20.0",
      teldatLanMask: "255.255.255.0",
      teldatLanGw: "172.16.20.1",
      teldatPcIp: "172.16.20.10",
      wanNet: "172.16.99.0",
      wanMask: "255.255.255.252",
      wanCiscoIp: "172.16.99.1",
      wanTeldatIp: "172.16.99.2"
    }
  },
  {
    id: "carrier_10",
    name: "Carrier / ISP Segment (10.x.x.x)",
    description: "LAN Cisco 10.10.1.0/24 · LAN Teldat 10.20.1.0/24 · WAN 10.0.0.0/30",
    config: {
      ciscoVlan: 110,
      teldatVlan: 220,
      ciscoLanNet: "10.10.1.0",
      ciscoLanMask: "255.255.255.0",
      ciscoLanGw: "10.10.1.1",
      ciscoPcIp: "10.10.1.10",
      teldatLanNet: "10.20.1.0",
      teldatLanMask: "255.255.255.0",
      teldatLanGw: "10.20.1.1",
      teldatPcIp: "10.20.1.10",
      wanNet: "10.0.0.0",
      wanMask: "255.255.255.252",
      wanCiscoIp: "10.0.0.1",
      wanTeldatIp: "10.0.0.2"
    }
  },
  {
    id: "subnetting_28",
    name: "Examen Subnetting /28 (Máscara 255.255.255.240)",
    description: "LAN Cisco 192.168.1.0/28 · LAN Teldat 192.168.1.16/28 · WAN 192.168.1.32/30",
    config: {
      ciscoVlan: 30,
      teldatVlan: 40,
      ciscoLanNet: "192.168.1.0",
      ciscoLanMask: "255.255.255.240",
      ciscoLanGw: "192.168.1.1",
      ciscoPcIp: "192.168.1.10",
      teldatLanNet: "192.168.1.16",
      teldatLanMask: "255.255.255.240",
      teldatLanGw: "192.168.1.17",
      teldatPcIp: "192.168.1.20",
      wanNet: "192.168.1.32",
      wanMask: "255.255.255.252",
      wanCiscoIp: "192.168.1.33",
      wanTeldatIp: "192.168.1.34"
    }
  }
];

export function generateRandomProfile() {
  const randCiscoOct = Math.floor(Math.random() * 200) + 10;
  let randTeldatOct = Math.floor(Math.random() * 200) + 10;
  if (randTeldatOct === randCiscoOct) randTeldatOct += 5;
  const randWanOct = Math.floor(Math.random() * 100) + 1;
  const randCiscoVlan = Math.floor(Math.random() * 80) + 10;
  const randTeldatVlan = randCiscoVlan + Math.floor(Math.random() * 30) + 10;

  return {
    id: "random_" + Date.now(),
    name: `🎲 Aleatorio del Examen (Subredes ${randCiscoOct} / ${randTeldatOct})`,
    description: `LAN Cisco: 192.168.${randCiscoOct}.0/24 · LAN Teldat: 192.168.${randTeldatOct}.0/24 · WAN: 10.${randWanOct}.1.0/30`,
    config: {
      ciscoVlan: randCiscoVlan,
      teldatVlan: randTeldatVlan,
      ciscoLanNet: `192.168.${randCiscoOct}.0`,
      ciscoLanMask: "255.255.255.0",
      ciscoLanGw: `192.168.${randCiscoOct}.1`,
      ciscoPcIp: `192.168.${randCiscoOct}.10`,
      teldatLanNet: `192.168.${randTeldatOct}.0`,
      teldatLanMask: "255.255.255.0",
      teldatLanGw: `192.168.${randTeldatOct}.1`,
      teldatPcIp: `192.168.${randTeldatOct}.10`,
      wanNet: `10.${randWanOct}.1.0`,
      wanMask: "255.255.255.252",
      wanCiscoIp: `10.${randWanOct}.1.1`,
      wanTeldatIp: `10.${randWanOct}.1.2`
    }
  };
}

/**
 * Replaces default IPs and VLANs with active exam configuration
 */
export function applyNetworkConfigToChallenge(challenge, netConfig) {
  if (!challenge || !netConfig) return challenge;

  const defaultValues = {
    ciscoVlan: 100,
    teldatVlan: 200,
    ciscoLanNet: "192.168.100.0",
    ciscoLanMask: "255.255.255.0",
    ciscoLanGw: "192.168.100.1",
    ciscoPcIp: "192.168.100.10",
    teldatLanNet: "192.168.200.0",
    teldatLanMask: "255.255.255.0",
    teldatLanGw: "192.168.200.1",
    teldatPcIp: "192.168.200.10",
    wanNet: "10.0.12.0",
    wanMask: "255.255.255.252",
    wanCiscoIp: "10.0.12.1",
    wanTeldatIp: "10.0.12.2"
  };

  const replaceText = (text) => {
    if (!text || typeof text !== "string") return text;
    let res = text;

    // Replace IPs
    res = res.replaceAll(defaultValues.ciscoLanNet, netConfig.ciscoLanNet);
    res = res.replaceAll(defaultValues.ciscoLanGw, netConfig.ciscoLanGw);
    res = res.replaceAll(defaultValues.ciscoPcIp, netConfig.ciscoPcIp);
    res = res.replaceAll(defaultValues.teldatLanNet, netConfig.teldatLanNet);
    res = res.replaceAll(defaultValues.teldatLanGw, netConfig.teldatLanGw);
    res = res.replaceAll(defaultValues.teldatPcIp, netConfig.teldatPcIp);
    res = res.replaceAll(defaultValues.wanCiscoIp, netConfig.wanCiscoIp);
    res = res.replaceAll(defaultValues.wanTeldatIp, netConfig.wanTeldatIp);

    // Replace masks if different
    if (netConfig.ciscoLanMask !== defaultValues.ciscoLanMask) {
      res = res.replaceAll(defaultValues.ciscoLanMask, netConfig.ciscoLanMask);
    }

    // Replace VLANs (preserving word boundaries or dot/colon formats)
    if (netConfig.ciscoVlan !== defaultValues.ciscoVlan) {
      res = res.replaceAll("vlan 100", `vlan ${netConfig.ciscoVlan}`);
      res = res.replaceAll("Vlan100", `Vlan${netConfig.ciscoVlan}`);
      res = res.replaceAll("vlan100", `vlan${netConfig.ciscoVlan}`);
      res = res.replaceAll("VLAN 100", `VLAN ${netConfig.ciscoVlan}`);
    }
    if (netConfig.teldatVlan !== defaultValues.teldatVlan) {
      res = res.replaceAll("dot1q 200", `dot1q ${netConfig.teldatVlan}`);
      res = res.replaceAll("ethernet0/0.200", `ethernet0/0.${netConfig.teldatVlan}`);
      res = res.replaceAll("eth-subinterface ethernet0/0 200", `eth-subinterface ethernet0/0 ${netConfig.teldatVlan}`);
      res = res.replaceAll("vlan 200", `vlan ${netConfig.teldatVlan}`);
      res = res.replaceAll("VLAN 200", `VLAN ${netConfig.teldatVlan}`);
    }

    return res;
  };

  return {
    ...challenge,
    title: replaceText(challenge.title),
    description: replaceText(challenge.description),
    steps: (challenge.steps || []).map(step => ({
      ...step,
      prompt: replaceText(step.prompt),
      hint: replaceText(step.hint),
      explanation: replaceText(step.explanation),
      valid_commands: (step.valid_commands || []).map(cmd => replaceText(cmd))
    }))
  };
}
