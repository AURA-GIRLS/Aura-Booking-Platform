"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Edit2, Save, X, Upload } from "lucide-react";
import Notification from "@/components/generalUI/Notification";
import { authService } from "@/services/auth";
import { UserResponseDTO } from "@/types/user.dtos";
import { useTranslate } from "@/i18n/hooks/useTranslate";

const EditProfile: React.FC = () => {
  const { t } = useTranslate('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserResponseDTO | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    fullName: "",
    phoneNumber: "",
    avatarUrl: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    isVisible: boolean;
  }>({
    type: "success",
    message: "",
    isVisible: false
  });

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
      showNotification("error", error.message || t('editProfile.profileLoadFailed'));
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
      showNotification("error", t('editProfile.fullNameRequired'));
      return false;
    }

    if (editedProfile.fullName.length < 2 || editedProfile.fullName.length > 50) {
      showNotification("error", t('editProfile.fullNameLength'));
      return false;
    }

    if (editedProfile.phoneNumber && !/^[\+]?[0-9][\d]{0,10}$/.test(editedProfile.phoneNumber)) {
      showNotification("error", t('editProfile.validPhone'));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      if (avatarFile) {
        setIsUploading(true);
        const uploadRes = await authService.uploadAvatar(avatarFile);
        if (!uploadRes.success || !uploadRes.data) {
          throw new Error(uploadRes.message || "Failed to upload avatar");
        }

        setProfile(uploadRes.data.user);
        setEditedProfile(prev => ({
          ...prev,
          avatarUrl: uploadRes.data?.avatarUrl || uploadRes.data?.user?.avatarUrl || prev.avatarUrl
        }));
        try {
          localStorage.setItem('currentUser', JSON.stringify(uploadRes.data.user));
          window.dispatchEvent(new CustomEvent('userUpdated'));
        } catch {}
        setIsUploading(false);
      }

      const updateData = {
        fullName: editedProfile.fullName,
        phoneNumber: editedProfile.phoneNumber || undefined,
      } as { fullName?: string; phoneNumber?: string };

      const response = await authService.updateProfile(updateData);

      if (response.success && response.data) {
        setProfile(response.data);
        setIsEditing(false);
        showNotification("success", t('editProfile.profileUpdateSuccess'));

        try {
          localStorage.setItem('currentUser', JSON.stringify(response.data));
          window.dispatchEvent(new CustomEvent('userUpdated'));
        } catch {}

        if (avatarPreviewUrl) {
          URL.revokeObjectURL(avatarPreviewUrl);
        }
        setAvatarPreviewUrl(null);
        setAvatarFile(null);
      }
    } catch (error: any) {
      showNotification("error", error.message || t('editProfile.profileUpdateFailed'));
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
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
    setAvatarFile(null);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification("error", t('editProfile.selectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", t('editProfile.imageSizeLimit'));
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreviewUrl(url);
    setEditedProfile(prev => ({ ...prev, avatarUrl: url }));
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
      
      <div className="bg-white rounded-2xl shadow-sm border border-rose-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('editProfile.title')}</h1>
              <p className="text-gray-600 mt-1">{t('editProfile.subtitle')}</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
              >
                <Edit2 size={16} />
                {t('editProfile.editProfileButton')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSaving ? t('editProfile.saving') : t('editProfile.save')}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition disabled:opacity-50"
                >
                  <X size={16} />
                  {t('editProfile.cancel')}
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
                    {editedProfile?.avatarUrl ? (
                      <img src={editedProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-pink-400" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input
                       title="file"
                       placeholder={t('editProfile.uploadAvatar')}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={isSaving}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition cursor-pointer"
                        title={t('editProfile.changeAvatar')}
                      >
                        <Camera size={16} />
                      </label>
                    </>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {profile?.fullName || t('editProfile.loading')}
                </h2>
                <p className="text-gray-600">{t('editProfile.customer')}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  {t('editProfile.fullName')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.fullName}
                    onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder={t('editProfile.enterFullName')}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.fullName || t('editProfile.notProvided')}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  {t('editProfile.email')}
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {profile?.email || t('editProfile.notProvided')}
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('editProfile.emailCannotBeChanged')}</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  {t('editProfile.phoneNumber')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder={t('editProfile.enterPhoneNumber')}
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.phoneNumber || t('editProfile.notProvided')}
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('editProfile.accountInformation')}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('editProfile.accountStatus')}</span>
                    <span className="text-green-600 font-medium">{profile?.status || t('editProfile.active')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('editProfile.emailVerified')}</span>
                    <span className={`font-medium ${profile?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {profile?.isEmailVerified ? t('editProfile.verified') : t('editProfile.notVerified')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t('editProfile.memberSince')}</span>
                    <span className="text-gray-600">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
