import EventForm from '@/components/shared/EventForm'
import { auth } from '@clerk/nextjs/server'
import React from 'react'

const CreateEvent = async () => {
    const { userId } = await auth()
    console.log(userId)

    if (!userId) {
        return <div>Please sign in to update events</div>
    }

    return (<>
        <section className='bg-primary-50 bg-dotted-pattern bg-cover bg-center py-5 md:py-10'>
            <h3 className='wrapper h3-bold text-center sm:text-left'>Create Event</h3>
        </section>

        <div className='wrapper my-8'>
            <EventForm userId={userId} type="Create"/>
        </div>
    </>)
}

export default CreateEvent