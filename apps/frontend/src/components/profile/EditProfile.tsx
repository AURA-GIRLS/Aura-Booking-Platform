"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Edit2, Save, X, Upload } from "lucide-react";
import Notification from "@/components/generalUI/Notification";
import { authService } from "@/services/auth";
import { UserResponseDTO } from "@/types/user.dtos";

const EditProfile: React.FC = () => {
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
      showNotification("error", error.message || "Failed to load profile");
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
      showNotification("error", "Full name is required");
      return false;
    }

    if (editedProfile.fullName.length < 2 || editedProfile.fullName.length > 50) {
      showNotification("error", "Full name must be between 2 and 50 characters");
      return false;
    }

    if (editedProfile.phoneNumber && !/^[\+]?[0-9][\d]{0,10}$/.test(editedProfile.phoneNumber)) {
      showNotification("error", "Please enter a valid phone number");
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
        showNotification("success", "Profile updated successfully!");
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to update profile");
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification("error", "Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("error", "Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const response = await authService.uploadAvatar(file);
      
      if (response.success && response.data) {
        setProfile(response.data.user);
        setEditedProfile(prev => ({
          ...prev,
          avatarUrl: response.data?.avatarUrl || ""
        }));
        showNotification("success", "Avatar updated successfully!");
      }
    } catch (error: any) {
      showNotification("error", error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your personal information</p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition disabled:opacity-50"
                >
                  <X size={16} />
                  Cancel
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
                    {isUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition cursor-pointer"
                      >
                        <Camera size={16} />
                      </label>
                    </>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {profile?.fullName || "Loading..."}
                </h2>
                <p className="text-gray-600">Customer</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.fullName}
                    onChange={(e) => setEditedProfile({...editedProfile, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.fullName || "Not provided"}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                  {profile?.email || "Not provided"}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phoneNumber}
                    onChange={(e) => setEditedProfile({...editedProfile, phoneNumber: e.target.value})}
                    className="w-full px-4 py-3 border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                    {profile?.phoneNumber || "Not provided"}
                  </div>
                )}
              </div>

              {/* Account Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Account Status</span>
                    <span className="text-green-600 font-medium">{profile?.status || 'Active'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Email Verified</span>
                    <span className={`font-medium ${profile?.isEmailVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {profile?.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Member Since</span>
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
