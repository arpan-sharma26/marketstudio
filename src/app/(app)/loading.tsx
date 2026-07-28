import { PageLoader } from "@/components/shared/page-loader";

/** Content-area loader for authenticated routes (keeps the app shell visible). */
export default function AppLoading() {
  return <PageLoader compact label="Loading…" className="bg-transparent" />;
}
