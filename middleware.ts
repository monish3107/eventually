import { clerkMiddleware } from '@clerk/nextjs/server';

const publicRoutes = [
  '/',
  '/events/:id',
  '/api/webhook/clerk',
  '/api/webhook/stripe',
  '/api/uploadthing',
];

import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authResult = await auth();
  if (!authResult.userId) {
    const url = req.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
