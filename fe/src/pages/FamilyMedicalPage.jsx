import { useEffect, useState } from "react";
import {
  getFamilies,
  createFamily,
  updateFamily,
  deleteFamily,
} from "../API/FamilyAPI";
import {
  createMember,
  updateMember,
  deleteMember,
  uploadFiles,
  assignDoctor,
} from "../API/MemberAPI";
import { getDoctors } from "../API/DoctorAPI";
import Header from "../components/Header";
import FamilyList from "../components/FamilyList";
import MemberCard from "../components/MemberCard";
import EditMemberModal from "../components/EditMemberModal";
import DoctorList from "../components/DoctorList";

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
    const res = await getFamilies();
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

  async function renameFamily(id) {
    const name = prompt("Tên mới:");
    if (!name) return;
    const res = await updateFamily(id, name);
    setFamilies(families.map((f) => (f.id === id ? res : f)));
  }

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
      <Header onAddFamily={addFamily} />
      <div className="main-layout">
        <FamilyList
          families={families}
          selectedFamilyId={selectedFamilyId}
          onSelect={setSelectedFamilyId}
          onAdd={addFamily}
          onDelete={removeFamily}
          onRename={renameFamily}
        />

        <section className="content">
          {selectedFamily && (
            <>
              <h2>{selectedFamily.name}</h2>
              <button onClick={() => addMember(selectedFamily.id)}>+ Thêm hồ sơ</button>
              <div className="records-grid">
                {selectedFamily.members?.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    familyId={selectedFamily.id}
                    onEdit={(m) => setEditingMember({ ...m, familyId: selectedFamily.id })}
                    onDelete={removeMember}
                    onUpload={(memberId, familyId) => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.multiple = true;
                      input.accept = ".pdf";
                      input.onchange = (e) =>
                        uploadFiles(memberId, e.target.files);
                      input.click();
                    }}
                    onAssignDoctor={assignDoctorToMember}
                    doctors={doctors}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        <DoctorList doctors={doctors} previewUrl={previewUrl} />
      </div>

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          doctors={doctors}
          onClose={() => setEditingMember(null)}
          onSave={(m) => saveMember(m, editingMember.familyId)}
        />
      )}
    </div>
  );
}
