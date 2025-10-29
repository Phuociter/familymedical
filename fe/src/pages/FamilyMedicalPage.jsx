import { useEffect, useState } from "react";
// import { getFamilies,createFamily,updateFamily,deleteFamily} from "../api/FamilyAPI";
// import {createMember,updateMember,deleteMember,uploadFiles,assignDoctor} from "../api/MemberAPI";
// import { getDoctors } from "../api/DoctorAPI";
import Header from "../components/FamilyMedicalComponent/header/Header";
import FamilyList from "../components/FamilyMedicalComponent/FamilyList";
import MemberCard from "../components/FamilyMedicalComponent/MemberCard";
import EditMemberModal from "../components/FamilyMedicalComponent/EditMemberModal";
import DoctorList from "../components/FamilyMedicalComponent/DoctorList";
import { fakeFamilies } from "../api/fakeData";
export default function FamilyMedicalPage() {
  const [families, setFamilies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    loadFamilies();
    loadDoctors();
  }, []);

  async function loadFamilies() {
    // const res = await getFamilies();
    setFamilies(res);
    if (!selectedFamilyId && res.length > 0) setSelectedFamilyId(res[0].id);
  }

  async function loadDoctors() {
    const res = await getDoctors();
    setDoctors(res);
  }

  async function addFamily() {
    const name = prompt("Tên hộ gia đình:");
    if (!name) return;
    const res = await createFamily(name);
    setFamilies([...families, res]);
  }

  // async function renameFamily(id) {
  //   const name = prompt("Tên mới:");
  //   if (!name) return;
  //   const res = await updateFamily(id, name);
  //   setFamilies(families.map((f) => (f.id === id ? res : f)));
  // }

  async function removeFamily(id) {
    if (!confirm("Xóa hộ này?")) return;
    await deleteFamily(id);
    setFamilies(families.filter((f) => f.id !== id));
  }

  async function addMember(familyId) {
    const newMember = await createMember(familyId);
    setFamilies(families.map((f) =>
      f.id === familyId ? { ...f, members: [newMember, ...f.members] } : f
    ));
  }

  async function saveMember(member, familyId) {
    const res = await updateMember(member);
    setFamilies(families.map((f) =>
      f.id === familyId ? {
        ...f,
        members: f.members.map((m) => (m.id === member.id ? res : m)),
      } : f
    ));
    setEditingMember(null);
  }

  async function removeMember(memberId, familyId) {
    await deleteMember(memberId);
    loadFamilies();
  }

  async function assignDoctorToMember(doctorId, memberId, familyId) {
    const res = await assignDoctor(memberId, doctorId);
    setFamilies(families.map((f) =>
      f.id === familyId
        ? { ...f, members: f.members.map((m) => (m.id === memberId ? res : m)) }
        : f
    ));
  }

  const selectedFamily = families.find((f) => f.id === selectedFamilyId);
  return (
    <div className="page">
      <Header />
      <div className="main-layout">
        
        <FamilyList
          families={fakeFamilies}
          selectedFamilyId={2}
          onSelect={2}
          // onAdd={addFamily}
          // onDelete={removeFamily}
          // onRename={renameFamily}
        />

      </div>

    </div>
  );
}
