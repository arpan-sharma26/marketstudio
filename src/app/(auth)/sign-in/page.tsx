import { redirect } from "next/navigation";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { getAuthenticatedProfile } from "@/lib/auth";

export const metadata = {
  title: "Sign in · Market Studio",
};

export default async function SignInPage() {
  // Already authenticated users skip the sign-in page.
  const profile = await getAuthenticatedProfile();
  if (profile) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-brand-700">Market Studio</h1>
          <p className="mt-1 text-sm text-slate-500">
            Daycare marketing &amp; lead management
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your credentials to access your workspace.
            </CardDescription>
          </CardHeader>
          <SignInForm />
        </Card>
      </div>
    </main>
  );
}
