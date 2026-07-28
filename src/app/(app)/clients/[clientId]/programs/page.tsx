import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ProgramDeleteButton,
  ProgramForm,
} from "@/features/brand/components/program-form";
import { listPrograms } from "@/features/brand/queries";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { listLocations } from "@/features/locations/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "Programs · Market Studio" };
}

export default async function ClientProgramsPage({
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
  const [programs, locations] = await Promise.all([
    listPrograms(clientId),
    listLocations(clientId).catch(() => []),
  ]);

  const locationNameById = new Map(locations.map((l) => [l.id, l.name]));

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Programs"
        description={`Age groups and offerings for ${client.name}.`}
      />
      <ClientSubnav clientId={clientId} active="programs" />

      <div className="space-y-6">
        {capabilities.canManageBrand ? (
          <Card>
            <CardHeader>
              <CardTitle>Add program</CardTitle>
              <CardDescription>
                Define programs once, then offer them at one or more locations.
              </CardDescription>
            </CardHeader>
            <ProgramForm
              clientId={clientId}
              locations={locations.map((l) => ({ id: l.id, name: l.name }))}
              canManage
            />
          </Card>
        ) : null}

        {programs.length === 0 ? (
          <EmptyState
            title="No programs yet"
            description="Add infant, toddler, preschool, or before/after-school programs."
          />
        ) : (
          <ul className="space-y-4">
            {programs.map((program) => {
              const offered = program.location_programs
                .map((link) => locationNameById.get(link.location_id) ?? "Location")
                .join(", ");
              const ageLabel =
                program.minimum_age_months != null ||
                program.maximum_age_months != null
                  ? `${program.minimum_age_months ?? "?"}–${program.maximum_age_months ?? "?"} months`
                  : "Age range not set";

              return (
                <li key={program.id}>
                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-base">{program.name}</CardTitle>
                        <CardDescription>
                          <span className="capitalize">{program.status}</span>
                          {` · ${ageLabel}`}
                          {offered ? ` · ${offered}` : " · No locations linked"}
                        </CardDescription>
                      </div>
                      {capabilities.canManageBrand ? (
                        <ProgramDeleteButton
                          clientId={clientId}
                          programId={program.id}
                        />
                      ) : null}
                    </CardHeader>
                    {capabilities.canManageBrand ? (
                      <ProgramForm
                        clientId={clientId}
                        locations={locations.map((l) => ({
                          id: l.id,
                          name: l.name,
                        }))}
                        program={program}
                        canManage
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-ink">
                        {program.description || "No description."}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
