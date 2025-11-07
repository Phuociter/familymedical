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
      setIsFamilyDoctorInfoOpen(false);
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
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#F3F4F6' }}>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenUserProfile={() => setIsUserProfileOpen(true)}
        onOpenFamilyDoctorInfo={() => setIsFamilyDoctorInfoOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        userAvatar={userProfile.avatar}
        userName={userProfile.name}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header title={activeView} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
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
