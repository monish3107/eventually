import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    if (!priceId) {
        return new NextResponse("Price ID is required", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    })

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return new NextResponse('Error creating checkout session', { status: 500 });
  }
}