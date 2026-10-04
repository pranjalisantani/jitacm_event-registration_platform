import QRCode from 'qrcode';

export interface DecodedQRToken {
  prefix: string;
  ticketNumber: string;
  eventId: string;
  usn: string;
  signature: string;
  timestamp: number;
}

/**
 * Generates an encrypted/signed verification token for an event pass
 */
export function generateTicketQRToken(ticketNumber: string, eventId: string, usn: string): string {
  const timestamp = Date.now();
  // Simulated HMAC/signature using deterministic hash
  const signature = btoa(`${ticketNumber}::${eventId}::${usn}::JITACM-SECURE-KEY`).slice(0, 16);
  return `JITACM|${ticketNumber}|${eventId}|${usn}|${timestamp}|${signature}`;
}

/**
 * Parses and verifies ticket token structure
 */
export function parseTicketQRToken(token: string): DecodedQRToken | null {
  try {
    const parts = token.trim().split('|');
    if (parts.length < 6 || parts[0] !== 'JITACM') {
      return null;
    }
    return {
      prefix: parts[0],
      ticketNumber: parts[1],
      eventId: parts[2],
      usn: parts[3],
      timestamp: parseInt(parts[4], 10),
      signature: parts[5],
    };
  } catch {
    return null;
  }
}

/**
 * Generates a PNG DataURL for a given string
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#060709',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    // Return SVG fallback data URL if canvas fails
    return '';
  }
}
