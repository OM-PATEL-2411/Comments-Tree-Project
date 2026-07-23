import { proxy } from "./proxy";

export function middleware(request) {
  return proxy(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export default middleware;
