import { getAuth } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = getAuth(req);

  if (auth.userId) {
    // User is signed in
    return NextResponse.json({ message: 'User is signed in', userId: auth.userId });
  } else {
    // User is not signed in
    return NextResponse.json({ message: 'User is not signed in' });
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};