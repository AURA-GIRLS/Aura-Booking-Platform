"use client"
import { Badge } from "@/components/lib/ui/badge"
import type React from "react"

import { Button } from "@/components/lib/ui/button"
import { Icon } from "@iconify/react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/lib/ui/card"
import { Separator } from "@/components/lib/ui/separator"
import { useEffect, useState, useRef } from "react"
export function SlotDetail() {
  return (
     <div className="w-1/3 flex flex-col">
          <div className="flex-1 p-6">
            <Card className="border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Icon icon="lucide:calendar" className="h-5 w-5 text-pink-500" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-pink-700">Bridal Makeup</h3>
                  <p className="text-sm text-pink-400">Monday, December 16, 2024</p>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Client:</span>
                    <span className="text-sm font-medium text-pink-700">Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time:</span>
                    <span className="text-sm font-medium text-pink-700">9:00 AM - 11:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Service:</span>
                    <span className="text-sm font-medium text-pink-700">Bridal Makeup</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Price:</span>
                    <span className="text-sm font-medium text-pink-700">$150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-pink-500 text-white">Confirmed</Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Notes:</p>
                  <p className="text-sm text-pink-400">
                    Client requested natural look with focus on eyes. Wedding theme is vintage.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:edit" className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" className="flex-1 bg-pink-500 hover:bg-pink-600 text-white border-none">
                    <Icon icon="lucide:x" className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="border-t bg-pink-100 p-6 rounded-br-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-pink-600">Pending Requests</h3>
              <Badge className="bg-pink-200 text-pink-700 border-pink-300" variant="secondary">3 New</Badge>
            </div>
            <div className="space-y-3">
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Jessica Wilson</p>
                    <p className="text-xs text-pink-400">Party Makeup - Dec 20, 2:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $80
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Maria Garcia</p>
                    <p className="text-xs text-pink-400">Photoshoot - Dec 21, 10:00 AM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $120
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
              <Card className="p-4 border-pink-200">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-pink-700">Anna Thompson</p>
                    <p className="text-xs text-pink-400">Evening Event - Dec 19, 4:00 PM</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-pink-300 text-pink-500">
                    $100
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-xs bg-pink-500 hover:bg-pink-600 text-white">
                    <Icon icon="lucide:check" className="mr-1 h-3 w-3" />
                    Accept
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs border-pink-300 text-pink-500 hover:bg-pink-100">
                    <Icon icon="lucide:x" className="mr-1 h-3 w-3" />
                    Decline
                  </Button>
                </div>
              </Card>
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm text-pink-600 hover:bg-pink-100">
              View All Requests
              <Icon icon="lucide:arrow-right" className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
  )
}