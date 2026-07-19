import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Not found · Market Studio",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
