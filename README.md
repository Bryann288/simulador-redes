# ⚡ Simulador y Evaluador CLI de Redes Multimarca

Simulador interactivo de comandos de consola de red para aprender y practicar la configuración de equipos de telecomunicaciones de diferentes fabricantes (**Cisco IOS**, **Teldat CIT** y **Datacom DmOS**).

---

## 🚀 Contenido del Proyecto

El repositorio incluye dos versiones:

1. **`web-simulator/` (Versión Web Moderna)**
   * Desarrollada con **React + Vite + Tailwind CSS**.
   * Terminal interactiva con evaluación en tiempo real de comandos.
   * Reconocimiento y normalización de abreviaturas reales de red (`conf t`, `en`, `int fa0`, `no sh`, `wr`, `* p 4`, etc.).
   * Panel del Experto con pistas, explicaciones teóricas y barra de progreso.
   * Navegación por módulos y niveles (C1-C3, T1-T2, D1, INT1).

2. **`simulador_cli_gui_v4.py` (Versión de Escritorio)**
   * Aplicación nativa en **Python 3** usando **Tkinter**.

---

## 🌐 Módulos y Retos de Configuración

* **Módulo 1: Cisco 860VAE (Cisco IOS)**
  * `C1`: Configuración Básica e Identificación (`enable`, `hostname`, `enable secret`, `write memory`).
  * `C2`: Capa 2/3 LAN y Asignación de IP en SVI (`vlan 100`, `interface Vlan100`, `switchport mode access`).
  * `C3`: Las 3 Variantes de Enrutamiento Estático WAN (Next-Hop, Interfaz de Salida, Ruta Flotante con AD 130).

* **Módulo 2: Teldat RS123 / C4B (Teldat CIT)**
  * `T1`: Consola, Parámetros y Navegación entre Procesos (* p 4, system, name, * p 3).
  * `T2`: Subinterfaz 802.1Q, IP y Persistencia Crítica (`add device`, `dot1q 200`, `save`, `restart`).

* **Módulo 3: Datacom SW1 / SW2 (Datacom DmOS)**
  * `D1`: Capa 2 Estricta, VLANs y Limpieza de VLAN 1 (`no set-member`, `set-member untagged`, `switchport native vlan`).

* **Módulo 4: Reto Integrado Multimarca**
  * `INT1`: Maqueta Completa Punta a Punta (`ping`, `show ip route static`).

---

## 🛠️ Cómo Ejecutar Localmente

### Versión Web (Recomendada):
```bash
cd web-simulator
npm install
npm run dev
```
Abre en tu navegador `http://localhost:5173/`.

### Versión de Escritorio (Python):
```bash
python simulador_cli_gui_v4.py
```
