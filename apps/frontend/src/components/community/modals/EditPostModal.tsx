"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { POST_STATUS } from "../../../constants";
import type { PostResponseDTO } from "@/types/community.dtos";
import { UploadService, type ResourceType } from "@/services/upload";
import { CommunityService } from "@/services/community";
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { initSocket} from "@/config/socket";
import ServiceSearchDialog from '../ServiceSearchDialog';
import { ServiceResponseDTO } from '@/types/service.dtos';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/lib/ui/dialog";
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator
} from "@/components/lib/ui/command";
import { Hash, Check, Plus, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/lib/ui/select";
import { Label } from "@/components/lib/ui/label";

export type EditPostModalProps = {
    isOpen: boolean;
    post: (PostResponseDTO & { _isLiked?: boolean }) | null;
    onClose: () => void;
    onUpdated?: (updated: PostResponseDTO) => void;
};

export default function EditPostModal({
    isOpen,
    post,
    onClose,
    onUpdated,
}: Readonly<EditPostModalProps>) {
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState("");
    const [status, setStatus] = useState<string>(POST_STATUS.PUBLISHED);
    const [imagesText, setImagesText] = useState("");
    const urls = useMemo(
        () => imagesText.split(/[\n,]/).map((s) => s.trim()).filter(Boolean),
        [imagesText]
    );

    // Tags state
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [tagQuery, setTagQuery] = useState("");
    const [allTags, setAllTags] = useState<
        Array<{ _id: string; name: string; slug: string }>
    >([]);
    const [tagsLoading, setTagsLoading] = useState(false);

    // Services state
    const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
    const [selectedServices, setSelectedServices] = useState<ServiceResponseDTO[]>([]);

    // Hydrate state from post
    useEffect(() => {
        if (isOpen && post) {
            setContent(post.content || "");
            setStatus(post.status || POST_STATUS.PUBLISHED);
            const urls = Array.isArray((post as any).media)
                ? ((post as any).media as any[])
                    .map((m) => m?.url ?? "")
                    .filter(Boolean)
                : [];
            setImagesText(urls.join("\n"));
            setSelectedTags(
                Array.isArray((post as any).tags) ? ((post as any).tags as string[]) : []
            );
            setSelectedServices(
                Array.isArray((post as any).attachedServices) ? ((post as any).attachedServices as ServiceResponseDTO[]) : []
            );
        }
    }, [isOpen, post]);

    // Fetch tags
    useEffect(() => {
        const fetchTags = async () => {
            try {
                setTagsLoading(true);
                const res = await CommunityService.getAllTags();
                if ((res as any)?.success && Array.isArray(res.data)) {
                    setAllTags(res.data as any);
                }
            } catch (e) {
                console.error("Failed to fetch tags", e);
            } finally {
                setTagsLoading(false);
            }
        };
        if (tagDialogOpen && allTags.length === 0 && !tagsLoading) {
            fetchTags();
        }
    }, [tagDialogOpen, allTags.length, tagsLoading]);

    // Helpers
    const isVideoUrl = useCallback(
        (u: string) => /\.(mp4|webm|ogg|mov|m4v)(?:\?|$)/i.test(u.split("?")[0]),
        []
    );

    const removeUrlAt = useCallback(
        (idx: number) => {
            const next = urls.filter((_, i) => i !== idx);
            setImagesText(next.join("\n"));
        },
        [urls]
    );

    const handlePickFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const uploads = await Promise.all(
                Array.from(files).map(async (file) => {
                    let guessedType: ResourceType = "raw";
                    if (file.type.startsWith("video/")) guessedType = "video";
                    else if (file.type.startsWith("image/")) guessedType = "image";
                    const res = await UploadService.uploadFile(file, {
                        resourceType: guessedType,
                        folder: "community/posts",
                    });
                    return res.success && res.data ? res.data.url : null;
                })
            );
            const newUrls = uploads.filter((u): u is string => !!u);
            if (newUrls.length) {
                const prefix = imagesText ? imagesText.trim() + "\n" : "";
                setImagesText(prefix + newUrls.join("\n"));
            }
        } catch (e) {
            console.error("Upload failed", e);
        } finally {
            setUploading(false);
        }
    };

    const sanitizeTag = (raw: string) => raw.replace(/^#+/, "").trim();

    const isSelected = useCallback(
        (name: string) => {
            const n = name.toLowerCase();
            return selectedTags.some((t) => t.toLowerCase() === n);
        },
        [selectedTags]
    );

    const toggleTag = useCallback((name: string) => {
        const cleaned = sanitizeTag(name);
        if (!cleaned) return;
        setSelectedTags((prev) => {
            const exists = prev.some(
                (t) => t.toLowerCase() === cleaned.toLowerCase()
            );
            return exists
                ? prev.filter((t) => t.toLowerCase() !== cleaned.toLowerCase())
                : [...prev, cleaned];
        });
    }, []);

    const removeTag = useCallback((name: string) => {
        setSelectedTags((prev) =>
            prev.filter((t) => t.toLowerCase() !== name.toLowerCase())
        );
    }, []);

    const guessTypeFromUrl = (u: string): ResourceType => {
        const base = u.split("?")[0].toLowerCase();
        if (/(\.mp4|\.webm|\.ogg|\.mov|\.m4v)$/i.test(base))
            return "video" as ResourceType;
        if (
            /(\.jpg|\.jpeg|\.png|\.gif|\.webp|\.svg|\.bmp|\.heic|\.heif|\.avif)$/i.test(
                base
            )
        )
            return "image" as ResourceType;
        return "raw" as ResourceType;
    };

    const handleSave = async () => {
        if (!post) return;
        setSaving(true);
        const media: { type: ResourceType; url: string }[] = urls.map((url) => ({
            type: guessTypeFromUrl(url),
            url,
        }));
        try {
            // Fire-and-forget: rely on realtime 'postUpdated' to reflect changes
            await CommunityService.updatePost(post._id, {
                content,
                media,
                tags: selectedTags,
                status:
                    status === "PUBLISHED" ? POST_STATUS.PUBLISHED : POST_STATUS.PRIVATE,
                attachedServices: selectedServices.map(s => s._id),
            });
        } catch (e) {
            console.error("Failed to update post", e);
        } finally {
            setSaving(false);
        }
    };

    // Close modal on realtime events affecting this post
    useEffect(() => {
        if (!isOpen || !post) return;
        const onPostUpdated = (payload: any) => {
            try {
                if (payload && payload._id === post._id) {
                    onUpdated?.(payload as PostResponseDTO); // optional: allow parent to react if desired
                    onClose();
                }
            } catch {/* ignore */}
        };
        const onPostDeleted = (payload: any) => {
            try {
                if (payload && payload.postId === post._id) {
                    onClose();
                }
            } catch {/* ignore */}
        };
        initSocket().on('postUpdated', onPostUpdated as any);
        initSocket().on('postDeleted', onPostDeleted as any);
        return () => {
            initSocket().off('postUpdated', onPostUpdated as any);
            initSocket().off('postDeleted', onPostDeleted as any);
        };
    }, [isOpen, post, onClose, onUpdated]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-foreground sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit post</DialogTitle>
                    <DialogDescription>Update your post content</DialogDescription>
                </DialogHeader>

                {/* Content */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="edit-post-content" className="block text-sm font-medium mb-1">Content</label>
                        <textarea
                            id="edit-post-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="Update your content..."
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="block text-sm font-medium mb-1">Tags</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setTagDialogOpen(true)}
                            >
                                <Hash className="w-4 h-4 mr-1" /> Edit tags
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setServiceDialogOpen(true)}
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6a2 2 0 00-2 2v6.002" />
                                </svg>
                                Edit services
                            </Button>
                        </div>
                        {selectedTags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {selectedTags.map((t) => (
                                    <Badge key={t} variant="secondary" className="flex items-center gap-1">
                                        #{t}
                                        <button
                                            title="Remove tag"
                                            type="button"
                                            onClick={() => removeTag(t)}
                                            className="ml-1 hover:text-foreground/80"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Selected services */}
                        {selectedServices.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="text-sm text-gray-600 font-medium">
                                    Selected services ({selectedServices.length}):
                                </div>
                                <div className="space-y-2">
                                    {selectedServices.map((service) => (
                                        <div key={service._id} className="flex items-center space-x-3 p-2 bg-rose-50 rounded-lg border border-rose-200">
                                            {service.images && service.images.length > 0 ? (
                                                <img
                                                    src={service.images[0]}
                                                    alt={service.name}
                                                    className="w-10 h-10 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-semibold">
                                                        {service.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{service.name}</p>
                                                <p className="text-xs text-gray-600">by {service.muaName}</p>
                                            </div>
                                            <button
                                                type="button"
                                                title={`Remove ${service.name}`}
                                                onClick={() => setSelectedServices(prev => prev.filter(s => s._id !== service._id))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <Label className="block text-sm font-medium mb-1">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value)}
                        >
                            <SelectTrigger className="w-[180px] bg-white text-sm text-gray-500 border-none focus:outline-none ">
                                <SelectValue placeholder="Select privacy" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem  value={POST_STATUS.PUBLISHED}>Public</SelectItem>
                                <SelectItem value={POST_STATUS.PRIVATE}>Only Me</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Media */}
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="block text-sm font-medium mb-1">Media</span>
                            <label className="text-rose-600 text-sm cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={(e) => handlePickFiles(e.target.files)}
                                />
                                {uploading ? "Uploading..." : "Add files"}
                            </label>
                        </div>
                        {urls.length > 0 && (
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-auto pr-1">
                                {urls.map((u, i) => (
                                    <div
                                        key={`${u}-${i}`}
                                        className="relative group rounded-lg overflow-hidden border bg-gray-50"
                                    >
                                        {isVideoUrl(u) ? (
                                            <video
                                                src={u}
                                                className="w-full h-24 object-cover bg-black"
                                                controls
                                                preload="metadata"
                                            >
                                                <track kind="captions" />
                                            </video>
                                        ) : (
                                            <img
                                                src={u}
                                                alt={`media-${i}`}
                                                className="w-full h-24 object-cover"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeUrlAt(i)}
                                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={uploading || saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Tag Command Dialog */}
            <CommandDialog
                className="z-[70] bg-white text-foreground" // đảm bảo cao hơn
                open={tagDialogOpen}
                onOpenChange={(o) => {
                    setTagDialogOpen(o);
                    setTagQuery("");
                }}
            >
                <CommandInput
                    placeholder="Search or create tag..."
                    value={tagQuery}
                    onValueChange={setTagQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {sanitizeTag(tagQuery)
                            ? `No tags found. Press Enter to create “${sanitizeTag(tagQuery)}”.`
                            : "No tags found."}
                    </CommandEmpty>

                    {allTags.length > 0 && (
                        <CommandGroup heading="All tags">
                            {allTags.map((t) => {
                                const name = (t as any).name || (t as any).slug;
                                const active = isSelected(name);
                                return (
                                    <CommandItem
                                        key={(t as any)._id}
                                        value={name}
                                        onSelect={(val) => toggleTag(val)}
                                    >
                                        <span className="mr-2">#</span>
                                        <span className="truncate">{name}</span>
                                        {active && <Check className="ml-auto h-4 w-4" />}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    )}

                    <CommandSeparator />

                    {sanitizeTag(tagQuery) &&
                        !isSelected(sanitizeTag(tagQuery)) &&
                        !allTags.some(
                            (t) =>
                                (((t as any).name || (t as any).slug) as string).toLowerCase() ===
                                sanitizeTag(tagQuery).toLowerCase()
                        ) && (
                            <CommandGroup heading="Create">
                                <CommandItem
                                    value={sanitizeTag(tagQuery)}
                                    onSelect={(val) => {
                                        toggleTag(val);
                                        setTagQuery("");
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create “{sanitizeTag(tagQuery)}”
                                </CommandItem>
                            </CommandGroup>
                        )}
                </CommandList>
            </CommandDialog>

            {/* Service Search Dialog */}
            <ServiceSearchDialog
                open={serviceDialogOpen}
                onOpenChange={setServiceDialogOpen}
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
            />
        </Dialog>
    );
}
