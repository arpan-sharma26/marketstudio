import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqDeleteButton, FaqForm } from "@/features/brand/components/faq-form";
import { listFaqs } from "@/features/brand/queries";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "FAQs · Market Studio" };
}

export default async function ClientFaqsPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "client.read", { clientId })) {
    redirect("/unauthorized");
  }

  const client = await getClient(clientId);
  if (!client) notFound();

  const capabilities = await getClientCapabilities(clientId);
  const [faqs, locations] = await Promise.all([
    listFaqs(clientId),
    listLocations(clientId).catch(() => []),
  ]);

  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="FAQs"
        description={`Approved answers for ${client.name} staff and AI agents.`}
      />
      <ClientSubnav clientId={clientId} active="faqs" />

      <div className="space-y-6">
        {capabilities.canManageBrand ? (
          <Card>
            <CardHeader>
              <CardTitle>Add FAQ</CardTitle>
              <CardDescription>
                Keep answers factual. Mark AI-usable only after approval.
              </CardDescription>
            </CardHeader>
            <FaqForm
              clientId={clientId}
              locations={locations.map((l) => ({ id: l.id, name: l.name }))}
              canManage
            />
          </Card>
        ) : null}

        {faqs.length === 0 ? (
          <EmptyState
            title="No FAQs yet"
            description="Add common parent questions about fees, tours, subsidy, and programs."
          />
        ) : (
          <ul className="space-y-4">
            {faqs.map((faq) => (
              <li key={faq.id}>
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                      <CardDescription>
                        <span className="capitalize">{faq.status}</span>
                        {faq.category ? ` · ${faq.category}` : ""}
                        {faq.location_id
                          ? ` · ${locationNameById.get(faq.location_id) ?? "Location"}`
                          : " · All locations"}
                        {faq.is_ai_usable ? " · AI usable" : ""}
                      </CardDescription>
                    </div>
                    {capabilities.canManageBrand ? (
                      <FaqDeleteButton clientId={clientId} faqId={faq.id} />
                    ) : null}
                  </CardHeader>
                  {capabilities.canManageBrand ? (
                    <FaqForm
                      clientId={clientId}
                      locations={locations.map((l) => ({
                        id: l.id,
                        name: l.name,
                      }))}
                      faq={faq}
                      canManage
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm text-ink">{faq.answer}</p>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
