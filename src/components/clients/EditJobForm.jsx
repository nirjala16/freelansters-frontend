"use client"

import { useState } from "react"
import PropTypes from "prop-types"
import { toast } from "sonner"
import userApi from "../../api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X } from "lucide-react"

const EditJobForm = ({ job, onUpdate, onCancel }) => {
  const user = JSON.parse(localStorage.getItem("session"))
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    budget: job.budget,
    skillsRequired: job.skillsRequired.join(", "),
    jobCategory: job.jobCategory,
    jobType: job.jobType,
    jobLocation: job.jobLocation,
    remoteAvailable: job.remoteAvailable,
    deadline: job.deadline?.split("T")[0] || "",
    experienceLevel: job.experienceLevel,
    additionalDetails: job.additionalDetails || "",
    budgetType: job.budgetType,
    hourlyRate: job.hourlyRate || "",
    minimumBidAmount: job.minimumBidAmount || "",
    preferredFreelancerLocation: job.preferredFreelancerLocation || "",
    priority: job.priority,
    tags: job.tags?.join(", ") || "",
    jobVisibility: job.jobVisibility,
    jobPhoto: job.jobPhoto || "",
  })
  const [jobPhoto, setJobPhoto] = useState(job.jobPhoto || "")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e) => {
    const jobImage = e.target.files[0]
    if (!jobImage) {
      toast.error("Please upload an image")
      return
    }
    setIsUploading(true)
    setUploadProgress(0)
    const data = new FormData()
    data.append("file", jobImage)
    data.append("upload_preset", "freelansters")
    data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      })
      const interval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          if (prevProgress >= 90) {
            clearInterval(interval)
            return prevProgress
          }
          return prevProgress + 10
        })
      }, 300)
      const uploadImageUrl = await res.json()
      clearInterval(interval)
      setUploadProgress(100)
      setJobPhoto(uploadImageUrl.url)
      setFormData((prevJob) => ({
        ...prevJob,
        jobPhoto: uploadImageUrl.url,
      }))
    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      toast.error("Error uploading job photo")
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await userApi.put(
        `/jobs/job/${job._id}`,
        {
          title: formData.title,
          description: formData.description,
          budget: Number.parseFloat(formData.budget),
          skillsRequired: formData.skillsRequired.split(",").map((s) => s.trim()),
          jobCategory: formData.jobCategory,
          jobType: formData.jobType,
          jobLocation: formData.jobLocation,
          remoteAvailable: formData.remoteAvailable,
          deadline: formData.deadline || null,
          experienceLevel: formData.experienceLevel,
          additionalDetails: formData.additionalDetails || null,
          budgetType: formData.budgetType,
          hourlyRate: formData.budgetType === "hourly" ? Number.parseFloat(formData.hourlyRate) : null,
          minimumBidAmount: Number.parseFloat(formData.minimumBidAmount) || null,
          preferredFreelancerLocation: formData.preferredFreelancerLocation || null,
          priority: formData.priority,
          tags: formData.tags.split(",").map((tag) => tag.trim()) || [],
          jobVisibility: formData.jobVisibility,
          jobPhoto: formData.jobPhoto || null,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      )

      if (response.data.success) {
        onUpdate(response.data.job)
        toast.success("Job updated successfully!")
      } else {
        toast.error("Failed to update job: " + response.data.message)
      }
    } catch (error) {
      toast.error("Error updating job: " + error.message)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-h-[80vh] overflow-y-auto p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update the basic details of your job posting</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobCategory">Job Category</Label>
                <Input
                  id="jobCategory"
                  name="jobCategory"
                  value={formData.jobCategory}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Specify the requirements and conditions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={formData.jobType} onValueChange={(value) => handleSelectChange("jobType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) => handleSelectChange("experienceLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry-level">Entry-Level</SelectItem>
                    <SelectItem value="mid-level">Mid-Level</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobLocation">Job Location</Label>
                <Input
                  id="jobLocation"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleChange} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remoteAvailable"
                checked={formData.remoteAvailable}
                onCheckedChange={(checked) => handleSelectChange("remoteAvailable", checked)}
              />
              <Label htmlFor="remoteAvailable">Remote Work Available</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Information</CardTitle>
            <CardDescription>Set your budget and payment terms</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget Type</Label>
                <Select value={formData.budgetType} onValueChange={(value) => handleSelectChange("budgetType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">{formData.budgetType === "hourly" ? "Hourly Rate" : "Budget"}</Label>
                <Input
                  id="budget"
                  name={formData.budgetType === "hourly" ? "hourlyRate" : "budget"}
                  type="number"
                  value={formData.budgetType === "hourly" ? formData.hourlyRate : formData.budget}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumBidAmount">Minimum Bid Amount</Label>
              <Input
                id="minimumBidAmount"
                name="minimumBidAmount"
                type="number"
                value={formData.minimumBidAmount}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills and Tags</CardTitle>
            <CardDescription>Specify required skills and relevant tags</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="skillsRequired">Required Skills</Label>
              <Input
                id="skillsRequired"
                name="skillsRequired"
                value={formData.skillsRequired}
                onChange={handleChange}
                placeholder="Enter skills separated by commas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Add any extra details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details</Label>
              <Textarea
                id="additionalDetails"
                name="additionalDetails"
                value={formData.additionalDetails}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Visibility</Label>
                <Select
                  value={formData.jobVisibility}
                  onValueChange={(value) => handleSelectChange("jobVisibility", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredFreelancerLocation">Preferred Freelancer Location</Label>
              <Input
                id="preferredFreelancerLocation"
                name="preferredFreelancerLocation"
                value={formData.preferredFreelancerLocation}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Photo</CardTitle>
            <CardDescription>Upload a photo for your job posting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="jobPhoto" />
                <Label
                  htmlFor="jobPhoto"
                  className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Upload className="h-4 w-4" />
                  Choose Photo
                </Label>
                {jobPhoto && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setJobPhoto("")
                      setFormData((prev) => ({ ...prev, jobPhoto: "" }))
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Photo
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-500">Uploading... {uploadProgress}%</p>
                  </motion.div>
                )}

                {jobPhoto && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-32 h-32"
                  >
                    <img
                      src={jobPhoto || "/placeholder.svg"}
                      alt="Job Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading} className="w-full sm:w-auto">
            {isUploading ? "Uploading..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

EditJobForm.propTypes = {
  job: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    budget: PropTypes.number.isRequired,
    skillsRequired: PropTypes.arrayOf(PropTypes.string).isRequired,
    jobCategory: PropTypes.string.isRequired,
    jobType: PropTypes.string.isRequired,
    jobLocation: PropTypes.string.isRequired,
    remoteAvailable: PropTypes.bool.isRequired,
    deadline: PropTypes.string,
    experienceLevel: PropTypes.string.isRequired,
    additionalDetails: PropTypes.string,
    budgetType: PropTypes.string.isRequired,
    hourlyRate: PropTypes.number,
    minimumBidAmount: PropTypes.number,
    preferredFreelancerLocation: PropTypes.string,
    priority: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    jobVisibility: PropTypes.string.isRequired,
    jobPhoto: PropTypes.string,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default EditJobForm

