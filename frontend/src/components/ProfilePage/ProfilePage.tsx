"use client";

import React, { useEffect, useState } from "react";
import { userAuthStore } from "@/store/authStore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

import {
  User,
  Stethoscope,
  FileText,
  Clock,
  Edit,
  Save,
  X,
} from "lucide-react";

interface ProfileProps {
  userType: "doctor" | "patient";
}

const ProfilePage = ({ userType }: ProfileProps) => {
  const { user, fetchProfile, updateProfile, loading } = userAuthStore();

  const [activeTab, setActiveTab] = useState("about");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<any>({});
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (userType === "doctor") {
      router.push("/doctor/dashboard");
    } else {
      router.push("/patient/dashboard");
    }
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="bg-gradient-to-br from-red-50 via-white to-red-100">
      <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Profile
          </h1>

          <div className="flex gap-2">
            {/* BACK BUTTON */}
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-red-200 hover:bg-red-50"
            >
              ← Back
            </Button>

            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-md"
              >
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>

                <Button
                  variant="outline"
                  className="border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(user);
                  }}
                >
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex flex-wrap gap-2 bg-white/70 backdrop-blur-md p-2 rounded-xl border border-red-100 shadow-sm">
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <User className="w-4 h-4 mr-2" /> About
            </TabsTrigger>

            {userType === "patient" && (
              <TabsTrigger
                value="medical"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg px-4 py-2"
              >
                <FileText className="w-4 h-4 mr-2" /> Medical
              </TabsTrigger>
            )}

            {userType === "doctor" && (
              <TabsTrigger
                value="professional"
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg px-4 py-2"
              >
                <Stethoscope className="w-4 h-4 mr-2" /> Professional
              </TabsTrigger>
            )}

            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-lg px-4 py-2"
            >
              <Clock className="w-4 h-4 mr-2" /> Availability
            </TabsTrigger>
          </TabsList>

          {/* ABOUT */}
          {activeTab === "about" && (
            <Card className="border border-red-100 shadow-lg rounded-2xl bg-white/80 backdrop-blur-md">
              <CardHeader className="border-b border-red-50">
                <CardTitle className="text-red-700">
                  Basic Information
                </CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.name || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="focus-visible:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="focus-visible:ring-red-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Input
                    value={formData.gender || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>About</Label>
                  <Textarea
                    value={formData.about || ""}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("about", e.target.value)}
                    className="focus-visible:ring-red-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* MEDICAL */}
          {activeTab === "medical" && userType === "patient" && (
            <Card className="border border-red-100 shadow-lg rounded-2xl bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-red-700">Medical Info</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {["allergies", "currentMedications", "chronicConditions"].map(
                  (field) => (
                    <div className="space-y-2" key={field}>
                      <Label className="capitalize">{field}</Label>
                      <Textarea
                        value={formData.medicalHistory?.[field] || ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          handleChange(
                            `medicalHistory.${field}`,
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ),
                )}
              </CardContent>
            </Card>
          )}

          {/* PROFESSIONAL */}
          {activeTab === "professional" && userType === "doctor" && (
            <Card className="border border-red-100 shadow-lg rounded-2xl bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-red-700">
                  Professional Details
                </CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Specialization</Label>
                  <Input
                    value={formData.specialization || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("specialization", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Experience</Label>
                  <Input
                    type="number"
                    value={formData.experience || 0}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("experience", +e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fees (₹)</Label>
                  <Input
                    type="number"
                    value={formData.fees || 0}
                    disabled={!isEditing}
                    onChange={(e) => handleChange("fees", +e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* AVAILABILITY */}
          {activeTab === "availability" && (
            <Card className="border border-red-100 shadow-lg rounded-2xl bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-red-700">Availability</CardTitle>
              </CardHeader>

              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.availabilityRange?.startDate || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange(
                        "availabilityRange.startDate",
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.availabilityRange?.endDate || ""}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("availabilityRange.endDate", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slot Duration</Label>
                  <Input
                    type="number"
                    value={formData.slotDurationMinutes || 30}
                    disabled={!isEditing}
                    onChange={(e) =>
                      handleChange("slotDurationMinutes", +e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
