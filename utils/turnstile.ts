const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function validateTurnstileToken(token: string): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY!);
    formData.append('response', token);

    const result = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const outcome = await result.json();
    return outcome.success === true;
  } catch (error) {
    console.error('Error validating Turnstile token:', error);
    return false;
  }
} 