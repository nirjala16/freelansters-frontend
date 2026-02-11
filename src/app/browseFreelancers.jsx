"use client"
import PropTypes from 'prop-types';
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Search, Star, MapPin, Briefcase, Mail, ExternalLink, AlertCircle, Users, Clock, Filter } from "lucide-react"
import userApi from "../api"

const sortOptions = [
  { label: "Recently Active", value: "recent" },
  { label: "Most Experienced", value: "experience" },
  { label: "Top Rated", value: "rating" },
]

const skillCategories = [
  "All Skills",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "Digital Marketing",
]

export default function BrowseFreelancers() {
  const [freelancers, setFreelancers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSkill, setSelectedSkill] = useState("All Skills")
  const [sortBy, setSortBy] = useState("recent")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await userApi.get("users/freelancers")
        setFreelancers(response.data.users)
      } catch (err) {
        setError("Failed to fetch freelancers", err)
        toast.error("Error loading freelancers. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchFreelancers()
  }, [])

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch =
      freelancer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.bio?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSkill =
      selectedSkill === "All Skills" ||
      freelancer.skills?.some((skill) => skill.toLowerCase().includes(selectedSkill.toLowerCase()))

    return matchesSearch && matchesSkill
  })

  const handleProfileClick = (freelancerId) => {
    navigate(`/userProfile/${freelancerId}`)
  }

  const FreelancerCard = ({ freelancer }) => {
    const hasPortfolio = freelancer.portfolio && freelancer.portfolio.length > 0
    const hasSkills = freelancer.skills && freelancer.skills.length > 0
    const rating = freelancer.rating || 0
    const location = freelancer.location || "Remote"
    const experience = freelancer.experience || "Not specified"

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} layout>
        <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:border-primary">
          <CardHeader className="relative pb-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <AvatarImage src={freelancer.profilePic} alt={freelancer.name} />
                  <AvatarFallback className="bg-primary/5 text-primary">
                    {freelancer.name?.[0]?.toUpperCase() || "F"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {freelancer.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                </div>
              </div>
              {rating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  {rating.toFixed(1)}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="mt-4">
            {freelancer.bio ? (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{freelancer.bio}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-4">No bio provided</p>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Experience:</span>
                <span>{experience}</span>
              </div>

              {hasSkills && (
                <div className="space-y-2">
                  <ScrollArea className="h-[80px]">
                    <div className="flex flex-wrap gap-1.5">
                      {freelancer.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="group-hover:bg-primary/10 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {hasPortfolio && (
                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {freelancer.portfolio.length} Portfolio {freelancer.portfolio.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between mt-auto pt-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleProfileClick(freelancer._id)}>
              <Users className="h-4 w-4" />
              View Profile
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Contact
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send a message to {freelancer.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardFooter>
        </Card>
      </motion.div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 py-16 md:px-6">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <section className="container px-4 py-16 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold tracking-tight">Browse Freelancers</h2>
        <p className="mt-4 text-xl text-muted-foreground">
          Find and collaborate with talented freelancers for your next project
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <Select value={selectedSkill} onValueChange={setSelectedSkill}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              {skillCategories.map((skill) => (
                <SelectItem key={skill} value={skill}>
                  {skill}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between mt-4">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredFreelancers.length > 0 ? (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer._id} freelancer={freelancer} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No freelancers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}


// Define prop types for FreelancerCard
BrowseFreelancers.propTypes = {
  freelancer: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Unique ID for the freelancer
    name: PropTypes.string.isRequired, // Name of the freelancer
    bio: PropTypes.string, // Optional bio
    profilePic: PropTypes.string, // Optional bio
    rating: PropTypes.number, // Optional rating
    location: PropTypes.string, // Optional location
    experience: PropTypes.string, // Optional experience
    skills: PropTypes.arrayOf(PropTypes.string), // Array of skills
    portfolio: PropTypes.array, // Optional portfolio items
  }),
};