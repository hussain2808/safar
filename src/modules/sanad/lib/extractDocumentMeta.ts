export interface ExtractedMeta {
  name?: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;   // YYYY-MM-DD string for date inputs
  expiryDate?: string;  // YYYY-MM-DD string for date inputs
}

// Month name → number (handles various languages/abbreviations)
const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseDate(raw: string): string | undefined {
  const s = raw.trim();

  // D:YYYYMMDDHHmmss (PDF creation date)
  const pdfDate = s.match(/^D:(\d{4})(\d{2})(\d{2})/);
  if (pdfDate) return `${pdfDate[1]}-${pdfDate[2]}-${pdfDate[3]}`;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[/\-.](\d{2})\.?(\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD MMM YYYY or DD MMMM YYYY (e.g. "15 Jan 2019")
  const dMonthY = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (dMonthY) {
    const [, d, mon, y] = dMonthY;
    const m = MONTHS[mon.toLowerCase()];
    if (m) return `${y}-${String(m).padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // MMMM DD, YYYY (e.g. "January 15, 2019")
  const mDy = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mDy) {
    const [, mon, d, y] = mDy;
    const m = MONTHS[mon.toLowerCase()];
    if (m) return `${y}-${String(m).padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return undefined;
}

// Patterns that label a date in the document text
const ISSUE_LABELS = [
  'date of issue', 'date issued', 'issue date', 'issued on', 'issued date',
  'valid from', 'commencement date', 'start date',
];
const EXPIRY_LABELS = [
  'date of expiry', 'expiry date', 'expiration date', 'expires on', 'expiry',
  'valid until', 'valid to', 'valid thru', 'valid through', 'date of expiration',
  'renewal date', 'end date',
];

// Date pattern that can follow a label (handles various separators and formats)
const DATE_PATTERN = `(?::\\s*|\\s+)(\\d{1,2}[/\\-.\\s](?:\\d{2}|[A-Za-z]+)[/\\-.\\s]\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}\\s+[A-Za-z]+\\s+\\d{4}|[A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4})`;

function extractLabeledDate(text: string, labels: string[]): string | undefined {
  const lower = text.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label);
    if (idx === -1) continue;
    const snippet = text.slice(idx + label.length, idx + label.length + 40);
    const m = snippet.match(new RegExp(DATE_PATTERN, 'i'));
    if (m) {
      const parsed = parseDate(m[1].trim());
      if (parsed) return parsed;
    }
  }
  return undefined;
}

// Known software/app names to ignore for name/authority fields
const SOFTWARE_NAMES = [
  'microsoft', 'adobe', 'word', 'acrobat', 'writer', 'libreoffice',
  'openoffice', 'nitro', 'foxit', 'pdfescape', 'pdf24', 'smallpdf',
  'ilovepdf', 'mac os', 'windows', 'scanner', 'wia', 'epson', 'hp', 'canon',
];

function looksLikeSoftware(s: string): boolean {
  const lower = s.toLowerCase();
  return SOFTWARE_NAMES.some((sw) => lower.includes(sw));
}

function cleanTitle(s: string): string {
  return s.replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractAuthority(text: string): string | undefined {
  const lower = text.toLowerCase();
  const authorityPatterns = [
    /issued\s+by\s*[:\-]?\s*(.+)/i,
    /issuing\s+authority\s*[:\-]?\s*(.+)/i,
    /authority\s*[:\-]\s*(.+)/i,
    /(ministry\s+of\s+\w+(?:\s+\w+)?)/i,
    /(department\s+of\s+\w+(?:\s+\w+)?)/i,
    /(directorate\s+of\s+\w+(?:\s+\w+)?)/i,
    /(government\s+of\s+\w+(?:\s+\w+)?)/i,
    /(general\s+authority\s+(?:of|for)\s+\w+(?:\s+\w+)?)/i,
  ];
  // Only search first 1000 chars where authority info is usually found
  const snippet = text.slice(0, 1000);
  for (const pattern of authorityPatterns) {
    const m = snippet.match(pattern);
    if (m) {
      const val = m[1].trim().replace(/\s+/g, ' ').slice(0, 80);
      if (val.length > 3) return val;
    }
  }
  void lower;
  return undefined;
}

function extractDocumentNumber(text: string): string | undefined {
  // Look for labeled document number first
  const labeledPatterns = [
    /(?:document\s+no|doc\.?\s*no|document\s+number|passport\s+no|id\s+no|license\s+no|permit\s+no|certificate\s+no)\s*[:\-#]?\s*([A-Z0-9]{6,15})/i,
    /(?:no\.|number|#)\s*[:\-]?\s*([A-Z]\d{7,9})/i,
  ];
  for (const pattern of labeledPatterns) {
    const m = text.match(pattern);
    if (m) return m[1].trim();
  }
  return undefined;
}

export async function extractFromPdf(file: File): Promise<ExtractedMeta> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');
  GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).href;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer, verbosity: 0 }).promise;

  // Extract PDF info dictionary
  const { info } = await pdf.getMetadata() as { info: Record<string, string> };

  // Extract all text from all pages (cap at 5 pages for performance)
  let fullText = '';
  const pagesToScan = Math.min(pdf.numPages, 5);
  for (let i = 1; i <= pagesToScan; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += (content.items as Array<{ str: string }>).map((item) => item.str).join(' ') + '\n';
  }

  const result: ExtractedMeta = {};

  // Document name from title or filename
  const title = info?.Title;
  if (title && title.length > 1 && !looksLikeSoftware(title)) {
    result.name = cleanTitle(title);
  }

  // Issuing authority from PDF Author field or text
  const author = info?.Author;
  if (author && author.length > 1 && !looksLikeSoftware(author)) {
    result.issuingAuthority = author.trim();
  }

  // Dates from text content (more reliable than PDF metadata for document dates)
  const issueDate = extractLabeledDate(fullText, ISSUE_LABELS);
  const expiryDate = extractLabeledDate(fullText, EXPIRY_LABELS);

  if (issueDate) result.issueDate = issueDate;
  if (expiryDate) result.expiryDate = expiryDate;

  // Fallback: PDF creation date as issue date if nothing found in text
  if (!result.issueDate && info?.CreationDate) {
    const parsed = parseDate(info.CreationDate);
    if (parsed) result.issueDate = parsed;
  }

  // Document number
  const docNumber = extractDocumentNumber(fullText);
  if (docNumber) result.documentNumber = docNumber;

  // Issuing authority from text if not from metadata
  if (!result.issuingAuthority) {
    const authority = extractAuthority(fullText);
    if (authority) result.issuingAuthority = authority;
  }

  return result;
}
