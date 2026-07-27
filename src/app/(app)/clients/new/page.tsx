import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "@/features/clients/components/client-form";
import { requireAuthContext } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/permissions";

export const metadata = { title: "New client · Market Studio" };

export default async function NewClientPage() {
  const ctx = await requireAuthContext();
  if (!isPlatformAdmin(ctx)) redirect("/unauthorized");

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New client"
        description="Create a daycare business tenant in Market Studio."
      />
      <Card>
        <CardHeader>
          <CardTitle>Client details</CardTitle>
          <CardDescription>
            Required fields are marked. Slug is auto-generated from the name if left blank.
          </CardDescription>
        </CardHeader>
        <ClientForm mode="create" />
      </Card>
    </div>
  );
}
