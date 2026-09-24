"""Generate Dimple's one-take-per-page SatQuery voice-over handout."""

from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "SatQuery_Dimple_Voiceover_Recording_Pack.pdf"
FONT_DIR = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Segoe", str(FONT_DIR / "segoeui.ttf")))
pdfmetrics.registerFont(TTFont("Segoe-Bold", str(FONT_DIR / "segoeuib.ttf")))

NAVY = colors.HexColor("#143149")
TEAL = colors.HexColor("#008f96")
MUTED = colors.HexColor("#5c7484")
LINE = colors.HexColor("#d7e6eb")
PALE = colors.HexColor("#f0f8f8")
WHITE = colors.white
W, H = A4

TAKES = [
    {
        "number": "01", "slug": "workspace", "title": "Enter the investigation",
        "screen": "Open the workspace, briefly show and close the introduction, then hold on the empty Analysis Studio.",
        "voice": "This is SatQuery AI's investigation workspace. The idea is simple: choose the observations, ask in ordinary language, and keep the answer beside the evidence. Let me show one Upper Lake investigation from start to finish.",
    },
    {
        "number": "02", "slug": "discover", "title": "Discover source imagery",
        "screen": "Data page: search 23.26, 77.30; show filters and the prepared Upper Lake collection; import the selected rasters.",
        "voice": "I can begin on the map, search by coordinates, and narrow the view by date and sensor. Here I open a prepared collection of real Sentinel observations around Upper Lake. These are source rasters, not just map thumbnails, so I can bring the selected imagery into the investigation.",
    },
    {
        "number": "03", "slug": "drop_geotiff", "title": "Bring in a GeoTIFF",
        "screen": "Independent insert: drag the November Upper Lake GeoTIFF from Downloads onto a fresh evidence canvas; show its preview and Inputs entry.",
        "voice": "The map is not the only way in. I can also drop a GeoTIFF from my computer directly into the evidence canvas. SatQuery reads its bands and spatial metadata, then keeps the original file attached to the observation. TIFF, PNG and JPEG uploads are supported too; ordinary images support visual questions, while spectral calculations need the appropriate raster bands.",
    },
    {
        "number": "04", "slug": "inputs", "title": "Choose the observations",
        "screen": "In the main take, show five available observations and the selected one- or two-image source chips.",
        "voice": "Several observations can stay in the same workspace. I choose which one - or which compatible pair - answers each question. The attached source, date and sensor remain visible, so a response is never detached from the imagery it used.",
    },
    {
        "number": "05", "slug": "visual_answer", "title": "Ask naturally",
        "screen": "Type the land-cover question on the November optical landscape image. Hold on the actual answer, source and limitations.",
        "voice": "Here is a question a non-specialist can type: describe the land cover and major visible features in this image. SatQuery examines the selected observation and returns a description we can check against the image. The source and the interpretation's limitations remain available in the same view.",
    },
    {
        "number": "06", "slug": "band_views", "title": "Inspect spectral views",
        "screen": "On the same optical GeoTIFF, show true colour, false colour, NDVI and NDWI one after another.",
        "voice": "The same multispectral file can be viewed in true colour, false colour, and vegetation and water indices. These views help us inspect different properties of the scene. They are derived from the source bands; they are not four new satellite observations.",
    },
    {
        "number": "07", "slug": "water_overlay", "title": "Locate water candidates",
        "screen": "Select the November shoreline crop, ask for a water highlight, toggle the overlay and show the executed parameters.",
        "voice": "Now I ask for a water highlight. For this question, SatQuery reads the green and near-infrared raster bands, calculates a water index, and applies the selected threshold. The overlay shows water candidates on this crop. I can switch it off to inspect the source image and open the executed parameters to see how it was produced.",
    },
    {
        "number": "08", "slug": "two_dates", "title": "Compare two dates",
        "screen": "Select matching May and November shoreline crops, ask about water extent, then show the actual values, units and comparison view.",
        "voice": "For change, I attach two corresponding observations and ask what happened to water extent between the dates. The raster workflow checks their common grid and compares valid pixels. The result reports the before-and-after measurements and newly detected water candidates, with the source dates and method still open for review.",
    },
    {
        "number": "09", "slug": "optical_sar", "title": "Combine optical and radar",
        "screen": "Select the May optical and SAR pair. Type: Use the optical and SAR images together to describe water and built-up regions. Show the real paired answer.",
        "voice": "The workspace can also bring optical and radar observations into one question. Their different sensing properties provide complementary context, while the answer stays tied to both selected inputs.",
        "note": "Record this voice now. Capture the screen using the question above, not the narration sentence.",
    },
    {
        "number": "10", "slug": "report", "title": "Export the evidence",
        "screen": "Download a new PDF from a successful answer; show its question, answer, observations, method and limitations.",
        "voice": "The investigation does not end with a paragraph. I can export an evidence report with the question, answer, source observation, processing method and limitations together. That gives someone else a practical starting point to review the result.",
        "note": "Record this voice now; the editor should capture report footage only after its layout and cloud-cover display are fixed.",
    },
    {
        "number": "11", "slug": "projects_handoff", "title": "Close and hand off",
        "screen": "Briefly show project context and return to a successful analysis result. Show History only if a real saved query is present.",
        "voice": "SatQuery also gives the investigation a project context, with data, analysis and results in one workspace. That is the prototype experience: bring the evidence, ask a question, inspect the output, and carry the report forward.",
    },
]

