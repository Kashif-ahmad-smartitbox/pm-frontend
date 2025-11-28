"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  LogOut,
  Menu,
  X,
  Users,
  Building,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import ConfirmationModal from "../ConfirmationModal";
import NotificationPanel from "../NotificationPanel";
import { getNotifications } from "@/lib/api/notification";

// Types
interface AppUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface HeaderProps {
  title: string;
  subtitle: string;
  onProjectTypesClick?: () => void;
  onTeamManagementClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  showProjectTypes?: boolean;
  showTeamManagement?: boolean;
  showNotifications?: boolean;
  showSettings?: boolean;
}

// Constants
const ROLE_DISPLAY_MAP: Record<string, string> = {
  admin: "Admin",
  project_manager: "Project Manager",
  team_member: "Team Member",
};

// Custom hook for notification badge
const useNotificationBadge = (enabled: boolean) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBadgeCount = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      const response = await getNotifications({
        page: 1,
        limit: 1,
        read: false,
      });
      setUnreadCount(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      fetchBadgeCount();

      // Refresh badge count every 30 seconds
      const interval = setInterval(fetchBadgeCount, 30000);
      return () => clearInterval(interval);
    }
  }, [enabled, fetchBadgeCount]);

  return { unreadCount, loading, refresh: fetchBadgeCount };
};

// Utility functions
const getRoleDisplay = (role?: string): string => {
  if (!role) return "User";
  return ROLE_DISPLAY_MAP[role] || role;
};

