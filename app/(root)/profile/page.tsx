import Collection from '@/components/shared/Collection'
import { Button } from '@/components/ui/button'
import { getEventsByUser } from '@/lib/actions/event.actions'
import { getOrdersByUser } from '@/lib/actions/order.actions'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import React from 'react'

const ProfilePage = async () => {
  const authData = await auth();
  const { userId } = authData;

  if (!userId) {
    // Optionally, you can redirect to sign-in or show a message
    return <div className="wrapper my-8">You must be signed in to view your profile.</div>;
  }

  const organizedEvents = await getEventsByUser({ userId, page: 1 });
  const myTickets = await getOrdersByUser({ userId, page: 1 });

  return (
    <>
      {/* My tickets */}    
      <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
        <div className='wrapper flex items-center justify-center sm:justify-between'>
          <h3 className='h3-bold text-center sm:text-left'>My Tickets</h3>
          <Button asChild size='lg' className='button hidden sm:flex'>
            <Link href="/#events">
              Explore More Events
            </Link>
          </Button>
        </div>
      </section>

      <section className='wrapper my-8'>
        <Collection
          data={myTickets?.data?.map((order: any) => order.event) || []}
          emptyTitle="No Event Tickets Purchased Yet"
          emptyStateSubtext="No worries - Plenty of exciting events to explore"
          collectionType="My_Tickets"
          limit={3}
          page={1}
          urlParamName='ordersPage'
          // total={myTickets?.totalPages}
        />
      </section>

      {/* Events organized */}
      <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
        <div className='wrapper flex items-center justify-center sm:justify-between'>
          <h3 className='h3-bold text-center sm:text-left'>Events Organized</h3>
          <Button asChild size="lg" className='button hidden sm:flex'>
            <Link href="/event/create">
              Create New Event
            </Link>
          </Button>
        </div>
      </section>

      <section className='wrapper my-8'>
        <Collection
          data={organizedEvents?.data}
          emptyTitle="No Event Created Yet"
          emptyStateSubtext="Create an Event now"
          collectionType="Events_Organized"
          limit={6}
          page={1}
          urlParamName='eventsPage'
          // total={2}
        />
      </section>
    </>
  )
}

export default ProfilePage
