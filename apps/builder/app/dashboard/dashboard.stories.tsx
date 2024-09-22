import type { StoryFn } from "@storybook/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./dashboard";
import type { UserPlanFeatures } from "~/shared/db/user-plan-features.server";
import type { DashboardProject } from "@webstudio-is/dashboard";

export default {
  title: "Dashboard / Projects",
  component: Dashboard,
};

const user = {
  id: "0",
  createdAt: new Date().toString(),
  email: null,
  image: null,
  username: "Taylor",
  teamId: null,
};

const createRouter = (element: JSX.Element) =>
  createBrowserRouter([
    {
      path: "*",
      element,
      loader: () => null,
    },
  ]);

const userPlanFeatures: UserPlanFeatures = {
  hasProPlan: false,
  hasSubscription: false,
  allowShareAdminLinks: false,
  allowDynamicData: false,
  allowContactEmail: false,
  maxDomainsAllowedPerUser: 5,
};

export const Empty: StoryFn<typeof Dashboard> = () => {
  const router = createRouter(
    <Dashboard
      user={user}
      projects={[]}
      projectTemplates={[]}
      userPlanFeatures={userPlanFeatures}
      publisherHost={"https://wstd.work"}
      imageBaseUrl=""
    />
  );
  return <RouterProvider router={router} />;
};

export const WithProjects: StoryFn<typeof Dashboard> = () => {
  const projects = [
    {
      id: "0",
      createdAt: new Date().toString(),
      title: "My Project",
      domain: "domain.com",
      userId: "",
      isDeleted: false,
      isPublished: false,
      latestBuild: null,
      previewImageAsset: {
        id: "0",
        projectId: "0",
        name: "preview.jpg",
      },
      previewImageAssetId: "",
      latestBuildVirtual: null,
      marketplaceApprovalStatus: "UNLISTED" as const,
    } as DashboardProject,
  ];
  const router = createRouter(
    <Dashboard
      user={user}
      projects={projects}
      projectTemplates={projects}
      userPlanFeatures={userPlanFeatures}
      publisherHost={"https://wstd.work"}
      imageBaseUrl=""
    />
  );
  return <RouterProvider router={router} />;
};