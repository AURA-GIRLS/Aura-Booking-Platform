"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Edit2, Save, X } from "lucide-react";
import Navbar from "@/components/generalUI/Navbar";
import Footer from "@/components/generalUI/Footer";
import Notification from "@/components/generalUI/Notification";
import { authService } from "@/services/auth";
import { UserResponseDTO } from "@/types/user.dtos";
import { useTranslate } from "@/i18n/hooks/useTranslate";

export default function MyProfilePage() {
  const { t } = useTranslate('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    fullName: "",
    phoneNumber: "",
    avatarUrl: ""
  });

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false
  });

  // Load user profile on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setEditedProfile({
          fullName: response.data.fullName || "",
          phoneNumber: response.data.phoneNumber || "",
          avatarUrl: response.data.avatarUrl || ""
        });
      }
    } catch (error: any) {
      showNotification("error", error.message || t('myProfile.profileLoadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const validateForm = () => {
    if (!editedProfile.fullName.trim()) {
      showNotification("error", t('myProfile.fullNameRequired'));
      return false;
    }

    if (editedProfile.fullName.length < 2 || editedProfile.fullName.length > 50) {
      showNotification("error", t('myProfile.fullNameLength'));
      return false;
    }

    if (editedProfile.phoneNumber && !/^[\+]?[0-9][\d]{0,10}$/.test(editedProfile.phoneNumber)) {
      showNotification("error", t('myProfile.validPhone'));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      
      const updateData = {
        fullName: editedProfile.fullName,
        phoneNumber: editedProfile.phoneNumber || undefined,
        avatarUrl: editedProfile.avatarUrl || undefined
      };

      const response = await authService.updateProfile(updateData);
      
      if (response.success && response.data) {
        setProfile(response.data);
        setIsEditing(false);
        showNotification("success", t('myProfile.profileUpdateSuccess'));
      }
    } catch (error: any) {
      showNotification("error", error.message || t('myProfile.profileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditedProfile({
        fullName: profile.fullName || "",
        phoneNumber: profile.phoneNumber || "",
        avatarUrl: profile.avatarUrl || ""
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mt-4"></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div >
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-10 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-100 to-rose-100 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{t('myProfile.title')}</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
                >
                  <Edit2 size={16} />
                  {t('myProfile.editProfile')}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {isSaving ? t('myProfile.saving') : t('myProfile.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    <X size={16} />
                    {t('myProfile.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Avatar Section */}
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-pink-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button title={t('myProfile.changeAvatar')} className="absolute bottom-0 right-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition">
                        <Camera size={16} />
                      </button>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    {profile?.fullName || t('myProfile.loading')}
                  </h2>
                  <p className="text-gray-600">{t('myProfile.customer')}</p>
                </div>
              </div>

              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User size={16} />
                    {t('myProfile.fullName')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.fullName}
                      onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                      className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder={t('myProfile.enterFullName')}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                      {profile?.fullName || t('myProfile.notProvided')}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} />
                    {t('myProfile.email')}
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.email || t('myProfile.notProvided')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t('myProfile.emailCannotBeChanged')}</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} />
                    {t('myProfile.phoneNumber')}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phoneNumber}
                      onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                      className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder={t('myProfile.enterPhoneNumber')}
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                      {profile?.phoneNumber || t('myProfile.notProvided')}
                    </div>
                  )}
                </div>

                {/* Avatar URL */}
                {isEditing && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Camera size={16} />
                      {t('myProfile.avatarUrl')}
                    </label>
                    <input
                      type="url"
                      value={editedProfile.avatarUrl}
                      onChange={(e) => setEditedProfile({...editedProfile, avatarUrl: e.target.value})}
                      className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                      placeholder={t('myProfile.enterAvatarUrl')}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Booking History */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myProfile.recentBookings')}</h3>
            <div className="text-gray-500 text-center py-8">
              {t('myProfile.noBookingsYet')}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('myProfile.accountInformation')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('myProfile.accountStatus')}</span>
                <span className="text-green-600 font-medium">{profile?.status || t('myProfile.active')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('myProfile.emailVerified')}</span>
                <span className={`font-medium ${profile?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.isEmailVerified ? t('myProfile.verified') : t('myProfile.notVerified')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{t('myProfile.memberSince')}</span>
                <span className="text-gray-600">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
