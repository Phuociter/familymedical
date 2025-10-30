import React, { useState } from "react";
import { FaTimes, FaFileUpload, FaPlus, FaSave } from "react-icons/fa";
  const UPLOAD_PDF = gql` mutation UploadPdf($file: Upload!) { uploadPdf(file: $file) }`;
export default function FamilyPdfList({ member, onClose }) {
  const [pdfList, setPdfList] = useState(member.pdfs || []);
  const [uploadPdf] = useMutation(UPLOAD_PDF);
  const [formData, setFormData] = useState({
    pdfFiles: [],
  });

  // 📂 Khi chọn file PDF
  const handleAddPdf = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      id: Date.now() + Math.random(),
      file, // giữ file thật để upload
      name: file.name,
      addedAt: new Date().toLocaleString(),
    }));

    setFormData((prev) => ({
      ...prev,
      pdfFiles: [...prev.pdfFiles, ...newFiles],
    }));
  };

  // 🗑️ Xoá file PDF khỏi danh sách hiện tại
  const handleDeletePDF = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bệnh án này?")) {
      setPdfList((prev) => prev.filter((pdf) => pdf.id !== id));
    }
  };

  // 💾 Upload PDF thật lên Cloudinary qua GraphQL
  const handleSavePDF = async () => {
    if (formData.pdfFiles.length === 0) {
      alert("❗Vui lòng chọn ít nhất 1 file PDF!");
      return;
    }

    try {
      const uploadedFiles = [];

      for (const pdf of formData.pdfFiles) {
        // 📤 Gọi mutation uploadPdf(file: Upload!)
        const result = await uploadPdf({
          variables: { file: pdf.file },
        });

        const uploadedUrl = result.data?.uploadPdf;

        uploadedFiles.push({
          id: Date.now() + Math.random(),
          name: pdf.name,
          addedAt: pdf.addedAt,
          note: "Đã upload lên cloud.",
          url: uploadedUrl,
        });
      }

      setPdfList((prev) => [...prev, ...uploadedFiles]);
      setFormData({ pdfFiles: [] });

      alert("✅ Đã upload file PDF lên Cloud thành công!");
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi upload PDF lên cloud!");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#00000080] backdrop-blur-sm z-[9999]"
      onClick={onClose}
    >
      {/* 🔹 Khung chính */}
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#ffffff] p-6 rounded-2xl shadow-2xl border border-[#cccccc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#e0e0e0] pb-3 mb-4">
          <h2 className="text-2xl font-bold text-[#42A5F5]">
            Danh sách bệnh án của {member.name}
          </h2>
          <button
            onClick={onClose}
            className="text-[#9E9E9E] hover:text-[#F44336] transition"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách PDF */}
        {pdfList.length === 0 ? (
          <p className="text-center py-4 text-[#9E9E9E]">
            Chưa có bệnh án nào được thêm.
          </p>
        ) : (
          <ul className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {pdfList.map((pdf) => (
              <li
                key={pdf.id}
                className="p-3 rounded-md flex justify-between items-center transition"
                style={{
                  backgroundColor: "#f5f5f5",
                  border: "1px solid #bdbdbd",
                }}
              >
                <div>
                  <div className="font-medium text-[#424242]">{pdf.note}</div>
                  <div className="text-xs text-[#9E9E9E]">{pdf.addedAt}</div>
                  <div className="text-sm mt-1 text-[#1E88E5]">{pdf.name}</div>
                </div>
                <button
                  onClick={() => handleDeletePDF(pdf.id)}
                  className="text-sm hover:underline"
                  style={{ color: "#E53935" }}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Khu vực thêm PDF */}
        <div className="mt-6 p-4 bg-[#E3F2FD] border border-[#64B5F6] rounded-lg">
          <h3 className="text-lg font-semibold text-[#1976D2] mb-3 flex items-center gap-2">
            <FaFileUpload /> Thêm file bệnh án (PDF)
          </h3>

          <label className="flex items-center justify-center w-full border-2 border-dashed border-[#42A5F5] rounded-lg py-4 cursor-pointer hover:bg-[#BBDEFB] transition">
            <FaPlus className="mr-2" />
            <span className="text-[#1E88E5] font-medium">Chọn file PDF</span>
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleAddPdf}
              className="hidden"
            />
          </label>

          {/* Danh sách file vừa chọn */}
          {formData.pdfFiles.length > 0 && (
            <>
              <ul className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                {formData.pdfFiles.map((file) => (
                  <li
                    key={file.id}
                    className="p-2 bg-[#ffffff] rounded border border-[#B0BEC5] text-sm flex justify-between"
                  >
                    <span className="text-[#424242]">{file.name}</span>
                    <span className="text-[#9E9E9E]">{file.addedAt}</span>
                  </li>
                ))}
              </ul>

              {/* 🟦 Nút lưu chỉ hiện khi đã chọn file */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSavePDF}
                  className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition"
                  style={{
                    backgroundColor: "#42A5F5",
                    color: "#ffffff",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#1E88E5")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#42A5F5")
                  }
                >
                  <FaSave />
                  Lưu file PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
