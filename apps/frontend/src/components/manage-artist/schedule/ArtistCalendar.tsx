'use client';
import { Badge } from "@/components/lib/ui/badge";
import { Button } from "@/components/lib/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/lib/ui/card";
import { Separator } from "@/components/lib/ui/separator";
import { useEffect } from "react";

export function ArtistCalendar({ id }: { readonly id: string }) {
    useEffect(() => {
       console.log("Artist ID:", id);
    }, [id]);
  return (
    <div style={{ background: '#FFF', minHeight: '100vh', color: '#191516', fontFamily: 'Montserrat, Poppins, Arial, sans-serif', letterSpacing: '0.04em' }}>
      <div style={{ borderBottom: '2px solid #FFD9DA', background: '#FFF' }}>
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 style={{ color: '#EB638B', fontWeight: 900, fontSize: '1.4rem', fontFamily: 'Montserrat, Poppins, Arial, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Calendar</h1>
            <p style={{ color: '#AC274F', fontSize: '0.8rem' }}>Manage your bookings and schedule</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge style={{ background: '#FFD9DA', color: '#AC274F', border: '1.5px solid #EB638B', fontWeight: 700 }}>12 Pending Requests</Badge>
            <Button style={{ background: '#EB638B', color: '#fff', fontWeight: 700, borderRadius: '999px', boxShadow: '0 0 0 2px #FFD9DA', border: 'none' }}>
              <Icon icon="lucide:plus" className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>
        </div>
      </div>
      <div className="flex ">
        <div style={{ width: '66.666%', borderRight: '2px solid #FFD9DA', background: '#FFF' }}>
          <div className="flex items-center justify-between" style={{ borderBottom: '2px solid #FFD9DA', padding: '1rem 1.5rem' }}>
            <Button variant="outline" size="sm" style={{ border: '1.5px solid #EB638B', color: '#EB638B', background: 'transparent', borderRadius: '8px' }}>
              <Icon icon="lucide:chevron-left" className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <h2 style={{ color: '#AC274F', fontWeight: 700, fontSize: '1.2rem', fontFamily: 'Montserrat, Poppins, Arial, sans-serif', letterSpacing: '0.08em' }}>December 16 - 22, 2024</h2>
              <p style={{ color: '#EB638B', fontSize: '0.95rem' }}>This Week</p>
            </div>
            <Button variant="outline" size="sm" style={{ border: '1.5px solid #EB638B', color: '#EB638B', background: 'transparent', borderRadius: '8px' }}>
              <Icon icon="lucide:chevron-right" className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-8" style={{ borderBottom: '2px solid #FFD9DA', background: '#FFD9DA' }}>
              <div className="p-3 text-sm font-medium" style={{ color: '#AC274F' }}>Time</div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Mon
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>16</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Tue
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>17</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Wed
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>18</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Thu
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>19</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Fri
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>20</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Sat
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>21</span>
              </div>
              <div className="border-l p-3 text-center text-sm font-medium" style={{ color: '#EB638B', borderLeft: '2px solid #FFF' }}>
                Sun
                <br />
                <span style={{ color: '#AC274F', fontWeight: 700 }}>22</span>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">9:00 AM</div>
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-100 p-2 text-xs border-l-4 border-pink-500">
                    <div className="font-medium text-pink-700">Bridal Makeup</div>
                    <div className="text-pink-400">Sarah Johnson</div>
                  </div>
                </div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">10:00 AM</div>
                <div className="border-l" />
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-200 p-2 text-xs border-l-4 border-pink-400">
                    <div className="font-medium text-pink-700">Party Makeup</div>
                    <div className="text-pink-400">Emma Davis</div>
                  </div>
                </div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">11:00 AM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-50 p-2 text-xs border-l-4 border-pink-300">
                    <div className="font-medium text-pink-700">Photoshoot</div>
                    <div className="text-pink-400">Model Agency</div>
                  </div>
                </div>
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">12:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">1:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-100 p-2 text-xs border-l-4 border-pink-500">
                    <div className="font-medium text-pink-700">Evening Makeup</div>
                    <div className="text-pink-400">Lisa Brown</div>
                  </div>
                </div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">2:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">3:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-200 p-2 text-xs border-l-4 border-pink-400">
                    <div className="font-medium text-pink-700">Consultation</div>
                    <div className="text-pink-400">New Client</div>
                  </div>
                </div>
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">4:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
              </div>
              <div className="grid grid-cols-8 border-b">
                <div className="p-3 text-sm text-pink-400">5:00 PM</div>
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l" />
                <div className="border-l p-1">
                  <div className="rounded-md bg-pink-100 p-2 text-xs border-l-4 border-pink-500">
                    <div className="font-medium text-pink-700">Wedding Prep</div>
                    <div className="text-pink-400">Bride & Bridesmaids</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      </div>
    </div>
  );
}