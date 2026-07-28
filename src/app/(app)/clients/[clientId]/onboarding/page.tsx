import { notFound, redirect } from "next/navigation";

import { ClientSubnav } from "@/components/shared/client-subnav";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getClient,
  getClientCapabilities,
} from "@/features/clients/queries";
import { MarketingGoalsForm } from "@/features/onboarding/components/marketing-goals-form";
import { OnboardingChecklist } from "@/features/onboarding/components/onboarding-checklist";
import {
  listOnboardingTasks,
  summarizeOnboardingProgress,
} from "@/features/onboarding/queries";
import { can } from "@/lib/permissions";
import { requireAuthContext } from "@/lib/auth";

export async function generateMetadata() {
  return { title: "Onboarding · Market Studio" };
}

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const ctx = await requireAuthContext();

  if (!can(ctx, "client.read", { clientId })) {
    redirect("/unauthorized");
  }

  const [client, capabilities] = await Promise.all([
    getClient(clientId),
    getClientCapabilities(clientId),
  ]);
  if (!client) notFound();

  const tasks = await listOnboardingTasks(clientId);
  const progress = summarizeOnboardingProgress(tasks);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Client onboarding"
        description={`Structured intake checklist for ${client.name}. No AI yet — mark tasks as you complete each section.`}
      />
      <ClientSubnav clientId={clientId} active="onboarding" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>
              Deep-link into existing client sections, then mark each task complete.
            </CardDescription>
          </CardHeader>
          <OnboardingChecklist
            clientId={clientId}
            tasks={tasks}
            progress={progress}
            onboardingStatus={client.onboarding_status}
            canManage={capabilities.canManageOnboarding}
          />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Marketing goals</CardTitle>
            <CardDescription>
              Near-term goals and notes used during setup and later marketing planning.
            </CardDescription>
          </CardHeader>
          <MarketingGoalsForm
            clientId={clientId}
            initialGoals={client.marketing_goals}
            canManage={capabilities.canManageOnboarding}
          />
        </Card>
      </div>
    </div>
  );
}
