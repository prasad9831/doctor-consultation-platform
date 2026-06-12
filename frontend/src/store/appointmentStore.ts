import { getWithAuth, postWithAuth, putWithAuth } from "@/services/httpService";
import { create } from "zustand";

export interface Appointment {
  _id: string;
  doctorId: any;
  patientId: any;
  date: string;
  slotStartIso: string;
  slotEndIso: string;
  consultationType: "Video Consultation" | "Voice Call";
  Status: "Scheduled" | "Completed" | "Cancelled" | "In Progress";
  symptoms: string;
  zegoRoomId: string;
  fees: number;
  prescription?: {
    medicine: string;
    dosage: string;
    duration: string;
  }[];
  notes?: string;
  diagnosis?:string
  transcript?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppointmentFilters {
  status?: string | string[];
  from?: string;
  to?: string;
  date?: string;
  sortBy?: "date" | "createdAt" | "status";
  sortOrder?: "asc" | "desc";
}

interface BookingData {
  doctorId: string;
  slotStartIso: string;
  slotEndIso: string;
  consultationType?: string;
  symptoms: string;
  date: string;
  consultationFees: number;
  platformFees: number;
  totalAmount: number;
}

interface AppointmentState {
  appointments: Appointment[];
  bookedSlots: string[];
  currentAppointment: Appointment | null;
  loading: boolean;
  error: string | null;
  copilotData: any;

  //Actions
  clearError: () => void;
  setCurrentAppointment: (appointment: Appointment) => void;
  setCopilotData: (data: any) => void;

  // Api Actions
  fetchAppointments: (
    role: "doctor" | "patient",
    tab?: "" | "upcoming" | "past",
    filters?: AppointmentFilters,
  ) => Promise<void>;
  fetchBookedSlots: (doctorId: string, date: string) => Promise<void>;
  fetchAppointmentById: (appointmentId: string) => Promise<Appointment | null>;
  bookedAppointment: (data: BookingData) => Promise<any>;
  joinConsultation: (appointmentId: string) => Promise<any>;
  endConsultation: (
    appointmentId: string,
    prescription?: {
      medicine: string;
      dosage: string;
      tests: string;
    }[],
    notes?: string,
    diagnosis?: string,
  ) => Promise<void>;
  updateAppontmentStatus: (
    appointmentId: string,
    status: string,
  ) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  bookedSlots: [],
  currentAppointment: null,
  loading: false,
  error: null,
  copilotData: null,

  clearError: () => set({ error: null }),
  setCurrentAppointment: (appointment) =>
    set({ currentAppointment: appointment }),

  setCopilotData: (data: any) => {
    console.log("🧠 INCOMING DATA:", data);

    set({
      copilotData: {
        prescription: Array.isArray(data?.prescription)
          ? data.prescription
          : [],
        notes: data?.notes ?? "",
        diagnosis: data?.diagnosis ?? "",
      },
    });
  },

  fetchAppointments: async (
    role: string,
    tab: "" | "upcoming" | "past" = "",
    filters = {},
  ) => {
    set({ loading: true, error: null });

    try {
      const endPoint =
        role === "doctor" ? "/appointment/doctor" : "/appointment/patient";

      const queryParams = new URLSearchParams();

      if (tab === "upcoming") {
        queryParams.append("status[]", "Scheduled");
        queryParams.append("status[]", "In Progress");
      } else if (tab === "past") {
        queryParams.append("status[]", "Completed");
        queryParams.append("status[]", "Cancelled");
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "status"
        ) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await getWithAuth(
        `${endPoint}?${queryParams.toString()}`,
      );

      set({ appointments: response.data || {} });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAppointmentById: async (appointmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await getWithAuth(`/appointment/${appointmentId}`);
      set({ currentAppointment: response?.data?.appointment });
      return response?.data?.appointment;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  fetchBookedSlots: async (doctorId, date) => {
    set({ loading: true, error: null });

    try {
      const response = await getWithAuth(
        `/appointment/booked-slots/${doctorId}/${date}`,
      );
      set({ bookedSlots: response?.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  bookedAppointment: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await postWithAuth("/appointment/book", data);
      set((state) => ({
        appointments: [response.data, ...state.appointments],
      }));

      return response.data;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  joinConsultation: async (appointmentId) => {
    set({ loading: true, error: null });
    try {
      const response = await getWithAuth(`/appointment/join/${appointmentId}`);
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, status: "In Progress" as const }
            : apt,
        ),
        currentAppointment:
          state.currentAppointment?._id === appointmentId
            ? { ...state.currentAppointment, status: "In Progress" as const }
            : state.currentAppointment,
      }));

      return response.data;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  endConsultation: async (appointmentId, prescription, notes) => {
    set({ loading: true, error: null });
    try {
      const response = await putWithAuth(`/appointment/end/${appointmentId}`, {
        prescription,
        notes,
        Status: "Completed",
      });
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === appointmentId
            ? { ...apt, Status: "Completed" as const }
            : apt,
        ),
        currentAppointment:
          state.currentAppointment?._id === appointmentId
            ? { ...state.currentAppointment, Status: "Completed" as const }
            : state.currentAppointment,
      }));

      return response.data;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },

  updateAppontmentStatus: async (appointmentId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await putWithAuth(
        `/appointment/status/${appointmentId}`,
        { status },
      );
      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: status as any } : apt,
        ),
        currentAppointment:
          state.currentAppointment?._id === appointmentId
            ? { ...state.currentAppointment, status: status as any }
            : state.currentAppointment,
      }));

      return response.data;
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false, error: null });
    }
  },
}));
