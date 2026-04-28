# Wise API Integration Demo

Demo integration for creating quotes via the Wise API (sandbox environment).

## Setup

1. Clone this repository
2. Copy `.env.example` to `.env` and add your sandbox token
3. Install dependencies: `npm install`
4. Run the demo: `node --env-file=.env wise-quote-demo.js`

## Contents

- **wise-quote-demo.js** - Node.js script demonstrating the quote flow
- **postman/Wise_homework_collection.json** - Complete Postman collection with:
  - Scenario 1: API exploration
  - Scenario 3: Quote creation integration

## Postman Collection

Import `postman/Wise_homework_collection.json` into Postman.

**Environment variables needed:**
- `baseUrl`: https://api.wise-sandbox.com
- `full access token`: Your sandbox API token (full access scope)
- `read-only token`: Your sandbox API token (read-only scope, for 403 demo)
- `profileId`: Auto-extracted from GET /v2/profiles request
- `quoteId`: Auto-extracted from POST quote creation request
- `balanceId`: Auto-extracted from GET balances request
- `customerTransactionId`: Auto-generated UUID for transfer idempotency

**Note:** Most variables are auto-populated by test scripts in the requests. You only need to manually set `baseUrl` and the two tokens.

## Integration Flow

1. GET /v2/profiles - Retrieve profile ID
2. POST /v3/profiles/{profileId}/quotes - Create quote
3. PATCH /v3/profiles/{profileId}/quotes/{quoteId} - Update quote
