import React from 'react';
import { POST_STATUS } from '../../../constants';
import type { PostResponseDTO } from '@/types/community.dtos';

export type EditPostModalProps = {
  isOpen: boolean;
  post: (PostResponseDTO & { _isLiked?: boolean }) | null;
  content: string;
  onContentChange: (v: string) => void;
  imagesText: string;
  onImagesTextChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function EditPostModal({ isOpen, post, content, onContentChange, imagesText, onImagesTextChange, status, onStatusChange, onClose, onSave }: Readonly<EditPostModalProps>) {
  if (!isOpen || !post) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <button aria-label="Close edit modal" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <dialog open aria-labelledby="edit-post-title" className="relative z-[61] w-full max-w-lg bg-white rounded-xl shadow-xl p-5">
        <h3 id="edit-post-title" className="text-lg font-semibold text-gray-900 mb-4">Edit post</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="edit-post-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea id="edit-post-content" value={content} onChange={(e) => onContentChange(e.target.value)} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Update your content..." />
          </div>
          <div>
            <label htmlFor="edit-post-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select id="edit-post-status" aria-labelledby="edit-post-status" value={status} onChange={(e) => onStatusChange(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
              <option value={POST_STATUS.PUBLISHED}>Published</option>
              <option value={POST_STATUS.PRIVATE}>Private</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-post-images" className="block text-sm font-medium text-gray-700 mb-1">Images (one URL per line or comma-separated)</label>
            <textarea id="edit-post-images" value={imagesText} onChange={(e) => onImagesTextChange(e.target.value)} rows={4} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder={"https://...\nhttps://..."} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={onSave} className="px-4 py-2 text-sm rounded-md bg-rose-600 text-white hover:bg-rose-700">Save</button>
        </div>
      </dialog>
    </div>
  );
}
