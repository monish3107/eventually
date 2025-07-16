'use client';

import React, { useTransition } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { IEvent } from '@/lib/database/models/event.model';
import { Button } from '../ui/button';
import { checkoutOrder } from '@/lib/actions/order.actions';

// It's a good practice to call loadStripe outside of a component’s render
// to avoid recreating the Stripe object on every render.
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripeKey) throw new Error('Stripe publishable key is not set');
loadStripe(stripeKey);

const Checkout = ({ event, userId }: { event: IEvent, userId: string }) => {
  const [isPending, startTransition] = useTransition();

  // Renamed 'e' to avoid shadowing the 'event' prop
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission

    if (event.isFree) {
      // Handle free ticket logic if necessary, maybe redirect to a confirmation page
      console.log("This is a free ticket.");
      // Optionally, you could call a function to create a free order here
      return;
    }

    startTransition(async () => {
      try {
        await checkoutOrder({
          eventTitle: event.title,
          eventId: event._id,
          price: event.price ?? "0", // <-- ENSURE STRING, PROVIDE DEFAULT IF NEEDED
          isFree: event.isFree,
          buyerId: userId,
        });
      } catch (error) {
        console.error('Checkout failed:', error);
        // Optionally, show an error message to the user
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" role="link" size="lg" className="button sm:w-fit" disabled={isPending}>
        {event.isFree ? 'Get Ticket' : isPending ? 'Processing...' : 'Buy Ticket'}
      </Button>
    </form>
  );
};

export default Checkout;