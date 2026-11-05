import os
import shutil
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and draw running headers, rules & total page count.
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
            self.setFillColor(colors.HexColor("#0F172A"))
            self.drawString(54, letter[1] - 36, "AGROTWIN-SHARE  //  TECHNICAL MASTER DEFENSE & CODE AUDIT GUIDE")
            
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawRightString(letter[0] - 54, letter[1] - 36, "BIOPHYSICAL KINETICS & FULL-STACK AUDIT")
            
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
            self.drawString(54, 32, "Confidential - Academic Viva Defense, Technical Evaluation & Project Expo Showcase")
            
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
    c_border = colors.HexColor("#CBD5E1")     # Border line

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=27,
        textColor=c_primary,
        spaceAfter=5
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_accent,
        spaceAfter=8
    )

    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12.5,
        textColor=colors.HexColor("#475569"),
        spaceAfter=10
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=c_blue,
        spaceBefore=9,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12,
        textColor=c_dark,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12,
        textColor=c_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3.5
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=12,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=2,
        spaceAfter=2
    )

    code_header_style = ParagraphStyle(
        'CodeHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=c_primary
    )

    code_content_style = ParagraphStyle(
        'CodeContent',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=colors.HexColor("#0F172A")
    )

    viva_q_style = ParagraphStyle(
        'VivaQ',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=c_primary,
        spaceBefore=7,
        spaceAfter=2.5,
        keepWithNext=True
    )

    viva_a_style = ParagraphStyle(
        'VivaA',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    table_header_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.2,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9,
        textColor=c_dark
    )

    table_cell_bold = ParagraphStyle(
        'TDBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=c_dark
    )

    def create_callout(title, text, badge="VIVA MASTER TIP", color_hex="#059669"):
        badge_p = Paragraph(f"<font color='{color_hex}'><b>[{badge}]</b></font> <b>{title}</b>", callout_style)
        body_p = Paragraph(text, callout_style)
        t = Table([[badge_p], [body_p]], colWidths=[letter[0] - 108])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor(color_hex)),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 7),
            ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ]))
        return t

    def create_code_box(filename, code_text, lang="Python", note=""):
        header_text = f"<b><font color='#2563EB'>[CODE EXCERPT]</font></b> <font color='#0F172A'><b>{filename}</b></font> <font color='#64748B'>// {lang}</font>"
        if note:
            header_text += f" &nbsp; <font color='#059669'><i>({note})</i></font>"
        header_p = Paragraph(header_text, code_header_style)
        
        # Clean text for ReportLab Paragraph
        formatted = code_text.strip()
        formatted = formatted.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        formatted = formatted.replace("\n", "<br/>").replace(" ", "&nbsp;")
        code_p = Paragraph(formatted, code_content_style)
        
        box = Table([[header_p], [code_p]], colWidths=[letter[0] - 108])
        box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor("#F8FAFC")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ('LINEBELOW', (0, 0), (-1, 0), 0.75, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ]))
        return box

    story = []

    # =========================================================================
    # COVER / HEADER BANNER
    # =========================================================================
    story.append(Paragraph("AgroTwin-Share: Technical Master Guide &amp; Code Deep-Dive", title_style))
    story.append(Paragraph("Biophysical Hydro-Thermal Digital Twin &amp; Edge IoT Platform for Post-Harvest Quality Preservation", subtitle_style))
    story.append(Paragraph(
        "<b>Comprehensive Viva Defense, Technical Code Audit &amp; Project Expo Presentation Manual</b><br/>"
        "<b>Target Audience:</b> University Viva Examiners, Technical Evaluators, Industry Judges &amp; Project Engineering Team<br/>"
        "<b>Repository:</b> <font color='#2563EB'><u>https://github.com/aaronaji007/AgroTwin</u></font> &nbsp;|&nbsp; <b>Live Deployment:</b> <font color='#059669'><u>https://agrotwinshare.vercel.app</u></font><br/>"
        "<b>Core Technologies:</b> Python 3.12, FastAPI, React 19, Vite, Tailwind CSS v4, Web Audio API, ESP32 (DHT11, MQ-135, HC-SR04)",
        meta_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceBefore=0, spaceAfter=8))

    # =========================================================================
    # SECTION 1: EXECUTIVE ABSTRACT & PROBLEM STATEMENT
    # =========================================================================
    story.append(Paragraph("1. Executive Abstract &amp; Problem Statement", h1_style))
    story.append(Paragraph(
        "According to the United Nations Food and Agriculture Organization (FAO), approximately <b>33% to 45% of all harvested fruits "
        "and vegetables spoil before reaching retail consumers</b>. This causes over <b>$1.0 trillion USD in annual economic losses</b> "
        "while squandering 25% of global agricultural freshwater and 20% of arable land. In contemporary cold storage facilities, conventional "
        "SCADA installations rely purely on <i>passive threshold alarms</i>: they ring a bell only after a thermal setpoint has already been "
        "violated, offering zero insight into biological cellular damage or actual commercial shelf-life decay.",
        body_style
    ))
    story.append(Paragraph(
        "<b>AgroTwin-Share</b> revolutionizes cold-chain asset management by introducing an end-to-end <b>Biophysical Hydro-Thermal "
        "Digital Twin</b>. By streaming live multi-transducer data (Temperature, Relative Humidity, Ethylene Gas, and HC-SR04 Ultrasonic "
        "fill distance) from microcontrollers directly into real-time biological kinetic models, the platform forecasts: "
        "<b>(1) Enzymatic Respiration Loss (Arrhenius Q10)</b>, <b>(2) Transpiration Moisture Desiccation (Tetens VPD)</b>, and "
        "<b>(3) Hormonal Ripening Surges (Ethylene C2H4)</b>, translating sensor streams into an actionable <b>Shelf-Life Index (SLI %)</b> "
        "and exact days-to-spoilage countdowns for every storage chamber.",
        body_style
    ))

    story.append(Spacer(1, 3))
    story.append(create_callout(
        "The 15-Second Pitch for Expo Judges & Evaluators",
        "\"AgroTwin-Share is an industrial Digital Twin platform for post-harvest cold storage. Rather than just recording room temperature, "
        "our system simulates the living biochemistry of stored commodities in real-time. By modeling cellular respiration, moisture evaporation "
        "gradients via Vapor Pressure Deficit, and autocatalytic ethylene cascades, we dynamically predict remaining shelf life in days and financial "
        "risk in dollars, preventing irreversible losses before they occur.\""
    ))

    # =========================================================================
    # SECTION 2: THE 3 BIOPHYSICAL MATHEMATICAL MODELS & CODE EXCERPTS (VIVA CORE)
    # =========================================================================
    story.append(Spacer(1, 5))
    story.append(Paragraph("2. Mathematical Decay Formulations &amp; Exact Source Code Excerpts", h1_style))
    story.append(Paragraph(
        "The core innovation of AgroTwin-Share is its coupled biophysical decay equation. The composite daily produce decay rate "
        "<b>K_decay</b> is formulated as the joint multiplicative product of three independent biophysical stress multipliers:",
        body_style
    ))
    
    # Formula Box
    formula_table = Table([[
        Paragraph(
            "<b>K_decay = K_base  x  f_thermal(T)  x  f_hydro(T, RH)  x  f_ethylene([C2H4])</b><br/>"
            "<font size='7' color='#475569'>where K_base is the species-specific baseline degradation rate at biological optimum setpoints.</font>",
            ParagraphStyle('F', fontName='Courier-Bold', fontSize=8, leading=11, textColor=c_primary)
        )
    ]], colWidths=[letter[0] - 108])
    formula_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(formula_table)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------------------
    # 2.1 Thermal Factor & Arrhenius Respiration (Q10 Law)
    # -------------------------------------------------------------------------
    story.append(Paragraph("2.1 Thermal Factor &amp; Arrhenius Respiration Kinetics (Q10 Law)", h2_style))
    story.append(Paragraph(
        "Harvested produce remains metabolically alive, consuming stored carbohydrates and dissolved oxygen via cellular respiration "
        "(C6H12O6 + 6O2 -&gt; 6CO2 + 6H2O + Energy). According to Van 't Hoff's rule and Arrhenius reaction kinetics, the metabolic "
        "respiration rate multiplies by a coefficient <b>Q10</b> (typically 2.0 to 3.2 in fruits) for every 10 deg C increase above the optimum storage temperature:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Respiration Acceleration (T &gt;= T_opt):</b> <code>f_thermal(T) = Q10 ^ ((T - T_opt) / 10)</code>", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Chilling Injury Penalty (T &lt; T_chill):</b> Tropical and subtropical commodities (bananas &lt; 12 deg C, avocados &lt; 3 deg C) suffer catastrophic phase transitions in cellular membrane lipids, switching from liquid-crystalline to rigid gel state. This causes electrolyte leakage, polyphenol oxidase browning, and cellular collapse: <code>f_thermal(T) = 1.0 + 1.5 x |T - T_chill|</code>.", bullet_style))
    
    code_thermal = """# backend/app/services/digital_twin_engine.py (Lines 128-140)
temp_diff = temp_c - profile["optimal_temp_c"]
if temp_diff >= 0:
    # Arrhenius exponential scaling for thermal respiration acceleration
    thermal_factor = math.pow(profile["q10_respiration"], temp_diff / 10.0)
else:
    # Sub-optimal temperature check: Safe cooling vs Irreversible Chilling Injury
    if temp_c < profile["chilling_injury_threshold_c"]:
        # Chilling injury causes severe cellular membrane collapse & browning
        chill_defect = abs(temp_c - profile["chilling_injury_threshold_c"])
        thermal_factor = 1.0 + (chill_defect * 1.5)
    else:
        # Modest safe cooling slowing down respiration decay
        thermal_factor = max(0.65, math.pow(profile["q10_respiration"], temp_diff / 10.0))"""
    story.append(create_code_box("backend/app/services/digital_twin_engine.py", code_thermal, "Python", "Arrhenius Q10 & Chilling Injury"))

    # -------------------------------------------------------------------------
    # 2.2 Hydro-Deficit & Transpiration Loss (Tetens VPD Model)
    # -------------------------------------------------------------------------
    story.append(Spacer(1, 4))
    story.append(Paragraph("2.2 Hydro-Deficit &amp; Transpiration Loss (Tetens Vapor Pressure Deficit)", h2_style))
    story.append(Paragraph(
        "Relative Humidity (RH %) alone is deceptive because warmer air holds significantly more water vapor. The true physical driving force "
        "for water evaporation from plant tissue through the cuticle is the <b>Vapor Pressure Deficit (VPD in kPa)</b>, defined as the difference "
        "between internal saturated vapor pressure (100% RH at fruit temperature) and external chamber air vapor pressure. "
        "We compute saturation vapor pressure <b>VP_sat</b> using the atmospheric Tetens formulation:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Tetens Saturation Pressure:</b> <code>VP_sat(T) = 0.61078 x exp( (17.27 x T) / (T + 237.3) )</code> [kPa]", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Vapor Pressure Deficit:</b> <code>VPD = VP_sat(T) x (1.0 - RH / 100.0)</code> [kPa]", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Transpiration Desiccation Multiplier:</b> If <code>VPD &gt; VPD_opt</code>, <code>f_hydro = 1.0 + 1.8 x (VPD - VPD_opt)</code>.", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Condensation Mold Hazard:</b> If <code>RH &gt; 96%</code>, water vapor condenses into free droplets on produce skin, activating <i>Botrytis cinerea</i> mold spores: <code>f_hydro += (RH - 96.0) x 0.15</code>.", bullet_style))

    code_vpd = """# backend/app/services/digital_twin_engine.py (Lines 109-123 & 142-157)
@staticmethod
def calculate_saturation_vapor_pressure(temp_c: float) -> float:
    \"\"\"Tetens formula: Saturation vapor pressure in kPa\"\"\"
    return 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))

@classmethod
def calculate_vpd(cls, temp_c: float, rh_pct: float) -> float:
    vp_sat = cls.calculate_saturation_vapor_pressure(temp_c)
    vp_act = vp_sat * (max(0.0, min(100.0, rh_pct)) / 100.0)
    return max(0.0, round(vp_sat - vp_act, 3))

# Inside calculate_decay_factors():
optimal_vpd = cls.calculate_vpd(profile["optimal_temp_c"], profile["optimal_rh_pct"])
current_vpd = cls.calculate_vpd(temp_c, rh_pct)
vpd_diff = current_vpd - optimal_vpd
hydro_factor = 1.0 + (vpd_diff * 1.8) if vpd_diff > 0 else 1.0

if rh_pct > 96.0:
    mold_risk_penalty = (rh_pct - 96.0) * 0.15
    hydro_factor += mold_risk_penalty"""
    story.append(create_code_box("backend/app/services/digital_twin_engine.py", code_vpd, "Python", "Tetens VPD & Mold Condensation"))

    # -------------------------------------------------------------------------
    # 2.3 Phytohormone Ethylene Acceleration Factor
    # -------------------------------------------------------------------------
    story.append(PageBreak())
    story.append(Paragraph("2.3 Phytohormone Ethylene Acceleration Kinetics (C2H4 Cascades)", h2_style))
    story.append(Paragraph(
        "Ethylene is a natural ripening gas synthesized by <b>climacteric crops</b> (apples, bananas, avocados, tomatoes). "
        "Upon reaching critical receptor concentrations (&gt;0.10 ppm), it triggers an autocatalytic feedback loop: ripening genes activate "
        "pectinase and cellulase enzymes that soften cell walls, degrade chlorophyll, and double respiration rates. "
        "In non-climacteric crops (strawberries), ethylene does not induce ripening but accelerates senescence and mold decay:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Climacteric Acceleration:</b> <code>f_ethylene = 1.0 + beta x ln(1 + 5 x ([C2H4] - Threshold))</code>", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Non-Climacteric Damped Sensitivity:</b> <code>f_ethylene = 1.0 + (beta x 0.4) x ln(1 + 2 x ([C2H4] - Threshold))</code>", bullet_style))

    code_eth = """# backend/app/services/digital_twin_engine.py (Lines 159-170)
eth_threshold = profile["ethylene_threshold_ppm"]
if ethylene_ppm > eth_threshold:
    excess_eth = ethylene_ppm - eth_threshold
    if profile["climacteric"]:
        # Logarithmic saturation model for autocatalytic ethylene receptor triggering
        eth_factor = 1.0 + profile["ethylene_slope"] * math.log1p(excess_eth * 5.0)
    else:
        # Non-climacteric damped senescent degradation
        eth_factor = 1.0 + (profile["ethylene_slope"] * 0.4) * math.log1p(excess_eth * 2.0)
else:
    eth_factor = 1.0

composite_multiplier = thermal_factor * hydro_factor * eth_factor"""
    story.append(create_code_box("backend/app/services/digital_twin_engine.py", code_eth, "Python", "Ethylene Receptor Model & Multiplier"))

    # -------------------------------------------------------------------------
    # 2.4 Discrete Differential Step Integration (Shelf-Life Index SLI %)
    # -------------------------------------------------------------------------
    story.append(Spacer(1, 4))
    story.append(Paragraph("2.4 Dynamic Shelf-Life Index (SLI %) Differential Step Integration", h2_style))
    story.append(Paragraph(
        "The Shelf-Life Index (SLI %) is a continuous biological health metric normalized from 100% (freshly harvested) down to 0% (total decomposition). "
        "At every telemetry update step delta_t (hours), the digital twin integrates the biological decay step:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Differential SLI Step:</b> <code>delta_SLI = (K_base / 24) x K_decay x delta_t</code>", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>Market Quality Tiers:</b> SLI &gt; 75%: <b>Export Grade A</b>; 50% &ndash; 75%: <b>Domestic Commercial</b>; 10% &ndash; 50%: <b>Discount Salvage</b>; &lt; 10%: <b>Unmarketable Total Rot</b>.", bullet_style))

    code_sli = """# backend/app/services/digital_twin_engine.py (Lines 180-192)
@classmethod
def calculate_step_sli(cls, current_sli: float, commodity: str, temp_c: float, 
                       rh_pct: float, ethylene_ppm: float, delta_hours: float = 1.0) -> float:
    \"\"\"Steps the Shelf-Life Index (SLI) forward by delta_hours.\"\"\"
    profile = COMMODITY_PROFILES.get(commodity, COMMODITY_PROFILES["Honeycrisp Apples"])
    factors = cls.calculate_decay_factors(commodity, temp_c, rh_pct, ethylene_ppm)
    
    base_hourly_decay = (profile["base_decay_rate_daily"] * 100.0) / 24.0
    sli_drop = base_hourly_decay * factors["composite_multiplier"] * delta_hours
    
    new_sli = max(0.0, min(100.0, current_sli - sli_drop))
    return round(new_sli, 2)"""
    story.append(create_code_box("backend/app/services/digital_twin_engine.py", code_sli, "Python", "Differential SLI Step Integration"))

    # -------------------------------------------------------------------------
    # 2.5 What-If Projection Engine & Economic Loss Valuation
    # -------------------------------------------------------------------------
    story.append(Spacer(1, 4))
    story.append(Paragraph("2.5 What-If Trajectory Simulation &amp; Economic Exposure Valuation", h2_style))
    story.append(Paragraph(
        "In Module 03 (What-If Simulation), operators adjust virtual chamber sliders. The digital twin runs a day-by-day forward Euler "
        "trajectory over a projection window (7 to 60 days), calculating biological shelf-life delta and dollar asset impact:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>Financial Loss Ratio:</b> <code>Loss_USD = -Batch_Value x (|delta_Days| / Baseline_Days) x 0.75</code>", bullet_style))

    code_sim = """# backend/app/services/digital_twin_engine.py (Lines 240-259)
base_days_rem = round(initial_sli / max(0.01, daily_base_decay), 1)
sim_days_rem = round(initial_sli / max(0.01, daily_sim_decay), 1)
delta_days = round(sim_days_rem - base_days_rem, 1)

if delta_days < 0:
    loss_ratio = min(1.0, abs(delta_days) / max(1.0, base_days_rem))
    economic_impact = -round(batch_value_usd * loss_ratio * 0.75, 2)
    risk_verdict = "CRITICAL: Accelerated shelf-life collapse. Immediate dispatch advised."
elif delta_days > 0:
    economic_impact = round(batch_value_usd * 0.08, 2)
    risk_verdict = "OPTIMAL: Extended preservation window active." """
    story.append(create_code_box("backend/app/services/digital_twin_engine.py", code_sim, "Python", "Economic Exposure & Trajectory Projection"))

    # Biological Profiles Table
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Table 1: Biological Commodity Profiles Programmed into AgroTwin-Share</b>", ParagraphStyle('Cap', fontName='Helvetica-Bold', fontSize=8, textColor=c_primary)))
    
    bio_table_data = [
        [Paragraph("Commodity", table_header_style), Paragraph("Type", table_header_style), Paragraph("Opt. Temp", table_header_style), Paragraph("Opt. RH", table_header_style), Paragraph("Q10", table_header_style), Paragraph("C2H4 Limit", table_header_style), Paragraph("Nominal Shelf-Life", table_header_style)],
        [Paragraph("Honeycrisp Apples", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("1.5 deg C", table_cell_style), Paragraph("92%", table_cell_style), Paragraph("2.2", table_cell_style), Paragraph("0.15 ppm", table_cell_style), Paragraph("180 Days (CA Storage)", table_cell_style)],
        [Paragraph("Cavendish Bananas", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("13.5 deg C", table_cell_style), Paragraph("90%", table_cell_style), Paragraph("2.6", table_cell_style), Paragraph("0.20 ppm", table_cell_style), Paragraph("28 Days (Chill &lt; 12 deg C)", table_cell_style)],
        [Paragraph("Hass Avocados", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("5.0 deg C", table_cell_style), Paragraph("90%", table_cell_style), Paragraph("2.4", table_cell_style), Paragraph("0.10 ppm", table_cell_style), Paragraph("35 Days", table_cell_style)],
        [Paragraph("Sweet Strawberries", table_cell_bold), Paragraph("Non-Climac.", table_cell_style), Paragraph("0.5 deg C", table_cell_style), Paragraph("93%", table_cell_style), Paragraph("3.1", table_cell_style), Paragraph("0.50 ppm", table_cell_style), Paragraph("14 Days (Perishable)", table_cell_style)],
        [Paragraph("Roma Tomatoes", table_cell_bold), Paragraph("Climacteric", table_cell_style), Paragraph("11.0 deg C", table_cell_style), Paragraph("88%", table_cell_style), Paragraph("2.3", table_cell_style), Paragraph("0.30 ppm", table_cell_style), Paragraph("24 Days", table_cell_style)],
    ]
    t_bio = Table(bio_table_data, colWidths=[105, 65, 55, 45, 35, 60, 139])
    t_bio.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
    ]))
    story.append(t_bio)

    # =========================================================================
    # SECTION 3: SYSTEM ARCHITECTURE & DUAL-MODE SERVICE LAYER
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("3. Full-Stack System Architecture &amp; Dual-Mode Service Layer", h1_style))
    story.append(Paragraph(
        "AgroTwin-Share is engineered as an enterprise-grade monorepo featuring a <b>Decoupled Adapter Service Pattern</b>. "
        "This ensures 100% operational autonomy during offline exhibitions while providing seamless integration with high-performance "
        "Python FastAPI backends and Vercel serverless deployments.",
        body_style
    ))

    arch_table_data = [
        [Paragraph("Subsystem", table_header_style), Paragraph("Technology Stack", table_header_style), Paragraph("Key Architectural Responsibility", table_header_style)],
        [Paragraph("Frontend Dashboard", table_cell_bold), Paragraph("React 19, Vite, Tailwind CSS v4, Recharts, Lucide", table_cell_style), Paragraph("Industrial SCADA user interface, real-time oscillating telemetry stream hook, dual-axis oscilloscope charts, What-If projection simulation console.", table_cell_style)],
        [Paragraph("Service Adapter", table_cell_bold), Paragraph("Unified API Adapter (frontend/src/services/api.js)", table_cell_style), Paragraph("Toggleable mock engine flag (const USE_MOCK). When true, in-memory client engine calculates all biophysical math. When false, seamlessly redirects to FastAPI.", table_cell_style)],
        [Paragraph("Backend API", table_cell_bold), Paragraph("Python 3.12, FastAPI, Uvicorn, Pydantic v2", table_cell_style), Paragraph("Modular RESTful API endpoints for storage bins, produce batch tracking, ESP32 packet ingestion, historical logging, and Arrhenius decay projections.", table_cell_style)],
        [Paragraph("Cloud &amp; Edge", table_cell_bold), Paragraph("Vercel Serverless Functions, ASGI Handler (api/index.py)", table_cell_style), Paragraph("Zero-config global deployment on Vercel with SPA client routing rewrites, sub-second cold starts, and automated continuous delivery.", table_cell_style)]
    ]
    t_arch = Table(arch_table_data, colWidths=[90, 140, 274])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 4))

    story.append(Paragraph("3.1 The Service Adapter Pattern &amp; Telemetry Polling Loop", h2_style))
    story.append(Paragraph(
        "A key design pattern in <code>frontend/src/services/api.js</code> decouples the UI from the network transport. "
        "Every UI component calls generic service methods like <code>fetchBins()</code>. The adapter checks runtime state: "
        "if <code>isMockEnabled()</code> is true, it queries an in-memory client store with Brownian fluctuations; "
        "if false, it dispatches an asynchronous HTTP request to the FastAPI server running at <code>http://localhost:8000/api</code>.",
        body_style
    ))

    code_adapter = """// frontend/src/services/api.js (Lines 37-46 & 312-322)
export function isMockEnabled() {
  return runtimeMockOverride !== null ? runtimeMockOverride : USE_MOCK;
}

export async function fetchBins() {
  if (isMockEnabled()) {
    return Promise.resolve(mockStore.getBins());
  }
  const res = await fetch(`${BACKEND_BASE_URL}/api/bins`);
  if (!res.ok) throw new Error(`Backend error: ${res.statusText}`);
  return normalizeBins(await res.json());
}"""
    story.append(create_code_box("frontend/src/services/api.js", code_adapter, "JavaScript", "Decoupled Service Adapter"))

    # =========================================================================
    # SECTION 4: EDGE HARDWARE CLUSTER & PROXIMITY SIREN IMPLEMENTATION
    # =========================================================================
    story.append(Spacer(1, 6))
    story.append(Paragraph("4. Physical Edge Node (ESP32) &amp; Nuclear Siren Synthesizer", h1_style))
    story.append(Paragraph(
        "AgroTwin-Share features an end-to-end physical hardware edge ingestion pipeline. A live ESP32 microcontroller collects "
        "transducer signals and posts JSON payloads every 2.5 seconds to <code>POST /api/telemetry/esp32</code>:",
        body_style
    ))
    story.append(Paragraph("&bull;&nbsp;<b>DHT11 Transducer (GPIO 4):</b> Measures chamber ambient temperature (+/-0.5 deg C) and relative humidity (+/-2% RH).", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>MQ-135 Gas Sensor (GPIO 32 / ADC1_CH4):</b> Measures reducing gases and ethylene PPM analog equivalent.", bullet_style))
    story.append(Paragraph("&bull;&nbsp;<b>HC-SR04 Ultrasonic Sensor (Trigger GPIO 5 / Echo GPIO 18):</b> Measures produce fill distance in cm via high-speed microsecond pulse timing: <code>Distance = (Duration x 0.034) / 2.0</code>.", bullet_style))

    code_esp32 = """// ESP32 Arduino C++ Firmware (AgroTwin-Share Edge Node)
long duration = pulseIn(ECHO_PIN, HIGH, 30000);
float distanceCm = (duration == 0) ? -1.0f : (duration * 0.034f / 2.0f);
float fillPct = (distanceCm != -1.0f) ? constrain(100.0f - distanceCm, 0.0f, 100.0f) : 0.0f;

String jsonPayload = "{";
jsonPayload += "\\\"device_id\\\": \\\"ESP32-NODE-01\\\",";
jsonPayload += "\\\"bin_id\\\": \\\"BIN-01\\\",";
jsonPayload += "\\\"dht11_temp\\\": " + String(temperature, 2) + ",";
jsonPayload += "\\\"dht11_humidity\\\": " + String(humidity, 2) + ",";
jsonPayload += "\\\"gas_raw\\\": " + String(gasRaw) + ",";
jsonPayload += "\\\"ultrasonic_distance_cm\\\": " + String(distanceCm, 1) + ",";
jsonPayload += "\\\"fill_level_pct\\\": " + String(fillPct, 1) + "}";

HTTPClient http;
http.begin(client, "http://10.18.84.40:8000/api/telemetry/esp32");
http.addHeader("Content-Type", "application/json");
int httpResponseCode = http.POST(jsonPayload);"""
    story.append(create_code_box("firmware/esp32_edge_node.ino", code_esp32, "C++ (Arduino)", "HC-SR04 Ultrasonic Pulse & HTTP Dispatch"))

    story.append(Spacer(1, 4))
    story.append(Paragraph("4.1 Ultrasonic Nuclear Reactor Meltdown Siren (Web Audio API Synthesizer)", h2_style))
    story.append(Paragraph(
        "To make the project interactive and unforgettable during live project expos, AgroTwin-Share implements a <b>Web Audio API "
        "hardware proximity klaxon</b> in <code>frontend/src/services/audioAlert.js</code>. While thermal and gas threshold breaches remain "
        "<b>strictly visual</b> (amber/red badges and SCADA journal), placing a hand closer than <b>5.0 cm</b> in front of the HC-SR04 ultrasonic sensor "
        "instantly triggers a multi-oscillator nuclear warning siren and sub-bass core rumble directly in the browser:",
        body_style
    ))

    code_audio = """// frontend/src/services/audioAlert.js (Synthesized Web Audio API)
// 1. Dual Sawtooth Klaxon Siren (Pitch modulated between 920Hz and 480Hz war-wail)
const sirenOsc1 = this.ctx.createOscillator();
const sirenOsc2 = this.ctx.createOscillator();
sirenOsc1.type = "sawtooth";
sirenOsc2.type = "square";
sirenOsc2.detune.setValueAtTime(12, now); // slight chorus detune for harsh industrial tone

// 2. Sub-bass Reactor Core Rumble (58Hz triangle oscillator modulated by 8Hz LFO)
const rumbleOsc = this.ctx.createOscillator();
rumbleOsc.type = "triangle";
rumbleOsc.frequency.setValueAtTime(58, now);

const lfo = this.ctx.createOscillator();
lfo.frequency.setValueAtTime(8, now); // 8 Hz shuddering core vibration"""
    story.append(create_code_box("frontend/src/services/audioAlert.js", code_audio, "JavaScript (Web Audio API)", "Multi-Oscillator Industrial Klaxon & Sub-Bass"))

    # =========================================================================
    # SECTION 5: EXHAUSTIVE FEATURE WALKTHROUGH
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("5. Comprehensive Module-by-Module Feature Walkthrough", h1_style))
    story.append(Paragraph(
        "The user interface follows an Awwwards-caliber <b>Raw Industrial Editorial SCADA aesthetic</b>: "
        "high-contrast Swiss 1px borders, zero rounded corners, 60-30-10 palette discipline (matte black #0A0A0A, dark neutral #262626, accent #00FF66 / #FFB000), "
        "and Instrument Serif display numerals.",
        body_style
    ))

    modules_data = [
        ("Module 01: Facility Control Matrix (Overview Page)", [
            "<b>5 Macro SCADA Metric Cards:</b> Displays Active Units (5/5 Online), Mean Temperature (6.7 deg C), Mean Humidity (90.5%), Active Ethylene Spikes (Surge count), and Total Inventory Health ($193.5K valuation).",
            "<b>Hardware Transducer Cluster:</b> Displays live status of DHT11, MQ-135 Gas Transducer, and HC-SR04 Ultrasonic sensor with instant latency indicators.",
            "<b>Chamber Telemetry Grid:</b> Real-time operational cards for Cold Room Alpha, Ripening Chamber Beta, CA Gamma, Pre-Cooling Delta, and Post-Harvest Epsilon with segmented SLI progress pips and days-to-spoilage countdowns.",
            "<b>Live Telemetry Demonstration Dock:</b> One-click pulse buttons (<code>PULSE ESP32 PACKET</code>, <code>TEST GAS SPIKE</code>, <code>&lt;5CM SIREN</code>) to showcase immediate SCADA state transitions."
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
    # SECTION 6: LIVE EXPO DEMONSTRATION SCRIPT
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("6. Step-by-Step Live Expo Demonstration Protocol", h1_style))
    story.append(Paragraph(
        "Follow this exact 3-minute sequence when presenting AgroTwin-Share to technical examiners and project expo judges:",
        body_style
    ))

    demo_steps = [
        ("Step 1: Orient the Evaluator (30 Seconds)",
         "Show the <b>Facility Control Matrix</b> (Module 01). Explain the 60-30-10 industrial terminal aesthetic: <i>\"We designed AgroTwin-Share "
         "as a mission-critical SCADA terminal. You are looking at Central Cold Storage Hub #4 holding $193,500 worth of perishable produce across "
         "5 post-harvest chambers. Notice our live 3-second telemetry pulse oscillating chamber metrics.\"</i>"),
        
        ("Step 2: Live ESP32 Hardware & Nuclear Siren Demo (45 Seconds)",
         "Direct attention to the physical breadboard. <i>\"Our system is connected in real-time to this physical ESP32 node running DHT11, MQ-135, "
         "and an HC-SR04 ultrasonic sensor.\"</i><br/>"
         "&bull;&nbsp;Wave your hand <b>within 5 cm</b> of the ultrasonic sensor.<br/>"
         "&bull;&nbsp;The browser immediately blares the <b>nuclear reactor meltdown siren</b> and flashes the emergency containment banner.<br/>"
         "&bull;&nbsp;Pull your hand away (&gt;5 cm): the siren silences instantly. Explain: <i>\"This proves end-to-end hardware-to-cloud reactive telemetry.\"</i>"),
        
        ("Step 3: Trigger an Anomaly Injection (30 Seconds)",
         "Click the <b>[+C2H4 SPIKE]</b> or <b>[+DOOR LEAK]</b> button in the top right injector dock.<br/>"
         "&bull;&nbsp;Cold Room Alpha or Beta immediately turns amber/red: <b>[ ALERT // WARNING ]</b>.<br/>"
         "&bull;&nbsp;The alarm bracket in the header increments to <b>[ ALARMS // 02 ]</b>.<br/>"
         "&bull;&nbsp;Open the <b>Storage Chambers</b> tab (Module 02). Show how the ethylene catalytic scrubber automatically switches to <b>[ PURGING ]</b> "
         "and the dual-axis oscilloscope graph plots the anomaly crossing the safety limit line."),
        
        ("Step 4: Demonstrate the What-If Digital Twin (45 Seconds)",
         "Navigate to <b>Module 03 (Digital Twin Model)</b>. Select <i>Honeycrisp Apples</i>.<br/>"
         "&bull;&nbsp;Move the Temperature slider up by 4 deg C. Watch the Recharts graph update in real-time.<br/>"
         "&bull;&nbsp;Highlight the <b>Financial Exposure Ledger</b>: <i>\"By warming the chamber 4 deg C, respiration doubles (Q10=2.2), "
         "cutting 65 days off shelf-life and causing an estimated -$18,000 USD loss in batch asset value.\"</i><br/>"
         "&bull;&nbsp;Click <b>[ RESET ]</b> to restore biological setpoints."),

        ("Step 5: Full-Stack & Deployment Parity (30 Seconds)",
         "Click the header toggle <b>[ FASTAPI ]</b>. Explain: <i>\"Our platform is full-stack. By switching this toggle, the frontend connects "
         "directly to our Python FastAPI server running at port 8000. Furthermore, the entire project is deployed globally on Vercel with serverless API routes.\"</i>")
    ]

    for s_title, s_desc in demo_steps:
        story.append(Paragraph(f"<b>{s_title}</b>", viva_q_style))
        story.append(Paragraph(s_desc, body_style))

    # =========================================================================
    # SECTION 7: TOP 15 TECHNICAL VIVA QUESTIONS & BULLETPROOF ANSWERS
    # =========================================================================
    story.append(Spacer(1, 6))
    story.append(Paragraph("7. Top 15 Technical Viva Questions &amp; Model Answers", h1_style))
    story.append(Paragraph(
        "Study these 15 questions thoroughly before your defense examination. They cover mathematical, biological, and software engineering inquiries:",
        body_style
    ))

    viva_qa = [
        ("Q1: What fundamentally differentiates your Digital Twin from a traditional IoT dashboard?",
         "A traditional IoT dashboard merely logs historical sensor values and applies simple static boolean thresholds (e.g. IF Temp &gt; 4 deg C THEN Alarm). "
         "A Digital Twin, by definition, possesses an internal biophysical mathematical model that simulates the biological physiology of the produce. "
         "AgroTwin-Share computes enzymatic respiration kinetics, vapor pressure moisture loss, and ethylene gene triggering to forecast future degradation, "
         "yielding predictive shelf-life countdowns and dynamic economic loss models."),

        ("Q2: Why did you choose Vapor Pressure Deficit (VPD) instead of just using Relative Humidity (RH %)?",
         "Relative humidity is relative to temperature: 90% RH at 2 deg C contains far less moisture capacity than 90% RH at 15 deg C. "
         "Produce skins experience moisture loss driven by the gradient between internal 100% saturated fruit tissue and ambient chamber air. "
         "Vapor Pressure Deficit (VPD in kPa) accurately measures this true evaporation force using the Tetens equation. Lower VPD prevents desiccation, "
         "while excessive humidity (RH &gt; 96%) causes liquid condensation, triggering Botrytis fungal decay."),

        ("Q3: What is the Q10 temperature coefficient and why is it important in post-harvest biology?",
         "The Q10 temperature coefficient quantifies the rate of metabolic respiration increase when temperature increases by 10 deg C. "
         "For fresh horticultural crops, Q10 typically ranges from 2.0 to 3.5. For example, Honeycrisp Apples have a Q10 of 2.2; storing them at 11.5 deg C instead of 1.5 deg C "
         "causes them to burn through stored sugars and organic acids at more than double the rate, halving their commercial storage life."),

        ("Q4: What is Chilling Injury and how is it mathematically accounted for in your model?",
         "Chilling injury is physiological damage that occurs at temperatures above freezing. In subtropical crops like bananas (&lt;12 deg C) or avocados (&lt;3 deg C), "
         "cold causes cellular membrane lipids to solidify into a rigid gel phase, causing electrolyte leakage, internal browning, and failure to ripen. "
         "In our algorithm, if T &lt; T_chill, a linear penalty multiplier (1.0 + 1.5 x |T - T_chill|) is applied to reflect accelerated tissue collapse."),

        ("Q5: What is the difference between climacteric and non-climacteric produce in your platform?",
         "Climacteric produce (bananas, apples, avocados, tomatoes) undergo an autocatalytic burst in respiration and ethylene synthesis at ripening onset. "
         "Non-climacteric produce (strawberries, citrus, leafy greens) do not exhibit this surge and do not ripen after harvest. "
         "In our engine, climacteric crops have high ethylene sensitivity slopes (beta = 1.8 to 3.2), meaning even trace ethylene triggers exponential decay cascades."),

        ("Q6: How does the platform calculate the Shelf-Life Index (SLI %)?",
         "The Shelf-Life Index (SLI) is a normalized index (100% at harvest, 0% at total rot). Each time step delta_t, the drop in SLI is computed as: "
         "delta_SLI = (BaseDailyDecay / 24) x K_decay x delta_t. When SLI drops below 75%, an action warning is logged; below 50%, produce has lost Grade A export status; "
         "below 10%, it is unmarketable waste. Days remaining is dynamically estimated as Current_SLI / (DailyDecay x K_decay)."),

        ("Q7: How did you implement real-time live data without physical microcontrollers during the expo?",
         "We engineered an autonomous client-side simulation layer in <code>src/services/api.js</code> and <code>TelemetryContext.jsx</code>. "
         "A dynamic React <code>useEffect</code> hook runs a 3-second interval applying subtle Brownian random walk noise to temperature (+/-0.08 deg C), humidity (+/-0.15%), and ethylene. "
         "It feeds these fluctuating inputs into the client-side biophysical model (<code>digitalTwinModel.js</code>), recalculating SLI in real time. This guarantees a lively, responsive dashboard with zero hardware dependencies."),

        ("Q8: How does switching between Mock Mode and FastAPI Live Mode work technically?",
         "Our frontend API service exports a boolean flag <code>isMockEnabled()</code>. When true, all service functions return promises resolved from our in-browser mock store. "
         "When set to false (or switched via the UI toggle), the functions execute asynchronous HTTP fetch calls to the FastAPI backend (<code>http://localhost:8000/api/...</code>). "
         "The adapter normalizes Python snake_case keys into JavaScript camelCase, ensuring the React UI is completely agnostic to the data provider."),

        ("Q9: What REST endpoints does the FastAPI backend provide?",
         "1. <code>GET /api/summary</code> (SCADA macro KPIs)<br/>"
         "2. <code>GET /api/bins</code> and <code>GET /api/bins/{id}</code> (Chamber status and telemetry)<br/>"
         "3. <code>PUT /api/bins/{id}/thresholds</code> (Safety limits configuration)<br/>"
         "4. <code>POST /api/bins/{id}/simulate-event</code> (Hardware failure injection)<br/>"
         "5. <code>GET /api/batches</code> (Biomass inventory lots)<br/>"
         "6. <code>GET /api/bins/{id}/history</code> (Historical time-series telemetry with 1h, 6h, 24h, 7d ranges)<br/>"
         "7. <code>POST /api/telemetry/esp32</code> (IoT sensor packet ingestion from ESP32 edge nodes)<br/>"
         "8. <code>POST /api/simulate/sli</code> (Digital twin What-If scenario projection calculations)<br/>"
         "9. <code>GET /api/alerts</code> and <code>POST /api/alerts/{id}/acknowledge</code> (Alarm journal)."),

        ("Q10: How is the financial economic loss calculated in the What-If simulation?",
         "When an operator adjusts setpoints (e.g. higher temperature or lower humidity), the engine runs a day-by-day trajectory over the projection window (e.g. 14 days). "
         "It compares the simulated days remaining against the baseline days remaining. If the shelf-life delta is negative, the loss ratio is calculated as: "
         "Loss = Batch_Value_USD x (|delta_Days| / Baseline_Days) x 0.75 (reflecting commercial discount and salvage value loss)."),

        ("Q11: Why did you adopt an 'Industrial Editorial' design aesthetic instead of standard SaaS templates?",
         "Standard SaaS templates with rounded corners, soft pastel drop-shadows, and bright violet icons look like consumer toys, not mission-critical industrial systems. "
         "We implemented an Awwwards-inspired Raw Industrial Editorial aesthetic utilizing Swiss 90-degree grid borders, deep matte black (#0A0A0A), "
         "monochrome 1px dividers, high-contrast Instrument Serif display typography, and JetBrains Mono micro-labels. "
         "This mirrors high-end physical SCADA monitoring terminals used in aerospace and cold chain infrastructure."),

        ("Q12: How is the platform deployed and hosted on Vercel?",
         "The project is structured with a root <code>vercel.json</code> that directs Vercel's build pipeline: <code>cd frontend &amp;&amp; npm install &amp;&amp; npm run build</code> "
         "with output directory <code>frontend/dist</code>. We included an SPA rewrite rule (source: /(.*) -&gt; /index.html) so client-side navigation never returns 404s. "
         "Additionally, we created <code>api/index.py</code> so FastAPI endpoints execute as serverless Python functions on Vercel."),

        ("Q13: How does your system handle actuator automation (Compressors, Fans, Scrubbers)?",
         "Each storage bin schema tracks physical actuator states: <code>compressor_active</code> (boolean), <code>evaporator_fan_active</code> (boolean), and <code>ethylene_scrubber_active</code> (boolean). "
         "When sensor telemetry detects ethylene exceeding the safety ceiling (e.g. &gt;0.15 ppm), the system auto-activates the catalytic scrubber relay (120 m3/h bed) "
         "and logs a priority warning in the alarm journal. If cooling compressor fails, emergency backup alerts are triggered."),

        ("Q14: How does the ultrasonic proximity siren work and why is temperature quiet?",
         "During our expo prototype testing, ambient room temperature (~30 deg C) naturally departs from true cold storage (0.5 to 3.5 deg C). If thermal alarms made noise, "
         "the buzzer would blare non-stop during the presentation. We therefore kept all thermal, humidity, and gas alarms strictly visual (amber/red badges, SCADA drawer). "
         "We reserved the Web Audio API nuclear meltdown siren specifically for the HC-SR04 ultrasonic sensor: putting a hand within 5 cm creates a dramatic, interactive sound demo "
         "that immediately silences when the hand is withdrawn."),

        ("Q15: What are the future research directions and enhancements for AgroTwin-Share?",
         "1. Multi-gas integration (O2 and CO2 respiration quotient modeling for Controlled Atmosphere rooms).<br/>"
         "2. Machine Learning residual calibration (using LSTM or XGBoost to correct biophysical Arrhenius predictions against empirical microbial plate counts).<br/>"
         "3. Dynamic pricing integration: connecting produce SLI directly to wholesale commodity exchange APIs to automatically fire-sale produce with diminishing shelf life.")
    ]

    for q_text, a_text in viva_qa:
        story.append(Paragraph(q_text, viva_q_style))
        story.append(Paragraph(a_text, viva_a_style))

    # =========================================================================
    # SECTION 8: VIVA CHEATSHEET & FORMULA SUMMARY TABLE
    # =========================================================================
    story.append(PageBreak())
    story.append(Paragraph("8. Quick-Reference Viva Cheatsheet", h1_style))
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
        [Paragraph("Hardware Ingestion", table_cell_bold), Paragraph("ESP32: DHT11, MQ-135, HC-SR04<br/>Endpoint: POST /api/telemetry/esp32", table_cell_style), Paragraph("Ultrasonic &lt; 5cm triggers Web Audio API nuclear klaxon siren; thermal alarms stay purely visual.", table_cell_style)],
        [Paragraph("Service Architecture", table_cell_bold), Paragraph("const USE_MOCK = true;<br/>FastAPI: http://localhost:8000", table_cell_style), Paragraph("Decoupled adapter pattern. Offline client simulation for expo + full-stack Python server for production.", table_cell_style)],
        [Paragraph("Color Palette (60-30-10)", table_cell_bold), Paragraph("60%: #0A0A0A, 30%: #EDEDED / #262626<br/>10%: #00FF66, #FFB000, #FF3333", table_cell_style), Paragraph("Raw industrial terminal aesthetic with zero consumer rounded badges. Maximum clarity and contrast.", table_cell_style)]
    ]
    t_cheat = Table(cheat_data, colWidths=[110, 145, 249])
    t_cheat.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, c_light]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_cheat)

    story.append(Spacer(1, 12))
    story.append(Paragraph("<b>Final Words for the Team: How to Score Maximum Marks</b>", h2_style))
    story.append(Paragraph(
        "1. <b>Speak with confidence about the biology:</b> Examiners respect computer science students who deeply understand the agricultural domain (Arrhenius kinetics, Tetens formula, climacteric curves).<br/>"
        "2. <b>Emphasize economic value:</b> Always point to the <i>$193,500 biomass valuation</i> and show how 4 degrees of temperature deviation causes an $18,000 loss—this transforms an engineering project into a commercial business solution.<br/>"
        "3. <b>Demonstrate the hardware live:</b> Use the ultrasonic sensor proximity demo (&lt;5cm) to trigger the nuclear siren—it guarantees evaluator attention and proves real-time edge processing.<br/>"
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

    # Copy to frontend/dist as well if exists
    dist_target = os.path.abspath(os.path.join(os.path.dirname(pdf_path), "frontend", "dist", "AgroTwin_Share_Expo_Viva_Guide.pdf"))
    try:
        if os.path.exists(os.path.dirname(dist_target)):
            shutil.copyfile(pdf_path, dist_target)
            print(f"PDF Successfully mirrored to dist folder: {dist_target}")
    except Exception as e:
        print(f"Could not copy to dist folder: {e}")

    return pdf_path

if __name__ == "__main__":
    out = build_pdf()
