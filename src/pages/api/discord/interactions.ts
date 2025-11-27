import type { APIRoute } from 'astro';
import { 
  verifyDiscordSignature, 
  parseCustomId, 
  createActionResponse,
  DISCORD_INTERACTION_TYPE,
  DISCORD_CALLBACK_TYPE,
  type DiscordInteraction
} from '@/lib/discord';
import { approveUser, rejectUser, getUserById } from '@/lib/db-utils';

// User interface from database
interface User {
  id: number;
  email: string;
  name: string;
  status: string;
  role: string;
  author_handle?: string;
}

// Environment with Discord configuration
interface DiscordEnv {
  DB: D1Database;
  DISCORD_PUBLIC_KEY?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env as DiscordEnv;
  const discordPublicKey = env.DISCORD_PUBLIC_KEY;

  // Check if Discord public key is configured
  if (!discordPublicKey) {
    console.error('DISCORD_PUBLIC_KEY environment variable is not configured');
    return new Response(JSON.stringify({ error: 'Discord integration not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify Discord signature
  const { isValid, body } = await verifyDiscordSignature(request, discordPublicKey);
  
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid request signature' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let interaction: DiscordInteraction;
  try {
    interaction = JSON.parse(body);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle Discord PING (required for endpoint verification)
  if (interaction.type === DISCORD_INTERACTION_TYPE.PING) {
    return new Response(JSON.stringify({ type: DISCORD_CALLBACK_TYPE.PONG }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Handle button interactions
  if (interaction.type === DISCORD_INTERACTION_TYPE.MESSAGE_COMPONENT) {
    const customId = interaction.data?.custom_id;
    
    if (!customId) {
      return new Response(JSON.stringify({ error: 'Missing custom_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const parsed = parseCustomId(customId);
    
    if (!parsed) {
      return new Response(JSON.stringify({ error: 'Invalid custom_id format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { action, userId } = parsed;
    const db = env.DB;

    try {
      // Get user info first for the response message
      const user = await getUserById(db, userId) as User | null;
      
      if (!user) {
        const response = createActionResponse(action, 'Unknown User', false);
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if user is still pending
      if (user.status !== 'pending') {
        // User has already been processed
        const response = {
          type: DISCORD_CALLBACK_TYPE.UPDATE_MESSAGE,
          data: {
            embeds: [
              {
                title: 'ℹ️ Already Processed',
                description: `**${user.name}** has already been ${user.status}.`,
                color: 0x5865F2,
                timestamp: new Date().toISOString(),
              },
            ],
            components: [], // Remove buttons
          },
        };
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Perform the action
      if (action === 'approve') {
        await approveUser(db, userId);
      } else {
        await rejectUser(db, userId);
      }

      const response = createActionResponse(action, user.name, true);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error processing user action:', error);
      const response = createActionResponse(action, `User #${userId}`, false);
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Unknown interaction type
  return new Response(JSON.stringify({ error: 'Unknown interaction type' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
};
