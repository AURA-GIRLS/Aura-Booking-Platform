import { Camera } from "lucide-react"
import { Card, CardContent } from "../lib/ui/card"
import { Button } from "../lib/ui/button"
import { Badge } from "../lib/ui/badge"
import { portfolioItems } from "./data"

export default function PortfolioSection() {
  return (
       <section id="portfolio" className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">My Portfolio</h2>
            <p className="text-gray-600 text-lg">
              Explore my latest work and see the artistry and attention to detail that showcases the artistry and skill
              behind every look
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {["Bridal", "Editorial", "Events", "Before & After"].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="border-rose-300 text-rose-700 hover:bg-rose-100 bg-transparent"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolioItems.map((item, index) => (
              <Card key={index} className="overflow-hidden border-rose-200 hover:shadow-lg transition-shadow">
                <div className="h-64 bg-rose-100 flex items-center justify-center border-b border-rose-200">
                  <Camera className="w-16 h-16 text-rose-300" />
                </div>
                <CardContent className="p-6">
                  <Badge className="bg-rose-500 text-white mb-3">{item.category}</Badge>
                  <h3 className="font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">View Full Portfolio</Button>
          </div>
        </div>
      </section>
  )
}
