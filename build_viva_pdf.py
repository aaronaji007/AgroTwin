import os
import shutil
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw running header & total page numbers.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        self.saveState()
        
        # Don't draw header/footer on cover page (page 1)
        if self._pageNumber > 1:
            # Running Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#475569"))
            self.drawString(54, letter[1] - 36, "AGROTWIN-SHARE  //  PROJECT DEFENSE & EXPO VIVA MASTER GUIDE")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#94A3B8"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, "IOT & HYDRO-THERMAL DIGITAL TWIN")
            
            # Header separator rule
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)

            # Running Footer
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 46, letter[0] - 54, 46)

            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(54, 32, "Confidential - For Student Team & Technical Evaluation Viva Board")
            
            page_text = f"Page {self._pageNumber} of {total_pages}"
            self.drawRightString(letter[0] - 54, 32, page_text)

        self.restoreState()


def build_pdf(filename="AgroTwin_Share_Expo_Viva_Guide.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0F172A")    # Deep Slate
    c_accent = colors.HexColor("#059669")     # Emerald / Bio Green
    c_amber = colors.HexColor("#D97706")      # Industrial Amber
    c_blue = colors.HexColor("#2563EB")       # Tech Blue
    c_dark = colors.HexColor("#1E293B")       # Body text
    c_light = colors.HexColor("#F8FAFC")      # Card background
    c_border = colors.HexColor("#E2E8F0")     # Border line
    c_callout_bg = colors.HexColor("#F1F5F9") # Callout box

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_primary,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_accent,
        spaceAfter=12
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#64748B"),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=7,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14.5,
        textColor=c_accent,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=13,
        textColor=c_dark,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=c_dark,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=2,
        spaceAfter=2
    )

    formula_style = ParagraphStyle(
        'FormulaText',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )

    viva_q_style = ParagraphStyle(
        'VivaQ',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=c_primary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    viva_a_style = ParagraphStyle(
        'VivaA',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#334155"),
        spaceAfter=7
    )

    table_header_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=c_dark
    )

    table_cell_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=c_dark
    )

    def create_callout(title, text, badge="VIVA MASTER TIP", color_hex="#059669"):
        badge_p = Paragraph(f"<font color='{color_hex}'><b>[{badge}]</b></font> <b>{title}</b>", callout_style)
        body_p = Paragraph(text, callout_style)
        t = Table([[badge_p], [body_p]], colWidths=[letter[0] - 108])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor(color_hex)),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # COVER / HEADER BANNER
    # =========================================================================
    story.append(Paragraph("AgroTwin-Share: Technical Master Guide", title_style))
    story.append(Paragraph("IoT &amp; Hydro-Thermal Digital Twin Platform for Post-Harvest Produce Preservation", subtitle_style))
    story.append(Paragraph(
        "<b>Document Purpose:</b> Comprehensive Viva Defense, Project Expo Presentation &amp; Technical Knowledge Transfer Document<br/>"
        "<b>Target Audience:</b> Project Teammates, Technical Evaluators, Industry Judges &amp; Viva Examiners<br/>"
        "<b>Repository:</b> <font color='#2563EB'><u>github.com/aaronaji007/AgroTwin</u></font> | <b>Hosting:</b> Vercel Production Ready",
        meta_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=10))

    # =========================================================================
    # SECTION 1: EXECUTIVE ABSTRACT & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("1. Executive Summary &amp; Problem Context", h1_style))
    story.append(Paragraph(
        "The Food and Agriculture Organization (FAO) reports that approximately <b>33% to 45% of all harvested fruits and vegetables "
        "spoil before reaching consumers</b>, generating enormous economic losses ($1+ trillion globally) and squandering critical water "
        "and land resources. In cold-storage warehouses, legacy SCADA systems rely strictly on <i>passive threshold sensors</i>: "
        "they sound an alarm only after a temperature limit has been breached, with zero biological foresight into how long produce "
        "will actually remain marketable.",
        body_style
    ))
    story.append(Paragraph(
        "<b>AgroTwin-Share</b> bridges this technological divide by introducing a <b>Biophysical Digital Twin</b>. "
        "Instead of merely logging temperature and humidity, AgroTwin-Share continuously runs real-time mathematical models of "
        "cellular respiration kinetics (Arrhenius Q10 law), transpiration desiccation (Tetens Vapor Pressure Deficit), "
        "and hormonal climacteric ripening (Ethylene gas reaction cascades) to compute a dynamic <b>Shelf-Life Index (SLI %)</b> "
        "and exact days-to-spoilage countdowns for every storage bin in real-time.",
        body_style
    ))

    story.append(Spacer(1, 4))
    story.append(create_callout(
        "The 15-Second Pitch for Expo Judges",
        "\"AgroTwin-Share is an industrial Digital Twin platform for post-harvest cold storage. Rather than just recording room temperature, "
        "our platform simulates the living biology inside each produce batch—predicting cellular moisture loss, respiration decay, and ethylene "
        "ripening surges to dynamically forecast remaining shelf life in days, alerting facility operators before irreversible spoilage occurs.\""
    ))

    # =========================================================================
    # SECTION 2: THE 3 BIOPHYSICAL MATHEMATICAL MODELS (VIVA CORE)
    # =========================================================================
    story.append(Spacer(1, 6))
    story.append(Paragraph("2. Core Scientific &amp; Mathematical Formulations", h1_style))
    story.append(Paragraph(
        "The foundational strength of AgroTwin-Share lies in its biophysical decay engine. The overall produce decay multiplier "
        "<b>K_decay</b> is calculated as a composite product of three independent environmental stress factors:",
        body_style
    ))
    
    # Formula Box
    formula_table = Table([[
        Paragraph(
            "<b>K_decay = K_base  x  f_thermal(T)  x  f_hydro(T, RH)  x  f_ethylene([C2H4])</b><br/>"
            "<font size='7.5' color='#475569'>where K_base is nominal daily decay rate at biological optimum setpoints.</font>",
            formula_style
        )
    ]], colWidths=[letter[0] - 108])
    formula_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(formula_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("2.1 Thermal Factor &amp; Arrhenius Respiration (Q10 Law)", h2_style))
    story.append(Paragraph(
        "Fresh produce respires post-harvest, consuming stored sugars and oxygen while releasing CO2 and heat. "
        "According to Van 't Hoff's rule and the Arrhenius kinetics equation, the respiration rate roughly doubles to triples for "
        "every 10 deg C rise in temperature above optimal storage setpoints:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Above Optimal (T &gt;= T_opt):</b> f_thermal(T) = Q10 ^ ((T - T_opt) / 10)", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Chilling Injury Penalty (T &lt; T_chill):</b> Tropical and sub-tropical produce (bananas below 12 deg C, avocados below 3 deg C) suffer irreversible cell membrane phase transitions causing rapid browning and cellular collapse: f_thermal = 1.0 + 1.5 x |T - T_chill|.", bullet_style))

    story.append(Paragraph("2.2 Hydro-Deficit &amp; Transpiration Loss (Tetens VPD Model)", h2_style))
    story.append(Paragraph(
        "Relative humidity (RH %) alone is deceptive because warmer air holds significantly more water vapor. The true driving force "
        "for water evaporation from produce tissue into the chamber air is the <b>Vapor Pressure Deficit (VPD)</b> in kPa. "
        "We compute saturation vapor pressure <b>VP_sat</b> using the standard atmospheric Tetens equation:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Saturation Vapor Pressure:</b> VP_sat(T) = 0.61078 x exp( (17.27 x T) / (T + 237.3) ) [kPa]", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Vapor Pressure Deficit:</b> VPD = VP_sat(T) x (1 - RH / 100)", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Transpiration Stress Multiplier:</b> If VPD &gt; VPD_opt, f_hydro = 1.0 + 1.8 x (VPD - VPD_opt). If RH &gt; 96%, condensation occurs on produce skin, multiplying fungal/mold risk (Botrytis cinerea).", bullet_style))

    story.append(Paragraph("2.3 Phytohormone Ethylene Acceleration Factor (C2H4)", h2_style))
    story.append(Paragraph(
        "Ethylene is a natural ripening gas synthesized by <b>climacteric crops</b> (apples, bananas, avocados, tomatoes). "
        "Even trace levels (&gt;0.10 ppm) trigger autocatalytic ripening genes that destroy chlorophyll, degrade pectin cell walls, "
        "and accelerate respiration:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Climacteric Acceleration:</b> f_ethylene = 1.0 + beta x ln(1 + 5 x ([C2H4] - Threshold))", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Cross-Contamination Hazard:</b> Storing high-ethylene emitters (apples) alongside ethylene-sensitive non-climacteric crops (strawberries, greens) causes catastrophic early decay.", bullet_style))

    # Biological Profiles Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Table 1: Biological Commodity Profiles Programmed into AgroTwin-Share</b>", ParagraphStyle('Cap', fontName='Helvetica-Bold', fontSize=8, textColor=c_primary)))
    
    bio_table_data = [
        [Paragraph("Commodity", table_header_style), Paragraph("Type", table_header_style), Paragraph("Opt. Temp", table_header_style), Paragraph("Opt. RH", table_header_style), Paragraph("Q10", table_header_style), Paragraph("C2H4 Limit", table_header_style), Paragraph("Nominal Shelf-Life", table_header_style)],
        [Paragraph("Honeycrisp Apples", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("1.5 deg C", table_cell_style), Paragraph("92%", table_cell_style), Paragraph("2.2", table_cell_style), Paragraph("0.15 ppm", table_cell_style), Paragraph("180 Days (CA Storage)", table_cell_style)],
        [Paragraph("Cavendish Bananas", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("13.5 deg C", table_cell_style), Paragraph("90%", table_cell_style), Paragraph("2.6", table_cell_style), Paragraph("0.20 ppm", table_cell_style), Paragraph("28 Days (Chill &lt; 12 deg C)", table_cell_style)],
        [Paragraph("Hass Avocados", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("5.0 deg C", table_cell_style), Paragraph("90%", table_cell_style), Paragraph("2.4", table_cell_style), Paragraph("0.10 ppm", table_cell_style), Paragraph("35 Days", table_cell_style)],
        [Paragraph("Sweet Strawberries", table_cell_bold), Paragraph("Non-Climac.", table_cell_style), Paragraph("0.5 deg C", table_cell_style), Paragraph("93%", table_cell_style), Paragraph("3.1", table_cell_style), Paragraph("0.50 ppm", table_cell_style), Paragraph("14 Days (Ultra perishable)", table_cell_style)],
        [Paragraph("Roma Tomatoes", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("11.0 deg C", table_cell_style), Paragraph("88%", table_cell_style), Paragraph("2.3", table_cell_style), Paragraph("0.30 ppm", table_cell_style), Paragraph("24 Days", table_cell_style)],
    ]
    t_bio = Table(bio_table_data, colWidths=[105, 65, 55, 45, 35, 60, 139])
    t_bio.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_bio)

    # =========================================================================
    # SECTION 3: SYSTEM ARCHITECTURE & FULL-STACK IMPLEMENTATION
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Full-Stack System Architecture &amp; Engineering", h1_style))
    story.append(Paragraph(
        "AgroTwin-Share is architected as an enterprise-grade monorepo featuring a <b>Dual-Mode Service Layer</b>. "
        "This guarantees 100% operational autonomy during internet or server outages while providing seamless live integration "
        "with Python FastAPI microservices and cloud deployments.",
        body_style
    ))

    arch_table_data = [
        [Paragraph("Subsystem", table_header_style), Paragraph("Technology Stack", table_header_style), Paragraph("Key Architectural Responsibility", table_header_style)],
        [Paragraph("Frontend Dashboard", table_cell_bold), Paragraph("React 19, Vite, Tailwind CSS v4, Recharts, Lucide", table_cell_style), Paragraph("Industrial SCADA user interface, real-time oscillating telemetry stream hook, interactive multi-axis oscilloscope charts, What-If projection simulation console.", table_cell_style)],
        [Paragraph("Service Layer", table_cell_bold), Paragraph("Unified API Adapter (src/services/api.js)", table_cell_style), Paragraph("Toggleable mock engine flag (const USE_MOCK = true). When true, in-memory client engine calculates all biophysical math. When false, seamlessly redirects to FastAPI.", table_cell_style)],
        [Paragraph("Backend API", table_cell_bold), Paragraph("Python 3.12, FastAPI, Uvicorn, Pydantic v2", table_cell_style), Paragraph("Modular RESTful API endpoints for storage bins, produce batch tracking, telemetry packet ingestion, historical logging, and Arrhenius decay projections.", table_cell_style)],
        [Paragraph("Cloud &amp; Edge", table_cell_bold), Paragraph("Vercel Serverless Functions, ASGI Handler (api/index.py)", table_cell_style), Paragraph("Zero-config global deployment on Vercel with SPA client routing rewrites, sub-second cold starts, and automated continuous delivery.", table_cell_style)]
    ]
    t_arch = Table(arch_table_data, colWidths=[90, 140, 274])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_arch)

    story.append(Spacer(1, 8))
    story.append(Paragraph("3.1 The Toggleable Mock Service Layer &amp; Dynamic Telemetry Hook", h2_style))
    story.append(Paragraph(
        "A critical engineering requirement fulfilled in <code>src/services/api.js</code> is the configuration toggle:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>export const USE_MOCK = true;</b><br/>"
        "When <b>USE_MOCK is true</b>, the client uses an internal Brownian fluctuation algorithm inside a React <code>useEffect</code> hook. "
        "Every 3 seconds, a timer oscillates chamber temperature, relative humidity, and ethylene concentration around realistic noise baselines. "
        "At every step, the digital twin recalculates the produce Shelf-Life Index (SLI %) so the dashboard is dynamic and active during live expo demonstrations. "
        "When flipped to <b>false</b> (or toggled via the header switch), all calls route to <code>http://localhost:8000/api</code>.",
        body_style
    ))

    story.append(Spacer(1, 4))
    story.append(create_callout(
        "Viva Question Alert: How does the toggleable service work?",
        "\"We decoupled our UI from our backend using a unified service adapter pattern in api.js. The frontend components make identical calls "
        "(fetchBins(), simulateEvent(), etc.). The adapter checks isMockEnabled(): if true, it reads from a thread-safe in-browser biophysical "
        "store; if false, it performs asynchronous fetch requests to FastAPI. This allows zero-latency offline expo demos with full production parity.\"",
        "VIVA QUESTION ALERT",
        "#2563EB"
    ))

    # =========================================================================
    # SECTION 4: EXHAUSTIVE FEATURE WALKTHROUGH
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("4. Comprehensive Module-by-Module Feature Walkthrough", h1_style))
    story.append(Paragraph(
        "The interface was redesigned with an Awwwards-caliber <b>Raw Industrial Editorial SCADA aesthetic</b>: "
        "high-contrast Swiss 1px borders, zero rounded corners, 60-30-10 color discipline, and Instrument Serif display numerals.",
        body_style
    ))

    modules_data = [
        ("Module 01: Facility Control Matrix (Overview Page)", [
            "<b>5 Macro SCADA Metric Cards:</b> Displays Active Units (5/5 Online), Mean Temperature (6.7 deg C), Mean Humidity (90.5%), Active Ethylene Spikes (Surge count), and Total Inventory Health ($193.5K valuation).",
            "<b>Chamber Telemetry Grid:</b> Real-time operational cards for Cold Room Alpha, Ripening Chamber Beta, CA Gamma, Pre-Cooling Delta, and Post-Harvest Epsilon with segmented SLI progress pips and days-to-spoilage countdowns.",
            "<b>Quick Mechanical Anomaly Injector:</b> One-click physical anomaly injection buttons (+C2H4 Spike, +Door Leak, Calibrate) to demonstrate instant real-time telemetry reaction to evaluators."
        ]),
        ("Module 02: Storage Chambers SCADA (Bin Detail View)", [
            "<b>Chamber Switchboard Tabs:</b> Rapid mechanical switching between micro-zones (CR-ALPHA to PH-EPSILON).",
            "<b>Dual-Axis Oscilloscope Telemetry Chart:</b> Real-time Recharts plotting Temperature on Left Y-Axis and Humidity on Right Y-Axis with horizontal warning limit ReferenceLines.",
            "<b>Ethylene Concentration Curve:</b> Dedicated trace highlighting catalytic scrubber trip ceilings (e.g. 0.15 ppm).",
            "<b>SLI Decay Trajectory:</b> Projects biological degradation toward the commercial reject floor (50% SLI).",
            "<b>Physical Relay Switchboard:</b> Controls Chiller Compressor (4.8 kW inverter load), Circulation Fans (1,250 RPM), and Catalytic Ethylene Scrubbers (120 m3/h bed)."
        ]),
        ("Module 03: Digital Twin Simulation Engine (What-If Panel)", [
            "<b>Interactive Stress Sliders:</b> Live perturbation sliders for Temperature (-2 to 24 deg C), Relative Humidity (65 to 99%), Ethylene (0.01 to 2.0 ppm), and Projection Window (7 to 60 Days).",
            "<b>Comparative Trajectory Overlay:</b> High-contrast Recharts graph comparing Baseline Design vs. Simulated Perturbation.",
            "<b>Financial Exposure Ledger:</b> Instant calculation of dollar gain or loss on the batch (e.g. -$12,450 USD loss due to accelerated decay).",
            "<b>Biophysical Recommendation Directive:</b> Automated agronomic advice regarding priority dispatch or ventilation."
        ]),
        ("Module 04: Biomass Inventory Ledger (Batches View)", [
            "<b>Lot Tracking Dossier:</b> Registry of all produce lots with variety classification (Highland Select Apples, Ecuador Gold Bananas, etc.).",
            "<b>Harvest &amp; Intake Stamps:</b> Complete chain-of-custody tracking from field harvest to cold storage arrival.",
            "<b>Quality Grade Classification:</b> Export Grade A, Commercial Stage 3.5, and Direct Retail Ultra designations."
        ]),
        ("Module 05: Limits &amp; Alarm Journal (Alert Drawer &amp; Modal)", [
            "<b>Configurable Safety Boundaries:</b> Operator customization of Min/Max Temp, Min/Max RH, and Ethylene Ceilings per chamber.",
            "<b>Commodity Quick Presets:</b> Instant setpoint calibration buttons: Apples CA (0.5-3.5 deg C), Banana Ripening (12.5-16 deg C), Avocado Pre-conditioning (4-7 deg C), Berry Hydro-chill (0-2.2 deg C).",
            "<b>Operator Acknowledgment Journal:</b> Slide-out drawer tracking unacknowledged alarms with timestamp and parameter values."
        ])
    ]

    for mod_title, mod_bullets in modules_data:
        story.append(Paragraph(mod_title, h2_style))
        for b in mod_bullets:
            story.append(Paragraph(f"&bull;&nbsp;{b}", bullet_style))

    # =========================================================================
    # SECTION 5: LIVE EXPO DEMONSTRATION SCRIPT
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Step-by-Step Live Expo Demonstration Protocol", h1_style))
    story.append(Paragraph(
        "Follow this exact 3-minute demonstration sequence when presenting AgroTwin-Share to technical judges and expo visitors:",
        body_style
    ))

    demo_steps = [
        ("Step 1: Orient the Evaluator (30 Seconds)",
         "Show the <b>Control Matrix</b> (Module 01). Explain the 60-30-10 industrial terminal aesthetic: \"We designed this like an expensive, "
         "custom-built physical monitoring terminal. You are looking at Central Cold Storage Hub #4 holding $193,000 worth of perishable produce across 5 microclimate chambers.\" "
         "Point out the live 3-second telemetry pulse oscillating temperature and relative humidity."),
        
        ("Step 2: Trigger an Anomaly Event (45 Seconds)",
         "Click the <b>[+C2H4 SPIKE]</b> or <b>[+DOOR LEAK]</b> button in the top right injector dock.<br/>"
         "&bull;&nbsp;Notice the instant state change: Ripening Chamber Beta turns to <b>[ ALERT // WARNING ]</b>.<br/>"
         "&bull;&nbsp;The alarm bracket in the header increments to <b>[ ALARMS // 02 ]</b> with amber alert lighting.<br/>"
         "&bull;&nbsp;Open the <b>Storage Chambers</b> tab (Module 02). Show how the ethylene scrubber automatically switches to <b>[ PURGING ]</b> "
         "and the dual-axis oscilloscope graph plots the anomaly crossing the safety reference line."),
        
        ("Step 3: Demonstrate the What-If Digital Twin (60 Seconds)",
         "Navigate to <b>Module 03 (Digital Twin Engine)</b>. Select <i>Honeycrisp Apples</i>.<br/>"
         "&bull;&nbsp;Move the Temperature slider up by 4 deg C. Watch the Recharts graph immediately update in real-time.<br/>"
         "&bull;&nbsp;Highlight the <b>Financial Exposure Ledger</b>: \"By warming the chamber 4 deg C, the respiration rate doubles (Q10=2.2), "
         "cutting 65 days off shelf-life and causing an estimated $18,000 loss in batch asset value.\"<br/>"
         "&bull;&nbsp;Click <b>[ RESET ]</b> to show optimal baseline restoration."),

        ("Step 4: Demonstrate Full-Stack &amp; Deployment Parity (45 Seconds)",
         "Click the header toggle <b>[ FASTAPI ]</b>. Explain: \"Our platform is full-stack. By switching this toggle, the frontend connects "
         "directly to our Python FastAPI REST server and Python digital twin engine running at port 8000. Furthermore, the entire project "
         "is deployed on Vercel with serverless API routes.\"")
    ]

    for s_title, s_desc in demo_steps:
        story.append(Paragraph(f"<b>{s_title}</b>", viva_q_style))
        story.append(Paragraph(s_desc, body_style))

    # =========================================================================
    # SECTION 6: TOP 15 TECHNICAL VIVA QUESTIONS & BULLETPROOF ANSWERS
    # =========================================================================
    story.append(Spacer(1, 8))
    story.append(Paragraph("6. Top 15 Technical Viva Questions &amp; Model Answers", h1_style))
    story.append(Paragraph(
        "Study these 15 questions thoroughly with your teammates before your viva examination. They cover theoretical, mathematical, "
        "architectural, and operational questions examiners love to ask:",
        body_style
    ))

    viva_qa = [
        ("Q1: What fundamentally differentiates your Digital Twin from a traditional IoT sensor dashboard?",
         "A traditional IoT dashboard merely logs historical sensor values and applies simple static boolean thresholds (e.g. IF Temp &gt; 4 deg C THEN Alarm). "
         "A Digital Twin, by definition, possesses an internal biophysical mathematical model that simulates the biological physiology of the produce. "
         "AgroTwin-Share computes enzymatic respiration kinetics, vapor pressure moisture loss, and ethylene gene triggering to forecast future degradation, "
         "yielding predictive shelf-life countdowns and dynamic economic loss models."),

        ("Q2: Why did you choose Vapor Pressure Deficit (VPD) instead of just using Relative Humidity (RH %)?",
         "Relative humidity is a relative measure that depends heavily on air temperature: 90% RH at 2 deg C contains far less water vapor than 90% RH at 15 deg C. "
         "Produce skins experience moisture loss driven by the gradient between the internal saturated leaf/fruit tissue and the surrounding chamber air. "
         "Vapor Pressure Deficit (VPD in kPa) accurately measures this drying gradient using the Tetens equation. Lower VPD prevents desiccation, while too low VPD (RH &gt; 96%) causes water droplets to condense, triggering Botrytis fungal mold."),

        ("Q3: What is the Q10 temperature coefficient and why is it important in post-harvest biology?",
         "The Q10 temperature coefficient quantifies the rate of metabolic respiration increase when temperature increases by 10 deg C. "
         "For fresh horticultural crops, Q10 typically ranges from 2.0 to 3.5. For example, Honeycrisp Apples have a Q10 of 2.2; storing them at 11.5 deg C instead of 1.5 deg C "
         "causes them to burn through their stored sugars and organic acids at more than double the rate, halving their storage life."),

        ("Q4: What is Chilling Injury and how is it mathematically accounted for in your model?",
         "Chilling injury is physiological damage that occurs at cold temperatures above freezing (typically 0 to 12 deg C depending on species). "
         "In subtropical crops like bananas (threshold 11.5 deg C) or avocados (3.0 deg C), cold causes cell membrane lipids to solidify from liquid-crystalline to gel phase, "
         "causing electrolyte leakage, browning, and failure to ripen. In our algorithm, if T &lt; T_chill, a linear penalty multiplier (1.0 + 1.5 x delta_T) is applied to reflect accelerated collapse."),

        ("Q5: What is the difference between climacteric and non-climacteric produce in your platform?",
         "Climacteric produce (bananas, apples, avocados, tomatoes) undergo an autocatalytic burst in respiration and ethylene synthesis at ripening onset. "
         "Non-climacteric produce (strawberries, citrus, leafy greens) do not exhibit this surge and do not ripen after harvest. "
         "In our engine, climacteric crops have high ethylene sensitivity slopes (beta = 1.8 to 3.2), meaning even trace ethylene triggers exponential decay cascades."),

        ("Q6: How does the platform calculate the Shelf-Life Index (SLI %)?",
         "The Shelf-Life Index (SLI) is a normalized index (100% at harvest, 0% at total rot). Each time step delta_t, the drop in SLI is computed as: "
         "Delta_SLI = (BaseDailyDecay / 24) x K_decay x delta_t. When SLI drops below 75%, an action warning is logged; below 50%, produce has lost Grade A export status; "
         "below 10%, it is unmarketable waste. Days remaining is dynamically estimated as Current_SLI / (DailyDecay x K_decay)."),

        ("Q7: How did you implement real-time live data without physical microcontrollers during the expo?",
         "We engineered an autonomous client-side simulation layer in src/services/api.js and TelemetryContext.jsx. "
         "A dynamic React useEffect hook runs a 3-second interval applying subtle Brownian random walk noise to temperature (+-0.08 deg C), humidity (+-0.15%), and ethylene. "
         "It feeds these fluctuating inputs into the client-side biophysical model (digitalTwinModel.js), recalculating SLI in real time. This guarantees a lively, responsive dashboard with zero hardware dependencies."),

        ("Q8: How does switching between Mock Mode and FastAPI Live Mode work technically?",
         "Our frontend API service exports a boolean flag 'const USE_MOCK = true;'. When true, all service functions return promises resolved from our in-browser mock store. "
         "When set to false (or switched via the UI toggle), the functions execute asynchronous HTTP fetch calls to the FastAPI backend ('http://localhost:8000/api/...'). "
         "The adapter normalizes Python snake_case keys into JavaScript camelCase, ensuring the React UI is completely agnostic to the data provider."),

        ("Q9: What REST endpoints does the FastAPI backend provide?",
         "1. GET /api/summary (SCADA macro KPIs)<br/>"
         "2. GET /api/bins and GET /api/bins/{id} (Chamber status and telemetry)<br/>"
         "3. PUT /api/bins/{id}/thresholds (Safety limits configuration)<br/>"
         "4. POST /api/bins/{id}/simulate-event (Hardware failure injection)<br/>"
         "5. GET /api/batches (Biomass inventory lots)<br/>"
         "6. GET /api/bins/{id}/history (Historical time-series telemetry with 1h, 6h, 24h, 7d ranges)<br/>"
         "7. POST /api/telemetry (IoT sensor packet ingestion from field microcontrollers)<br/>"
         "8. POST /api/simulate/sli (Digital twin What-If scenario projection calculations)<br/>"
         "9. GET /api/alerts and POST /api/alerts/{id}/acknowledge (Alarm journal)."),

        ("Q10: How is the financial economic loss calculated in the What-If simulation?",
         "When an operator adjusts setpoints (e.g. higher temperature or lower humidity), the engine runs a day-by-day trajectory over the projection window (e.g. 14 days). "
         "It compares the simulated days remaining against the baseline days remaining. If the shelf-life delta is negative, the loss ratio is calculated as: "
         "Loss = Batch_Value_USD x (|Delta_Days| / Baseline_Days) x 0.75 (reflecting commercial discount and salvage value loss)."),

        ("Q11: Why did you adopt an 'Industrial Editorial' design aesthetic instead of standard SaaS templates?",
         "Standard SaaS templates with rounded corners, soft pastel drop-shadows, and bright violet icons look like consumer toys, not mission-critical industrial systems. "
         "We implemented an Awwwards-inspired Raw Industrial Editorial aesthetic utilizing Swiss 90-degree grid borders, deep matte black (#0A0A0A), "
         "monochrome 1px dividers, high-contrast Instrument Serif display typography, and JetBrains Mono micro-labels. "
         "This mirrors high-end physical SCADA monitoring terminals used in aerospace and cold chain infrastructure."),

        ("Q12: How is the platform deployed and hosted on Vercel?",
         "The project is structured with a root vercel.json that directs Vercel's build pipeline: 'cd frontend &amp;&amp; npm install &amp;&amp; npm run build' "
         "with output directory 'frontend/dist'. We included an SPA rewrite rule (source: /(.*) -&gt; /index.html) so client-side navigation never returns 404s. "
         "Additionally, we created api/index.py so FastAPI endpoints can execute as serverless Python functions on Vercel."),

        ("Q13: How does your system handle actuator automation (Compressors, Fans, Scrubbers)?",
         "Each storage bin schema tracks physical actuator states: compressor_active (boolean), evaporator_fan_active (boolean), and ethylene_scrubber_active (boolean). "
         "When sensor telemetry detects ethylene exceeding the safety ceiling (e.g. &gt;0.15 ppm), the system auto-activates the catalytic scrubber relay (120 m3/h bed) "
         "and logs a priority warning in the alarm journal. If cooling compressor fails, emergency backup alerts are triggered."),

        ("Q14: How can physical IoT hardware (ESP32 / Arduino / Raspberry Pi) be connected to your system?",
         "Physical IoT sensor nodes installed inside chambers periodically assemble JSON telemetry packets containing bin_id, temperature, humidity, ethylene_ppm, and co2_ppm. "
         "They transmit these packets via HTTP POST or MQTT to our ingestion endpoint: POST /api/telemetry. "
         "The endpoint validates the payload with Pydantic, updates the digital twin state, appends to the historical time-series buffer, and triggers threshold checks."),

        ("Q15: What are the future research directions and enhancements for AgroTwin-Share?",
         "1. Multi-gas integration (O2 and CO2 respiration quotient modeling for Controlled Atmosphere rooms).<br/>"
         "2. Machine Learning residual calibration (using LSTM or XGBoost to correct biophysical Arrhenius predictions against empirical microbial plate counts).<br/>"
         "3. Dynamic pricing integration: connecting produce SLI directly to wholesale commodity exchange APIs to automatically fire-sale produce with diminishing shelf life.")
    ]

    for q_text, a_text in viva_qa:
        story.append(Paragraph(q_text, viva_q_style))
        story.append(Paragraph(a_text, viva_a_style))

    # =========================================================================
    # SECTION 7: VIVA CHEATSHEET & FORMULA SUMMARY TABLE
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("7. Quick-Reference Viva Cheatsheet", h1_style))
    story.append(Paragraph(
        "Memorize these core scientific equations, parameters, and architecture facts for instantaneous recall during viva questioning:",
        body_style
    ))

    cheat_data = [
        [Paragraph("Concept / Parameter", table_header_style), Paragraph("Formula / Technical Value", table_header_style), Paragraph("Key Viva Explanation Point", table_header_style)],
        [Paragraph("Respiration Q10 Factor", table_cell_bold), Paragraph("f_T = Q10 ^ ((T - T_opt)/10)<br/>Apples: 2.2, Bananas: 2.6", table_cell_style), Paragraph("Respiration roughly doubles every 10 deg C rise, consuming stored sugars and halving shelf-life.", table_cell_style)],
        [Paragraph("Vapor Pressure Deficit (VPD)", table_cell_bold), Paragraph("VPD = VP_sat(T) x (1 - RH/100)<br/>Tetens formula for VP_sat", table_cell_style), Paragraph("True drying gradient of air. Optimal is 0.05-0.25 kPa. High VPD causes shriveling; RH &gt; 96% causes mold.", table_cell_style)],
        [Paragraph("Chilling Injury", table_cell_bold), Paragraph("T &lt; T_chill (Bananas &lt; 12 deg C, Avocados &lt; 3 deg C)", table_cell_style), Paragraph("Membrane lipid phase transition from liquid to gel, causing permanent tissue collapse and decay.", table_cell_style)],
        [Paragraph("Ethylene Sensitivity", table_cell_bold), Paragraph("Climacteric: Apples, Bananas, Avocados, Tomatoes", table_cell_style), Paragraph("Autocatalytic surge triggers pectinase and cellulase enzyme synthesis, breaking cell walls.", table_cell_style)],
        [Paragraph("Shelf-Life Index (SLI %)", table_cell_bold), Paragraph("SLI = 100% (Harvest) to 0% (Rot)<br/>Floor: 10% (Unmarketable)", table_cell_style), Paragraph("Integrated decay equation tracking quality degradation. Translates directly into days remaining.", table_cell_style)],
        [Paragraph("Service Architecture", table_cell_bold), Paragraph("const USE_MOCK = true;<br/>FastAPI: http://localhost:8000", table_cell_style), Paragraph("Decoupled adapter pattern. Offline client simulation for expo + full-stack Python server for production.", table_cell_style)],
        [Paragraph("Color Palette (60-30-10)", table_cell_bold), Paragraph("60%: #0A0A0A, 30%: #EDEDED / #262626<br/>10%: #00FF66, #FFB000, #FF3333", table_cell_style), Paragraph("Raw industrial terminal aesthetic with zero consumer rounded badges. Maximum clarity and contrast.", table_cell_style)]
    ]
    t_cheat = Table(cheat_data, colWidths=[110, 145, 249])
    t_cheat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_cheat)

    story.append(Spacer(1, 14))
    story.append(Paragraph("<b>8. Final Words for the Team: How to Score Maximum Marks</b>", h2_style))
    story.append(Paragraph(
        "1. <b>Speak with confidence about the biology:</b> Examiners respect computer science students who deeply understand the agricultural domain (Arrhenius kinetics, Tetens formula, climacteric curves).<br/>"
        "2. <b>Emphasize economic value:</b> Always point to the <i>$193,000 biomass valuation</i> and show how 4 degrees of temperature deviation causes an $18,000 loss—this transforms an engineering project into a commercial business solution.<br/>"
        "3. <b>Show off the UI live:</b> Don't just click through static screens; use the <b>[+C2H4 SPIKE]</b> and <b>[+DOOR LEAK]</b> buttons to prove the digital twin recalculates shelf-life in real time.<br/>"
        "4. <b>Highlight Vercel and GitHub:</b> Emphasize that the codebase is completely open-source, version-controlled on GitHub (<code>aaronaji007/AgroTwin</code>), and deployed live on Vercel.",
        body_style
    ))

    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully generated at: {pdf_path}")

    # Copy to frontend/public for one-click downloading from web app
    public_target = os.path.abspath(os.path.join(os.path.dirname(pdf_path), "frontend", "public", "AgroTwin_Share_Expo_Viva_Guide.pdf"))
    try:
        shutil.copyfile(pdf_path, public_target)
        print(f"PDF Successfully mirrored to public web folder: {public_target}")
    except Exception as e:
        print(f"Could not copy to public folder: {e}")

    return pdf_path

if __name__ == "__main__":
    out = build_pdf()
