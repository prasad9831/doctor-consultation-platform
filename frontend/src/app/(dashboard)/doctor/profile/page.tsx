import ProfilePage from '@/components/ProfilePage/ProfilePage'
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Doctor Profile | MediCare+",
  description: "View and manage your profile in MediCare+ platform.",
};

const page = () => {
  return <ProfilePage userType='doctor'/>
}

export default page