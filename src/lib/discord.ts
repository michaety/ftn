/**
 * Discord embed field type
 */
interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * Discord embed type
 */
interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
}

/**
 * Discord webhook message type
 */
interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

/**
 * Validates that a URL is a valid Discord webhook URL
 * @param url - The URL to validate
 * @returns true if the URL is a valid Discord webhook URL
 */
function isValidDiscordWebhookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Only allow Discord webhook URLs (both discord.com and discordapp.com)
    const validHostnames = ['discord.com', 'discordapp.com'];
    return validHostnames.includes(parsedUrl.hostname) && 
           parsedUrl.pathname.startsWith('/api/webhooks/');
  } catch {
    return false;
  }
}

/**
 * Sends a Discord notification via webhook
 * @param webhookUrl - The Discord webhook URL
 * @param message - The message content to send
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  message: DiscordMessage
): Promise<boolean> {
  // Validate webhook URL to prevent SSRF attacks
  if (!isValidDiscordWebhookUrl(webhookUrl)) {
    console.error('Invalid Discord webhook URL');
    return false;
  }

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
 * Escapes special Discord markdown characters in a string
 * @param text - The text to escape
 * @returns The escaped text safe for Discord messages
 */
function escapeDiscordMarkdown(text: string): string {
  // Escape Discord markdown special characters
  return text.replace(/([*_~`|\\])/g, '\\$1');
}

/**
 * Sends a new writer signup notification to Discord
 * @param webhookUrl - The Discord webhook URL
 * @param writerDetails - Details about the new writer
 * @returns Promise that resolves to true if successful, false otherwise
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
      { name: 'Name', value: escapeDiscordMarkdown(writerDetails.name), inline: true },
      { name: 'Email', value: escapeDiscordMarkdown(writerDetails.email), inline: true },
      { name: 'Author Handle', value: escapeDiscordMarkdown(writerDetails.authorHandle), inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  return sendDiscordNotification(webhookUrl, { embeds: [embed] });
}
