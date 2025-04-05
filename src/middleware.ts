// import { getToken } from 'next-auth/jwt';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname;

//   // Handle API routes differently
//   if (path.startsWith('/api/admin')) {
//     const session = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!session || session.role !== 'admin') {
//       return new NextResponse(
//         JSON.stringify({ error: 'Unauthorized' }),
//         {
//           status: 401,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );
//     }
//   }
//   // Handle admin UI routes
//   else if (path.startsWith('/admin')) {
//     const session = await getToken({
//       req: request,
//       secret: process.env.NEXTAUTH_SECRET,
//     });

//     if (!session || session.role !== 'admin') {
//       const url = new URL('/admin-login', request.url);
//       return NextResponse.redirect(url);
//     }
//   }

//   return NextResponse.next();
// }

// // Configure which routes to run middleware on
// export const config = {
//   matcher: ['/admin/:path*', '/api/admin/:path*']
// };


import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Get the referer header to check if the request is from our application
  const referer = request.headers.get('referer');
  const isInternalRequest = referer?.includes(request.headers.get('host') || '');

  // Handle all API routes
  if (path.startsWith('/api/')) {
    // For admin routes, require admin authentication and internal request
    if (path.startsWith('/api/admin')) {
      // Check if request is internal
      if (!isInternalRequest) {
        return new NextResponse(
          JSON.stringify({ error: 'External API access is not allowed' }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      // Verify admin authentication
      const session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!session || session.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }
    // For non-admin API routes, ensure request is internal
    else if (!isInternalRequest) {
      return new NextResponse(
        JSON.stringify({ error: 'External API access is not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  // Handle admin UI routes
  else if (path.startsWith('/admin')) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!session || session.role !== 'admin') {
      const url = new URL('/admin-login', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};
