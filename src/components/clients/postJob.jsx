import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import api from "../../api";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
const PostJobForm = () => {
  const user = JSON.parse(localStorage.getItem("session"));
  const userId = user.user._id;
  const [jobPhoto, setJobPhoto] = useState(""); // State to store profile picture URL
  const handleFileChange = async (e) => {
    const jobPhoto = e.target.files[0];
    if (!jobPhoto) {
      toast.error("Please upload a job image");
      return;
    }

    const data = new FormData();
    data.append("file", jobPhoto);
    data.append("upload_preset", "freelansters");
    data.append("cloud_name", "dijuifjai");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dijuifjai/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      const uploadImageUrl = await res.json();
      setJobPhoto(uploadImageUrl.url);
      setNewJob((prevJob) => ({
        ...prevJob,
        jobPhoto: uploadImageUrl.url,
      }));
      console.log(uploadImageUrl.url); // Check if the URL is logged here
    } catch (error) {
      toast.error("Error uploading Job image");
      console.error(error);
    }
  };

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    budget: "",
    skillsRequired: [],
    jobCategory: "",
    jobType: "full-time",
    jobLocation: "",
    remoteAvailable: true,
    deadline: "",
    experienceLevel: "entry-level",
    additionalDetails: "",
    budgetType: "fixed",
    hourlyRate: "",
    minimumBidAmount: "",
    preferredFreelancerLocation: "",
    priority: "medium",
    jobVisibility: "public",
    tags: [],
    jobPhoto: jobPhoto,
  });

  const [selectedDate, setSelectedDate] = useState(null);

  const handleFieldChange = (field, value) => {
    setNewJob({
      ...newJob,
      [field]: value,
    });
  };

  console.log(jobPhoto);
  const handleSkillsChange = (skills) => {
    setNewJob({
      ...newJob,
      skillsRequired: skills.split(",").map((skill) => skill.trim()),
    });
  };

  const handleTagsChange = (tags) => {
    setNewJob({
      ...newJob,
      tags: tags.split(",").map((tag) => tag.trim()),
    });
  };

  const validateForm = () => {
    const requiredFields = [
      "title",
      "description",
      "skillsRequired",
      "jobCategory",
      "jobType",
      "jobLocation",
    ];

    for (let field of requiredFields) {
      if (
        !newJob[field] ||
        (Array.isArray(newJob[field]) && newJob[field].length === 0)
      ) {
        return field;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const missingField = validateForm();

    if (missingField) {
      console.log(newJob);
      toast.error(`Please fill in the ${missingField} field.`);
      return;
    }

    // Type checks for each field
    if (typeof newJob.title !== "string" || newJob.title.trim() === "") {
      toast.error("Job title cannot be empty.");
      return;
    }

    if (
      typeof newJob.description !== "string" ||
      newJob.description.trim() === ""
    ) {
      toast.error("Job description cannot be empty.");
      return;
    }

    if (
      !Array.isArray(newJob.skillsRequired) ||
      newJob.skillsRequired.length === 0
    ) {
      toast.error("Skills required cannot be empty.");
      return;
    }

    if (
      typeof newJob.jobCategory !== "string" ||
      newJob.jobCategory.trim() === ""
    ) {
      toast.error("Job category cannot be empty.");
      return;
    }

    if (
      typeof newJob.jobType !== "string" ||
      !["full-time", "part-time", "contract", "temporary"].includes(
        newJob.jobType
      )
    ) {
      toast.error(
        "Job type must be one of: full-time, part-time, contract, temporary."
      );
      return;
    }
    if (newJob.deadline) {
      const deadlineDate = new Date(newJob.deadline);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Set time to midnight for comparison

      if (isNaN(deadlineDate.getTime())) {
        toast.error("Deadline must be a valid date.");
        return;
      }

      if (deadlineDate < currentDate) {
        toast.error("Deadline cannot be earlier than today.");
        return;
      }
    }

    if (
      newJob.budgetType === "fixed" &&
      (isNaN(Number(newJob.budget)) || Number(newJob.budget) <= 0)
    ) {
      toast.error("Budget must be a positive number.");
      return;
    }

    if (
      newJob.budgetType === "hourly" &&
      (isNaN(Number(newJob.hourlyRate)) || Number(newJob.hourlyRate) <= 0)
    ) {
      toast.error("Hourly rate must be a positive number.");
      return;
    }

    if (
      newJob.minimumBidAmount &&
      (isNaN(Number(newJob.minimumBidAmount)) ||
        Number(newJob.minimumBidAmount) <= 0)
    ) {
      toast.error("Minimum bid amount must be a positive number.");
      return;
    }

    if (typeof newJob.preferredFreelancerLocation !== "string") {
      toast.error("Preferred freelancer location must be a string.");
      return;
    }

    if (
      typeof newJob.priority !== "string" ||
      !["low", "medium", "high"].includes(newJob.priority)
    ) {
      toast.error("Priority must be one of: low, medium, high.");
      return;
    }

    if (
      typeof newJob.jobVisibility !== "string" ||
      !["public", "private", "hidden"].includes(newJob.jobVisibility)
    ) {
      toast.error("Job visibility must be one of: public, private, hidden.");
      return;
    }

    if (!Array.isArray(newJob.tags)) {
      toast.error("Tags must be an array.");
      return;
    }

    console.log(newJob);

    try {
      const response = await api.post(
        "/jobs/newJob",
        { ...newJob, createdBy: userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Job posted successfully!");
        setNewJob({
          title: "",
          description: "",
          budget: "",
          skillsRequired: [],
          jobCategory: "",
          jobType: "full-time",
          jobLocation: "",
          remoteAvailable: true,
          deadline: "",
          experienceLevel: "entry-level",
          additionalDetails: "",
          budgetType: "fixed",
          hourlyRate: "",
          minimumBidAmount: "",
          preferredFreelancerLocation: "",
          priority: "medium",
          jobVisibility: "public",
          tags: [],
          jobPhoto: "",
        });
      } else {
        toast.error("Failed to post job: " + response.data.message);
      }
    } catch (error) {
      toast.error(
        "Error posting job: " + error.response?.data?.message || error.message
      );
    }
  };

  return (
    <Card className="max-w-4xl my-4 mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Post a New Job</h2>
        <p className="text-muted-foreground text-center mt-2">
          Fill in the details below to create a new job listing
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="Enter job title"
                  value={newJob.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobCategory">Job Category</Label>
                <Input
                  id="jobCategory"
                  placeholder="Enter job category"
                  value={newJob.jobCategory}
                  onChange={(e) =>
                    handleFieldChange("jobCategory", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed job description"
                value={newJob.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                className="min-h-[100px]"
                required
              />
            </div>
            <div>
              <label
                htmlFor="jobPhoto"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Job Image
              </label>
              <Input
                id="jobPhoto"
                type="file"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={newJob.jobType}
                  onValueChange={(value) => handleFieldChange("jobType", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  value={newJob.experienceLevel}
                  onValueChange={(value) =>
                    handleFieldChange("experienceLevel", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Experience Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry-level">Entry Level</SelectItem>
                    <SelectItem value="mid-level">Mid Level</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobLocation">Job Location</Label>
                <Input
                  id="jobLocation"
                  placeholder="Enter job location"
                  value={newJob.jobLocation}
                  onChange={(e) =>
                    handleFieldChange("jobLocation", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredFreelancerLocation">
                  Preferred Freelancer Location
                </Label>
                <Input
                  id="preferredFreelancerLocation"
                  placeholder="Enter preferred freelancer location"
                  value={newJob.preferredFreelancerLocation}
                  onChange={(e) =>
                    handleFieldChange(
                      "preferredFreelancerLocation",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remoteAvailable"
                checked={newJob.remoteAvailable}
                onCheckedChange={(checked) =>
                  handleFieldChange("remoteAvailable", checked)
                }
              />
              <Label htmlFor="remoteAvailable">Remote work available</Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skills and Requirements</h3>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills Required</Label>
              <Input
                id="skills"
                placeholder="Enter skills (comma separated)"
                value={newJob.skillsRequired.join(", ")}
                onChange={(e) => handleSkillsChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details</Label>
              <Textarea
                id="additionalDetails"
                placeholder="Enter any additional job details"
                value={newJob.additionalDetails}
                onChange={(e) =>
                  handleFieldChange("additionalDetails", e.target.value)
                }
                className="min-h-[100px]"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget and Compensation</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Budget Type</Label>
                <RadioGroup
                  value={newJob.budgetType}
                  onValueChange={(value) =>
                    handleFieldChange("budgetType", value)
                  }
                  className="flex space-x-4"
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Budget</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hourly" id="hourly" />
                    <Label htmlFor="hourly">Hourly Rate</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">
                  {newJob.budgetType === "fixed" ? "Budget" : "Hourly Rate"}
                </Label>
                <Input
                  id="budget"
                  placeholder={`Enter ${
                    newJob.budgetType === "fixed" ? "budget" : "hourly rate"
                  }`}
                  value={
                    newJob.budgetType === "fixed"
                      ? newJob.budget
                      : newJob.hourlyRate
                  }
                  onChange={(e) =>
                    handleFieldChange(
                      newJob.budgetType === "fixed" ? "budget" : "hourlyRate",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumBidAmount">Minimum Bid Amount</Label>
              <Input
                id="minimumBidAmount"
                placeholder="Enter minimum bid amount"
                value={newJob.minimumBidAmount}
                onChange={(e) =>
                  handleFieldChange("minimumBidAmount", e.target.value)
                }
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Deadline</h3>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate
                          ? format(selectedDate, "PPP")
                          : "Select a deadline"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="start">
                      <Calendar
                        mode="single"
                        onSelect={(date) => {
                          // Update the selected date
                          setSelectedDate(date);
                          // Update the deadline field in newJob state
                          handleFieldChange(
                            "deadline",
                            format(date, "yyyy-MM-dd")
                          );
                        }}
                        initialFocus
                        selected={selectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Job Visibility</Label>
                <Select
                  value={newJob.jobVisibility}
                  onValueChange={(value) =>
                    handleFieldChange("jobVisibility", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Job Visibility" />
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
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags (comma separated)"
                value={newJob.tags.join(", ")}
                onChange={(e) => handleTagsChange(e.target.value)}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Post Job
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostJobForm;
