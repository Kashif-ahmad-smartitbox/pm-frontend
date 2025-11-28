"use client";

import React, { useState, useEffect } from "react";
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

// Compact Profile Dropdown
const ProfileDropdown = ({
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

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User";
    const roleMap: { [key: string]: string } = {
      admin: "Admin",
      project_manager: "Project Manager",
      team_member: "Team Member",
    };
    return roleMap[role] || role;
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    onSettingsClick?.();
    setIsOpen(false);
  };

  if (!user) {
    return (
      <div className="w-8 h-8 bg-[#D9F3EE] rounded-full flex items-center justify-center">
        <User className="w-3.5 h-3.5 text-[#0E3554]" />
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#EFFFFA] transition-colors min-w-0 group"
        >
          <div className="w-7 h-7 bg-gradient-to-br from-[#0E3554] to-[#1CC2B1] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs">
              {getInitials(user.name)}
            </span>
          </div>

          <div className="hidden lg:block text-left min-w-0 max-w-24">
            <div className="text-sm font-semibold text-[#0E3554] truncate">
              {user.name || "User"}
            </div>
            <div className="text-xs text-[#1CC2B1] font-medium truncate">
              {getRoleDisplay(user.role)}
            </div>
          </div>

          <ChevronDown
            className={`w-3 h-3 text-[#0E3554] transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-9 bg-white rounded-lg shadow-lg border border-[#D9F3EE] py-1 z-50 min-w-44">
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
                className="w-full px-3 py-1.5 text-left text-sm text-[#0E3554] hover:bg-[#EFFFFA] flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            )}

            <button
              onClick={handleLogoutClick}
              className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
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
};

// Compact Icon Button Component
const IconButton = ({
  onClick,
  icon: Icon,
  badgeCount = 0,
  title,
  badgeLoading = false,
}: {
  onClick?: () => void;
  icon: React.ComponentType<any>;
  badgeCount?: number;
  title: string;
  badgeLoading?: boolean;
}) => {
  if (!onClick) return null;

  return (
    <button
      onClick={onClick}
      className="relative p-1.5 text-[#0E3554] hover:text-[#1CC2B1] hover:bg-[#EFFFFA] rounded-lg transition-colors"
      title={title}
    >
      <Icon className="w-4 h-4" />
      {badgeLoading ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center border border-white">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
        </span>
      ) : badgeCount > 0 ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium border border-white">
          {badgeCount > 9 ? "9+" : badgeCount}
        </span>
      ) : null}
    </button>
  );
};

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
  const [unreadCount, setUnreadCount] = useState(0);
  const [badgeLoading, setBadgeLoading] = useState(true);
  const { user, logout } = useAuth();

  // Fetch notification count for badge
  const fetchBadgeCount = async () => {
    try {
      setBadgeLoading(true);
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
      setBadgeLoading(false);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchBadgeCount();

      // Refresh badge count every 30 seconds
      const interval = setInterval(fetchBadgeCount, 30000);
      return () => clearInterval(interval);
    }
  }, [showNotifications]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationsClick = () => {
    setNotificationPanelOpen(true);
    onNotificationsClick?.();
  };

  const handleCloseNotificationPanel = () => {
    setNotificationPanelOpen(false);
    // Refresh badge count when panel closes
    fetchBadgeCount();
  };

  return (
    <>
      <header className="bg-white rounded-xl p-3 mb-3 border border-[#E1F3F0]">
        {/* Main Header */}
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <img className="w-14 h-14 rounded" src="/logo.png" alt="SKC" />
            <div>
              <h1 className="text-base font-bold text-[#0E3554] leading-tight">
                {title}
              </h1>
              <p className="text-[#1CC2B1] text-xs font-medium leading-tight">
                {subtitle}
              </p>
            </div>
          </div>

          <span className="font-bold text-xl text-[#0E3554]">
            TnA Dashboard
          </span>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1">
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

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-1">
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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#0E3554] hover:bg-[#EFFFFA] rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-[#E1F3F0] sm:hidden">
            <div className="flex flex-col gap-2">
              {showProjectTypes && (
                <div className="flex items-center gap-2">
                  <IconButton
                    onClick={onProjectTypesClick}
                    icon={Building}
                    title="Project Types"
                  />
                  <span className="text-sm text-[#0E3554]">Project Types</span>
                </div>
              )}

              {showTeamManagement && (
                <div className="flex items-center gap-2">
                  <IconButton
                    onClick={onTeamManagementClick}
                    icon={Users}
                    title="Team Management"
                  />
                  <span className="text-sm text-[#0E3554]">
                    Team Management
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E1F3F0]">
                <ProfileDropdown
                  user={user}
                  onLogout={handleLogout}
                  onSettingsClick={showSettings ? onSettingsClick : undefined}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Notification Panel */}
      {showNotifications && notificationPanelOpen && (
        <NotificationPanel onClose={handleCloseNotificationPanel} />
      )}
    </>
  );
}
