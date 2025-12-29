export const sanitizeHtmlInput = (rawString: string): string => {
  const charactersMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#x27;',
    '/': '&#x2F;',
  }

  // Reemplazamos cada caracter sospechoso por su versión segura
  return rawString.replace(/[&<>"'/]/g, (match: string) => charactersMap[match])
}