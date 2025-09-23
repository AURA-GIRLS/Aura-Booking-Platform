"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/lib/ui/dialog";
import { Button } from "@/components/lib/ui/button";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
}

export default function DeleteConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Delete Comment",
    description = "Are you sure you want to delete this comment? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
}: DeleteConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 mt-6">
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="px-4 py-2"
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2"
                    >
                        {confirmText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}