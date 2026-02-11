"use client"
import PropTypes from "prop-types"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { toast } from "sonner"
import { Search, Mail, Calendar, Briefcase, AlertCircle, Clock, Users, Building2, CheckCircle2 } from "lucide-react"
import userApi from "../api"
import { format } from "date-fns"

const sortOptions = [
  { label: "Recently Joined", value: "recent" },
  { label: "Most Active", value: "active" },
  { label: "Alphabetical", value: "alpha" },
]

export default function BrowseClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await userApi.get("/users/clients")
        setClients(response.data.users)
      } catch (err) {
        setError("Failed to fetch clients", err)
        toast.error("Error loading clients. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  const sortedAndFilteredClients = clients
    .filter(
      (client) =>
        client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.bio?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.dateJoined) - new Date(a.dateJoined)
        case "active":
          return (b.postedJobs?.length || 0) - (a.postedJobs?.length || 0)
        case "alpha":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const handleProfileClick = (clientId) => {
    navigate(`/userProfile/${clientId}`)
  }

  const ClientCard = ({ client }) => {
    const joinedDate = format(new Date(client.dateJoined), "MMM yyyy")
    const postedJobsCount = client.postedJobs?.length || 0
    const activeProjectsCount = client.activeProjects?.length || 0
    const isVerified = client.email?.includes("@") // Simple verification check, adjust as needed

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} layout>
        <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:border-primary">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Avatar className="h-12 w-12 cursor-pointer border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                      <AvatarImage src={client.profilePic} alt={client.name} />
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {client.name?.[0]?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={client.profilePic} />
                        <AvatarFallback>{client.name?.[0]?.toUpperCase() || "C"}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{client.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{client.bio || "No bio provided"}</p>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Joined {joinedDate}</span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    {isVerified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <CheckCircle2 className="h-4 w-4 text-primary fill-primary/10" />
                          </TooltipTrigger>
                          <TooltipContent>Verified Client</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Member since {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {client.bio ? (
                <p className="text-sm text-muted-foreground line-clamp-2">{client.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No bio provided</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    Posted Jobs
                  </div>
                  <p className="text-2xl font-semibold">{postedJobsCount}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Active Projects
                  </div>
                  <p className="text-2xl font-semibold">{activeProjectsCount}</p>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between mt-auto pt-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleProfileClick(client._id)}>
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
                  <p>Send a message to {client.name}</p>
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
        <h2 className="text-4xl font-bold tracking-tight">Browse Clients</h2>
        <p className="mt-4 text-xl text-muted-foreground">Connect with clients and find exciting projects to work on</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
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

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-9 w-28" />
                  <Skeleton className="h-9 w-28" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : sortedAndFilteredClients.length > 0 ? (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedAndFilteredClients.map((client) => (
              <ClientCard key={client._id} client={client} />
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
            <h3 className="text-xl font-semibold mb-2">No clients found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

BrowseClients.propTypes = {
  client: PropTypes.shape({
    _id: PropTypes.string.isRequired, // Unique ID for the client
    name: PropTypes.string.isRequired, // Name of the client
    profilePic: PropTypes.string, // Optional profile picture URL
    bio: PropTypes.string, // Optional bio
    email: PropTypes.string, // Optional email for verification
    dateJoined: PropTypes.string.isRequired, // Date the client joined
    postedJobs: PropTypes.arrayOf(PropTypes.object), // Optional array of posted jobs
    activeProjects: PropTypes.arrayOf(PropTypes.object), // Optional array of active projects
  }),
};