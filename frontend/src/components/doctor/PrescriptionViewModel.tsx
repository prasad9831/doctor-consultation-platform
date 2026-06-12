import { Appointment } from "@/store/appointmentStore";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Check, Copy, FileTextIcon, X } from "lucide-react";
import { Button } from "../ui/button";

interface PrescriptionViewModalInterface {
  appointment: Appointment;
  userType: "doctor" | "patient";
  trigger: React.ReactNode;
}

const PrescriptionViewModel = ({
  appointment,
  userType,
  trigger,
}: PrescriptionViewModalInterface) => {
  console.log("📦 Appointment Data:", appointment);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const openModel = () => setIsOpen(true);
  const closeModel = () => setIsOpen(false);

  const formateDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const copyToClickboard = async () => {
    try {
      const text = JSON.stringify(appointment?.prescription, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const otherUser =
    userType === "doctor" ? appointment?.patientId : appointment?.doctorId;

  return (
    <>
      <span onClick={openModel} style={{ cursor: "pointer" }}>
        {trigger}
      </span>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex items-center flex-row justify-between space-y-0 pb-3">
              <div className="flex items-center space-x-2">
                <FileTextIcon className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg">Prescription</CardTitle>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClickboard}
                  className="flex items-center space-x-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>

                <Button variant="ghost" size="sm" onClick={closeModel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* USER INFO */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{otherUser?.name || "N/A"}</p>
                  <p className="text-sm text-gray-600">
                    {userType === "patient"
                      ? otherUser?.specialization || "N/A"
                      : otherUser?.age
                        ? `Age: ${otherUser.age}`
                        : "Age: N/A"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {formateDate(appointment.slotStartIso)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appointment.consultationType}
                  </p>
                </div>
              </div>

              {/* DIAGNOSIS */}
              {appointment?.diagnosis && (
                <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Diagnosis
                  </h3>
                  <p className="text-sm text-gray-800">
                    {appointment.diagnosis}
                  </p>
                </div>
              )}

              {/* PRESCRIPTION LIST (FIXED) */}
              <div className="border border-green-200 bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">
                  Medicines
                </h3>

                <div className="space-y-3">
                  {Array.isArray(appointment?.prescription) &&
                    appointment.prescription.map((item: any, index: number) => (
                      <div
                        key={item._id || index}
                        className="bg-white p-3 rounded border text-sm"
                      >
                        <p>
                          <span className="font-semibold">Medicine:</span>{" "}
                          {item.medicine}
                        </p>
                        <p>
                          <span className="font-semibold">Dosage:</span>{" "}
                          {item.dosage}
                        </p>
                        <p>
                          <span className="font-semibold">Tests:</span>{" "}
                          {item.tests}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* NOTES */}
              {appointment.notes && (
                <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {appointment.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default PrescriptionViewModel;