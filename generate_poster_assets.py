import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

os.makedirs('poster_assets', exist_ok=True)

# -----------------------------------------------------------------------------
# 1. GENERATE SYSTEM ARCHITECTURE DIAGRAM
# -----------------------------------------------------------------------------
def generate_architecture_diagram():
    fig, ax = plt.subplots(figsize=(14, 10.5), dpi=200)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#FFFFFF')

    # Color Palette matching Awwwards / Industrial Academic style
    c_navy = '#0F295C'
    c_blue = '#1E40AF'
    c_accent_green = '#059669'
    c_accent_amber = '#D97706'
    c_accent_red = '#DC2626'
    c_card_bg = '#F8FAFC'
    c_border = '#CBD5E1'

    # Background frame
    bg_rect = patches.FancyBboxPatch((1, 1), 98, 98, boxstyle="round,pad=0.5,rounding_size=1",
                                     linewidth=1.5, edgecolor=c_border, facecolor='#FFFFFF')
    ax.add_patch(bg_rect)

    # Title Bar
    title_rect = patches.FancyBboxPatch((2, 91.5), 96, 6.5, boxstyle="round,pad=0.2,rounding_size=0.5",
                                        facecolor=c_navy, edgecolor='none')
    ax.add_patch(title_rect)
    ax.text(50, 94.75, "AGROTWIN-SHARE: MULTI-TIER BIOPHYSICAL DIGITAL TWIN ARCHITECTURE",
            color='#FFFFFF', fontsize=14, fontweight='bold', ha='center', va='center', fontfamily='sans-serif')

    # 4 Main Columns / Tiers
    # Tier 1: Physical Cold Storage Chambers (x: 4 to 24)
    # Tier 2: Real-Time Event & Ingestion Bus (x: 28 to 48)
    # Tier 3: Biophysical Digital Twin Engine (x: 52 to 72)
    # Tier 4: SCADA Telemetry & Actuation (x: 76 to 96)

    tiers = [
        ("TIER 1: PHYSICAL STORAGE CHAMBERS", 4, 21.5, '#F1F5F9', c_blue),
        ("TIER 2: REAL-TIME INGESTION BUS", 28.5, 21.5, '#ECFDF5', c_accent_green),
        ("TIER 3: BIOPHYSICAL TWIN ENGINE", 53, 21.5, '#EFF6FF', c_blue),
        ("TIER 4: SCADA & ACTUATOR RELAYS", 77.5, 21.5, '#FFFBEB', c_accent_amber)
    ]

    for title, x, w, bg_color, header_color in tiers:
        # Tier card outline
        card = patches.FancyBboxPatch((x, 5), w, 84, boxstyle="round,pad=0.3,rounding_size=1",
                                     linewidth=1.2, edgecolor=c_border, facecolor=bg_color)
        ax.add_patch(card)
        
        # Tier Header
        header = patches.FancyBboxPatch((x, 83), w, 6, boxstyle="round,pad=0.2,rounding_size=0.5",
                                        facecolor=header_color, edgecolor='none')
        ax.add_patch(header)
        ax.text(x + w/2, 86, title, color='#FFFFFF', fontsize=9, fontweight='bold',
                ha='center', va='center', fontfamily='sans-serif')

    # Tier 1 Contents: 5 Chamber Nodes
    chambers = [
        ("Cold Room Alpha", "Honeycrisp Apples (1.8°C / 92% RH)", "DS18B20 Temp • SHT40 RH • MQ-137"),
        ("Ripening Chamber Beta", "Cavendish Bananas (14.5°C / 88% RH)", "Dual C2H4 Sensor • Respiration CO2"),
        ("CA Vault Gamma", "Hass Avocados (5.2°C / 91% RH)", "Hermetic O2/CO2 Cell • Ethylene Scrubber"),
        ("Pre-Cooling Unit Delta", "Sweet Strawberries (0.8°C / 94% RH)", "High-Airflow Hydro-Cooling Sensor"),
        ("Post-Harvest Bay Epsilon", "Roma Tomatoes (11.8°C / 86% RH)", "Transit Buffer Microclimate Node")
    ]
    y_pos = 73
    for name, desc, sensors in chambers:
        box = patches.FancyBboxPatch((5.5, y_pos - 9.5), 18.5, 12, boxstyle="round,pad=0.2,rounding_size=0.5",
                                     linewidth=1, edgecolor='#CBD5E1', facecolor='#FFFFFF')
        ax.add_patch(box)
        ax.text(6.5, y_pos + 0.5, name, fontsize=8.5, fontweight='bold', color=c_navy)
        ax.text(6.5, y_pos - 3, desc, fontsize=7.2, color='#475569')
        ax.text(6.5, y_pos - 6.5, f"Sensors: {sensors}", fontsize=6.8, fontfamily='monospace', color=c_blue)
        y_pos -= 14.5

    # Tier 2 Contents: Telemetry Ingestion Bus
    t2_boxes = [
        ("ESP32 IoT Gateway Node", "Edge packet serializer: JSON payload\nTransmission: HTTP POST / MQTT\nSampling: 3-sec cycle buffer", c_accent_green),
        ("Autonomous Brownian Generator", "Client-side useEffect hook\nSubtle random walk oscillation\nZero-dependency offline demo", c_accent_green),
        ("FastAPI Ingestion Endpoint", "POST /api/telemetry\nPydantic schema validation\nThread-safe state update buffer", c_blue),
        ("Historical Time-Series Store", "In-memory circular telemetry buffer\nGranular windows: 1h, 6h, 24h, 7d\nInstant JSON historical stream", c_blue)
    ]
    y_pos = 71
    for title, desc, col in t2_boxes:
        box = patches.FancyBboxPatch((30, y_pos - 12.5), 18.5, 15.5, boxstyle="round,pad=0.2,rounding_size=0.5",
                                     linewidth=1, edgecolor='#CBD5E1', facecolor='#FFFFFF')
        ax.add_patch(box)
        ax.text(31, y_pos + 1, title, fontsize=8.5, fontweight='bold', color=col)
        ax.text(31, y_pos - 7, desc, fontsize=7.2, color='#334155', linespacing=1.4)
        y_pos -= 19

    # Tier 3 Contents: Biophysical Digital Twin Engine
    t3_boxes = [
        ("Arrhenius Respiration (Q10)", "f_thermal = Q10 ^ ((T - T_opt)/10)\nChilling injury penalty for T < T_chill\nMetabolic substrate consumption", c_blue),
        ("Tetens Vapor Pressure Deficit", "VPD = VP_sat(T) x (1 - RH/100)\nTranspiration desiccation stress\nHigh RH (>96%) mold penalty", c_blue),
        ("Ethylene Ripening Cascade", "Climacteric receptor sensitivity\nf_eth = 1 + beta x ln(1 + 5(C2H4 - Thresh))\nCross-contamination alarm model", c_accent_amber),
        ("Shelf-Life Index (SLI %) Engine", "K_decay = K_base x f_T x f_H x f_eth\nSLI(t) = SLI_0 - int(K_decay dt)\nDynamic days-to-spoilage countdown", c_accent_green)
    ]
    y_pos = 71
    for title, desc, col in t3_boxes:
        box = patches.FancyBboxPatch((54.5, y_pos - 12.5), 18.5, 15.5, boxstyle="round,pad=0.2,rounding_size=0.5",
                                     linewidth=1, edgecolor='#CBD5E1', facecolor='#FFFFFF')
        ax.add_patch(box)
        ax.text(55.5, y_pos + 1, title, fontsize=8.5, fontweight='bold', color=col)
        ax.text(55.5, y_pos - 7, desc, fontsize=7.2, color='#334155', linespacing=1.4)
        y_pos -= 19

    # Tier 4 Contents: SCADA & Actuators
    t4_boxes = [
        ("SCADA Oscilloscope UI", "Dual-Axis Temp/RH Recharts\nEthylene ppm flux & scrubber line\nSLI degradation trajectory curve", c_navy),
        ("What-If Stress Simulator", "Live perturbation setpoint sliders\n7, 14, 30, 60-day forecast horizon\nFinancial loss ledger ($ USD)", c_navy),
        ("Actuator Relay Automation", "Inverter Chiller Compressor (4.8 kW)\nEvaporator Fan Relay (1,250 RPM)\nCatalytic Scrubber Bed (120 m3/h)", c_accent_amber),
        ("Safety Limits & Alarm Journal", "Per-chamber threshold configuration\nApples/Banana/Avocado/Berry presets\nOperator acknowledgment queue", c_accent_red)
    ]
    y_pos = 71
    for title, desc, col in t4_boxes:
        box = patches.FancyBboxPatch((79, y_pos - 12.5), 18.5, 15.5, boxstyle="round,pad=0.2,rounding_size=0.5",
                                     linewidth=1, edgecolor='#CBD5E1', facecolor='#FFFFFF')
        ax.add_patch(box)
        ax.text(80, y_pos + 1, title, fontsize=8.5, fontweight='bold', color=col)
        ax.text(80, y_pos - 7, desc, fontsize=7.2, color='#334155', linespacing=1.4)
        y_pos -= 19

    # Flow Arrows between Tiers
    arrow_props = dict(facecolor=c_navy, edgecolor='none', width=1.5, headwidth=6, headlength=6)
    
    # Tier 1 -> Tier 2
    ax.annotate('', xy=(28.5, 60), xytext=(24, 60), arrowprops=arrow_props)
    ax.annotate('', xy=(28.5, 35), xytext=(24, 35), arrowprops=arrow_props)
    ax.text(26.2, 61.5, "Telemetry", fontsize=6.5, ha='center', color=c_navy, fontweight='bold')

    # Tier 2 -> Tier 3
    ax.annotate('', xy=(53, 60), xytext=(48.5, 60), arrowprops=arrow_props)
    ax.annotate('', xy=(53, 35), xytext=(48.5, 35), arrowprops=arrow_props)
    ax.text(50.7, 61.5, "Packets", fontsize=6.5, ha='center', color=c_navy, fontweight='bold')

    # Tier 3 -> Tier 4
    ax.annotate('', xy=(77.5, 60), xytext=(73, 60), arrowprops=arrow_props)
    ax.annotate('', xy=(77.5, 35), xytext=(73, 35), arrowprops=arrow_props)
    ax.text(75.2, 61.5, "K_decay", fontsize=6.5, ha='center', color=c_navy, fontweight='bold')

    # Feedback Loop Arrow (Tier 4 Actuators -> Tier 1 Physical Chambers)
    feedback_pts = [(88, 5), (88, 2.5), (14, 2.5), (14, 5)]
    feedback_line = patches.Polygon(feedback_pts, closed=False, fill=False, edgecolor=c_accent_red,
                                    linewidth=1.8, linestyle='--')
    ax.add_patch(feedback_line)
    ax.annotate('', xy=(14, 5), xytext=(14, 3.5),
                arrowprops=dict(facecolor=c_accent_red, edgecolor='none', width=1.5, headwidth=6, headlength=6))
    ax.text(50, 3.5, "CLOSED-LOOP ACTUATOR FEEDBACK (Compressor Load Modulation • Scrubber Purging • Fan Velocity)",
            color=c_accent_red, fontsize=7.5, fontweight='bold', ha='center', va='center', backgroundcolor='#FFFFFF')

    plt.tight_layout()
    out_path = 'poster_assets/architecture_diagram.png'
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

