import { jsPDF } from 'jspdf'

type Source = {
  id?: string; label?: string; date?: string; modality?: string; source?: string
  cloud?: number | null; stac?: string; bands?: string[]; processing?: string
  crs?: string | null; bounds?: number[]
}
type Step = {
  tool?: string; label?: string; detail?: string; method?: string; model?: string
  parameters?: Record<string, unknown>; observations?: number; status?: string; source?: string; view?: string
}
export type Report = {
  query?: string; answer: string; mode: string; task: string
  limitations?: string[]; sources?: Source[]; trace: Step[]; elapsedSeconds?: number
  evidenceImages?: { label: string; date?: string; image: string }[]; maskPng?: string
}

/** Human-readable report; Export execution JSON remains the lossless machine record. */
export function createEvidenceReport(report: Report) {
  const pdf = new jsPDF()
  const navy: [number, number, number] = [21, 52, 69]
  const muted: [number, number, number] = [87, 110, 126]
  const teal: [number, number, number] = [15, 140, 148]
  const clean = (value: string) => value.replace(/[–—−]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x20-\x7e\n]/g, ' ')
  let y = 30

  function newPage() { pdf.addPage(); y = 30 }
  function ensure(height: number) { if (y + height > 270) newPage() }
  function lines(value: string, width: number, size: number) {
    pdf.setFontSize(size)
    return pdf.splitTextToSize(clean(value), width) as string[]
  }
  function paragraph(value: string, options: { x?: number; width?: number; size?: number; leading?: number; color?: [number, number, number]; bold?: boolean } = {}) {
    const { x = 20, width = 170, size = 10, leading = 5.5, color = navy, bold = false } = options
    pdf.setFont('helvetica', bold ? 'bold' : 'normal'); pdf.setTextColor(...color)
    const wrapped = lines(value, width, size)
    // Keep a paragraph on one page when it fits; only split unusually long blocks.
    if (wrapped.length * leading <= 240) ensure(wrapped.length * leading)
    for (const line of wrapped) {
      ensure(leading)
      pdf.text(line, x, y)
      y += leading
    }
  }
  function heading(title: string, following = 0) {
    ensure(20 + following)
    y += 5
    pdf.setDrawColor(209, 224, 231); pdf.line(20, y - 2, 190, y - 2)
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(...navy)
    pdf.text(title, 20, y + 7); y += 15
  }
  function detail(label: string, value?: string) {
    if (value) paragraph(`${label}: ${value}`, { size: 9, leading: 5, color: muted })
  }
  function imageCard(image: string, title: string, subtitle?: string) {
    ensure(83)
    try {
      const format = image.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
      const properties = pdf.getImageProperties(image)
      const scale = Math.min(72 / properties.width, 72 / properties.height)
      const width = properties.width * scale, height = properties.height * scale
      pdf.setFillColor(246, 250, 251); pdf.rect(20, y, 170, 78, 'F')
      pdf.addImage(image, format, 23 + (72 - width) / 2, y + 3 + (72 - height) / 2, width, height, undefined, 'FAST')
      const top = y
      y += 10
      paragraph(title, { x: 101, width: 84, size: 10, leading: 5, bold: true })
      if (subtitle) paragraph(subtitle, { x: 101, width: 84, size: 9, leading: 5, color: muted })
      y = top + 84
    } catch {
      paragraph(`${title}: preview could not be embedded; source details follow.`, { color: muted })
      y += 3
    }
  }

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(22); pdf.setTextColor(...navy)
  pdf.text('Evidence report', 20, y); y += 9
  paragraph(`${report.mode}  |  ${report.task}  |  ${new Date().toISOString().slice(0, 10)}${report.elapsedSeconds ? `  |  ${report.elapsedSeconds}s` : ''}`, { size: 9, color: muted })
  heading('Question')
  paragraph(report.query || 'Analysis', { size: 11, leading: 6, bold: true })
  heading('Answer')
  for (const block of report.answer.split(/\n+/).filter(Boolean)) {
    paragraph(block, { leading: 5.7 })
    y += 2
  }

  if (report.evidenceImages?.length || report.maskPng) {
    heading('Visual evidence')
    for (const [index, evidence] of (report.evidenceImages || []).slice(0, 2).entries()) {
      imageCard(evidence.image, `Observation ${index + 1}: ${evidence.label}`, evidence.date)
    }
    if (report.maskPng) imageCard(report.maskPng, 'Computed overlay', 'Derived from the selected source raster; inspect method and limitations below.')
  }

  heading('Quality and limitations')
  const cautions = report.limitations?.length ? report.limitations : ['No limitations were provided for this result; inspect the source and method before relying on it.']
  for (const caution of cautions) {
    paragraph(`- ${caution}`, { size: 9.5, leading: 5.2 })
    y += 2
  }

  heading('Source observations', 45)
  for (const [index, source] of (report.sources || []).entries()) {
    ensure(35)
    paragraph(`${index + 1}. ${source.label || source.id || 'Observation'}${source.date ? `  |  ${source.date}` : ''}`, { size: 10, bold: true })
    detail('Sensor', source.modality)
    detail('Source ID', source.source)
    detail('Raster', source.processing)
    detail('Bands', source.bands?.join(', '))
    detail('Grid', [source.crs, source.bounds?.length === 4 ? `bounds ${source.bounds.join(', ')}` : ''].filter(Boolean).join('  |  '))
    if (typeof source.cloud === 'number') detail('Scene cloud cover', `${source.cloud.toFixed(2)}% (not a cloud mask for this crop)`)
    if (source.stac?.startsWith('https://')) {
      ensure(6)
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(...teal)
      pdf.textWithLink('Open source catalogue record', 20, y, { url: source.stac }); y += 6
    }
    y += 6
  }

  heading('Executed method', 25)
  for (const [index, step] of (report.trace || []).entries()) {
    ensure(18)
    paragraph(`${index + 1}. ${step.label || step.tool || 'Processing step'}`, { size: 10, bold: true })
    detail('Detail', step.detail || step.method || step.view)
    detail('Source', step.source)
    detail('Model', step.model)
    if (step.parameters) detail('Parameters', Object.entries(step.parameters).map(([key, value]) => `${key}=${String(value)}`).join('  |  '))
    if (step.observations !== undefined) detail('Inputs', `${step.observations} observation${step.observations === 1 ? '' : 's'}`)
    detail('Status', step.status)
    y += 5
  }

  const pages = pdf.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page)
    pdf.setDrawColor(...teal); pdf.setLineWidth(0.6); pdf.line(20, 17, 190, 17)
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(...muted)
    pdf.text('SATQUERY / SOURCE-LINKED EVIDENCE', 20, 14)
    pdf.setFont('helvetica', 'normal'); pdf.text(`${page} / ${pages}`, 190, 286, { align: 'right' })
  }
  return pdf
}
