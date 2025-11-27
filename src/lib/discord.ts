/**
 * Discord Integration Utilities
 * Handles Discord webhook notifications and interaction verification
 * 
 * IMPORTANT: To use interactive buttons (message components), you need:
 * 1. A Discord Application with a webhook (not just a channel webhook)
 * 2. Register your interactions endpoint URL in Discord Developer Portal
 * 3. Configure DISCORD_PUBLIC_KEY and DISCORD_WEBHOOK_URL environment variables
 * 
 * Regular channel webhooks cannot send components - use the application webhook URL instead.
 * The webhook URL format should be: https://discord.com/api/webhooks/{app.id}/{webhook.token}
 */

// Discord interaction types
export const DISCORD_INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
} as const;

// Discord interaction callback types
export const DISCORD_CALLBACK_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
  DEFERRED_UPDATE_MESSAGE: 6,
  UPDATE_MESSAGE: 7,
} as const;

// Discord button styles
export const DISCORD_BUTTON_STYLE = {
  PRIMARY: 1,
  SECONDARY: 2,
  SUCCESS: 3,
  DANGER: 4,
  LINK: 5,
} as const;

// Discord component types
export const DISCORD_COMPONENT_TYPE = {
  ACTION_ROW: 1,
  BUTTON: 2,
} as const;

export interface DiscordInteraction {
  type: number;
  data?: {
    custom_id?: string;
    component_type?: number;
  };
  message?: {
    id: string;
    embeds?: Array<{
      title?: string;
      description?: string;
      color?: number;
      fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
      }>;
    }>;
  };
  token?: string;
  application_id?: string;
}

/**
 * Verify Discord interaction signature using Ed25519
 * @param request - The incoming request
 * @param publicKey - Discord application public key
 * @returns Whether the signature is valid
 */
export async function verifyDiscordSignature(
  request: Request,
  publicKey: string
): Promise<{ isValid: boolean; body: string }> {
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const body = await request.text();

  if (!signature || !timestamp) {
    return { isValid: false, body };
  }

  try {
    // Import the public key
    const keyBytes = hexToBytes(publicKey);
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'Ed25519' },
      false,
      ['verify']
    );

    // Prepare the message to verify
    const encoder = new TextEncoder();
    const message = encoder.encode(timestamp + body);
    const signatureBytes = hexToBytes(signature);

    // Verify the signature
    const isValid = await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signatureBytes,
      message
    );

    return { isValid, body };
  } catch (error) {
    console.error('Discord signature verification failed:', error);
    return { isValid: false, body };
  }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Send a signup notification to Discord with approve/reject buttons
 * @param webhookUrl - Discord webhook URL
 * @param user - User data
 * @returns Response from Discord
 */
export async function sendSignupNotification(
  webhookUrl: string,
  user: {
    id: number;
    name: string;
    email: string;
    authorHandle?: string;
  }
): Promise<Response> {
  const payload = {
    embeds: [
      {
        title: '🆕 New User Signup',
        description: 'A new user has registered and is waiting for approval.',
        color: 0x5865F2, // Discord blurple
        fields: [
          {
            name: 'Name',
            value: user.name,
            inline: true,
          },
          {
            name: 'Email',
            value: user.email,
            inline: true,
          },
          {
            name: 'User ID',
            value: String(user.id),
            inline: true,
          },
          ...(user.authorHandle
            ? [
                {
                  name: 'Author Handle',
                  value: user.authorHandle,
                  inline: true,
                },
              ]
            : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
    components: [
      {
        type: DISCORD_COMPONENT_TYPE.ACTION_ROW,
        components: [
          {
            type: DISCORD_COMPONENT_TYPE.BUTTON,
            style: DISCORD_BUTTON_STYLE.SUCCESS,
            label: 'Approve',
            custom_id: `approve_user_${user.id}`,
          },
          {
            type: DISCORD_COMPONENT_TYPE.BUTTON,
            style: DISCORD_BUTTON_STYLE.DANGER,
            label: 'Reject',
            custom_id: `reject_user_${user.id}`,
          },
        ],
      },
    ],
  };

  const url = new URL(webhookUrl);
  url.searchParams.set('wait', 'true');

  return fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Create a response for updating the Discord message after action
 * @param action - The action taken (approve/reject)
 * @param userName - The user's name
 * @param success - Whether the action succeeded
 * @returns Discord interaction response payload
 */
export function createActionResponse(
  action: 'approve' | 'reject',
  userName: string,
  success: boolean
) {
  const isApprove = action === 'approve';
  const emoji = success ? (isApprove ? '✅' : '❌') : '⚠️';
  const actionText = isApprove ? 'approved' : 'rejected';
  const color = success 
    ? (isApprove ? 0x57F287 : 0xED4245) // Green for approve, red for reject
    : 0xFEE75C; // Yellow for error

  return {
    type: DISCORD_CALLBACK_TYPE.UPDATE_MESSAGE,
    data: {
      embeds: [
        {
          title: success 
            ? `${emoji} User ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`
            : `${emoji} Action Failed`,
          description: success
            ? `**${userName}** has been ${actionText}.`
            : `Failed to ${action} user **${userName}**. Please try again or use the admin panel.`,
          color,
          timestamp: new Date().toISOString(),
        },
      ],
      components: [], // Remove the buttons after action
    },
  };
}

/**
 * Parse user ID from Discord custom_id
 * @param customId - The custom_id from Discord button
 * @returns Parsed action and userId, or null if invalid
 */
export function parseCustomId(customId: string): { action: 'approve' | 'reject'; userId: number } | null {
  const approveMatch = customId.match(/^approve_user_(\d+)$/);
  if (approveMatch) {
    return { action: 'approve', userId: parseInt(approveMatch[1], 10) };
  }

  const rejectMatch = customId.match(/^reject_user_(\d+)$/);
  if (rejectMatch) {
    return { action: 'reject', userId: parseInt(rejectMatch[1], 10) };
  }

  return null;
}
