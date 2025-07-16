'use server'

import { revalidatePath } from 'next/cache'

import { connectToDatabase } from '@/lib/database'
import User from '@/lib/database/models/user.model'
import Order from '@/lib/database/models/order.model'
import Event from '@/lib/database/models/event.model'
import { handleError } from '@/lib/utils'
import { clerkClient } from '@clerk/nextjs/server'

import { CreateUserParams, UpdateUserParams } from '@/types'

// Helper to ensure MongoDB user exists for a given Clerk userId
async function ensureMongoUser(clerkId) {
  let user = await User.findOne({ clerkId });
  if (!user) {
    // Fetch from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkId);
    if (!clerkUser) throw new Error('Clerk user not found');
    try {
      user = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        username: clerkUser.username || clerkUser.id,
        firstName: clerkUser.firstName || 'Unknown',
        lastName: clerkUser.lastName || 'User',
        photo: clerkUser.imageUrl || '',
      });
    } catch (err: any) {
      if (err.code === 11000) {
        user = await User.findOne({ clerkId });
      } else {
        throw err;
      }
    }
  }
  return user;
}

export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase()

    const newUser = await User.create(user)
    return JSON.parse(JSON.stringify(newUser))
  } catch (error) {
    handleError(error)
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase()

    const user = await User.findById(userId)

    if (!user) throw new Error('User not found')
    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    handleError(error)
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase()

    console.log('Updating user with clerkId:', clerkId, 'data:', user)

    let updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });
    if (!updatedUser) {
      // Try to create user and update again
      await ensureMongoUser(clerkId);
      updatedUser = await User.findOneAndUpdate({ clerkId }, user, { new: true });
      if (!updatedUser) throw new Error(`User not found with clerkId: ${clerkId}`);
    }
    
    console.log('User updated successfully:', updatedUser._id)
    return JSON.parse(JSON.stringify(updatedUser))
  } catch (error) {
    console.error('Error in updateUser:', error)
    handleError(error)
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase()

    // Find user to delete
    let userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      // Try to create user and delete again
      userToDelete = await ensureMongoUser(clerkId);
    }
    if (!userToDelete) {
      throw new Error('User not found')
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany({ _id: { $in: userToDelete.orders } }, { $unset: { buyer: 1 } }),
    ])

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id)
    revalidatePath('/')

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null
  } catch (error) {
    handleError(error)
  }
}