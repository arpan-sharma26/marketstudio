import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access denied · Market Studio",
};

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-brand-600">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your account does not have permission to view this resource. If you believe this
          is a mistake, contact your Market Studio administrator.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
