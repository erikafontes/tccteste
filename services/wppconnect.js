import wppconnect from '@wppconnect-team/wppconnect';

let clientPromise = null;

function normalizeNumber(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length <= 11 && !digits.startsWith('55')) {
    // Assume Brasil when country code is missing
    return `55${digits}`;
  }
  return digits;
}

async function waitForReady(client, timeoutMs = 30000, intervalMs = 1000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      if (typeof client.getConnectionState === 'function') {
        const state = await client.getConnectionState();
        if (state === 'CONNECTED' || state === 'OPEN' || state === 'PAIRING' || state === 'MAIN') {
          return true;
        }
      } else if (typeof client.isConnected === 'function') {
        const ok = await client.isConnected();
        if (ok) return true;
      } else {
        // If we can't detect state, don't block
        return true;
      }
    } catch (_error) {
      // Ignore and retry until timeout
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

export function getWppClient() {
  if (!clientPromise) {
    clientPromise = wppconnect
      .create({
        session: 'admin-alerts',
        folderNameToken: 'tokens',
        autoClose: 0,
        deviceSyncTimeout: 0,
        waitForLogin: true,
        browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
        logQR: true,
        catchQR: (_base64, asciiQR, attempts) => {
          console.log('WPPConnect QR (tentativas):', attempts);
          console.log(asciiQR);
        },
        statusFind: (statusSession, session) => {
          console.log('WPPConnect status:', statusSession, 'session:', session);
        }
      })
      .then((client) => client)
      .catch((error) => {
        clientPromise = null;
        throw error;
      });
  }
  return clientPromise;
}

export async function startWppClient() {
  try {
    await getWppClient();
    console.log('WPPConnect iniciado.');
  } catch (error) {
    console.warn('Nao foi possivel iniciar o WPPConnect:', error);
  }
}

export async function sendAdminAlert(message) {
  const rawNumber = process.env.WPP_ADMIN_NUMBER;
  const digits = normalizeNumber(rawNumber);
  if (!digits) {
    console.warn('WPP_ADMIN_NUMBER nao configurado. Alerta nao enviado.');
    return;
  }

  const client = await getWppClient();
  await waitForReady(client);
  let chatId = `${digits}@c.us`;
  try {
    if (typeof client.checkNumberStatus === 'function') {
      const status = await client.checkNumberStatus(digits);
      if (status && status.numberExists && status.id && status.id._serialized) {
        chatId = status.id._serialized;
      } else {
        console.warn('Numero nao existe ou nao recebeu ID do WhatsApp:', status);
      }
    }
  } catch (error) {
    console.warn('Falha ao checar numero no WhatsApp:', error);
  }

  try {
    return await client.sendText(chatId, message);
  } catch (error) {
    console.warn('Falha ao enviar alerta pelo WhatsApp:', error);
    return;
  }
}
