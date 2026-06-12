"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../landing/Header";
import { useSearchParams } from "next/navigation";
import { userAuthStore } from "@/store/authStore";
import { useDoctorStore } from "@/store/doctorStore";
import { Appointment, useAppointmentStore } from "@/store/appointmentStore";
import {
  Calendar,
  DollarSign,
  MapPin,
  Plus,
  Star,
  TrendingUp,
  Users,
  Activity,
  ChevronRight,
  Clock,
  Video,
  Phone,
} from "lucide-react";
import PrescriptionModel from "./PrescriptionModel";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { getStatusColor } from "@/lib/constant";
import { postWithAuth } from "@/services/httpService";

const DoctorDashboardContent = () => {
  const searchParams = useSearchParams();
  const { user } = userAuthStore();
  const {
    dashboard: dashboardData,
    fetchDashboard,
    loading,
  } = useDoctorStore();
  const [showPrescriptionModel, setShowPrescriptionModel] = useState(false);
  const [completingAppointmentId, setCompletingAppointmentId] = useState<
    string | null
  >(null);
  const [modelLoading, setModelLoading] = useState(false);
  const {
    endConsultation,
    fetchAppointmentById,
    currentAppointment,
    copilotData,
  } = useAppointmentStore();
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (user?.type === "doctor") {
      fetchDashboard(user?.type);
    }
  }, [user, fetchDashboard]);

  // console.log(dashboardData);

  useEffect(() => {
    const completedCallId = searchParams.get("completeCall");

    if (completedCallId) {
      setCompletingAppointmentId(completedCallId);
      fetchAppointmentById(completedCallId);
      setShowPrescriptionModel(true);

      generateAI(completedCallId);
    }
  }, [searchParams, fetchAppointmentById]);

  const generateAI = async (id: string) => {
    try {
      setAiLoading(true);

      const res = await postWithAuth("/copilot/generate", {
        appointmentId: id,
      });

      console.log("RAW API RESPONSE:", res); // 👈 ADD THIS

      const data = res?.data;

      console.log("EXTRACTED DATA:", data);

      if (data) {
        console.log("✅ IF BLOCK ENTERED");

        useAppointmentStore.getState().setCopilotData(data);

        console.log("✅ AFTER SET CALLED");

        setTimeout(() => {
          console.log(
            "🧪 AFTER UPDATE:",
            useAppointmentStore.getState().copilotData,
          );
        }, 0);
      }
    } catch (err) {
      console.error("AI error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSavePrescription = async (
    prescription: string | undefined,
    notes: string | undefined,
    diagnosis: string | undefined,
  ) => {
    if (!completingAppointmentId) return;
    setModelLoading(true);
    try {
      await endConsultation(
        completingAppointmentId,
        copilotData?.prescription,
        notes,
        diagnosis,
      );
      setShowPrescriptionModel(false);
      setCompletingAppointmentId(null);

      if (user?.type) {
        fetchDashboard(user.type);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("completeCall");
      window.history.replaceState({}, "", url.pathname);
    } catch (error) {
      console.error("Failed to complete consultation", error);
    } finally {
      setModelLoading(false);
    }
  };

  const handleCloseModel = () => {
    setShowPrescriptionModel(false);
    setCompletingAppointmentId(null);
  };

  const formateDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canJoinCall = (appointment: any) => {
    const appointmentTime = new Date(appointment.slotStartIso);
    const now = new Date();

    const diffMinutes = Math.floor(
      (appointmentTime.getTime() - now.getTime()) / (1000 * 60),
    );

    return (
      diffMinutes <= 30 &&
      diffMinutes >= -120 &&
      (appointment.Status === "Scheduled" ||
        appointment.Status === "In Progress")
    );
  };

  if (loading || !dashboardData) {
    return (
      <>
        <Header showDashboardNav={true} />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-300 rounded w-64"></div>
                  <div className="h-4 bg-gray-300 rounded w-48"></div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const patientName = currentAppointment?.patientId?.name;

  const statsCards = [
    {
      title: "Total Patients",
      value: dashboardData?.stats?.totalPatient?.toString() || "0",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Appointments",
      value: dashboardData?.stats?.totalAppointment?.toString() || "0",
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData?.stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+25%",
      changeColor: "text-green-600",
    },
    {
      title: "Completed",
      value: dashboardData?.stats?.completedAppointment?.toString() || "0",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      change: "+18%",
      changeColor: "text-green-600",
    },
  ];

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    // agar birthday abhi aaya nahi hai iss saal
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <>
      <Header showDashboardNav={true} />

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20 ring-4 ring-red-100">
                  <AvatarImage
                    src={dashboardData?.user?.profileImage}
                    alt={dashboardData?.user?.name}
                  />
                  <AvatarFallback>
                    {dashboardData?.user?.name?.charAt(3).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h1 className="text-md md:text-3xl font-bold text-gray-900">
                    Good Evening, {dashboardData?.user?.name}
                  </h1>
                  <p className="text-gray-600 text-xs md:text-lg">
                    {dashboardData?.user?.specialization}
                  </p>

                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {dashboardData?.user?.hospitalInfo?.name},{" "}
                        {dashboardData?.user?.hospitalInfo?.city}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-orange-400 text-yellow-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {dashboardData?.stats?.averageRating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                <Link href="/doctor/profile">
                  <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    <Plus className="w-4 h-4 mr-2" /> Update Availablity
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="">
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-600 mr-1">
                        {stat.value}
                      </p>

                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                        <span
                          className={`text-sm font-medium ${stat.changeColor}`}
                        >
                          {stat.change} from last year
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-14 h-14 ${stat.bgColor} rouded-xl flex items-center justify-center`}
                    >
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <span>Today's Schedule</span>
                  <Badge variant="secondary" className="ml-2">
                    {dashboardData?.todayAppointment?.length} appointments
                  </Badge>
                </CardTitle>
                <Link href="doctor/appointments">
                  <Button variant="ghost" size="sm">
                    View All{" "}
                    <ChevronRight className="w-4 h-4 ml-1 hover:bg-white" />
                  </Button>
                </Link>
              </CardHeader>

              <CardContent className="space-y-4">
                {dashboardData?.todayAppointment?.length > 0 ? (
                  dashboardData?.todayAppointment?.map(
                    (appointment: Appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gary-50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                          <Clock className="w-6 h-6 text-red-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              {appointment?.patientId.name}
                            </h4>
                            <div className="text-sm font-medium text-red-600">
                              {formateDate(appointment.slotStartIso)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-1">
                            Age: {calculateAge(appointment?.patientId?.dob)}{" "}
                            years
                          </p>

                          <div className="flex items-center space-x-4 mt-2">
                            <Badge
                              className={getStatusColor(appointment.Status)}
                            >
                              {appointment.Status}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {appointment.consultationType ===
                              "Video Consultation" ? (
                                <Video className="w-4 h-4 text-red-600" />
                              ) : (
                                <Phone className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-sm text-gray-500 ml-2 ">
                                ₹{appointment.doctorId.fees}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-x-2">
                          {canJoinCall(appointment) && (
                            <Link href={`/call/${appointment._id}`}>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Appointments today
                    </h3>
                    <p className="text-gray-600">Enjoy your free day</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-red-500" />
                    <span>Upcoming</span>
                  </CardTitle>
                  <Link href="doctor/appointments">
                    <Button variant="ghost" size="sm">
                      View All{" "}
                      <ChevronRight className="w-4 h-4 ml-1 hover:bg-white" />
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="space-y-4">
                  {dashboardData?.upcomingAppointment?.length > 0 ? (
                    dashboardData?.todayAppointment?.map(
                      (appointment: Appointment) => (
                        <div
                          key={appointment._id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gary-50 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarImage
                              src={appointment.patientId.profileImage}
                            />
                            <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                              {appointment.patientId?.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {appointment?.patientId.name}
                            </h4>
                            <div className="text-sm font-medium text-red-600">
                              {formateDate(appointment.slotStartIso)}
                            </div>

                            <div className="flex items-center space-x-1 mt-1">
                              {appointment.consultationType ===
                              "Video Consultation" ? (
                                <Video className="w-4 h-4 text-red-600" />
                              ) : (
                                <Phone className="w-4 h-4 text-green-600" />
                              )}
                              <span className="text-sm text-gray-500 ml-2 ">
                                ₹{appointment.doctorId.fees}
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    )
                  ) : (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-sm text-gray-500">
                        No Upcoming Appointments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <span>Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Patient Satisfaction
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {dashboardData?.performance?.patientSatisfaction} / 5
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Completion Rate
                    </span>
                    <span className="font-semibold text-green-600">
                      {dashboardData?.performance?.completionRate}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardData?.performance?.responseTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <PrescriptionModel
        isOpen={showPrescriptionModel}
        onClose={handleCloseModel}
        onSave={handleSavePrescription}
        patientName={patientName}
        loading={aiLoading}
      />
    </>
  );
};

export default DoctorDashboardContent;
