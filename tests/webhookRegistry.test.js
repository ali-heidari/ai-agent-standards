const WebhookRegistry = require('../src/webhookRegistry');
const db = require('../src/database');

jest.mock('../src/database', () => ({
  query: jest.fn(),
}));

const mockCache = {
  invalidateWebhookCache: jest.fn(),
};

describe('WebhookRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new WebhookRegistry();
    registry.setCache(mockCache);
    jest.clearAllMocks();
  });

  it('registers a webhook and invalidates cache', async () => {
    const row = {
      id: '1234',
      customer_id: 'cust-1',
      url: 'https://example.com/webhook',
      event_types: ['order.created'],
      secret: null,
      is_active: true,
      created_at: '2026-04-20T00:00:00.000Z',
    };
    db.query.mockResolvedValue({ rows: [row] });

    const webhook = await registry.registerWebhook('cust-1', 'https://example.com/webhook', ['order.created']);

    expect(webhook).toEqual(row);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO webhooks'),
      ['cust-1', 'https://example.com/webhook', ['order.created'], null]
    );
    expect(mockCache.invalidateWebhookCache).toHaveBeenCalledWith(['order.created']);
  });

  it('returns null when webhook is not found', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const webhook = await registry.getWebhookById('missing-id');
    expect(webhook).toBeNull();
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM webhooks WHERE id = $1 AND is_active = true', ['missing-id']);
  });
});