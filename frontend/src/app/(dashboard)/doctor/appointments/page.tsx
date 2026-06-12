import React, { Suspense } from 'react'
import DoctorDashboardContent from '@/components/doctor/DoctorDashboardContent'
import Loader from '@/components/Loader'
import DoctorAppointmentContent from '@/components/doctor/DoctorAppointmentContent'

const page = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <DoctorAppointmentContent/>
    </Suspense>
  )
}

export default page