import React, { Suspense } from "react";
import PatientDashboardContent from "@/components/patient/PatientDashboardContent";
import Loader from '@/components/Loader'

const page = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <PatientDashboardContent />
    </Suspense>
  );
};

export default page;
