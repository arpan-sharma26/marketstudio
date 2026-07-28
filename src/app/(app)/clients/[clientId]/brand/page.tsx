import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandProfileForm } from "@/features/brand/components/brand-profile-form";
import { getBrandProfile } from "@/features/brand/queries";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "Brand · Market Studio" };
}

export default async function ClientBrandPage({
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
  const profile = await getBrandProfile(clientId);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Brand profile"
        description={`Approved marketing identity for ${client.name}.`}
      />
      <ClientSubnav clientId={clientId} active="brand" />

      <Card>
        <CardHeader>
          <CardTitle>{profile ? "Edit brand profile" : "Create brand profile"}</CardTitle>
          <CardDescription>
            Claims, voice, and CTAs that AI and marketing workflows must respect.
          </CardDescription>
        </CardHeader>
        {!profile && !capabilities.canManageBrand ? (
          <EmptyState
            title="No brand profile yet"
            description="A client admin or account manager can create the first brand profile."
          />
        ) : (
          <BrandProfileForm
            clientId={clientId}
            profile={profile}
            canManage={capabilities.canManageBrand}
            canApprove={capabilities.canApproveBrand}
            defaultName={client.name}
          />
        )}
      </Card>
    </div>
  );
}
