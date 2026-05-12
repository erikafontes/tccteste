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

function buildNumberCandidates(digits) {
  const candidates = [digits];

  // Brasil: 55 + DDD + numero. O WhatsApp as vezes resolve o contato
  // com ou sem o nono digito, entao tentamos os dois formatos.
  if (digits.startsWith('55') && digits.length === 12) {
    candidates.push(`${digits.slice(0, 4)}9${digits.slice(4)}`);
  }
  if (digits.startsWith('55') && digits.length === 13 && digits[4] === '9') {
    candidates.push(`${digits.slice(0, 4)}${digits.slice(5)}`);
  }

  return [...new Set(candidates)];
}

function isProbablySentError(error) {
  const text = [
    error?.message,
    error?.stack,
    error?.toString?.()
  ].filter(Boolean).join('\n');

  return text.includes('msgChunks') || text.includes('getMessageById');
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
        puppeteerOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
          ]
        },
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

  const candidates = buildNumberCandidates(digits);
  for (const candidate of candidates) {
    const chatIds = [`${candidate}@c.us`];

    try {
      if (typeof client.checkNumberStatus === 'function') {
        const status = await client.checkNumberStatus(candidate);
        if (!status || status.numberExists === false) {
          console.warn('Numero nao encontrado no WhatsApp:', candidate, status);
          continue;
        }
        if (status.id && status.id._serialized) {
          chatIds.push(status.id._serialized);
        }
      }
    } catch (error) {
      console.warn('Falha ao checar numero no WhatsApp:', candidate, error);
    }

    for (const chatId of [...new Set(chatIds)]) {
      try {
        return await client.sendText(chatId, message);
      } catch (error) {
        if (isProbablySentError(error)) {
          console.warn('WhatsApp retornou erro ao confirmar a mensagem, mas ela provavelmente foi enviada:', chatId, error.message);
          return { probableSent: true, chatId };
        }

        console.warn('Falha ao enviar alerta pelo WhatsApp:', chatId, error);
      }
    }
  }

  console.warn('Alerta nao enviado. Nenhum numero valido encontrado para WPP_ADMIN_NUMBER:', rawNumber);
}
