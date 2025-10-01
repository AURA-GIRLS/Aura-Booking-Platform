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
import { Icon } from "@iconify/react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: NotificationType;
    title: string;
    description: string;
    buttonText?: string;
}

const typeConfig = {
    success: {
        icon: "lucide:check-circle",
        iconClass: "text-green-600",
        bgClass: "bg-green-100",
        buttonClass: "bg-green-600 hover:bg-green-700"
    },
    error: {
        icon: "lucide:x-circle",
        iconClass: "text-red-600",
        bgClass: "bg-red-100",
        buttonClass: "bg-red-600 hover:bg-red-700"
    },
    warning: {
        icon: "lucide:alert-circle",
        iconClass: "text-amber-600",
        bgClass: "bg-amber-100",
        buttonClass: "bg-amber-600 hover:bg-amber-700"
    },
    info: {
        icon: "lucide:info",
        iconClass: "text-blue-600",
        bgClass: "bg-blue-100",
        buttonClass: "bg-blue-600 hover:bg-blue-700"
    }
};

export default function NotificationDialog({
    open,
    onOpenChange,
    type,
    title,
    description,
    buttonText = "OK",
}: NotificationDialogProps) {
    const config = typeConfig[type];

    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-md text-center">
                <DialogHeader className="text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 ${config.bgClass} rounded-full flex items-center justify-center`}>
                        <Icon 
                            icon={config.icon} 
                            className={`w-8 h-8 ${config.iconClass}`} 
                        />
                    </div>
                    <DialogTitle className="text-xl font-semibold">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6">
                    <Button 
                        onClick={handleClose}
                        className={`${config.buttonClass} text-white px-6 py-2 w-full`}
                    >
                        {buttonText}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}