import { Star, MapPin, Calendar, MessageCircle, User, Check } from "lucide-react"
import { Badge } from "../lib/ui/badge"
import { Button } from "../lib/ui/button"
import { ArtistDetail } from "@/types/artist.dto"
import { useAuthCheck } from "../../utils/auth"

export default function HeroSection({muaDetail,handleBook}:{muaDetail:ArtistDetail, handleBook?: (serviceId?: string) => void}) {
  const { checkAuthAndExecute } = useAuthCheck();

  const handleBookNow = () => {
    checkAuthAndExecute(() => {
      if (handleBook) {
        handleBook();
      }
    });
  };

  return (
     <section id="about" className="bg-gradient-to-br from-rose-50 to-pink-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row">
              {/* Profile Image */}
              <div id="profile_image" className="lg:w-[26rem] p-6">
                <div className="relative">
                  {muaDetail.avatarUrl ? (
                    <img
                        src={muaDetail.avatarUrl}
                        alt={`${muaDetail.fullName}'s profile picture`}
                        className="w-full h-[22rem] object-cover rounded-lg border-2 border-rose-200"
                    />
                    ) : (
                    <div className="w-full h-[22rem] bg-rose-100 rounded-lg flex items-center justify-center border-2 border-rose-200">
                        <User className="w-20 h-20 text-rose-300" />
                    </div>
                    )}

                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-fit">
                    <div className="bg-white border-2 border-rose-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-md whitespace-nowrap">
                      <Star className="w-4 h-4 fill-rose-400 text-rose-400" />
                      <span className="font-semibold text-black">{muaDetail.ratingAverage}</span>
                      <span className="text-rose-600 text-sm">({muaDetail.feedbackCount}) reviews</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 p-6 lg:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-rose-500 text-white hover:bg-rose-600">
                    <Check className="w-3 h-3 mr-1" />
                    Verified Professional
                  </Badge>
                  <Badge variant="outline" className="border-rose-300 text-rose-700">
                    Licensed Artist
                  </Badge>
                  <Badge className="bg-pink-500 text-white hover:bg-pink-600">Available Today</Badge>
                </div>

                <h1 className="text-3xl font-bold text-black mb-2">{muaDetail.fullName}</h1>
                <p className="text-rose-600 text-lg mb-4">Professional Makeup Artist & Beauty Specialist</p>

                <div className="flex items-center gap-2 text-rose-700 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{muaDetail.location}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-500 mb-1">{muaDetail.experienceYears ?? 0}+</div>
                    <div className="text-sm text-black">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-500 mb-1">{muaDetail.bookingCount}+</div>
                    <div className="text-sm text-black">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-rose-600 mb-1">15+</div>
                    <div className="text-sm text-black">Awards Won</div>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-black mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Bridal Makeup", "Editorial", "Special Events", "Photoshoot", "Color Theory", "Airbrush"].map(
                      (specialty) => (
                        <Badge
                          key={specialty}
                          variant="outline"
                          className="border-rose-300 text-rose-700 hover:bg-rose-50"
                        >
                          {specialty}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>

                {/* About */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-black mb-4">About Elena</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {muaDetail.bio?.length!==0 ?(muaDetail.bio):
                    "With over 8 years of experience in the beauty industry, Elena specializes in creating stunning looks"+
                    "that enhance natural beauty. From intimate bridal sessions to high-fashion editorial shoots, she"+
                    "brings artistry and professionalism to every appointment. Her goal is to make clients feel confident"+
                    "and beautiful while ensuring a comfortable, enjoyable experience."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                  onClick={handleBookNow}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-rose-300 text-rose-700 hover:bg-rose-50 bg-transparent"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>

              </div>
              
            </div>
        </div>
      </section>
  )
}
