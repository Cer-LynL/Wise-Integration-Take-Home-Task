const fetch = require('node-fetch');

const BASE_URL = 'https://api.wise-sandbox.com';
const TOKEN = process.env.WISE_SANDBOX_TOKEN;

async function wiseRequest(method, path, body) {
  const contentType =
    method === 'PATCH' ? 'application/merge-patch+json' : 'application/json';
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': contentType,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${method} ${path} failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  if (!TOKEN) {
    throw new Error('Missing WISE_SANDBOX_TOKEN environment variable');
  }

  console.log('Step 1: Fetching profiles...');
  const profiles = await wiseRequest('GET', '/v2/profiles');
  const personal = profiles.find((p) => p.type === 'PERSONAL');
  if (!personal) throw new Error('No personal profile found');
  console.log(`  Personal profile ID: ${personal.id}`);

  console.log('\nStep 2: Creating quote (GBP -> USD, source 100)...');
  const quote = await wiseRequest('POST', `/v3/profiles/${personal.id}/quotes`, {
    sourceCurrency: 'GBP',
    targetCurrency: 'USD',
    sourceAmount: 100,
  });
  console.log(`  Quote ID: ${quote.id}`);
  console.log(`  Rate: ${quote.rate}`);
  
  const targetAmt = quote.targetAmount ?? quote.paymentOptions?.[0]?.targetAmount;
  const fee = quote.paymentOptions?.[0]?.fee?.total ?? 'N/A';
  
  console.log(`  Source: ${quote.sourceAmount} ${quote.sourceCurrency}`);
  console.log(`  Target: ${targetAmt} ${quote.targetCurrency}`);
  console.log(`  Fee: ${fee} ${quote.sourceCurrency}`);

  console.log('\nStep 3: Looking up a USD recipient...');
  const accounts = await wiseRequest(
    'GET',
    `/v1/accounts?profile=${personal.id}&currency=USD`
  );
  if (!accounts.length) {
    throw new Error('No USD recipient found — create one in sandbox first');
  }
  const recipient = accounts[0];
  console.log(`  Recipient: ${recipient.accountHolderName} (ID: ${recipient.id})`);

  console.log('\nStep 4: Attaching recipient to quote...');
  const updated = await wiseRequest(
    'PATCH',
    `/v3/profiles/${personal.id}/quotes/${quote.id}`,
    { targetAccount: recipient.id }
  );
  
  const updatedTargetAmt = updated.targetAmount ?? updated.paymentOptions?.[0]?.targetAmount;
  const updatedFee = updated.paymentOptions?.[0]?.fee?.total ?? 'N/A';
  
  console.log(`  Quote updated with recipient`);
  console.log(`  Rate: ${updated.rate}`);
  console.log(`  Source: ${updated.sourceAmount} ${updated.sourceCurrency}`);
  console.log(`  Target: ${updatedTargetAmt} ${updated.targetCurrency}`);
  console.log(`  Fee: ${updatedFee} ${updated.sourceCurrency}`);

  console.log('\n✓ Integration demo complete');
}

main().catch((err) => {
  console.error('\nError:', err.message);
  process.exit(1);
});
