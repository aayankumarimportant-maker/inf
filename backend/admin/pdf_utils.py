"""PDF text extraction utilities using pdfplumber."""
import io
import logging

import pdfplumber

log = logging.getLogger(__name__)


def extract_text_from_pdf(data: bytes) -> str:
    """Extract concatenated text from all pages of a PDF byte-string.
    Returns empty string on any parse failure (caller decides how to handle)."""
    try:
        text_parts: list[str] = []
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            for page in pdf.pages:
                try:
                    page_text = page.extract_text() or ""
                except Exception as e:
                    log.warning("Page text extraction failed: %s", e)
                    page_text = ""
                if page_text:
                    text_parts.append(page_text)
        return "\n\n".join(text_parts).strip()
    except Exception as e:
        log.exception("PDF text extraction failed: %s", e)
        return ""
