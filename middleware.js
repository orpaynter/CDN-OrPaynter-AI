import { NextResponse } from 'next/server';

const unauthorized = () => {
  const response = new NextResponse('Authentication required.', { status: 401 });
  response.headers.set('WWW-Authenticate', 'Basic realm="Private Site", charset="UTF-8"');
  return response;
};

const decodeBasicAuth = (encoded) => {
  try {
    const decoded = atob(encoded);
    const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return null;
  }
};

const timingSafeEqual = (left, right) => {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
};

const isAuthorized = (request, username, password) => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const [scheme, encoded] = authHeader.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    return false;
  }

  const decoded = decodeBasicAuth(encoded);
  if (!decoded) {
    return false;
  }

  const separator = decoded.indexOf(':');
  if (separator === -1) {
    return false;
  }

  const suppliedUser = decoded.slice(0, separator);
  const suppliedPassword = decoded.slice(separator + 1);
  return timingSafeEqual(suppliedUser, username) && timingSafeEqual(suppliedPassword, password);
};

export function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!username || !password) {
    return new NextResponse('Private site credentials are not configured.', { status: 503 });
  }

  if (!isAuthorized(request, username, password)) {
    return unauthorized();
  }

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add custom header to track middleware execution
  response.headers.set('X-Middleware-Executed', 'true');

  // Logging for demonstration (in production, use proper logging service)
  console.log(`[Middleware] ${request.method} ${pathname} - ${new Date().toISOString()}`);

  // Example: Block access to /admin paths (demonstration only)
  if (pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    response.headers.set('X-Blocked-Path', pathname);
    return NextResponse.redirect(url);
  }

  // Example: Add custom header for API routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/quotes/')) {
    response.headers.set('X-API-Version', '1.0');
  }

  return response;
}

export const config = {
  matcher: [
    '/:path*',
  ],
};
