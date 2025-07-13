import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { clerkClient } from '@clerk/nextjs/server';
import { createUser, updateUser, deleteUser } from '@/lib/actions/user.actions';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const evt = await verifyWebhook(request);

    const eventType = evt.type;
    const data = evt.data as any;

    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, first_name, last_name, username } = data;
      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      };
      const newUser = await createUser(user);

      if (newUser) {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
      }

      return NextResponse.json({ message: 'OK', user: newUser });
    }

    if (eventType === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = data;
      
      // Debug: Log the data being received
      console.log('User update data:', { id, image_url, first_name, last_name, username });
      
      // Only update fields that are provided (not null/undefined)
      const updateData: any = {};
      if (first_name) updateData.firstName = first_name;
      if (last_name) updateData.lastName = last_name;
      if (username) updateData.username = username;
      if (image_url) updateData.photo = image_url;
      
      // Only proceed if we have data to update
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await updateUser(id, updateData);
        return NextResponse.json({ message: 'OK', user: updatedUser });
      } else {
        console.log('No valid data to update for user:', id);
        return NextResponse.json({ message: 'No data to update' });
      }
    }

    if (eventType === 'user.deleted') {
      const { id } = data;
      const deletedUser = await deleteUser(id);
      return NextResponse.json({ message: 'OK', user: deletedUser });
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }
}