"use client";

import { useState } from "react";
import { X, Upload, Loader2, Hash, Plus } from "lucide-react";
import type {
  Portfolio,
  CreatePortfolioInput,
  UpdatePortfolioInput,
  PortfolioCategory,
  PortfolioImage,
} from "@/types/portfolio";
import {
  createPortfolio,
  updatePortfolio,
  uploadPortfolioImage,
} from "@/lib/api/portfolio";
import { PORTFOLIO_CATEGORY_LABELS } from "@/constants/index";

interface PortfolioFormModalProps {
  portfolio: Portfolio | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES: Array<{ value: PortfolioCategory; label: string }> = [
  { value: "BRIDAL" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.BRIDAL },
  { value: "PARTY" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.PARTY },
  { value: "WEDDING_GUEST" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.WEDDING_GUEST },
  { value: "GRADUATION" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.GRADUATION },
  { value: "PROM" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.PROM },
  { value: "DAILY" as PortfolioCategory, label: PORTFOLIO_CATEGORY_LABELS.DAILY },
];

export default function PortfolioFormModal({
  portfolio,
  onClose,
  onSuccess,
}: PortfolioFormModalProps) {
  const isEdit = !!portfolio;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: PortfolioCategory;
    coverFile: File | null;
    coverPreview: string;
  }>(() => ({
    title: portfolio?.title || "",
    description: portfolio?.description || "",
    category: (portfolio?.category || "BRIDAL") as PortfolioCategory,
    coverFile: null,
    coverPreview: portfolio?.images?.[0]?.url || "",
  }));

  // Tags state - giống community
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(portfolio?.tags || []);

  // Tag handlers - giống community
  const sanitizeTag = (raw: string) => raw.replace(/^#+/, '').trim().toLowerCase();
  
  const handleAddTag = () => {
    const cleaned = sanitizeTag(tagInput);
    if (!cleaned) return;
    if (tags.some(t => t.toLowerCase() === cleaned)) {
      alert("Tag already exists");
      return;
    }
    if (tags.length >= 10) {
      alert("Maximum 10 tags allowed");
      return;
    }
    setTags([...tags, cleaned]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t.toLowerCase() !== tagToRemove.toLowerCase()));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    // Need either a newly selected file or an existing image in edit mode
    const hasExistingImage = !!portfolio?.images?.length;
    if (!formData.coverFile && !hasExistingImage) {
      alert("Please choose a cover image to upload");
      return;
    }

    setLoading(true);
    try {
      let uploaded: PortfolioImage | null = null;
      if (formData.coverFile) {
        uploaded = await uploadPortfolioImage(formData.coverFile);
      }

      if (isEdit && portfolio) {
        const updateData: UpdatePortfolioInput = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: tags, // Add tags
          images: uploaded ? [uploaded] : portfolio.images,
        };
        await updatePortfolio(portfolio._id, updateData);
      } else {
        const createData: CreatePortfolioInput = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          tags: tags, // Add tags
          images: uploaded ? [uploaded] : [],
          isPublished: true,
        };
        if (!createData.images.length) {
          throw new Error("Image upload failed or no image provided");
        }
        await createPortfolio(createData);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save portfolio:", error);
      alert(error?.message || "Failed to save portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Portfolio" : "Add New Portfolio"}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Romantic Garden Wedding"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as PortfolioCategory })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your work..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Tags Input - giống community */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags <span className="text-gray-500 text-xs">(Max 10)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="e.g., natural, glam, soft..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  disabled={tags.length >= 10}
                />
              </div>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 10}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Press Enter or click Add to add a tag. Tags help users find your work.
            </p>

            {/* Selected Tags Display */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 text-sm rounded-full border border-pink-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-pink-900 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                <span>Choose image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    const preview = file
                      ? URL.createObjectURL(file)
                      : formData.coverPreview;
                    setFormData({ ...formData, coverFile: file, coverPreview: preview });
                  }}
                />
              </label>
              {formData.coverFile && (
                <span className="text-sm text-gray-600">{formData.coverFile.name}</span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">PNG/JPEG/WebP up to 5MB</p>

            {/* Image Preview */}
            {formData.coverPreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={formData.coverPreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Saving..." : isEdit ? "Update Portfolio" : "Create Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}