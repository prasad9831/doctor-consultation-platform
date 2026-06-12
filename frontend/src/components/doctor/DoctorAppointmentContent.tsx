"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../landing/Header";
import { userAuthStore } from "@/store/authStore";
import { Appointment, useAppointmentStore } from "@/store/appointmentStore";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  Video,
  XCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { emptyStates, getStatusColor } from "@/lib/constant";
import PrescriptionViewModel from "./PrescriptionViewModel";

const DoctorAppointmentContent = () => {
  const { user } = userAuthStore();
  const { appointments, fetchAppointments, loading, updateAppontmentStatus } =
    useAppointmentStore();
  const [activeTab, setActiveTab] = useState<
  "" | "upcoming" | "past"
>("upcoming");
  const [tabCounts, setTabCounts] = useState({
    upcoming: 0,
    past: 0,
  });

  useEffect(() => {
    if (user?.type === "doctor") {
      fetchAppointments("doctor", activeTab);
    }
  }, [user, fetchAppointments, activeTab]);
  

  const autoCompleteAppointments = async () => {
    const now = new Date();

    for (const appointment of appointments) {
      const appointmentTime = new Date(appointment.slotStartIso);

      const diffMinutes = Math.floor(
        (appointmentTime.getTime() - now.getTime()) / (1000 * 60),
      );

      if (diffMinutes <= -120 && appointment.Status !== "Completed") {
        try {
          await updateAppontmentStatus(appointment._id, "Completed");
        } catch (error) {
          console.error("Auto complete failed", error);
        }
      }
    }
  };

  useEffect(() => {
  if (appointments.length > 0) {
    autoCompleteAppointments();
  }
}, [appointments]);

  // useEffect(() => {
  const now = new Date();

  const upcomingAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.slotStartIso);
    const status = apt.Status;

    return (
      (aptDate >= now || status === "In Progress") &&
      (status === "Scheduled" || status === "In Progress")
    );
  });

  const pastAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.slotStartIso);
    const status = apt.Status;

    return aptDate < now || status === "Completed" || status === "Cancelled";
  });

  useEffect(() => {
    setTabCounts({
      upcoming: upcomingAppointments.length,
      past: pastAppointments.length,
    });
  }, [appointments]);
  // }, [appointments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (dateString: string | Date) => {
    const today = new Date();
    const d = new Date(dateString);

    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const canJoinCall = (appointment: any) => {
    const appointmentTime = new Date(appointment.slotStartIso);
    const now = new Date();

    const diffMinutes = Math.floor(
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60),
    );

    return (
      isToday(appointmentTime) &&
      // diffMinutes <= 30 &&
      diffMinutes >= -120 &&
      (appointment.Status === "Scheduled" ||
        appointment.Status === "In Progress")
    );
  };

  // console.log("doctorname", appointments);

  const canMarkedCancelled = (appointment: any) => {
    if (!appointment) return false;

    const appointmentTime = new Date(appointment.slotStartIso);
    const now = new Date();

    const status = (appointment.status || appointment.Status)?.toLowerCase();

    return status === "scheduled" && now < appointmentTime;
  };

  const handleMarkCancelled = async (appointmentId: string) => {
    if (
      confirm("Are you sure you want to mark this appointment as cancelled")
    ) {
      try {
        await updateAppontmentStatus(appointmentId, "Cancelled");
        if (user?.type === "doctor") {
          fetchAppointments("doctor", activeTab);
        }
      } catch (error) {
        console.error("Failed to mark cancel appointment", error);
      }
    }
  };

  if (!user) {
    return null;
  }

  const getDoctorInitials = (name?: string) => {
    if (!name) return "DR";

    // Remove "Dr." prefix if already present
    const cleanName = name.replace(/^dr\.?\s*/i, "");

    const parts = cleanName.split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const getAgeFromDOB = (dob?: string) => {
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    // adjust if birthday not yet passed this year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };
  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    console.log("patientId:", appointment.patientId),
    console.log("Appointment:", appointment),
    console.log("Can Join:", canJoinCall(appointment)),
    (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col items-center md:flex-row md:items-start md:space-x-6">
            <div className="flex-shrink-0 flex justify-center md:justify-start">
              <Avatar className="w-20 h-20 border-2 border-white shadow-md">
                <AvatarImage
                  src={appointment.patientId?.profileImage}
                  alt={appointment.patientId?.name}
                />

                <AvatarFallback className="bg-gradient-to-br from-red-500 to-pink-500 text-white text-lg font-bold flex items-center justify-center">
                  {getDoctorInitials(appointment.patientId?.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-4 md:mt-0 flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.patientId?.name}
                  </h3>
                  <p className="text-gray-600">
                    DOB:{" "}
                    {appointment.patientId?.dob
                      ? new Date(appointment.patientId.dob).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )
                      : "—"}
                  </p>

                  <p className="text-gray-600">
                    Age: {getAgeFromDOB(appointment.patientId?.dob) ?? "—"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {appointment.patientId?.email}
                  </p>
                </div>

                <div className="mt-2 md:mt-0 text-center md:text-right">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      appointment.Status,
                    )}`}
                  >
                    {/* Status dot */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        appointment.Status?.toLowerCase() === "confirmed"
                          ? "bg-green-500"
                          : appointment.Status?.toLowerCase() === "pending"
                            ? "bg-yellow-500"
                            : appointment.Status?.toLowerCase() === "completed"
                              ? "bg-blue-500"
                              : appointment.Status?.toLowerCase() ===
                                  "cancelled"
                                ? "bg-red-500"
                                : appointment.Status?.toLowerCase() ===
                                    "scheduled"
                                  ? "bg-indigo-500"
                                  : "bg-gray-500"
                      }`}
                    />

                    {/* Status text */}
                    {appointment.Status || "Unknown"}
                  </div>

                  {isToday(appointment.slotStartIso) && (
                    <div className="text-xs text-red-600 font-semibold mt-1">
                      TODAY
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.slotStartIso)}</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600">
                    {appointment.consultationType === "Video Consultation" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    <span>{appointment.consultationType}</span>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <div className="flex justify-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold">Fees:</span>
                    <p>₹{appointment.doctorId?.fees}</p>
                  </div>

                  {appointment.symptoms && (
                    <div className="flex justify-center gap-2 text-sm text-gray-600 mt-1">
                      <span className="font-semibold">Symptoms</span>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {appointment.symptoms}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex-col md:flex-row items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex space-x-2">
                  {canJoinCall(appointment) && (
                    <Link href={`/call/${appointment._id}`}>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Start Consultation
                      </Button>
                    </Link>
                  )}

                  <div>
                    {canMarkedCancelled(appointment) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleMarkCancelled(appointment._id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Mark Cancelled
                      </Button>
                    )}
                  </div>

                  {appointment.Status === "Completed" &&
                    appointment.prescription && (
                      <PrescriptionViewModel
                        appointment={appointment}
                        userType="patient"
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700 border-green-200 hover:bg-green-50"
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                        }
                      />
                    )}
                </div>
                {appointment.Status === "Completed" && (
                  <div className="flex items-center space-x-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  );

  const EmptyState = ({ tab }: { tab: string }) => {
    const state = emptyStates[tab as keyof typeof emptyStates];

    if (!state) return null;
    const Icon = state.icon;

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {state.title}
          </h3>
          <p className="text-gray-600 mb-6">{state.description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Header showDashboardNav={true} />

      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-md md:text-3xl font-bold text-gray-900">
                My Appointment
              </h1>
              <p className="text-xs md:text-lg text-gray-600">
                Manage your patient consultation
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/doctor/profile">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Update Availability
                </Button>
              </Link>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="upcoming"
                className="flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Upcoming ({tabCounts.upcoming})</span>
              </TabsTrigger>

              <TabsTrigger value="past" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Past ({tabCounts.past})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState tab="upcoming" />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                            <div className="h-3 w-3/4 bg-gray-200 rounded-full"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pastAppointments.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState tab="past" />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default DoctorAppointmentContent;
