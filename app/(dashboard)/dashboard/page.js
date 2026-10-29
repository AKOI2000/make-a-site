import DashboardHeader from "./sections/DashboardHeader/DashboardHeader";
import WelcomeSection from "./sections/WelcomeSection/WelcomeSection";
import WebsiteList from "./sections/WebsiteList/WebsiteList";

import { getSession } from "@/app/lib/auth-sessions";
import { getUserWebsites } from "@/lib/data/websites";
import WebsiteHeader from "./sections/WebsiteHeader/WebsiteHeader";

export default async function DashboardPage() {
  const session = await getSession();

  const id = session?.user?.id;
  const websites = await getUserWebsites(id, 4);

  return (
    <>
      <DashboardHeader user={session.user} />
      <WelcomeSection user={session.user} />
      <WebsiteHeader />
      <WebsiteList websites={websites} />
    </>
  );
}
