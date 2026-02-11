import { motion, AnimatePresence } from "framer-motion"
import PropTypes from 'prop-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Pencil, Save, X, User, Phone, FileText, Map } from 'lucide-react'

export function ProfileForm({
  formData,
  handleChange,
  handleSubmit,
  handleCancelEdit,
  isEditing,
  setIsEditing,
}) {
  const formFields = [
    {
      id: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      icon: User,
      required: true,
    },
    {
      id: "phoneNumber",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter your phone number",
      icon: Phone,
    },
    {
      id: "bio",
      label: "Bio",
      type: "textarea",
      placeholder: "Tell us about yourself",
      icon: FileText,
    },
    {
      id: "location",
      label: "Location",
      type: "text",
      placeholder: "Enter your location",
      icon: Map,
    },
  ]

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              {isEditing
                ? "Update your personal information"
                : "Your personal information"}
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid gap-6">
                {formFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label
                      htmlFor={field.id}
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <field.icon className="h-4 w-4 text-muted-foreground" />
                      {field.label}
                      {field.required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.id}
                        name={field.id}
                        value={formData[field.id] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="min-h-[100px] resize-none bg-background"
                      />
                    ) : (
                      <Input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        value={formData[field.id] || ""}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="bg-background"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <field.icon className="h-4 w-4" />
                    {field.label}
                  </div>
                  <p className="text-sm font-medium">
                    {formData[field.id] || (
                      <span className="text-muted-foreground italic">
                        Not provided
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

ProfileForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string,
    bio: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleCancelEdit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.func.isRequired,
}
