import { redirect } from "next/navigation";
import Sidebar from "../components/Sidebar/Sidebar";
import DashboardHeader from "../sections/DashboardHeader/DashboardHeader";
import WebsiteList from "../sections/WebsiteList/WebsiteList";
import "./sites.scss";
import { getSession } from "@/app/lib/auth-sessions";
import { getUserWebsites } from "@/lib/data/websites";
import SitesHeader from "./sections/SitesHeader/SitesHeader";

export default async function SitesPage() {
  const session = await getSession();
  const id = session?.user?.id;

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const websites = await getUserWebsites(id);

  return (
    <>
      <SitesHeader websiteCount={websites.length}/>
      <WebsiteList websites={websites} />
    </>
  );
}
