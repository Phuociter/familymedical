import React, { useState } from 'react';
import Sidebar from '../components/FamilyMedicalComponent/Sidebar';
import FamilyList from '../components/FamilyMedicalComponent/FamilyList';
import DoctorList from '../components/FamilyMedicalComponent/DoctorList';
import Messages from '../components/FamilyMedicalComponent/Messages';
import Header from '../components/FamilyMedicalComponent/Header';
import UserProfileModal from '../components/FamilyMedicalComponent/UserProfileModal';
import FamilyDoctorInfoModal from '../components/FamilyMedicalComponent/FamilyDoctorInfoModal';
import SubscriptionModal from '../components/FamilyMedicalComponent/SubscriptionModal';
import { View } from '../type';
import { USER_PROFILE, DOCTORS } from '../constants';

const FamilyMedicalPage = () => {
  const [activeView, setActiveView] = useState(View.Family);
  // Let's assume the family already has a doctor with ID 2 for demonstration
  const [familyDoctorId, setFamilyDoctorId] = useState(2);
  
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);
  const [isFamilyDoctorInfoOpen, setIsFamilyDoctorInfoOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(USER_PROFILE);


  const familyDoctor = DOCTORS.find(d => d.id === familyDoctorId);

  const handleSetFamilyDoctor = (doctorId) => {
    setFamilyDoctorId(doctorId);
  };
  
  const handleProfileUpdate = (updatedProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleTerminateContract = () => {
    if (window.confirm('Bạn có chắc chắn muốn chấm dứt hợp đồng với bác sĩ này không?')) {
      setFamilyDoctorId(null);
      setIsFamilyDoctorInfoOpen(false); // Close modal after action
      alert('Đã chấm dứt hợp đồng thành công.');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case View.Family:
        return <FamilyList />;
      case View.Doctors:
        return <DoctorList familyDoctorId={familyDoctorId} onSetFamilyDoctor={handleSetFamilyDoctor} />;
      case View.Messages:
        return <Messages />;
      default:
        return <FamilyList />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onOpenFamilyDoctorInfo={() => setIsFamilyDoctorInfoOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        userAvatar={userProfile.avatar}
        userName={userProfile.name}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={activeView} />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      <UserProfileModal 
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        profile={userProfile}
        onSave={handleProfileUpdate}
      />

      <FamilyDoctorInfoModal
        isOpen={isFamilyDoctorInfoOpen}
        onClose={() => setIsFamilyDoctorInfoOpen(false)}
        doctor={familyDoctor}
        onTerminateContract={handleTerminateContract}
      />

      <SubscriptionModal 
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
      />
    </div>
  );
};

export default FamilyMedicalPage;