const getInitials = (name?: string): string => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0] || "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Compact Icon Button Component
const IconButton = React.memo(
  ({
    onClick,
    icon: Icon,
    badgeCount = 0,
    title,
    badgeLoading = false,
    className = "",
  }: {
    onClick?: () => void;
    icon: React.ComponentType<any>;
    badgeCount?: number;
    title: string;
    badgeLoading?: boolean;
    className?: string;
  }) => {
    if (!onClick) return null;

    const renderBadge = () => {
      if (badgeLoading) {
        return (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center border-2 border-white">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          </span>
        );
      }

      if (badgeCount > 0) {
        return (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium border-2 border-white px-0.5">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        );
      }

      return null;
    };

    return (
      <button
        onClick={onClick}
        className={`
          relative p-2 text-[#0E3554] hover:text-[#1CC2B1] 
          hover:bg-[#EFFFFA] rounded-lg transition-all duration-200
          active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:ring-opacity-50
          ${className}
        `}
        title={title}
        aria-label={title}
      >
        <Icon className="w-4 h-4" aria-hidden="true" />
        {renderBadge()}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

// Profile Dropdown Component
const ProfileDropdown = React.memo(
  ({
    user,
    onLogout,
    onSettingsClick,
  }: {
    user: AppUser | null;
    onLogout: () => void;
    onSettingsClick?: () => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
      setShowLogoutConfirm(true);
      setIsOpen(false);
    };

    const handleSettingsClick = () => {
      onSettingsClick?.();
      setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(".profile-dropdown")) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
          document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [isOpen]);

    if (!user) {
      return (
        <div
          className="w-8 h-8 bg-[#D9F3EE] rounded-full flex items-center justify-center"
          aria-label="User placeholder"
        >
          <User className="w-3.5 h-3.5 text-[#0E3554]" aria-hidden="true" />
        </div>
      );
    }

    return (
      <>
        <div className="relative profile-dropdown">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EFFFFA] transition-all duration-200 min-w-0 group focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:ring-opacity-50"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-[#0E3554] to-[#1CC2B1] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-medium text-xs">
                {getInitials(user.name)}
              </span>
            </div>

            <div className="hidden lg:block text-left min-w-0 max-w-32">
              <div className="text-sm font-semibold text-[#0E3554] truncate">
                {user.name || "User"}
              </div>
              <div className="text-xs text-[#1CC2B1] font-medium truncate">
                {getRoleDisplay(user.role)}
              </div>
            </div>

            <ChevronDown
              className={`w-3 h-3 text-[#0E3554] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#D9F3EE] py-1 z-50 min-w-48 animate-in fade-in-0 zoom-in-95">
              <div className="px-3 py-2 border-b border-[#D9F3EE]">
                <div className="text-sm font-semibold text-[#0E3554] truncate">
                  {user.name || "User"}
                </div>
                <div className="text-xs text-[#1CC2B1] font-medium truncate">
                  {user.email || "No email"}
                </div>
              </div>

              {onSettingsClick && (
                <button
                  onClick={handleSettingsClick}
                  className="w-full px-3 py-2 text-left text-sm text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:bg-[#EFFFFA]"
                >
                  <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                  Settings
                </button>
              )}

              <button
                onClick={handleLogoutClick}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:bg-red-50"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={onLogout}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          variant="info"
        />
      </>
    );
  }
);

ProfileDropdown.displayName = "ProfileDropdown";

// Mobile Menu Component
const MobileMenu = React.memo(
  ({
    isOpen,
    onClose,
    showProjectTypes,
    showTeamManagement,
    showSettings,
    onProjectTypesClick,
    onTeamManagementClick,
    onSettingsClick,
    user,
    onLogout,
  }: {
    isOpen: boolean;
    onClose: () => void;
    showProjectTypes: boolean;
    showTeamManagement: boolean;
    showSettings: boolean;
    onProjectTypesClick?: () => void;
    onTeamManagementClick?: () => void;
    onSettingsClick?: () => void;
    user: AppUser | null;
    onLogout: () => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="mt-3 pt-3 border-t border-[#E1F3F0] sm:hidden animate-in slide-in-from-top duration-200">
        <div className="flex flex-col gap-2">
          {showProjectTypes && (
            <button
              onClick={() => {
                onProjectTypesClick?.();
                onClose();
              }}
              className="flex items-center gap-3 p-2 text-sm text-[#0E3554] hover:bg-[#EFFFFA] rounded-lg transition-colors duration-200"
            >
              <Building className="w-4 h-4" aria-hidden="true" />
              Project Types
            </button>
          )}

          {showTeamManagement && (
            <button
              onClick={() => {
                onTeamManagementClick?.();
                onClose();
              }}
              className="flex items-center gap-3 p-2 text-sm text-[#0E3554] hover:bg-[#EFFFFA] rounded-lg transition-colors duration-200"
            >
              <Users className="w-4 h-4" aria-hidden="true" />
              Team Management
            </button>
          )}

          <div className="pt-2 border-t border-[#E1F3F0]">
            <ProfileDropdown
              user={user}
              onLogout={onLogout}
              onSettingsClick={showSettings ? onSettingsClick : undefined}
            />
          </div>
        </div>
      </div>
    );
  }
);

MobileMenu.displayName = "MobileMenu";

// Main Header Component
export default function CommonHeader({
  title,
  subtitle,
  onProjectTypesClick,
  onTeamManagementClick,
  onNotificationsClick,
  onSettingsClick,
  showProjectTypes = false,
  showTeamManagement = false,
  showNotifications = false,
  showSettings = false,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { user, logout } = useAuth();

  const {
    unreadCount,
    loading: badgeLoading,
    refresh: refreshBadgeCount,
  } = useNotificationBadge(showNotifications);

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationsClick = () => {
    setNotificationPanelOpen(true);
    onNotificationsClick?.();
  };

  const handleCloseNotificationPanel = () => {
    setNotificationPanelOpen(false);
    refreshBadgeCount();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white rounded-xl p-4 mb-4 border border-[#E1F3F0] shadow-sm">
        {/* Main Header Row */}
        <div className="flex items-center justify-between">
          {/* Logo and Title Section - Left aligned */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none">
            <img
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex-shrink-0"
              src="/logo.png"
              alt="SKC Logo"
            />
            <div className="min-w-0 flex-1 sm:flex-none">
              <h1 className="text-lg sm:text-xl font-bold text-[#0E3554] leading-tight truncate">
                {title}
              </h1>
              <p className="text-[#1CC2B1] text-sm font-medium leading-tight truncate">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Center Title - Hidden on mobile, visible on tablet and up */}
          <div className="hidden sm:flex flex-1 justify-center">
            <span className="font-bold text-xl text-[#0E3554] text-center whitespace-nowrap">
              TnA Dashboard
            </span>
          </div>

          {/* Desktop Actions - Right aligned */}
          <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
            {showProjectTypes && (
              <IconButton
                onClick={onProjectTypesClick}
                icon={Building}
                title="Project Types"
              />
            )}

            {showTeamManagement && (
              <IconButton
                onClick={onTeamManagementClick}
                icon={Users}
                title="Team Management"
              />
            )}

            {showNotifications && (
              <IconButton
                onClick={handleNotificationsClick}
                icon={Bell}
                badgeCount={unreadCount}
                badgeLoading={badgeLoading}
                title="Notifications"
              />
            )}

            <div className="ml-1">
              <ProfileDropdown
                user={user}
                onLogout={handleLogout}
                onSettingsClick={showSettings ? onSettingsClick : undefined}
              />
            </div>
          </div>

          {/* Mobile Actions - Right aligned */}
          <div className="sm:hidden flex items-center gap-1 flex-shrink-0">
            {showNotifications && (
              <IconButton
                onClick={handleNotificationsClick}
                icon={Bell}
                badgeCount={unreadCount}
                badgeLoading={badgeLoading}
                title="Notifications"
              />
            )}

            <button
              onClick={toggleMobileMenu}
              className="p-2 text-[#0E3554] hover:bg-[#EFFFFA] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1CC2B1] focus:ring-opacity-50"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Menu className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Center Title - Visible only on mobile below the subtitle */}
        <div className="sm:hidden mt-3 pt-3 border-t border-[#E1F3F0]">
          <span className="font-bold text-lg text-[#0E3554] text-center block">
            TnA Dashboard
          </span>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={closeMobileMenu}
          showProjectTypes={showProjectTypes}
          showTeamManagement={showTeamManagement}
          showSettings={showSettings}
          onProjectTypesClick={onProjectTypesClick}
          onTeamManagementClick={onTeamManagementClick}
          onSettingsClick={onSettingsClick}
          user={user}
          onLogout={handleLogout}
        />
      </header>

      {/* Notification Panel */}
      {showNotifications && notificationPanelOpen && (
        <NotificationPanel onClose={handleCloseNotificationPanel} />
      )}
    </>
  );
}
