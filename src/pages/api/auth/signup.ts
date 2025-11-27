import type { APIRoute } from 'astro';
import { createUser } from '@/lib/db-utils';
import { sendSignupNotification } from '@/lib/discord';

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

    const db = locals.runtime.env.DB;

    // Create user with pending status
    const user = await createUser(db, {
      email,
      password,
      role: 'editor',
      name,
      authorHandle,
      status: 'pending'
    }) as { id: number; name: string; email: string };

    // Send Discord notification with approve/reject buttons
    const discordWebhookUrl = (locals.runtime.env as Record<string, unknown>).DISCORD_WEBHOOK_URL as string | undefined;
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
