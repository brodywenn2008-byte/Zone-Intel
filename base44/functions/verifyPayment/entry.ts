import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ paid: false }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

    // Check for any completed payment sessions for this user email
    const sessions = await stripe.checkout.sessions.list({
      customer_details: { email: user.email },
      limit: 10,
    });

    // Also search by metadata user_email
    const paid = sessions.data.some(
      (s) => s.payment_status === 'paid' &&
        (s.customer_email === user.email || s.metadata?.user_email === user.email)
    );

    return Response.json({ paid });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return Response.json({ paid: false, error: error.message }, { status: 500 });
  }
});