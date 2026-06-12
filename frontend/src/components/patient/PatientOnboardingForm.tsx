"use client";
import { userAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Phone, User } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface emergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface medicalHistory {
  allergies: string;
  currentMedications: string;
  chronicConditions: string;
}

interface patientOnboardingData {
  phone: string;
  dob: string;
  gender: string;
  bloodGroup?: string;
  emergencyContact: emergencyContact;
  medicalHistory: medicalHistory;
}

const step1Schema = z.object({
  phone: z
    .string()
    .min(10, "Phone must be 10 digits")
    .regex(/^[0-9]+$/, "Only numbers allowed"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
 bloodGroup: z.string().min(1, "BloodGroup is required"),
});

const step2Schema = z.object({
  name: z.string().min(3, "Name must be at least 3 chars"),
  phone: z
    .string()
    .min(10, "Phone must be 10 digits")
    .regex(/^[0-9]+$/, "Only numbers allowed"),
  relationship: z.string().min(1, "Relationship is required"),
});

const step3Schema = z.object({
  allergies: z.string().min(1, "Required"),
  currentMedications: z.string().min(1, "Required"),
  chronicConditions: z.string().min(1, "Required"),
});

const PatientOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<patientOnboardingData>({
    phone: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    medicalHistory: {
      allergies: "",
      currentMedications: "",
      chronicConditions: "",
    },
  });

  const { updateProfile, user, loading } = userAuthStore();
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (
    field: keyof emergencyContact,
    value: string | null,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const handleMedicalHistoryChange = (
    field: keyof medicalHistory,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      medicalHistory: {
        ...prev.medicalHistory,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    const result = step3Schema.safeParse(formData.medicalHistory);

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    try {
      await updateProfile(formData);
      router.push("/");
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  const handleNext = (): void => {
    let result;

    if (currentStep === 1) {
      result = step1Schema.safeParse({
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup : formData.bloodGroup
      });
    }

    if (currentStep === 2) {
      result = step2Schema.safeParse(formData.emergencyContact);
    }

    if (!result?.success) {
      const fieldErrors = result?.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevious = (): void => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome {user?.name} to MediCare+
        </h1>
        <p className="text-gray-600">
          Complete your profile to start booking appointment
        </p>
      </div>

      {/* progress step */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > step
                    ? "bg-red-600 border-res-600 text-white"
                    : currentStep === step
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-5 h-5" /> // completed step
                ) : (
                  step //current + upcoming
                )}
              </div>

              {step < 3 && (
                <div
                  className={`w-20 h-1 ${
                    currentStep > step ? "bg-red-600" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-8">
                <User className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    placeholder="+91 9999999999"
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-red-500 text-sm">{errors?.phone?.[0]}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-red-500 text-sm">{errors?.dob?.[0]}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      handleSelectChange("gender", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-red-500 text-sm">{errors?.gender?.[0]}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Blood Group</Label>
                  <Select
                    value={formData.bloodGroup || ""}
                    onValueChange={(value) =>
                      handleSelectChange("bloodGroup", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="AB +">AB+</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-red-500 text-sm">
                    {errors?.bloodGroup?.[0]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Phone className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold">Emergency Contact</h2>
              </div>
              <Alert>
                <AlertDescription>
                  This information will be used to contact someone on your
                  behalf in case of emergency during consultations
                </AlertDescription>
              </Alert>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyName">Contact Name</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleEmergencyContactChange("name", e.target.value)
                    }
                    placeholder="Full Name"
                    required
                  />
                  <p className="text-red-500 text-sm">{errors?.name?.[0]}</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleEmergencyContactChange("phone", e.target.value)
                    }
                    placeholder="+91 9999999999"
                    required
                  />
                  <p className="text-red-500 text-sm">{errors?.phone?.[0]}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Select
                    value={formData.emergencyContact.relationship}
                    onValueChange={(value) =>
                      handleEmergencyContactChange("relationship", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-red-500 text-sm">
                    {errors?.relationship?.[0]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Phone className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-semibold">Medical Information</h2>
              </div>
              <Alert>
                <AlertDescription>
                  This information helps doctor to provide better care. All
                  infromation kept confidential and secure.
                </AlertDescription>
              </Alert>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Known Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={formData.medicalHistory.allergies}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleMedicalHistoryChange("allergies", e.target.value)
                    }
                    placeholder="e.g.,Penicilian, Dust (or write 'None' if no known allergies)"
                    rows={3}
                  ></Textarea>
                  <p className="text-red-500 text-sm">
                    {errors?.allergies?.[0]}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedication">Current Medication</Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.medicalHistory.currentMedications}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleMedicalHistoryChange(
                        "currentMedications",
                        e.target.value,
                      )
                    }
                    placeholder="List any medications you're currently taking (or write 'None' if not taking any)"
                    rows={3}
                  ></Textarea>
                  <p className="text-red-500 text-sm">
                    {errors?.currentMedications?.[0]}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronicConditions"
                    value={formData.medicalHistory.chronicConditions}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleMedicalHistoryChange(
                        "chronicConditions",
                        e.target.value,
                      )
                    }
                    placeholder="e.g.,Diabetes, hypertensio, Asthma (or write 'None' if no known Chronic conditions)"
                    rows={3}
                  ></Textarea>
                  <p className="text-red-500 text-sm">
                    {errors?.chronicConditions?.[0]}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleNext}
                className='bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600 shadow-md hover:scale-95 px-5'
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Completing Setup..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientOnboardingForm;
