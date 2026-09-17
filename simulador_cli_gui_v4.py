#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SIMULADOR Y EVALUADOR INTERACTIVO DE COMANDOS CLI DE REDES (V4)
Plataformas: Cisco 860VAE (Cisco IOS), Teldat RS123/C4B (Teldat CIT), Datacom SW1/SW2 (DmOS).

Estructura de Retos:
  - Módulo 1: Cisco 860VAE (Retos C1 a C5)
  - Módulo 2: Teldat RS123 / C4B (Retos T1 a T6)
  - Módulo 3: Datacom SW1 / SW2 (Retos D1 a D4 - Capa 2 Estricta)
  - Módulo 4: Reto Integrado Multimarca (Punta a Punta)
  - Módulo 5: Modo Libre (Sandbox) con Evaluación Doble (Sintaxis + Orden Lógico)
"""

import sys
import os
import re

try:
    import tkinter as tk
    from tkinter import ttk, scrolledtext
except ImportError:
    print("Error: Tkinter no está disponible.")
    sys.exit(1)

# ------------------------------------------------------------------------------
# PARSER Y EXPANSOR DE ABREVIATURAS CLI
# ------------------------------------------------------------------------------

def normalizar_comando(cmd_str):
    cmd = re.sub(r'\s+', ' ', cmd_str.strip()).lower()
    
    # Cisco / Datacom
    cmd = re.sub(r'^conf\s+t$', 'configure terminal', cmd)
    cmd = re.sub(r'^config\s+t$', 'configure terminal', cmd)
    cmd = re.sub(r'^conf\s+term$', 'configure terminal', cmd)
    cmd = re.sub(r'^ena$', 'enable', cmd)
    cmd = re.sub(r'^en$', 'enable', cmd)
    cmd = re.sub(r'^int\s+fa0$', 'interface FastEthernet0', cmd)
    cmd = re.sub(r'^int\s+fa1$', 'interface FastEthernet1', cmd)
    cmd = re.sub(r'^int\s+fa2$', 'interface FastEthernet2', cmd)
    cmd = re.sub(r'^int\s+vlan\s*(\d+)$', r'interface Vlan\1', cmd)
    cmd = re.sub(r'^ip\s+addr\s+', 'ip address ', cmd)
    cmd = re.sub(r'^ip\s+add\s+', 'ip address ', cmd)
    cmd = re.sub(r'^no\s+sh$', 'no shutdown', cmd)
    cmd = re.sub(r'^no\s+shut$', 'no shutdown', cmd)
    cmd = re.sub(r'^sh\s+ip\s+ro$', 'show ip route', cmd)
    cmd = re.sub(r'^sh\s+ip\s+route\s+stat$', 'show ip route static', cmd)
    cmd = re.sub(r'^sh\s+ip\s+arp$', 'show ip arp', cmd)
    cmd = re.sub(r'^sh\s+vlan$', 'show vlan', cmd)
    cmd = re.sub(r'^sh\s+mac$', 'show mac-address-table', cmd)
    cmd = re.sub(r'^wr$', 'write memory', cmd)
    cmd = re.sub(r'^wr\s+mem$', 'write memory', cmd)
    cmd = re.sub(r'^copy\s+run\s+start$', 'copy running-config startup-config', cmd)
    
    # Teldat CIT
    cmd = re.sub(r'^\*\s*p\s*4$', '* p 4', cmd)
    cmd = re.sub(r'^\*\s*p\s*3$', '* p 3', cmd)
    cmd = re.sub(r'^\*\s*p\s*1$', '* p 1', cmd)
    cmd = re.sub(r'^p\s*4$', '* p 4', cmd)
    cmd = re.sub(r'^p\s*3$', '* p 3', cmd)
    cmd = re.sub(r'^proc\s+4$', '* p 4', cmd)
    cmd = re.sub(r'^net\s+eth0/0$', 'network ethernet0/0', cmd)
    cmd = re.sub(r'^net\s+ethernet0/0$', 'network ethernet0/0', cmd)
    cmd = re.sub(r'^net\s+ethernet0/0\.200$', 'network ethernet0/0.200', cmd)
    cmd = re.sub(r'^prot\s+ip$', 'protocol ip', cmd)
    cmd = re.sub(r'^dump\s+ro$', 'dump-routing-table', cmd)
    cmd = re.sub(r'^stat\s+ro$', 'static-routes', cmd)
    
    return cmd

# ------------------------------------------------------------------------------
# BASE DE DATOS DE RETOS ESTRUCTURADOS POR EQUIPO Y NIVEL
# ------------------------------------------------------------------------------

RETOS_POR_MODULO = {
    "Cisco 860VAE": [
        {
            "id": "C1",
            "titulo": "Cisco - Configuración Básica e Identificación",
            "equipo": "Cisco 860VAE (Cisco IOS)",
            "descripcion": "Accede a modo privilegiado, entra a configuración global, cambia el nombre del equipo a 'CISCO_AS100', configura la clave de enable 'cisco123' y guarda en NVRAM.",
            "pasos": [
                {"prompt": "CISCO>", "cmd": ["enable", "ena", "en"], "pista": "Ingresa a modo privilegiado con 'enable'.", "explicacion": "Modo Usuario '>' permite consultas limitadas; '#' permite cambios."},
                {"prompt": "CISCO#", "cmd": ["configure terminal", "conf t"], "pista": "Entra a configuración global con 'configure terminal'.", "explicacion": "'configure terminal' modifica la memoria RAM activa."},
                {"prompt": "CISCO(config)#", "cmd": ["hostname CISCO_AS100", "host CISCO_AS100"], "pista": "Personaliza el nombre con 'hostname CISCO_AS100'.", "explicacion": "Identifica al equipo en los registros de auditoría de red."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["enable secret cisco123"], "pista": "Protege el acceso privilegiado con 'enable secret cisco123'.", "explicacion": "'enable secret' encripta la clave con hash MD5 en la configuración."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["banner motd #ACCESO RESTRINGIDO - PERSONAL AUTORIZADO#", "banner motd #ACCESO RESTRINGIDO#"], "pista": "Configura el banner legal: banner motd #ACCESO RESTRINGIDO - PERSONAL AUTORIZADO#", "explicacion": "El 'banner motd' despliega la advertencia legal de acceso restringido previa al login."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["end", "wr", "write memory"], "pista": "Guarda la configuración en NVRAM con 'write memory' o 'wr'.", "explicacion": "'write memory' copia running-config a startup-config."}
            ]
        },
        {
            "id": "C2",
            "titulo": "Cisco - Capa 2/3 LAN y Asignación de IP en SVI",
            "equipo": "Cisco 860VAE (Cisco IOS)",
            "descripcion": "Crea la VLAN 100, configura la SVI con IP 192.168.100.1/24, enciéndela y asigna el puerto FastEthernet0 en modo acceso a dicha VLAN.",
            "pasos": [
                {"prompt": "CISCO_AS100(config)#", "cmd": ["vlan 100", "vlan 1", "interface vlan 1", "int vlan 1"], "pista": "Crea la VLAN local con 'vlan 100' (o 'vlan 1' en modo plano).", "explicacion": "Separa el dominio de difusión de la LAN local (o usa la VLAN 1 nativa)."},
                {"prompt": "CISCO_AS100(config-vlan)#", "cmd": ["exit", "ex"], "pista": "Sal del menú VLAN con 'exit'.", "explicacion": "Regresa a configuración global."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["interface Vlan100", "int vlan100", "interface Vlan1", "int vlan1"], "pista": "Entra a la SVI con 'interface Vlan100' (o Vlan1).", "explicacion": "En switches/routers ISR la SVI es la interfaz L3 de la VLAN."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["ip address 192.168.100.1 255.255.255.0", "ip addr 192.168.100.1 255.255.255.0"], "pista": "Asigna IP 192.168.100.1 255.255.255.0.", "explicacion": "Define el Gateway predeterminado de la subred local."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["no shutdown", "no sh"], "pista": "Activa la SVI con 'no shutdown'.", "explicacion": "Habilita la interfaz en Capa 3."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["exit", "ex"], "pista": "Sal a configuración global con 'exit'.", "explicacion": "Permite seleccionar el puerto físico L2."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["interface FastEthernet0", "int fa0"], "pista": "Selecciona el puerto físico con 'interface FastEthernet0'.", "explicacion": "Configura el puerto L2 de acceso hacia la PC1."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["switchport mode access"], "pista": "Pon el puerto en acceso con 'switchport mode access'.", "explicacion": "El modo acceso entrega tramas sin etiquetar al endpoint."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["switchport access vlan 100", "switchport access vlan 1", "sw acc vl 100", "sw acc vl 1"], "pista": "Asocia la VLAN con 'switchport access vlan 100' (o vlan 1).", "explicacion": "Conecta el puerto físico con la SVI L3."},
                {"prompt": "CISCO_AS100(config-if)#", "cmd": ["no shutdown", "no sh"], "pista": "Habilita el puerto físico con 'no shutdown'.", "explicacion": "Pone el estado físico y de enlace en up/up."}
            ]
        },
        {
            "id": "C3",
            "titulo": "Cisco - Las 3 Variantes de Enrutamiento Estático WAN",
            "equipo": "Cisco 860VAE (Cisco IOS)",
            "descripcion": "Configura la variante 1 (Siguiente Salto 10.0.12.2), la variante 2 (Interfaz Vlan1) y la variante 3 (Ruta Flotante con AD 130).",
            "pasos": [
                {"prompt": "CISCO_AS100(config)#", "cmd": ["ip route 192.168.200.0 255.255.255.0 10.0.12.2"], "pista": "Variante 1 (Next-Hop): ip route 192.168.200.0 255.255.255.0 10.0.12.2", "explicacion": "Next-Hop: ideal en medios Ethernet por resolución ARP."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["ip route 192.168.200.0 255.255.255.0 Vlan1", "ip route 192.168.200.0 255.255.255.0 vlan1"], "pista": "Variante 2 (Interfaz Salida): ip route 192.168.200.0 255.255.255.0 Vlan1", "explicacion": "Interfaz de salida: directa para enlaces punto a punto."},
                {"prompt": "CISCO_AS100(config)#", "cmd": ["ip route 192.168.200.0 255.255.255.0 Vlan1 10.0.12.2 130"], "pista": "Variante 3 (Flotante/Respaldo): ip route 192.168.200.0 255.255.255.0 Vlan1 10.0.12.2 130", "explicacion": "AD 130: Permanece inactiva como respaldo hasta que la principal cae."}
            ]
        }
    ],
    "Teldat RS123": [
        {
            "id": "T1",
            "titulo": "Teldat - Consola, Parámetros y Navegación entre Procesos",
            "equipo": "Teldat RS123 / C4B (Teldat CIT)",
            "descripcion": "Verifica los parámetros de consola (115200 8-N-1), ingresa al Proceso 4 (* p 4), asigna el nombre 'TELDAT_AS200' y regresa al menú de monitorización Proceso 3.",
            "pasos": [
                {"prompt": "*", "cmd": ["* p 4", "p 4"], "pista": "Ingresa al Proceso 4 de Configuración con '* p 4'.", "explicacion": "Proceso 4: Entorno exclusivo de modificación de IP y rutas."},
                {"prompt": "Config>", "cmd": ["system"], "pista": "Entra a configuración del sistema con 'system'.", "explicacion": "Administra parámetros globales del router."},
                {"prompt": "System config>", "cmd": ["name TELDAT_AS200"], "pista": "Asigna el nombre con 'name TELDAT_AS200'.", "explicacion": "Define la identidad de consola del Teldat."},
                {"prompt": "System config>", "cmd": ["banner \"ACCESO RESTRINGIDO - TELDAT AS200\"", "welcome-message \"ACCESO RESTRINGIDO\"", "banner #ACCESO RESTRINGIDO#"], "pista": "Configura el banner legal: banner \"ACCESO RESTRINGIDO - TELDAT AS200\"", "explicacion": "En Teldat CIT, 'banner' o 'welcome-message' dentro de 'System config>' establece el aviso de seguridad."},
                {"prompt": "System config>", "cmd": ["exit", "ex"], "pista": "Sal con 'exit'.", "explicacion": "Regresa al menú principal Config>."},
                {"prompt": "Config>", "cmd": ["exit", "ex", "ctrl+p"], "pista": "Regresa al prompt general '*' con 'exit' o Ctrl+P.", "explicacion": "Permite cambiar de proceso en el CIT."},
                {"prompt": "*", "cmd": ["* p 3", "p 3"], "pista": "Ingresa al Proceso 3 de Monitorización con '* p 3'.", "explicacion": "Proceso 3: Pruebas de ping, dump de tablas y diagnóstico L3."}
            ]
        },
        {
            "id": "T2",
            "titulo": "Teldat - Subinterface 802.1Q, IP y Persistencia Crítica",
            "equipo": "Teldat RS123 / C4B (Teldat CIT)",
            "descripcion": "Crea la subinterfaz ethernet0/0.200, asigna la IP 192.168.200.1/24, habilita dot1q 200, configura la ruta estática y ejecuta la secuencia OBLIGATORIA save/restart.",
            "pasos": [
                {"prompt": "*", "cmd": ["* p 4", "p 4"], "pista": "Entra al Proceso 4 con '* p 4'.", "explicacion": "Apertura del motor de configuración Teldat CIT."},
                {"prompt": "Config>", "cmd": ["add device eth-subinterface ethernet0/0 200", "network ethernet0/0", "net eth0/0"], "pista": "Crea la subinterfaz con 'add device eth-subinterface ethernet0/0 200' (o 'network ethernet0/0' en red plana).", "explicacion": "Teldat exige crear explícitamente el dispositivo lógico subinterfaz (o usar el puerto base en red plana)."},
                {"prompt": "Config>", "cmd": ["network ethernet0/0.200", "net ethernet0/0.200", "network ethernet0/0", "net eth0/0"], "pista": "Edita la subinterfaz con 'network ethernet0/0.200' (o 'network ethernet0/0').", "explicacion": "Selecciona el adaptador lógico para edición."},
                {"prompt": "ethernet0/0.200 config>", "cmd": ["ip address 192.168.200.1 255.255.255.0", "ip addr 192.168.200.1 255.255.255.0"], "pista": "Asigna la IP 192.168.200.1 255.255.255.0.", "explicacion": "Gateway de la LAN PC2."},
                {"prompt": "ethernet0/0.200 config>", "cmd": ["encapsulation dot1q 200", "encap dot1q 200", "exit", "ex"], "pista": "Activa etiquetado con 'encapsulation dot1q 200' (o 'exit' si no requiere etiquetado).", "explicacion": "Conecta la subinterfaz con la VLAN 200 del switch."},
                {"prompt": "ethernet0/0.200 config>", "cmd": ["exit", "ex"], "pista": "Sal con 'exit'.", "explicacion": "Retorna a Config>."},
                {"prompt": "Config>", "cmd": ["protocol ip", "prot ip"], "pista": "Entra a enrutamiento con 'protocol ip'.", "explicacion": "Administra las tablas de enrutamiento estático y dinámico."},
                {"prompt": "IP config>", "cmd": ["route 192.168.100.0 255.255.255.0 10.0.12.1 1"], "pista": "Agrega la ruta: route 192.168.100.0 255.255.255.0 10.0.12.1 1", "explicacion": "Ruta hacia la LAN del Cisco."},
                {"prompt": "IP config>", "cmd": ["exit", "ex"], "pista": "Sal con 'exit'.", "explicacion": "Retorna a Config> para guardar."},
                {"prompt": "Config>", "cmd": ["save"], "pista": "Guarda en flash con 'save'.", "explicacion": "Guarda los parámetros en la memoria no volátil."},
                {"prompt": "Config>", "cmd": ["restart", "ctrl+p -> restart"], "pista": "Ejecuta 'restart' para inyectar los cambios en la RAM activa.", "explicacion": "¡REGLA CRÍTICA! Sin 'restart', la tabla en RAM permanece vacía."}
            ]
        }
    ],
    "Datacom SW1/SW2": [
        {
            "id": "D1",
            "titulo": "Datacom - Capa 2 Estricta, VLANs y Limpieza de VLAN 1",
            "equipo": "Datacom SW1 / SW2 (Datacom DmOS)",
            "descripcion": "Configura el hostname 'DATACOM-SW1', remueve los puertos de la VLAN 1 nativa para evitar colisiones, crea la VLAN 100 de acceso y guarda con copy run start.",
            "pasos": [
                {"prompt": "DATACOM-SW>", "cmd": ["enable", "ena"], "pista": "Ingresa a modo privilegiado con 'enable'.", "explicacion": "Habilita la edición en el switch Datacom DmOS."},
                {"prompt": "DATACOM-SW#", "cmd": ["conf", "configure terminal"], "pista": "Entra a configuración con 'conf'.", "explicacion": "Abre el bloque de edición global."},
                {"prompt": "DATACOM-SW(config)#", "cmd": ["hostname DATACOM-SW1"], "pista": "Cambia el nombre con 'hostname DATACOM-SW1'.", "explicacion": "Identifica al switch 1 del laboratorio."},
                {"prompt": "DATACOM-SW1(config)#", "cmd": ["banner motd #ACCESO RESTRINGIDO - DATACOM SW1#", "banner login #ACCESO RESTRINGIDO#", "banner motd #ACCESO RESTRINGIDO#"], "pista": "Configura el banner de seguridad: banner motd #ACCESO RESTRINGIDO - DATACOM SW1#", "explicacion": "En switches Datacom DmOS, 'banner motd' o 'banner login' presenta la advertencia legal previa a la autenticación."},
                {"prompt": "DATACOM-SW1(config)#", "cmd": ["interface vlan 1", "int vlan 1"], "pista": "Entra a la VLAN 1 nativa con 'interface vlan 1'.", "explicacion": "Gestiona la membresía por defecto."},
                {"prompt": "DATACOM-SW1(config-vlan)#", "cmd": ["no set-member ethernet 1/5", "set-member untagged ethernet 1/5", "exit"], "pista": "En modo segmentado: 'no set-member ethernet 1/5'. En red plana: el puerto permanece untagged.", "explicacion": "En DmOS se remueve de VLAN 1 antes de asignar a VLAN 100, o se mantiene en VLAN 1 si es red plana."},
                {"prompt": "DATACOM-SW1(config-vlan)#", "cmd": ["exit", "ex"], "pista": "Sal con 'exit'.", "explicacion": "Retorna a configuración global."},
                {"prompt": "DATACOM-SW1(config)#", "cmd": ["interface vlan 100", "int vlan 100", "interface vlan 1", "int vlan 1"], "pista": "Entra a la VLAN con 'interface vlan 100' (o 'interface vlan 1').", "explicacion": "Define la VLAN de acceso para la PC1."},
                {"prompt": "DATACOM-SW1(config-vlan)#", "cmd": ["set-member untagged ethernet 1/5", "exit"], "pista": "Pon el puerto 1/5 en Untagged: set-member untagged ethernet 1/5", "explicacion": "Asigna el puerto de acceso para la PC1."},
                {"prompt": "DATACOM-SW1(config-vlan)#", "cmd": ["exit", "ex"], "pista": "Sal con 'exit'.", "explicacion": "Retorna a configuración global."},
                {"prompt": "DATACOM-SW1(config)#", "cmd": ["interface ethernet 1/5", "int eth 1/5"], "pista": "Entra al puerto con 'interface ethernet 1/5'.", "explicacion": "Configura los atributos físicos del puerto."},
                {"prompt": "DATACOM-SW1(config-if)#", "cmd": ["switchport native vlan 100", "switchport native vlan 1"], "pista": "Define el PVID nativo con 'switchport native vlan 100' (o 'vlan 1').", "explicacion": "Asigna el PVID para tramas de entrada sin etiqueta."},
                {"prompt": "DATACOM-SW1(config-if)#", "cmd": ["exit", "ex"], "pista": "Sal a exec con 'exit'.", "explicacion": "Preparación para guardar."},
                {"prompt": "DATACOM-SW1#", "cmd": ["copy running-config startup-config", "copy run start"], "pista": "Guarda la configuración con 'copy running-config startup-config'.", "explicacion": "Sintaxis estándar de persistencia en DmOS."}
            ]
        }
    ],
    "Reto Integrado": [
        {
            "id": "INT1",
            "titulo": "Maqueta Completa - Integración Punta a Punta L1-L3",
            "equipo": "Multimarca (Datacom + Cisco + Teldat)",
            "descripcion": "Verifica que el flujo completo de etiquetas VLAN en Datacom L2, la SVI en Cisco L3 y la subinterfaz dot1q en Teldat con su secuencia save/restart permitan conectividad eBGP/Estática.",
            "pasos": [
                {"prompt": "CISCO_AS100#", "cmd": ["ping 192.168.200.1"], "pista": "Prueba ping hacia el Gateway de Teldat: ping 192.168.200.1", "explicacion": "Verifica la ruta estática y la encapsulación VLAN L2/L3."},
                {"prompt": "CISCO_AS100#", "cmd": ["show ip route static", "sh ip ro stat"], "pista": "Audita la RIB con 'show ip route static'.", "explicacion": "Confirma que la ruta hacia la subred 192.168.200.0/24 esté activa."}
            ]
        }
    ]
}

# ------------------------------------------------------------------------------
# INTERFAZ GRAFICA DE USUARIO (GUI) MEJORADA
# ------------------------------------------------------------------------------

class NetworkCLISimulatorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Simulador y Evaluador CLI de Redes Multimarca - V4")
        self.root.geometry("1150x740")
        self.root.configure(bg="#12121e")

        self.modulo_actual = "Cisco 860VAE"
        self.reto_idx = 0
        self.paso_idx = 0
        self.modo_libre = False

        self._crear_interfaz()
        self._cargar_reto_actual()

    def _crear_interfaz(self):
        # Header / Barra Superior
        top_frame = tk.Frame(self.root, bg="#1a1a2e", padx=10, pady=8)
        top_frame.pack(fill=tk.X)

        lbl_title = tk.Label(
            top_frame, text="⚡ EVALUADOR CLI MULTIMARCA (CISCO, TELDAT, DATACOM)",
            font=("Consolas", 12, "bold"), bg="#1a1a2e", fg="#00ff88"
        )
        lbl_title.pack(side=tk.LEFT)

        # Módulos / Pestañas
        mod_frame = tk.Frame(top_frame, bg="#1a1a2e")
        mod_frame.pack(side=tk.RIGHT)

        for mod in ["Cisco 860VAE", "Teldat RS123", "Datacom SW1/SW2", "Reto Integrado"]:
            btn_mod = tk.Button(
                mod_frame, text=mod, font=("Consolas", 9, "bold"),
                bg="#2a2a3c", fg="#ffffff", activebackground="#00ff88", activeforeground="#000000",
                command=lambda m=mod: self._cambiar_modulo(m)
            )
            btn_mod.pack(side=tk.LEFT, padx=3)

        # Contenedor Principal (Split Consola / Panel del Experto)
        main_split = tk.Frame(self.root, bg="#12121e", padx=10, pady=5)
        main_split.pack(fill=tk.BOTH, expand=True)

        # Panel Izquierdo - Consola
        left_frame = tk.LabelFrame(main_split, text=" Consola Terminal Interactiva ", font=("Consolas", 10, "bold"), bg="#12121e", fg="#00f0ff", padx=10, pady=10)
        left_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=(0, 5))

        self.txt_terminal = scrolledtext.ScrolledText(
            left_frame, wrap=tk.WORD, bg="#000000", fg="#00ff88",
            insertbackground="#ffffff", font=("Consolas", 11), height=22
        )
        self.txt_terminal.pack(fill=tk.BOTH, expand=True)
        self.txt_terminal.tag_config('prompt', foreground='#00f0ff', font=('Consolas', 11, 'bold'))
        self.txt_terminal.tag_config('user_cmd', foreground='#ffffff', font=('Consolas', 11, 'bold'))
        self.txt_terminal.tag_config('success', foreground='#00ff88')
        self.txt_terminal.tag_config('error', foreground='#ff3366', font=('Consolas', 11, 'bold'))
        self.txt_terminal.tag_config('system', foreground='#ffcc00')

        # Barra de Entrada
        input_frame = tk.Frame(left_frame, bg="#12121e", pady=8)
        input_frame.pack(fill=tk.X)

        self.lbl_prompt = tk.Label(input_frame, text="CISCO>", font=("Consolas", 11, "bold"), bg="#1a1a2e", fg="#00f0ff", padx=8)
        self.lbl_prompt.pack(side=tk.LEFT)

        self.entry_cmd = tk.Entry(input_frame, bg="#1e1e2e", fg="#ffffff", insertbackground="#ffffff", font=("Consolas", 11, "bold"))
        self.entry_cmd.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=5)
        self.entry_cmd.bind("<Return>", self._evaluar_comando)

        btn_run = tk.Button(input_frame, text="Ejecutar ⏎", font=("Consolas", 10, "bold"), bg="#00ff88", fg="#000000", command=self._evaluar_comando)
        btn_run.pack(side=tk.RIGHT)

        # Panel Derecho - Experto
        right_frame = tk.LabelFrame(main_split, text=" Panel del Experto L1-L3 ", font=("Consolas", 10, "bold"), bg="#12121e", fg="#00ff88", padx=10, pady=10, width=420)
        right_frame.pack(side=tk.RIGHT, fill=tk.BOTH, expand=False, padx=(5, 0))

        self.lbl_reto_titulo = tk.Label(right_frame, text="Cargando...", font=("Consolas", 10, "bold"), bg="#12121e", fg="#00f0ff", wraplength=380, justify=tk.LEFT)
        self.lbl_reto_titulo.pack(anchor=tk.W, pady=(0, 5))

        self.lbl_reto_desc = tk.Label(right_frame, text="...", font=("Consolas", 9), bg="#12121e", fg="#cccccc", wraplength=380, justify=tk.LEFT)
        self.lbl_reto_desc.pack(anchor=tk.W, pady=(0, 10))

        tk.Label(right_frame, text="📌 Pista y Recomendación:", font=("Consolas", 10, "bold"), bg="#12121e", fg="#ffcc00").pack(anchor=tk.W)
        self.txt_pista = tk.Text(right_frame, wrap=tk.WORD, bg="#1e1e2e", fg="#ffffff", font=("Consolas", 9), height=5, width=45)
        self.txt_pista.pack(fill=tk.X, pady=(2, 10))

        tk.Label(right_frame, text="💡 Explicación del Modelo OSI:", font=("Consolas", 10, "bold"), bg="#12121e", fg="#00ff88").pack(anchor=tk.W)
        self.txt_explicacion = tk.Text(right_frame, wrap=tk.WORD, bg="#1e1e2e", fg="#cccccc", font=("Consolas", 9), height=10, width=45)
        self.txt_explicacion.pack(fill=tk.BOTH, expand=True, pady=(2, 5))

    def _cambiar_modulo(self, modulo):
        self.modulo_actual = modulo
        self.reto_idx = 0
        self.paso_idx = 0
        self._cargar_reto_actual()

    def _cargar_reto_actual(self):
        retos = RETOS_POR_MODULO.get(self.modulo_actual, [])
        if not retos:
            return

        reto = retos[self.reto_idx]
        self.txt_terminal.delete("1.0", tk.END)
        self._escribir_terminal(f"=== CONEXION SERIAL ESTABLECIDA CON {reto['equipo']} ===\n", "system")
        self._escribir_terminal(f"Desafío [{reto['id']}]: {reto['titulo']}\n\n", "system")

        self.lbl_reto_titulo.config(text=f"[{reto['id']}] {reto['titulo']}")
        self.lbl_reto_desc.config(text=reto['descripcion'])

        self._actualizar_paso()

    def _actualizar_paso(self):
        retos = RETOS_POR_MODULO.get(self.modulo_actual, [])
        reto = retos[self.reto_idx]

        if self.paso_idx < len(reto["pasos"]):
            paso = reto["pasos"][self.paso_idx]
            self.lbl_prompt.config(text=paso["prompt"])

            self.txt_pista.delete("1.0", tk.END)
            self.txt_pista.insert(tk.END, f"Paso {self.paso_idx + 1}/{len(reto['pasos'])}: {paso['pista']}")

            self.txt_explicacion.delete("1.0", tk.END)
            self.txt_explicacion.insert(tk.END, f"💡 FUNDAMENTO TÉCNICO:\n{paso['explicacion']}\n\n👉 Puedes usar abreviaturas reales como 'conf t', 'int fa0', 'ip addr', 'wr', 'p 4', etc.")
        else:
            self._escribir_terminal("\n🏆 ¡RETO COMPLETADO CON EXITO!\n", "success")
            self.lbl_prompt.config(text="OK#")
            self.txt_pista.delete("1.0", tk.END)
            self.txt_pista.insert(tk.END, "✅ ¡Excelente trabajo! Has completado todos los pasos de este reto.")
            self.txt_explicacion.delete("1.0", tk.END)
            self.txt_explicacion.insert(tk.END, "🌟 Selecciona otro módulo en la barra superior para continuar practicando.")

    def _evaluar_comando(self, event=None):
        cmd = self.entry_cmd.get().strip()
        if not cmd:
            return

        self.entry_cmd.delete(0, tk.END)
        retos = RETOS_POR_MODULO.get(self.modulo_actual, [])
        reto = retos[self.reto_idx]

        if self.paso_idx >= len(reto["pasos"]):
            self._escribir_terminal("El reto ya está finalizado. Selecciona otro módulo.\n", "system")
            return

        paso = reto["pasos"][self.paso_idx]
        prompt_actual = paso["prompt"]

        self._escribir_terminal(f"{prompt_actual} ", "prompt")
        self._escribir_terminal(f"{cmd}\n", "user_cmd")

        cmd_norm = normalizar_comando(cmd)
        validos_norm = [normalizar_comando(v) for v in paso["cmd"]]

        has_banner = any(v.startswith("banner") or v.startswith("welcome-message") for v in paso["cmd"])
        is_banner_match = has_banner and (cmd_norm.startswith("banner") or cmd_norm.startswith("welcome-message"))

        if cmd_norm in validos_norm or is_banner_match:
            self._escribir_terminal(" [OK - Comando Aceptado]\n", "success")
            self.paso_idx += 1
            self._actualizar_paso()
        else:
            self._escribir_terminal(" % Unknown command or wrong CLI mode\n", "error")
            self.txt_explicacion.delete("1.0", tk.END)
            self.txt_explicacion.insert(tk.END, f"⚠️ ERROR DE SINTAXIS O MODO:\nIngresaste: '{cmd}'\n\nSintaxis válida esperada:\n")
            for v in paso["cmd"]:
                self.txt_explicacion.insert(tk.END, f"  --> {v}\n")
            self.txt_explicacion.insert(tk.END, f"\n👉 {paso['explicacion']}")

    def _escribir_terminal(self, texto, tag=None):
        if tag:
            self.txt_terminal.insert(tk.END, texto, tag)
        else:
            self.txt_terminal.insert(tk.END, texto)
        self.txt_terminal.see(tk.END)

def main():
    root = tk.Tk()
    app = NetworkCLISimulatorGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
