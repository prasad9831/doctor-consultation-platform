"use client";

import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileTextIcon, Save, X } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useAppointmentStore } from "@/store/appointmentStore";

/* ---------------- TYPES ---------------- */

type PrescriptionItem = {
  medicine: string;
  dosage: string;
  tests: string;
};

type CopilotData = {
  prescription: PrescriptionItem[];
  notes: string;
  diagnosis: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    prescription: string,
    notes: string,
    diagnosis: string,
  ) => Promise<void>;
  patientName?: string;
  loading: boolean;
};

/* ---------------- COMPONENT ---------------- */

const PrescriptionModel: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  patientName,
  loading,
}) => {
  const { copilotData, setCopilotData } = useAppointmentStore();

  const CopilotData = useAppointmentStore((state) => state.copilotData);

  useEffect(() => {
    console.log("✅ COPILOT STATE UPDATED:", CopilotData);
  }, [CopilotData]);

  if (!isOpen) return null;

  // ✅ SAFE DEFAULT STATE
  const data: CopilotData = copilotData ?? {
    prescription: [],
    notes: "",
    diagnosis: "",
  };

  // ✅ FIXED LOADING LOGIC
  const isAILoading = loading;

  /* ---------------- HANDLERS ---------------- */

  const updatePrescription = (
    index: number,
    field: keyof PrescriptionItem,
    value: string,
  ) => {
    const updated = [...data.prescription];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setCopilotData({
      ...data,
      prescription: updated,
    });
  };

  const handleSave = async () => {
    const formatted = data.prescription
      .map((p) => `${p.medicine} - ${p.dosage} for ${p.tests}`)
      .join(", ");

    await onSave(formatted, data.notes, data.diagnosis);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-red-600" />
            <CardTitle>Complete Consultation</CardTitle>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {isAILoading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-6 w-6 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                🧠 Generating AI Prescription...
              </p>
            </div>
          ) : (
            <>
              {/* PATIENT INFO */}
              <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200 shadow-sm">
                <h3 className="font-semibold text-red-900 text-lg">
                  Confirm Consultation
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Patient: <strong>{patientName}</strong>
                </p>
              </div>

              {/* PRESCRIPTION */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Prescription</Label>

                {data.prescription.map((med, i) => (
                  <div
                    key={i}
                    className="p-4 border rounded-xl bg-white shadow-sm space-y-3"
                  >
                    <div className="space-y-1">
                      <Label>Medicine</Label>
                      <input
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Enter medicine"
                        value={med.medicine}
                        onChange={(e) =>
                          updatePrescription(i, "medicine", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Dosage</Label>
                      <input
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Enter dosage"
                        value={med.dosage}
                        onChange={(e) =>
                          updatePrescription(i, "dosage", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Tests</Label>
                      <input
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Enter duration"
                        value={med.tests}
                        onChange={(e) =>
                          updatePrescription(i, "tests", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* NOTES */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Notes</Label>
                <Textarea
                  className="min-h-[120px] p-3 rounded-lg border focus:ring-2 focus:ring-red-500 outline-none"
                  value={data.notes}
                  placeholder="Write notes..."
                  onChange={(e) =>
                    setCopilotData({ ...data, notes: e.target.value })
                  }
                />
              </div>

              {/* DIAGNOSIS */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Diagnosis</Label>
                <input
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  value={data.diagnosis}
                  placeholder="Enter diagnosis"
                  onChange={(e) =>
                    setCopilotData({ ...data, diagnosis: e.target.value })
                  }
                />
              </div>

              {/* ACTION */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>

                <Button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6"
                  disabled={data.prescription.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrescriptionModel;
