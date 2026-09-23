import { jsPDF } from 'jspdf'

type Report = {
  query?: string; answer: string; mode: string; task: string;
  limitations?: string[]; sources?: unknown[]; trace: unknown[]; elapsedSeconds?: number
  evidenceImages?: { label: string; date?: string; image: string }[]; maskPng?: string
}

/** A real, paginated PDF; JSON remains the lossless machine-readable export. */
export function createEvidenceReport(report: Report) {
  const pdf = new jsPDF()
  let y = 28
  const clean = (text: string) => text.replace(/[–—−]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x20-\x7e\n]/g, ' ')
  function section(title: string, text: string) {
    if (y > 250) { pdf.addPage(); y = 28 }
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(18, 55, 73)
    pdf.text(title, 20, y); y += 9
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10)
    const lines: string[] = pdf.splitTextToSize(clean(text), 170)
    for (const line of lines) {
      if (y > 272) { pdf.addPage(); y = 28 }
      pdf.text(line, 20, y); y += 5
    }
    y += 9
  }
  section('SatQuery | Evidence report', `Generated ${new Date().toISOString()}\n${report.mode} | ${report.task}${report.elapsedSeconds ? ` | ${report.elapsedSeconds}s` : ''}`)
  section('Question', report.query || 'Analysis')
  section('Answer', report.answer)
  if (report.evidenceImages?.length) {
    if (y > 205) { pdf.addPage(); y = 28 }
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.setTextColor(18, 55, 73)
    pdf.text('Visual evidence', 20, y); y += 8
    for (const evidence of report.evidenceImages.slice(0, 2)) {
      if (y > 190) { pdf.addPage(); y = 28 }
      try {
        const format = evidence.image.startsWith('data:image/jpeg') ? 'JPEG' : 'PNG'
        pdf.addImage(evidence.image, format, 20, y, 76, 76, undefined, 'FAST')
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9)
        pdf.text(pdf.splitTextToSize(clean(`${evidence.label}${evidence.date ? ` | ${evidence.date}` : ''}`), 76), 20, y + 81)
      } catch { pdf.text('Preview could not be embedded; source metadata follows.', 20, y + 8) }
      y += 94
    }
  }
  if (report.maskPng) {
    if (y > 190) { pdf.addPage(); y = 28 }
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(13); pdf.text('Computed overlay', 20, y); y += 8
    try { pdf.addImage(report.maskPng, 'PNG', 20, y, 76, 76, undefined, 'FAST'); y += 88 } catch { y += 4 }
  }
  section('Evidence quality and limitations', ['No calibrated accuracy score is inferred from this result.', ...(report.limitations || [])].join('\n'))
  section('Source observations', JSON.stringify(report.sources || [], null, 2))
  section('Executed tools and parameters', JSON.stringify(report.trace, null, 2))
  const pages = pdf.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    pdf.setPage(page); pdf.setFontSize(8); pdf.setTextColor(100, 120, 130)
    pdf.text('SATQUERY / SOURCE-LINKED EVIDENCE', 20, 15)
    pdf.text(`${page} / ${pages}`, 190, 287, { align: 'right' })
  }
  return pdf
}
