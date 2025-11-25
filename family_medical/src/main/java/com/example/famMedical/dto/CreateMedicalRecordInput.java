package com.example.famMedical.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class CreateMedicalRecordInput {
    private Integer memberID;
    private String fileType;
    private String fileLink;
    private String description;
    private LocalDate recordDate;


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