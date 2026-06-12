"use client";
import DoctorProfile from "@/components/BookingSteps/DoctorProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { convertTo24Hour, minutesToTime, toLocalYMD } from "@/lib/dateUtils";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useDoctorStore } from "@/store/doctorStore";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CalenderStep from "@/components/BookingSteps/CalenderStep";
import ConsultationStep from "@/components/BookingSteps/ConsultationStep";
import PaymentStep from "@/components/BookingSteps/PaymentStep";

const page = () => {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const { currentDoctor, fetchDoctorById } = useDoctorStore();
  const { bookedAppointment, loading, fetchBookedSlots, bookedSlots } =
    useAppointmentStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultationType, setConsultationType] =
    useState("Video Consultation");
  const [symptoms, setSymptoms] = useState("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [availableDate, setAvailableDate] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [createdAppointmentId, setcreatedAppointmentId] = useState<
    string | null
  >(null);
  const [patientName, setPatientName] = useState<string>("");

  useEffect(() => {
    if (doctorId) {
      fetchDoctorById(doctorId);
    }
  }, [doctorId, fetchDoctorById]);

  useEffect(() => {
    if (selectedDate && doctorId) {
      const dataString = toLocalYMD(selectedDate);
      fetchBookedSlots(doctorId, dataString);
    }
  }, [selectedDate, doctorId, fetchBookedSlots]);

  // Generate Available date
  useEffect(() => {
    if (currentDoctor?.availabilityRange) {
      const startDate = new Date(currentDoctor?.availabilityRange.startDate);
      const endDate = new Date(currentDoctor?.availabilityRange.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dates: string[] = [];
      const iterationStart = new Date(
        Math.max(today.getTime(), startDate.getTime()),
      );

      for (
        let d = new Date(iterationStart);
        d <= endDate && dates.length < 90;
        d.setDate(d.getDate() + 1)
      ) {
        dates.push(toLocalYMD(d));
      }

      setAvailableDate(dates);
    }
  }, [currentDoctor]);

  // Generate Available slots
  useEffect(() => {
    console.log("useEffect triggered");

    console.log("selectedDate:", selectedDate);
    console.log("currentDoctor:", currentDoctor);
    console.log("dailyTimeRanges:", currentDoctor?.dailyTimeRange);

    if (selectedDate && currentDoctor?.dailyTimeRange) {
      console.log("INSIDE IF ✅");

      const slots: string[] = [];
      const slotDuration = currentDoctor?.slotDurationMinutes || 30;

      currentDoctor.dailyTimeRange.forEach((timeRange) => {
        const startMinutes = timeToMinutes(timeRange.start);
        const endMinutes = timeToMinutes(timeRange.end);

        for (
          let minutes = startMinutes;
          minutes < endMinutes;
          minutes += slotDuration
        ) {
          slots.push(minutesToTime(minutes));
        }
      });

      console.log("Available Slots:", slots);

      setAvailableSlots(slots);
    }
  }, [currentDoctor, selectedDate]);

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !symptoms.trim()) {
      alert("Please complete all required fields");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      const dateString = toLocalYMD(selectedDate);
      const slotStart = new Date(
        `${dateString}T${convertTo24Hour(selectedSlot)}`,
      );
      const slotEnd = new Date(
        slotStart.getTime() +
          (currentDoctor!.slotDurationMinutes || 30) * 60000,
      );
      const consultationFees = getConsultationPrice();
      const platformFees = Math.round(consultationFees * 0.1);
      const totalAmount = consultationFees + platformFees;

      const appointment = await bookedAppointment({
        doctorId: doctorId,
        slotStartIso: slotStart.toISOString(),
        slotEndIso: slotEnd.toISOString(),
        consultationType,
        symptoms,
        date: dateString,
        consultationFees,
        platformFees,
        totalAmount,
      });

      if (appointment && appointment?._id) {
        console.log("NEW appointmentId:", appointment._id); // ✅ सही

        setcreatedAppointmentId(appointment._id);

        setPatientName(appointment.patientId?.name || "Patient");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        router.push("/patient/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      setIsPaymentProcessing(false);
    }
  };

  const getConsultationPrice = (): number => {
    const basePrice = currentDoctor?.fees || 0;
    const typePrice = consultationType === "Voice Call" ? -100 : 0;
    return Math.max(0, basePrice + typePrice);
  };

  const handlePaymentSuccess = (appointment: any) => {
    router.push("/patient/dashboard");
  };

  if (!currentDoctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor information...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/doctor-list">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to doctors
                </Button>
              </Link>
              <div className="h-6 w-px bg-gray-500"></div>
              <div>
                <h1 className="text-sm md:text-2xl font-bold text-gray-900">
                  Book Appointment
                </h1>
                <p className="text-xs md:text-sm text-gray-600">
                  with {currentDoctor.name}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center space-x-2 ${
                      currentStep >= step ? "text-red-600" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        currentStep >= step
                          ? "bg-red-600 border-red-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {currentStep > step ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <span
                          className={`text-sm font-semibold ${
                            currentStep >= step ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {step}
                        </span>
                      )}
                    </div>

                    <span className="text-sm font-medium">
                      {step === 1
                        ? "Select Time"
                        : step === 2
                          ? "Details"
                          : "Payment"}
                    </span>
                  </div>

                  {step < 3 && <div className="w-12 h-px bg-gray-300"></div>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <DoctorProfile doctor={currentDoctor} />
          </div>
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <CalenderStep
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        availableSlots={availableSlots}
                        availableDates={availableDate}
                        excludedWeekdays={
                          currentDoctor?.availabilityRange?.excludedWeekdays ||
                          []
                        }
                        bookedSlots={bookedSlots}
                        onContinue={() => setCurrentStep(2)}
                      />
                    </motion.div>
                  )}

                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <ConsultationStep
                        consultationType={consultationType}
                        setConsultationType={setConsultationType}
                        symptoms={symptoms}
                        setSymptoms={setSymptoms}
                        doctorFees={currentDoctor.fees}
                        onBack={() => setCurrentStep(1)}
                        onContinue={() => setCurrentStep(3)}
                      />
                    </motion.div>
                  )}

                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <PaymentStep
                        selectedDate={selectedDate}
                        selectedSlot={selectedSlot}
                        consultationType={consultationType}
                        doctorName={currentDoctor.name}
                        slotDuration={currentDoctor.slotDurationMinutes}
                        consultationFees={getConsultationPrice()}
                        onBack={() => setCurrentStep(2)}
                        onConfirm={handleBooking}
                        onPaymentSuccess={handlePaymentSuccess}
                        loading={loading}
                        appointmentId={createdAppointmentId || undefined}
                        patientName={patientName || undefined}
                        isProcessing={isPaymentProcessing}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
