import { Star } from "lucide-react"
import { Card, CardContent } from "../lib/ui/card"
import { testimonials } from "./data"

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">What Clients Say</h2>
            <p className="text-gray-600 text-lg">
              Real feedback from brides, models, and clients who trusted Elena with their special moments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-rose-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-rose-400 text-rose-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.image}
                    </div>
                    <div>
                      <div className="font-semibold text-black">{testimonial.name}</div>
                      <div className="text-sm text-rose-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Stats */}
          <div className="mt-16 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-rose-500">4.9</span>
                  <Star className="w-6 h-6 fill-rose-400 text-rose-400" />
                </div>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-pink-500 mb-2">247</div>
                <p className="text-gray-600">Total Reviews</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-rose-600 mb-2">98%</div>
                <p className="text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
            <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
              Join hundreds of satisfied clients who trusted Elena with their most important moments. Book your
              consultation today!
            </p>
          </div>
        </div>
      </section>
  )
}