# -----------------------------------------------------------------------------
# 2. GENERATE SCADA TELEMETRY SHOWCASE CHART FIGURE
# -----------------------------------------------------------------------------
def generate_scada_showcase():
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 9.5), dpi=200)
    fig.patch.set_facecolor('#0A0A0A')

    # Data generation
    time_pts = np.linspace(0, 24, 100) # 24 hours
    
    # Subplot 1: Dual Temp / RH with Reference Lines
    temp = 1.8 + 0.3 * np.sin(time_pts * 0.4) + np.random.normal(0, 0.05, 100)
    temp[60:75] += 2.2 # Door ajar event
    rh = 92.1 - 0.5 * np.sin(time_pts * 0.4) + np.random.normal(0, 0.1, 100)
    rh[60:75] -= 12.0

    ax1.set_facecolor('#0F0F0F')
    ax1.grid(True, linestyle='--', color='#222222', alpha=0.8)
    
    # Left Y: Temp
    line1 = ax1.plot(time_pts, temp, color='#00FF66', linewidth=2.5, label='Chamber Temperature (°C)')
    ax1.set_ylabel('Temperature (°C)', color='#00FF66', fontsize=10, fontweight='bold', fontfamily='monospace')
    ax1.tick_params(axis='y', labelcolor='#00FF66', labelsize=8)
    ax1.tick_params(axis='x', labelcolor='#888888', labelsize=8)
    ax1.set_ylim(-1, 6)

    # Reference limits
    ax1.axhline(3.5, color='#DC2626', linestyle='--', linewidth=1.5, label='Temp Max Safe Limit (3.5°C)')
    ax1.axhline(0.5, color='#38BDF8', linestyle='--', linewidth=1.5, label='Temp Min Safe Limit (0.5°C)')

    # Right Y: Humidity
    ax1_rh = ax1.twinx()
    line2 = ax1_rh.plot(time_pts, rh, color='#00E5FF', linewidth=2.0, linestyle='-.', label='Relative Humidity (%)')
    ax1_rh.set_ylabel('Relative Humidity (%)', color='#00E5FF', fontsize=10, fontweight='bold', fontfamily='monospace')
    ax1_rh.tick_params(axis='y', labelcolor='#00E5FF', labelsize=8)
    ax1_rh.set_ylim(60, 100)
    ax1_rh.axhline(88.0, color='#F59E0B', linestyle=':', linewidth=1.5, label='Min Safe RH (88%)')

    ax1.set_title('TIME-SERIES HYDRO-THERMAL OSCILLOSCOPE (COLD ROOM ALPHA: HONEYCRISP APPLES)',
                  color='#FFFFFF', fontsize=11, fontweight='bold', fontfamily='monospace', pad=10)

    # Add annotation for door open event
    ax1.annotate('DOOR AJAR ANOMALY\n(+2.2°C / -12% RH)', xy=(16, 4.0), xytext=(12, 5.0),
                 color='#F59E0B', fontsize=8, fontweight='bold', fontfamily='monospace',
                 arrowprops=dict(facecolor='#F59E0B', width=1, headwidth=5, headlength=5))

    # Subplot 2: Ethylene Flux & What-If Shelf-Life Decay Projection
    ax2.set_facecolor('#0F0F0F')
    ax2.grid(True, linestyle='--', color='#222222', alpha=0.8)

    days = np.arange(0, 15)
    baseline_sli = 95.0 - days * 0.55 # ~0.55% decay per day
    simulated_sli = 95.0 - days * 2.85 # accelerated under stress

    ax2.plot(days, baseline_sli, color='#00FF66', linewidth=2.5, marker='o', markersize=4, label='Baseline Optimal SLI (K_base=1.0x)')
    ax2.plot(days, simulated_sli, color='#DC2626', linewidth=2.5, marker='s', markersize=4, label='Simulated Perturbation SLI (K_decay=5.18x)')
    ax2.axhline(60.0, color='#F59E0B', linestyle='--', linewidth=1.5, label='Commercial Grade Reject Floor (60% SLI)')

    ax2.set_xlabel('Timeline Horizon (Days)', color='#888888', fontsize=9, fontfamily='monospace')
    ax2.set_ylabel('Shelf-Life Index (SLI %)', color='#FFFFFF', fontsize=10, fontweight='bold', fontfamily='monospace')
    ax2.tick_params(axis='x', labelcolor='#888888', labelsize=8)
    ax2.tick_params(axis='y', labelcolor='#FFFFFF', labelsize=8)
    ax2.set_ylim(40, 100)
    ax2.set_title('DIGITAL TWIN "WHAT-IF" 14-DAY DECAY TRAJECTORY & FINANCIAL IMPACT MODEL',
                  color='#FFFFFF', fontsize=11, fontweight='bold', fontfamily='monospace', pad=10)

    ax2.annotate('SHELF-LIFE DELTA: -48.5 DAYS\nFINANCIAL IMPACT: -$18,450 USD',
                 xy=(10, 66.5), xytext=(6, 48),
                 color='#DC2626', fontsize=8.5, fontweight='bold', fontfamily='monospace',
                 arrowprops=dict(facecolor='#DC2626', width=1, headwidth=5, headlength=5))

    # Style Legends
    for ax in [ax1, ax2]:
        leg = ax.legend(loc='lower left', facecolor='#111111', edgecolor='#333333', fontsize=7.5)
        for text in leg.get_texts():
            text.set_color('#E5E5E5')
            text.set_fontfamily('monospace')

    plt.tight_layout()
    out_path = 'poster_assets/scada_dashboard_showcase.png'
    plt.savefig(out_path, dpi=300, bbox_inches='tight')
    plt.close()
    print("Generated:", out_path)

if __name__ == '__main__':
    generate_architecture_diagram()
    generate_scada_showcase()
