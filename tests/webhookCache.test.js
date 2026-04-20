const WebhookCache = require('../src/webhookCache');
const redis = require('redis');

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('WebhookCache', () => {
  let cache;
  let client;

  beforeEach(async () => {
    client = {
      on: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(JSON.stringify([{ id: 'w1' }])),
      setEx: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue(['webhooks:order.created']),
    };

    redis.createClient.mockReturnValue(client);
    cache = new WebhookCache();
    await cache.connect();
  });

  afterEach(async () => {
    await cache.disconnect();
    jest.clearAllMocks();
  });

  it('reads cached webhooks for an event type', async () => {
    const webhooks = await cache.getWebhooksForEventType('order.created');
    expect(webhooks).toEqual([{ id: 'w1' }]);
    expect(client.get).toHaveBeenCalledWith('webhooks:order.created');
  });

  it('writes and expires cached webhooks', async () => {
    const data = [{ id: 'w2' }];
    await cache.setWebhooksForEventType('order.updated', data);
    expect(client.setEx).toHaveBeenCalledWith('webhooks:order.updated', 300, JSON.stringify(data));
  });

  it('invalidates cache keys for event types', async () => {
    await cache.invalidateWebhookCache(['order.created', 'order.updated']);
    expect(client.del).toHaveBeenCalledWith(['webhooks:order.created', 'webhooks:order.updated']);
  });
});