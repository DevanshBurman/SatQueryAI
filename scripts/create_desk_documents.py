from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
OUT.mkdir(parents=True, exist_ok=True)

INK = colors.HexColor("#18232B")
MUTED = colors.HexColor("#5D6972")
LINE = colors.HexColor("#C9D0D4")
LIGHT = colors.HexColor("#F2F4F5")
ACCENT = colors.HexColor("#294C60")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="DocKicker",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=8.5,
    leading=11,
    textColor=MUTED,
    spaceAfter=5 * mm,
    tracking=0.8,
))
styles.add(ParagraphStyle(
    name="DocTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=20,
    leading=24,
    textColor=INK,
    alignment=0,
    spaceAfter=2.5 * mm,
))
styles.add(ParagraphStyle(
    name="DocTitleProminent",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=29,
    leading=33,
    textColor=INK,
    alignment=0,
    spaceAfter=3.5 * mm,
))
styles.add(ParagraphStyle(
    name="DocSubtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=13,
    textColor=MUTED,
    spaceAfter=8 * mm,
))
styles.add(ParagraphStyle(
    name="Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=10.5,
    leading=14,
    textColor=INK,
    spaceBefore=5 * mm,
    spaceAfter=2.5 * mm,
))
styles.add(ParagraphStyle(
    name="BodyClean",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=10.5,
    leading=16,
    textColor=INK,
    spaceAfter=3.2 * mm,
))
styles.add(ParagraphStyle(
    name="Small",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=8.2,
    leading=11,
    textColor=MUTED,
))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(22 * mm, 16 * mm, A4[0] - 22 * mm, 16 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(22 * mm, 10.5 * mm, "Prepared demonstration scenario - not an official emergency record")
    canvas.drawRightString(A4[0] - 22 * mm, 10.5 * mm, "Page 1")
    canvas.restoreState()


def document(path, title, subtitle, story, prominent_title=False):
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=22 * mm,
        leftMargin=22 * mm,
        topMargin=19 * mm,
        bottomMargin=23 * mm,
        title=title,
        author="SatQueryAI demonstration team",
    )
    elements = [
        Paragraph("FIELD OPERATIONS  /  DEMONSTRATION SCENARIO", styles["DocKicker"]),
        Paragraph(title, styles["DocTitleProminent"] if prominent_title else styles["DocTitle"]),
        Paragraph(subtitle, styles["DocSubtitle"]),
    ]
    elements.extend(story)
    doc.build(elements, onFirstPage=footer)


def metadata(rows):
    data = []
    for label, value in rows:
        data.append([
            Paragraph(f"<b>{label}</b>", styles["Small"]),
            Paragraph(value, styles["BodyClean"]),
        ])
    table = Table(data, colWidths=[42 * mm, 119 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT),
        ("TEXTCOLOR", (0, 0), (-1, -1), INK),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def numbered_items(items):
    rows = []
    for number, item in enumerate(items, 1):
        rows.append([
            Paragraph(f"<b>{number:02d}</b>", styles["Small"]),
            Paragraph(item, styles["BodyClean"]),
        ])
    table = Table(rows, colWidths=[14 * mm, 147 * mm], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def situation_update():
    story = [
        metadata([
            ("Area", "Supaul district, Bihar"),
            ("Reference period", "12 August 2023 to 28 August 2023"),
            ("Current status", "Initial evidence review pending"),
            ("Operational need", "Prioritise locations for field verification"),
        ]),
        Paragraph("Situation summary", styles["Section"]),
        Paragraph(
            "Field teams are preparing to assess reported changes along the Kosi river corridor. "
            "The available material includes two satellite scene previews from different dates, but "
            "the affected locations have not yet been verified on the ground.",
            styles["BodyClean"],
        ),
        Paragraph("Decision required", styles["Section"]),
        Paragraph(
            "Identify the locations that should be checked first, with particular attention to road "
            "crossings, embankments, low-lying settlements and agricultural parcels near the river.",
            styles["BodyClean"],
        ),
        Paragraph("Available material", styles["Section"]),
        numbered_items([
            "Prepared optical scene preview dated 12 August 2023.",
            "Prepared optical scene preview dated 28 August 2023.",
            "A selected river corridor for focused review.",
            "Field observations to be added after local verification.",
        ]),
        Spacer(1, 7 * mm),
        KeepTogether([
            Paragraph("Working note", styles["Section"]),
            Paragraph(
                "The imagery should support the field decision, not replace local confirmation.",
                styles["BodyClean"],
            ),
        ]),
    ]
    document(
        OUT / "01_Flood_Situation_Update.pdf",
        "FLOOD SITUATION UPDATE",
        "Supaul river corridor  |  Initial field planning note",
        story,
        prominent_title=True,
    )


def review_request():
    story = [
        metadata([
            ("Requested by", "District field operations desk"),
            ("Area of interest", "Selected Kosi river corridor, Supaul"),
            ("Evidence", "Two prepared optical scene previews"),
            ("Required output", "Short, reviewable field-priority brief"),
        ]),
        Paragraph("Questions for review", styles["Section"]),
        numbered_items([
            "What visible differences appear inside the selected river corridor?",
            "Which observations may indicate expanded surface water or changed access conditions?",
            "Which road crossings, embankments or settlement edges should be verified first?",
            "Which conclusions remain uncertain and require field confirmation?",
        ]),
        Paragraph("Evidence handling", styles["Section"]),
        Paragraph(
            "Keep each observation connected to its source scene and selected area. Distinguish "
            "measured values from visual interpretation, and mark any unverified conclusion clearly.",
            styles["BodyClean"],
        ),
        Paragraph("Response requested", styles["Section"]),
        Paragraph(
            "Return a concise location summary, the evidence used, and a practical list of field "
            "checks. Do not issue a final impact assessment until on-ground observations are available.",
            styles["BodyClean"],
        ),
        Spacer(1, 16 * mm),
        Paragraph("Analyst note  ______________________________________________________________", styles["Small"]),
        Spacer(1, 9 * mm),
        Paragraph("___________________________________________________________________________", styles["Small"]),
    ]
    document(
        OUT / "02_Satellite_Evidence_Review_Request.pdf",
        "Satellite evidence review request",
        "Field-priority support  |  Prepared demonstration scenario",
        story,
    )


if __name__ == "__main__":
    situation_update()
    review_request()
    print(OUT / "01_Flood_Situation_Update.pdf")
    print(OUT / "02_Satellite_Evidence_Review_Request.pdf")
