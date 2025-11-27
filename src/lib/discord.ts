/**
 * Sends a Discord notification via webhook
 * @param webhookUrl - The Discord webhook URL
 * @param message - The message content to send
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  message: { content?: string; embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    timestamp?: string;
  }> }
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

/**
 * Sends a new writer signup notification to Discord
 * @param webhookUrl - The Discord webhook URL
 * @param writerDetails - Details about the new writer
 */
export async function sendWriterSignupNotification(
  webhookUrl: string,
  writerDetails: { name: string; email: string; authorHandle: string }
): Promise<boolean> {
  const embed = {
    title: '📝 New Writer Signup',
    description: 'A new writer has signed up and is pending approval.',
    color: 0x5865F2, // Discord blurple color
    fields: [
      { name: 'Name', value: writerDetails.name, inline: true },
      { name: 'Email', value: writerDetails.email, inline: true },
      { name: 'Author Handle', value: writerDetails.authorHandle, inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordNotification(webhookUrl, { embeds: [embed] });
}