body_style = ParagraphStyle(
    "body", fontName="Segoe", fontSize=11.3, leading=17,
    textColor=NAVY, alignment=TA_LEFT,
)
voice_style = ParagraphStyle(
    "voice", fontName="Segoe", fontSize=15, leading=24,
    textColor=NAVY, alignment=TA_LEFT,
)
small_style = ParagraphStyle(
    "small", fontName="Segoe", fontSize=10, leading=15,
    textColor=MUTED, alignment=TA_LEFT,
)


def paragraph(pdf, text, x, top, width, style, max_height=None):
    p = Paragraph(escape(text), style)
    _, height = p.wrap(width, H)
    if max_height is not None and height > max_height:
        raise ValueError(f"Text overflow ({height:.1f} > {max_height:.1f}): {text[:45]}")
    p.drawOn(pdf, x, top - height)
    return height


def footer(pdf, page_num):
    pdf.setStrokeColor(LINE)
    pdf.line(48, 49, W - 48, 49)
    pdf.setFillColor(MUTED)
    pdf.setFont("Segoe", 8.5)
    pdf.drawString(48, 33, "DIMPLE  /  PROTOTYPE DEMO VOICE TAKES")
    pdf.drawRightString(W - 48, 33, f"{page_num} / 12")


def cover(pdf):
    pdf.setFillColor(NAVY)
    pdf.rect(0, 570, W, H - 570, fill=1, stroke=0)
    pdf.setFillColor(TEAL)
    pdf.rect(48, 724, 7, 76, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor("#9fe5e5"))
    pdf.setFont("Segoe-Bold", 10)
    pdf.drawString(72, 774, "SATQUERY AI  /  PROTOTYPE DEMO")
    pdf.setFillColor(WHITE)
    pdf.setFont("Segoe-Bold", 31)
    pdf.drawString(72, 719, "Dimple's recording pack")
    pdf.setFont("Segoe", 15)
    pdf.drawString(72, 687, "Eleven short takes. Eleven separate audio files.")
    pdf.setFillColor(colors.HexColor("#2b6171"))
    for index, height in enumerate([13, 28, 18, 39, 25, 48, 20, 35, 16, 30, 12]):
        pdf.rect(72 + index * 17, 618, 5, height, fill=1, stroke=0)
    pdf.setFillColor(colors.HexColor("#9fe5e5"))
    pdf.setFont("Segoe-Bold", 9)
    pdf.drawString(286, 625, "ONE TAKE  /  ONE FILE")

    pdf.setFillColor(NAVY)
    pdf.setFont("Segoe-Bold", 18)
    pdf.drawString(48, 524, "How to record")
    instructions = [
        "Use any quiet-room phone Voice Recorder, Voice Memos, or desktop recorder.",
        "Record each numbered READ ALOUD paragraph as its own file. Do not read the screen notes.",
        "Leave two seconds of quiet before and after each take. Keep a natural, precise pace.",
        "Listen back for clipped words or room noise, then export WAV if available; M4A is fine.",
        "Send each take as a separate file attachment, or place all eleven files in one shared folder. Do not combine them into one track or send compressed chat voice notes.",
    ]
    y = 489
    for index, instruction in enumerate(instructions, 1):
        pdf.setFillColor(PALE)
        pdf.rect(48, y - 35, W - 96, 48, fill=1, stroke=0)
        pdf.setFillColor(TEAL)
        pdf.setFont("Segoe-Bold", 11)
        pdf.drawString(62, y - 6, f"{index:02d}")
        height = paragraph(pdf, instruction, 93, y + 2, W - 156, body_style)
        if height > 42:
            raise ValueError("Cover instruction exceeds its card")
        y -= 67

    pdf.setFillColor(colors.HexColor("#e4f4f4"))
    pdf.rect(48, 80, W - 96, 68, fill=1, stroke=0)
    pdf.setFillColor(NAVY)
    pdf.setFont("Segoe-Bold", 11)
    pdf.drawString(62, 126, "Filename rule")
    paragraph(pdf, "Use the exact SQ_VO filename printed on each take page. If your recorder only exports M4A, keep the base name and change only the extension.", 62, 116, W - 124, small_style)
    footer(pdf, 1)
    pdf.showPage()


