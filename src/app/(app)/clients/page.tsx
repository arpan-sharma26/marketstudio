import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/permissions";
import { listClients } from "@/features/clients/queries";

export const metadata = { title: "Clients · Market Studio" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const ctx = await requireAuthContext();
  const params = await searchParams;
  const query = (params.q ?? "").trim().toLowerCase();

  const clients = await listClients();
  const filtered = query
    ? clients.filter(
        (client) =>
          client.name.toLowerCase().includes(query) ||
          client.slug.toLowerCase().includes(query) ||
          (client.primary_email ?? "").toLowerCase().includes(query),
      )
    : clients;

  const canCreate = isPlatformAdmin(ctx);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Clients"
        description="Daycare businesses you can access in Market Studio."
        actions={
          canCreate ? (
            <Link href="/clients/new">
              <Button>New client</Button>
            </Link>
          ) : null
        }
      />

      <form className="mb-4" method="get">
        <label htmlFor="q" className="sr-only">
          Search clients
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search by name, slug, or email"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
        />
      </form>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? "No matching clients" : "No clients yet"}
          description={
            query
              ? "Try a different search term."
              : canCreate
                ? "Create the first daycare client to get started."
                : "You have not been assigned to any clients yet."
          }
          action={
            canCreate ? (
              <Link href="/clients/new">
                <Button>Create client</Button>
              </Link>
            ) : null
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Timezone</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{client.name}</div>
                    <div className="text-xs text-slate-500">{client.slug}</div>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-700">{client.status}</td>
                  <td className="px-4 py-3 text-slate-700">{client.timezone}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!canCreate ? (
        <Card className="mt-4">
          <p className="text-sm text-slate-500">
            Only Market Studio administrators can create new clients. Contact your
            account manager if you need a new daycare added.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
