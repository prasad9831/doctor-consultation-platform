"use client";
import { DoctorFormData, HospitalInfo } from "@/lib/type";
import { userAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { healthcareCategoriesList, specializations } from "@/lib/constant";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { Check } from "lucide-react";

const step1Schema = z.object({
  specialization: z.string().min(1, "Select specialization"),
  experience: z.string().min(1, "Enter experience"),
  qualification: z.string().min(1, "Enter qualification"),
  about: z.string().min(1, "Enter about"),
  fees: z.string().min(1, "Enter fees"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
});

const step2Schema = z.object({
  name: z.string().min(1, "Enter hospital name"),
  address: z.string().min(1, "Enter address"),
  city: z.string().min(1, "Enter city"),
});

const step3Schema = z.object({
  startDate: z.string().min(1, "Select start date"),
  endDate: z.string().min(1, "Select end date"),
  slotDurationMinutes: z
    .preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().optional(),
    )
    .refine((val) => val !== undefined && val > 0, {
      message: "Select slot duration",
    }),
  availabilityRange: z.object({
    excludedWeekdays: z.array(z.number()).min(1, "Select at least one day"),
  }),
});

const DoctorOnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<DoctorFormData>({
    specialization: "",
    categories: [],
    qualification: "",
    experience: "",
    fees: "",
    about: "",
    hospitalInfo: {
      name: "",
      address: "",
      city: "",
    },
    availabilityRange: {
      startDate: "",
      endDate: "",
      excludedWeekdays: [],
    },
    dailyTimeRanges: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" },
    ],
    slotDurationMinutes: undefined,
  });

  const { updateProfile, user, loading } = userAuthStore();
  const router = useRouter();
  const [errors, setErrors] = useState<any>({});

  const handleCategoryToggle = (category: string): void => {
    setFormData((prev: DoctorFormData) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c: string) => c! === category)
        : [...prev.categories, category],
    }));
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = event.target;
    setFormData((prev: DoctorFormData) => ({ ...prev, [name]: value }));
  };

  const handleHospitalInfoChange = (
    field: keyof HospitalInfo,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      hospitalInfo: {
        ...prev.hospitalInfo,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    const result = step3Schema.safeParse({
      startDate: formData.availabilityRange.startDate,
      endDate: formData.availabilityRange.endDate,
      slotDurationMinutes: formData.slotDurationMinutes,
      availabilityRange: {
        excludedWeekdays: formData.availabilityRange.excludedWeekdays,
      },
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        const key = err.path.join(".");
        fieldErrors[key] = err.message;
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      await updateProfile({
        ...formData,
        category: formData.categories.join(", "),
        availabilityRange: {
          startDate: new Date(formData.availabilityRange.startDate),
          endDate: new Date(formData.availabilityRange.endDate),
          excludedWeekdays: formData.availabilityRange.excludedWeekdays,
        },
        dailyTimeRange: formData.dailyTimeRanges,
      });

      router.push("/doctor/dashboard");
    } catch (error) {
      console.error(error);
    }
  };

  const handleNext = (): void => {
    let result;

    if (currentStep === 1) {
      result = step1Schema.safeParse({
        specialization: formData.specialization,
        experience: formData.experience,
        qualification: formData.qualification,
        about: formData.about,
        fees: formData.fees,
        categories: formData.categories,
      });
    }

    if (currentStep === 2) {
      result = step2Schema.safeParse(formData.hospitalInfo);
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
      <div className="flex items-center justify-center mb-8">
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

      <Card className="shadow-lg">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-8">
                Professional Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Medical Specialization</Label>

                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialization: value ?? "",
                      }))
                    }
                  >
                    <SelectTrigger
                      className={`${
                        errors?.specialization
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    >
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>

                    <SelectContent>
                      {specializations.map((spec: string) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors?.specialization?.[0] && (
                    <p className="text-red-500 text-sm">
                      {errors.specialization[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>

                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    placeholder="e.g.,5"
                    onChange={handleInputChange}
                    className={`${
                      errors?.experience
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />

                  {errors?.experience?.[0] && (
                    <p className="text-red-500 text-sm">
                      {errors.experience[0]}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Healthcare Categories</Label>

                <p className="text-sm text-gray-600">
                  Select the Healthcare areas you provide services for (Select
                  atleast one)
                </p>

                <div
                  className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-md ${
                    errors?.categories ? "border border-red-500" : ""
                  }`}
                >
                  {healthcareCategoriesList.map((category: string) => (
                    <div className="flex items-center space-x-2" key={category}>
                      <Checkbox
                        checked={formData.categories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label className="text-sm cursor-pointer hover:text-red-600">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>

                {errors?.categories?.[0] && (
                  <p className="text-red-500 text-xs">{errors.categories[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>

                <Input
                  id="qualification"
                  name="qualification"
                  type="text"
                  value={formData.qualification}
                  placeholder="e.g., MBBS, MD, Cardiology"
                  onChange={handleInputChange}
                  className={`${
                    errors?.qualification
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />

                {errors?.qualification?.[0] && (
                  <p className="text-red-500 text-sm">
                    {errors.qualification[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About</Label>

                <Textarea
                  id="about"
                  name="about"
                  value={formData.about}
                  placeholder="Tell patients about your expertise and approach to healthcare..."
                  onChange={handleInputChange}
                  rows={4}
                  className={`${
                    errors?.about ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />

                {errors?.about?.[0] && (
                  <p className="text-red-500 text-sm">{errors.about[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fees">Consultation Fees (₹)</Label>

                <Input
                  id="fees"
                  name="fees"
                  type="number"
                  value={formData.fees}
                  placeholder="e.g., 500"
                  onChange={handleInputChange}
                  className={`${
                    errors?.fees ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />

                {errors?.fees?.[0] && (
                  <p className="text-red-500 text-sm">{errors.fees[0]}</p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-8">
                Hospital/Clinic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hospitalName">Hospital/Clinic Name</Label>

                  <Input
                    id="hospitalName"
                    type="text"
                    value={formData.hospitalInfo.name}
                    placeholder="e.g., Apollo Hospital"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleHospitalInfoChange("name", e.target.value)
                    }
                    className={`${
                      errors?.name ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />

                  {errors?.name?.[0] && (
                    <p className="text-red-500 text-sm">{errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>

                  <Textarea
                    id="address"
                    value={formData.hospitalInfo.address}
                    placeholder="Full address of your practice"
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleHospitalInfoChange("address", e.target.value)
                    }
                    rows={3}
                    className={`${
                      errors?.address ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />

                  {errors?.address?.[0] && (
                    <p className="text-red-500 text-sm">{errors.address[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>

                  <Input
                    id="city"
                    type="text"
                    value={formData.hospitalInfo.city}
                    placeholder="e.g., Mumbai"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleHospitalInfoChange("city", e.target.value)
                    }
                    className={`${
                      errors?.city ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />

                  {errors?.city?.[0] && (
                    <p className="text-red-500 text-sm">{errors.city[0]}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">
                Availability Settings
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Available From</Label>

                  <Input
                    id="startDate"
                    type="date"
                    value={formData.availabilityRange.startDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData((prev) => ({
                        ...prev,
                        availabilityRange: {
                          ...prev.availabilityRange,
                          startDate: e.target.value,
                        },
                      }));

                      setErrors((prev: any) => ({
                        ...prev,
                        startDate: undefined,
                      }));
                    }}
                    className={`${
                      errors?.startDate
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />

                  {errors?.startDate && (
                    <p className="text-red-500 text-sm">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Available Until</Label>

                  <Input
                    id="endDate"
                    type="date"
                    value={formData.availabilityRange.endDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setFormData((prev) => ({
                        ...prev,
                        availabilityRange: {
                          ...prev.availabilityRange,
                          endDate: e.target.value,
                        },
                      }));

                      setErrors((prev: any) => ({
                        ...prev,
                        endDate: undefined,
                      }));
                    }}
                    className={`${
                      errors?.endDate ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                  />

                  {errors?.endDate && (
                    <p className="text-red-500 text-sm">{errors.endDate}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Appointment Slots Duration</Label>

                <Select
                  value={formData.slotDurationMinutes?.toString() || ""}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      slotDurationMinutes: parseInt(value ?? ""),
                    }))
                  }
                >
                  <SelectTrigger
                    className={
                      errors.slotDurationMinutes ? "border-red-500" : ""
                    }
                  >
                    <SelectValue placeholder="Select slot duration" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="20">20 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="45">45 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                    <SelectItem value="90">90 Minutes</SelectItem>
                    <SelectItem value="120">120 Minutes</SelectItem>
                  </SelectContent>
                </Select>

                {/* ✅ ERROR MESSAGE */}
                {errors.slotDurationMinutes && (
                  <p className="text-red-500 text-sm">
                    {errors.slotDurationMinutes}
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  Duration for each patient consultation slot
                </p>
              </div>
              <div className="space-y-3">
                <Label>Working Days</Label>

                <p className="text-sm text-gray-600">
                  Select the days you are Not available
                </p>

                {/* ✅ Add red border if error */}
                <div
                  className={`grid grid-cols-4 md:grid-cols-7 ${
                    errors["availabilityRange.excludedWeekdays"]
                      ? "border border-red-500 p-2 rounded-md"
                      : ""
                  }`}
                >
                  {[
                    { day: "sunday", value: 0 },
                    { day: "monday", value: 1 },
                    { day: "tuesday", value: 2 },
                    { day: "wednesday", value: 3 },
                    { day: "thursday", value: 4 }, // ✅ fixed typo
                    { day: "friday", value: 5 },
                    { day: "saturday", value: 6 },
                  ].map(({ day, value }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${value}`}
                        checked={formData.availabilityRange.excludedWeekdays.includes(
                          value,
                        )}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              availabilityRange: {
                                ...prev.availabilityRange,
                                excludedWeekdays: [
                                  ...prev.availabilityRange.excludedWeekdays,
                                  value,
                                ],
                              },
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              availabilityRange: {
                                ...prev.availabilityRange,
                                excludedWeekdays:
                                  prev.availabilityRange.excludedWeekdays.filter(
                                    (d) => d !== value,
                                  ),
                              },
                            }));
                          }
                        }}
                      />

                      <Label
                        htmlFor={`day-${value}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {day.slice(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* ✅ ERROR MESSAGE */}
                {errors["availabilityRange.excludedWeekdays"] && (
                  <p className="text-red-500 text-sm">
                    {errors["availabilityRange.excludedWeekdays"]}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Label>Daily Working Hours</Label>
                <p className="text-sm text-gray-600">
                  Set your working hours for each day
                </p>
                {formData.dailyTimeRanges.map((range, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="fkex-1">
                      <Label className="text-sm">
                        Session {index + 1} - Start time
                      </Label>
                      <Input
                        type="time"
                        value={range.start}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newRange = [...formData.dailyTimeRanges];
                          newRange[index].start = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            dailyTimeRanges: newRange,
                          }));
                        }}
                        required
                      />
                    </div>
                    <div className="fkex-1">
                      <Label className="text-sm">
                        Session {index + 1} - End time
                      </Label>
                      <Input
                        type="time"
                        value={range.end}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const newRange = [...formData.dailyTimeRanges];
                          newRange[index].end = e.target.value;
                          setFormData((prev) => ({
                            ...prev,
                            dailyTimeRanges: newRange,
                          }));
                        }}
                        required
                      />
                    </div>
                    {formData.dailyTimeRanges.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newRange = formData.dailyTimeRanges.filter(
                            (_, i) => i !== index,
                          );
                          setFormData((prev) => ({
                            ...prev,
                            dailyTimeRanges: newRange,
                          }));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData((prev) => {
                      const lastRange = prev.dailyTimeRanges.at(-1);

                      let newStart = "18:00";
                      let newEnd = "20:00";

                      if (lastRange) {
                        newStart = lastRange.end;

                        // function to add 2 hours
                        const addHours = (time: string, hours: number) => {
                          const [h, m] = time.split(":").map(Number);
                          const date = new Date();
                          date.setHours(h + hours, m);
                          return date.toTimeString().slice(0, 5);
                        };

                        newEnd = addHours(newStart, 2);
                      }

                      return {
                        ...prev,
                        dailyTimeRanges: [
                          ...prev.dailyTimeRanges,
                          { start: newStart, end: newEnd },
                        ],
                      };
                    });
                  }}
                  className="w-full"
                >
                  + Add Another Time Session
                </Button>
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
                className="bg-red-600 text-white hover:bg-red-700 hover:text-white border-red-600 shadow-md hover:scale-95 px-5"
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

export default DoctorOnboardingForm;
