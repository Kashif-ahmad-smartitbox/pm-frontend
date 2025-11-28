"use client";

import { useAuth } from "@/app/context/AuthContext";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import TeamMemberDashboard from "@/components/dashboard/TeamMemberDashboard";
import ProjectManagerDashboard from "@/components/dashboard/ProjectManagerDashboard";
import { Loader2, ShieldAlert, UserX } from "lucide-react";
import { removeCookie } from "@/lib/cookies";

type UserRole = "admin" | "project_manager" | "team_member";

interface User {
  role?: string;
  roles?: string[];
  id?: string;
  email?: string;
  name?: string;
}

// Loading Component
const DashboardLoading = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-4">
    <div className="text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-[#D9F3EE] border-t-white rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#1CC2B1] animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[#0E3554]">Loading Dashboard</h2>
        <p className="text-slate-600 max-w-sm">
          Preparing your workspace... This will just take a moment.
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-[#1CC2B1] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Error Component
const DashboardError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-8 h-8 text-red-600" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-[#0E3554]">Access Issue</h2>
        <p className="text-slate-600 leading-relaxed">{message}</p>
      </div>
      <div className="space-y-3 pt-4">
        <button
          onClick={() => {
            removeCookie("authToken");
            window.location.reload();
          }}
          className="w-full py-3 px-4 bg-[#0E3554] hover:bg-[#0A2A42] text-white rounded-xl font-semibold transition-colors duration-200"
        >
          Logout and Try Again
        </button>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full py-3 px-4 border border-[#0E3554] text-[#0E3554] hover:bg-[#0E3554] hover:text-white rounded-xl font-semibold transition-colors duration-200"
          >
            Try Again
          </button>
        )}
        <a
          href="/support"
          className="inline-block text-sm text-[#0E3554] hover:text-[#1CC2B1] font-medium transition-colors duration-200"
        >
          Contact Support →
        </a>
      </div>
    </div>
  </div>
);

// Authentication Required Component
const AuthenticationRequired = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-16 h-16 bg-[#FFF4DD] rounded-2xl flex items-center justify-center mx-auto mb-4">
        <UserX className="w-8 h-8 text-[#E6A93A]" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-[#0E3554]">
          Authentication Required
        </h2>
        <p className="text-slate-600 leading-relaxed">
          Please sign in to access your dashboard.
        </p>
      </div>
      <div className="space-y-3 pt-4">
        <a
          href="/"
          className="inline-block w-full py-3 px-4 bg-[#0E3554] hover:bg-[#0A2A42] text-white rounded-xl font-semibold transition-colors duration-200"
        >
          Go to Login
        </a>
      </div>
    </div>
  </div>
);

const DashboardFooter = () => (
  <footer className="fixed bottom-4 left-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm z-40">
    <p className="text-xs text-gray-600 text-nowrap">
      Made with ❤️ by{" "}
      <a
        className="font-semibold text-yellow-600 hover:text-yellow-700 transition-colors"
        href="https://smartitbox.in"
        target="_blank"
        rel="noopener noreferrer"
      >
        SMART ITBOX
      </a>
    </p>
  </footer>
);

// Role validation utility
const isValidRole = (role: string | undefined): role is UserRole => {
  if (!role) return false;
  return ["admin", "project_manager", "team_member"].includes(role);
};

// Role resolution utility
const resolveUserRole = (user: User | null): UserRole | null => {
  if (!user) return null;

  // Check primary role field
  if (user.role && isValidRole(user.role)) {
    return user.role;
  }

  // Check roles array
  if (user.roles && user.roles.length > 0) {
    const validRole = user.roles.find((role) => isValidRole(role));
    if (validRole) return validRole;
  }

  return null;
};

// Enhanced role resolution with detailed error information
const getUserRoleWithFallback = (
  user: User | null
): { role: UserRole | null; error?: string } => {
  if (!user) {
    return {
      role: null,
      error: "No user data available. Please try logging in again.",
    };
  }

  const role = resolveUserRole(user);

  if (role) {
    return { role };
  }

  // Provide detailed error information
  const availableRoles = user.role ? [user.role] : user.roles || [];
  const roleInfo =
    availableRoles.length > 0
      ? `Available roles: ${availableRoles.join(", ")}`
      : "No roles found in user data";

  return {
    role: null,
    error: `Unable to determine valid user role. ${roleInfo}. Valid roles are: admin, project_manager, team_member`,
  };
};

// Dashboard component mapping
const DASHBOARD_COMPONENTS: Record<UserRole, React.ComponentType> = {
  admin: AdminDashboard,
  project_manager: ProjectManagerDashboard,
  team_member: TeamMemberDashboard,
};

// Main Dashboard Component
function Dashboard() {
  const { user, loading, error } = useAuth();

  // Handle loading state
  if (loading) {
    return <DashboardLoading />;
  }

  // Handle error state with retry option
  if (error) {
    return (
      <DashboardError message="We encountered an issue while loading your dashboard. Please try again or contact support if the problem persists." />
    );
  }

  // Handle unauthenticated state
  if (!user) {
    return <AuthenticationRequired />;
  }

  // Resolve and validate user role
  const { role: userRole, error: roleError } = getUserRoleWithFallback(user);

  if (!userRole) {
    return (
      <DashboardError
        message={
          roleError ||
          "Unable to determine your access level. Please contact your administrator."
        }
      />
    );
  }

  // Get the appropriate dashboard component
  const DashboardComponent = DASHBOARD_COMPONENTS[userRole];

  // Render dashboard with footer
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <DashboardComponent />
      </div>
      <DashboardFooter />
    </div>
  );
}

export default Dashboard;
