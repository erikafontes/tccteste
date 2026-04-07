import wppconnect from '@wppconnect-team/wppconnect';

let clientPromise = null;

function normalizeNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  return digits;
}

export function getWppClient() {
  if (!clientPromise) {
    clientPromise = wppconnect
      .create({
        session: 'admin-alerts',
        autoClose: 0,
        logQR: true,
        catchQR: (_base64, asciiQR, attempts) => {
          console.log('WPPConnect QR (tentativas):', attempts);
          console.log(asciiQR);
        },
        statusFind: (statusSession, session) => {
          console.log('WPPConnect status:', statusSession, 'session:', session);
        }
      })
      .then((client) => client);
  }
  return clientPromise;
}

export async function sendAdminAlert(message) {
  const rawNumber = process.env.WPP_ADMIN_NUMBER;
  const digits = normalizeNumber(rawNumber);
  if (!digits) {
    console.warn('WPP_ADMIN_NUMBER nao configurado. Alerta nao enviado.');
    return;
  }

  const client = await getWppClient();
  let chatId = `${digits}@c.us`;
  try {
    const status = await client.checkNumberStatus(digits);
    if (status && status.numberExists && status.id && status.id._serialized) {
      chatId = status.id._serialized;
    } else {
      console.warn('Numero nao existe ou nao recebeu ID do WhatsApp:', status);
    }
  } catch (error) {
    console.warn('Falha ao checar numero no WhatsApp:', error);
  }

  return client.sendText(chatId, message);
}