def take_page(pdf, take, page_num):
    number, slug = take["number"], take["slug"]
    audio_name = f"SQ_VO_{number}_{slug}.wav"
    screen_name = f"SQ_DEMO_{number}_{slug}.mp4"

    pdf.setFillColor(NAVY)
    pdf.rect(0, H - 16, W, 16, fill=1, stroke=0)
    pdf.setFillColor(TEAL)
    pdf.rect(48, H - 109, 6, 62, fill=1, stroke=0)
    pdf.setFillColor(MUTED)
    pdf.setFont("Segoe-Bold", 9)
    pdf.drawString(70, H - 57, f"VOICE TAKE {number} / 11")
    pdf.setFillColor(NAVY)
    pdf.setFont("Segoe-Bold", 23)
    pdf.drawString(70, H - 92, take["title"])

    pdf.setFillColor(PALE)
    pdf.rect(48, 650, W - 96, 65, fill=1, stroke=0)
    pdf.setFillColor(MUTED)
    pdf.setFont("Segoe-Bold", 9)
    pdf.drawString(62, 690, "SAVE YOUR AUDIO AS")
    pdf.setFillColor(NAVY)
    pdf.setFont("Segoe-Bold", 13)
    pdf.drawString(62, 666, audio_name)

    pdf.setFillColor(MUTED)
    pdf.setFont("Segoe-Bold", 9)
    pdf.drawString(48, 615, "WHAT THE VIEWER SEES  -  DO NOT READ")
    paragraph(pdf, take["screen"], 48, 597, W - 96, body_style, max_height=58)

    pdf.setStrokeColor(LINE)
    pdf.line(48, 514, W - 48, 514)
    pdf.setFillColor(TEAL)
    pdf.setFont("Segoe-Bold", 10)
    pdf.drawString(48, 486, "READ ALOUD")
    pdf.setFillColor(PALE)
    pdf.rect(48, 201, W - 96, 267, fill=1, stroke=0)
    pdf.setFillColor(TEAL)
    pdf.rect(48, 201, 5, 267, fill=1, stroke=0)
    paragraph(pdf, take["voice"], 68, 443, W - 136, voice_style, max_height=225)

    if "note" in take:
        pdf.setFillColor(MUTED)
        pdf.setFont("Segoe-Bold", 9)
        pdf.drawString(48, 178, "PRODUCTION NOTE - DO NOT READ")
        paragraph(pdf, take["note"], 48, 163, W - 96, small_style, max_height=35)
    else:
        pdf.setFillColor(MUTED)
        pdf.setFont("Segoe", 9)
        pdf.drawString(48, 167, f"Matching screen clip for the editor: {screen_name}")

    for x, label in [(48, "Recorded"), (182, "Listened back"), (348, "Sent as separate file")]:
        pdf.setStrokeColor(TEAL)
        pdf.rect(x, 95, 12, 12, stroke=1, fill=0)
        pdf.setFillColor(NAVY)
        pdf.setFont("Segoe", 9.5)
        pdf.drawString(x + 19, 96, label)
    footer(pdf, page_num)
    pdf.showPage()


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    pdf.setTitle("SatQuery AI - Dimple voice-over recording pack")
    pdf.setAuthor("SatQuery AI")
    cover(pdf)
    for page_num, take in enumerate(TAKES, 2):
        take_page(pdf, take, page_num)
    pdf.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
