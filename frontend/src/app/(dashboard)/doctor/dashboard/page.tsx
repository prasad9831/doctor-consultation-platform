import React, { Suspense } from 'react'
import DoctorDashboardContent from '@/components/doctor/DoctorDashboardContent'
import Loader from '@/components/Loader'

const page = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <DoctorDashboardContent/>
    </Suspense>
  )
}

export default page