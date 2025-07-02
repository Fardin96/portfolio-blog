import { SetWebhookDataType } from './types/types';

export async function fetchWebhookData(
  setWebhookData: SetWebhookDataType
): Promise<void> {
  try {
    const response = await fetch('/api/webhook/data');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook data');
    }

    const data = await response.json();
    console.log('+--------------------main-page------------------+');
    console.log('response.json(): ', data);

    setWebhookData(data.webhookData || null);
  } catch (err) {
    console.error('Error fetching webhook data:', err);
  }
}
