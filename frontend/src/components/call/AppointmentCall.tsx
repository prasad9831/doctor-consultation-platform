"use client";

import { getWithAuth, postWithoutAuth } from "@/services/httpService";
import { Appointment } from "@/store/appointmentStore";
import React, { useCallback, useEffect, useRef } from "react";

interface AppointmentCallInterface {
  appointment: Appointment;
  currentUser: {
    id: string;
    name: string;
    role: "doctor" | "patient";
  };
  onCallEnd: () => void;
  joinConsultation: (appointmentId: string) => Promise<void>;
}

const AppointmentCall = ({
  appointment,
  currentUser,
  onCallEnd,
  joinConsultation,
}: AppointmentCallInterface) => {
  const zpRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializationRef = useRef(false);
  const isComponentMountedRef = useRef(false);
  const hasLeftRef = useRef(false);

  const isVideoCall = appointment.consultationType === "Video Consultation";

    const memoizedJoinConsultation = useCallback(
    async (appointmentId: string) => {
      await joinConsultation(appointmentId);
    },
    [joinConsultation],
  );


  const initializeCall = useCallback(
    async (container: HTMLDivElement) => {
      if (
        initializationRef.current ||
        zpRef.current ||
        !isComponentMountedRef.current
      ) {
        return;
      }

      if (!container || !container.isConnected) return;

      try {
        initializationRef.current = true;

        // ✅ IMPORTANT: runtime import (correct fix)
        const { ZegoUIKitPrebuilt } =
          await import("@zegocloud/zego-uikit-prebuilt");

        const appId = process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID;
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SERVER_SECRET;

        if (!appId || !serverSecret) {
          throw new Error("Zegocloud credentials missing");
        }

        const numericAppId = Number(appId);
        if (isNaN(numericAppId)) {
          throw new Error("Invalid App ID");
        }

        try {
          await memoizedJoinConsultation(appointment._id);
        } catch (err) {
          console.warn("Join consultation failed", err);
        }

        // ✅ generate token
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          numericAppId,
          serverSecret,
          appointment.zegoRoomId,
          currentUser.id,
          currentUser.name,
        );

        console.log("kittoken", kitToken);
        console.log(typeof numericAppId);

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnCameraWhenJoining: isVideoCall,
          turnOnMicrophoneWhenJoining: true,
          showMyMicrophoneToggleButton: true,
          showMyCameraToggleButton: isVideoCall,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          showRemoveUserButton: true,
          showAudioVideoSettingsButton: true,
          maxUsers: 2,
          layout: "Auto",

          onJoinRoom: () => {
            console.log("Joined call");
          },
          // onLeaveRoom: () => {
          //   if (zpRef.current) {
          //     try {
          //       zpRef.current.mutePublishStreamAudio(true);
          //       zpRef.current.mutePublishStreamVideo(true);
          //     } catch (err) {
          //       console.error("Cleanup error");
          //     }
          //   }
          // },

          // onReturnToHomeScreenClicked: () => {
          //   if (zpRef.current) {
          //     try {
          //       zpRef.current.mutePublishStreamAudio(true);
          //       zpRef.current.mutePublishStreamVideo(true);
          //     } catch (err) {
          //       console.error("Cleanup error");
          //     }
          //   }
          //   onCallEnd();
          // },

          // onLeaveRoom: async () => {
          //   console.log("User left room");

          //   if (zpRef.current) {
          //     zpRef.current.destroy();
          //     zpRef.current = null;
          //     initializationRef.current = false;
          //   }
          //   onCallEnd();
          // },

          onLeaveRoom: async () => {
            if (hasLeftRef.current) return;
            hasLeftRef.current = true;

            console.log("User left room");

            // 🔥 DON'T destroy immediately
            setTimeout(() => {
              if (zpRef.current) {
                try {
                  zpRef.current.destroy();
                } catch (err) {
                  console.warn("Destroy error", err);
                } finally {
                  zpRef.current = null;
                  initializationRef.current = false;
                }
              }

              onCallEnd(); // redirect AFTER cleanup
            }, 300);
          },

          // onReturnToHomeScreenClicked: () => {
          //   console.log("Return to home");
          // },

          onReturnToHomeScreenClicked: () => {
            if (hasLeftRef.current) return;
            hasLeftRef.current = true;

            console.log("Return to home clicked");

            if (zpRef.current) {
              try {
                zpRef.current.destroy();
              } catch (err) {
                console.warn("Destroy error", err);
              } finally {
                zpRef.current = null;
              }
            }

            onCallEnd(); // 👈 manual redirect control
          },
        });
      } catch (error) {
        console.error("Call init failed:", error);
        initializationRef.current = false;

        if (isComponentMountedRef.current) {
          zpRef.current = null;
          onCallEnd();
        }
      }
    },
    [
      appointment._id,
      appointment.zegoRoomId,
      currentUser.id,
      currentUser.name,
      memoizedJoinConsultation,
      onCallEnd,
      isVideoCall,
    ],
  );

  // ✅ Track mount
  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);



useEffect(() => {
  if (
    containerRef.current &&
    !initializationRef.current &&
    currentUser.id &&
    currentUser.name &&
    isComponentMountedRef.current
  ) {
    initializeCall(containerRef.current);
  }

  return () => {
    if (zpRef.current) {
      try {
        zpRef.current.destroy();
      } catch (err) {
        console.warn("Destroy error", err);
      } finally {
        zpRef.current = null;
      }
    }
  };
}, [currentUser.id, currentUser.name, initializeCall]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-red-50 to-red-100 flex flex-col">
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">
            {isVideoCall ? "Video Consultation" : "Voice Consultation"}
          </h1>
          <p className="text-sm text-gray-600">
            {currentUser.role === "doctor"
              ? `Patient: ${appointment.patientId.name}`
              : `Dr: ${appointment.doctorId.name}`}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <div ref={containerRef} className="w-full h-full bg-gray-900" />
      </div>
    </div>
  );
};

export default AppointmentCall;
