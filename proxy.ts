// import { createServerClient } from "@supabase/ssr";
// import { NextRequest, NextResponse } from "next/server";

// export async function proxy(request: NextRequest) {
//   let response = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },

//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) => {
//             request.cookies.set(name, value);
//           });

//           response = NextResponse.next({
//             request,
//           });

//           cookiesToSet.forEach(({ name, value, options }) => {
//             response.cookies.set(name, value, options);
//           });
//         },
//       },
//     }
//   );

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
//   const isLoginPage = request.nextUrl.pathname === "/admin/login";

//   /*
//    * Protect all /admin pages except the login page.
//    */
//   if (isAdminRoute && !isLoginPage && !user) {
//     const loginUrl = request.nextUrl.clone();

//     loginUrl.pathname = "/admin/login";

//     return NextResponse.redirect(loginUrl);
//   }

//   /*
//    * If an authenticated user visits the login page,
//    * send them to the admin dashboard.
//    */
//   if (isLoginPage && user) {
//     const adminUrl = request.nextUrl.clone();

//     adminUrl.pathname = "/admin";

//     return NextResponse.redirect(adminUrl);
//   }

//   return response;
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };


import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  const adminEmail = process.env.ADMIN_EMAIL
    ?.trim()
    .toLowerCase();

  const isAuthorisedAdmin =
    Boolean(user?.email) &&
    Boolean(adminEmail) &&
    user!.email!.trim().toLowerCase() === adminEmail;

  // Protect all admin routes.
  if (isAdminRoute && !isLoginPage && !isAuthorisedAdmin) {
    const redirectUrl = request.nextUrl.clone();

    if (!user) {
      redirectUrl.pathname = "/admin/login";
    } else {
      redirectUrl.pathname = "/";
    }

    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  // Only the authorised administrator can enter the dashboard.
  if (isLoginPage && isAuthorisedAdmin) {
    const adminUrl = request.nextUrl.clone();

    adminUrl.pathname = "/admin";
    adminUrl.search = "";

    return NextResponse.redirect(adminUrl);
  }

  // Authenticated non-admin users cannot use the admin login page.
  if (isLoginPage && user && !isAuthorisedAdmin) {
    const homeUrl = request.nextUrl.clone();

    homeUrl.pathname = "/";
    homeUrl.search = "";

    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
