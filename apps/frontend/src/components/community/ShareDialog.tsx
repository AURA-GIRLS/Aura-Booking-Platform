'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Copy, X, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/lib/ui/dialog'
import { Button } from '@/components/lib/ui/button'
import { Input } from '@/components/lib/ui/input'

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  postId: string
}

export default function ShareDialog({ isOpen, onClose, postId }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Generate share link
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/user/community?post=${postId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  // Function to clean URL when dialog closes
  const handleClose = () => {
    // If current URL has the post parameter and it matches the shared post, remove it
    if (searchParams?.get('post') === postId) {
      try {
        const sp = new URLSearchParams(searchParams.toString())
        sp.delete('post')
        const newUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname
        router.replace(newUrl as never, { scroll: false })
      } catch (error) {
        console.error('Failed to update URL:', error)
      }
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-rose-100 shadow-lg">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Share post
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Share link section */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={shareLink}
                readOnly
                className="bg-gray-50 border-gray-200 text-sm text-gray-600 rounded-lg focus:border-rose-300 focus:ring-rose-200"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <Button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copied
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
              disabled={copied}
            >
              {copied ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Copied</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy link</span>
                </div>
              )}
            </Button>
          </div>

          {/* Optional: Social media sharing buttons */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">Share on social media</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=Check%20out%20this%20post`
                  window.open(twitterUrl, '_blank', 'noopener,noreferrer')
                }}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Twitter
              </button>
              <button
                onClick={() => {
                  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`
                  window.open(facebookUrl, '_blank', 'noopener,noreferrer')
                }}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                Facebook
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}