import type { APIRoute } from 'astro';
import { createUser } from '@/lib/db-utils';
import { sendWriterSignupNotification } from '@/lib/discord';
import { sendSignupNotification } from '@/lib/discord';

// User interface from database
interface CreatedUser {
  id: number;
  email: string;
  name: string;
  status: string;
  role: string;
  author_handle?: string;
}

// Environment with Discord configuration
interface SignupEnv {
  DB: D1Database;
  DISCORD_WEBHOOK_URL?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const name = formData.get('name')?.toString();
    const authorHandle = formData.get('authorHandle')?.toString();

    if (!email || !password || !name || !authorHandle) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const env = locals.runtime.env as SignupEnv;
    const db = env.DB;

    // Create user with pending status
    const user = await createUser(db, {
      email,
      password,
      role: 'editor',
      name,
      authorHandle,
      status: 'pending'
    }) as CreatedUser;

    // Send Discord notification with approve/reject buttons
    const discordWebhookUrl = env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await sendSignupNotification(discordWebhookUrl, {
          id: user.id,
          name: user.name,
          email: user.email,
          authorHandle,
        });
      } catch (discordError) {
        // Log error but don't fail the signup
        console.error('Failed to send Discord notification:', discordError);
      }
    }

    // Send Discord notification (non-blocking, doesn't affect signup success)
    const discordWebhookUrl = locals.runtime.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      sendWriterSignupNotification(discordWebhookUrl, {
        name,
        email,
        authorHandle,
      }).catch((error) => {
        console.error('Failed to send Discord notification:', error);
      });
    }

    // Return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Account created! Your registration is pending admin approval. You will be notified once approved.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Check for duplicate email error
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
