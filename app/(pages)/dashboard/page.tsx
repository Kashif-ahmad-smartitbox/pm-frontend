"use client";

import { useAuth } from "@/app/context/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeamMemberDashboard from "@/components/dashboard/TeamMemberDashboard";
import ProjectManagerDashboard from "@/components/dashboard/ProjectManagerDashboard";
import { Loader2, ShieldAlert, UserX } from "lucide-react";

type UserRole = "admin" | "project_manager" | "team_member";

interface User {
  role?: string;
  roles?: string[];
  id?: string;
  email?: string;
  name?: string;
}

const DashboardLoading = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Loading Dashboard</h2>
        <p className="text-slate-600 max-w-sm">
          Preparing your workspace... This will just take a moment.
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const DashboardError = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8 text-red-600" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-slate-800">Access Issue</h2>
        <p className="text-slate-600 leading-relaxed">{message}</p>
      </div>
      <div className="space-y-3 pt-4">
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          Try Again
        </button>
        <a
          href="/support"
          className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          Contact Support →
        </a>
      </div>
    </div>
  </div>
);

const isValidRole = (role: string | undefined): role is UserRole => {
  if (!role) return false;
  return ["admin", "project_manager", "team_member"].includes(role);
};

const resolveUserRole = (user: User | null): UserRole | null => {
  if (!user) return null;

  if (user.role && isValidRole(user.role)) {
    return user.role;
  }

  if (user.roles && user.roles.length > 0) {
    for (const role of user.roles) {
      if (isValidRole(role)) {
        return role;
      }
    }
  }

  return null;
};

const getUserRoleWithFallback = (
  user: User | null
): { role: UserRole | null; error?: string } => {
  if (!user) {
    return { role: null, error: "No user data available" };
  }

  const role = user.role || user.roles?.[0];

  if (!role) {
    return { role: null, error: "No role assigned to user" };
  }

  if (isValidRole(role)) {
    return { role };
  }

  return {
    role: null,
    error: `Invalid role: "${role}". Valid roles are: admin, project_manager, team_member`,
  };
};

// Main Dashboard Component
function Dashboard() {
  const { user, loading, error } = useAuth();

  // Handle loading state
  if (loading) {
    return <DashboardLoading />;
  }

  // Handle error state
  if (error) {
    return (
      <DashboardError message="We encountered an issue while loading your dashboard. Please try again or contact support if the problem persists." />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserX className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-800">
              Authentication Required
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Please sign in to access your dashboard.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <a
              href="/login"
              className="inline-block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  const userRole = resolveUserRole(user);

  if (!userRole) {
    const { error: roleError } = getUserRoleWithFallback(user);

    return (
      <DashboardError
        message={
          roleError ||
          "Unable to determine your access level. Please contact your administrator."
        }
      />
    );
  }

  const dashboardComponents: Record<UserRole, React.ComponentType> = {
    admin: AdminDashboard,
    project_manager: ProjectManagerDashboard,
    team_member: TeamMemberDashboard,
  };

  const DashboardComponent = dashboardComponents[userRole];

  return <DashboardComponent />;
}

export default Dashboard;
