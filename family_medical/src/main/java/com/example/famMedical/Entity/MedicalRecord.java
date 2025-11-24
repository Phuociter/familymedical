package com.example.famMedical.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "MedicalRecords")
@Data
// @NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {

    public MedicalRecord(){}

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RecordID", nullable = false)
    private Integer recordID;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "memberID")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "family"})
    private Member member;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctorID", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User doctor;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "FileType", nullable = true)
    private FileType fileType;

    @Column(name = "FileLink", nullable = true)
    private String fileLink;

    @Column(name = "Description", nullable = true)
    private String description;

    @Column(name = "RecordDate", nullable = true)
    private LocalDate recordDate;

    @Column(name = "UploadDate", nullable = true)
    private LocalDateTime uploadDate;

    private String symptoms;
    private String diagnosis;
    private String treatmentPlan;
    
    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
    }

    public enum FileType{
        Chup_XQuang,
        Sieu_Am,
        Chup_CT,
        Chup_MRI,
        Chup_Nhu_Anh_Mammography,
        Chup_PET_CT,
        Xet_Nghiem_Mau,
        Xet_Nghiem_Nuoc_Tieu,
        Xet_Nghiem_Sinh_Hoa_Mau,
        Xet_Nghiem_Mien_Dich_Huyet_Hoc,
        Xet_Nghiem_Vi_Sinh,
        Xet_Nghiem_Di_Truyen,
        Ket_Qua_PCR_Antigen_COVID19,
        Giai_Phau_Benh,
        Dien_Tam_Do_ECG,
        Dien_Nao_Do_EEG,
        Dien_Co_EMG,
        Do_Chuc_Nang_Ho_Hap_Spirometry,
        Holter_Dien_Tim,
        Holter_Huyet_Ap,
        Phieu_Kham_Benh,
        Don_Thuoc,
        Giay_Nhap_Vien,
        Giay_Ra_Vien,
        Giay_Chuyen_Tuyen,
        Ho_So_Tiem_Chung,
        Bao_Cao_Phau_Thuat,
        Ke_Hoach_Dieu_Tri,
        Ho_So_Nha_Khoa,
        Sieu_Am_San_Khoa,
        Kham_Thi_Luc,        
        Kham_Thinh_Luc,
        Test_Di_Ung,
    }
}
