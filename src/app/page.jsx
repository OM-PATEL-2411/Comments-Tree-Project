import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (isAuthenticated) {
    redirect("/comments");
  } else {
    redirect("/authenticate");
  }

  return null;
}