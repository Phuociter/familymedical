package com.example.famMedical.config;

import com.example.famMedical.Entity.*;
import com.example.famMedical.Entity.Appointment.AppointmentStatus;
import com.example.famMedical.Entity.DoctorAssignment.AssignmentStatus;
import com.example.famMedical.Entity.Member.Gender;
import com.example.famMedical.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DataLoader để tự động tạo dữ liệu test khi ứng dụng khởi động
 * Chỉ chạy khi property test.data.loader.enabled = true
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TestDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final MemberRepository memberRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final DoctorAssignmentRepository doctorAssignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${test.data.loader.enabled:false}")
    private boolean enabled;

    @Value("${test.data.loader.password:123456}")
    private String defaultPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            log.info("Test data loader is disabled. Set test.data.loader.enabled=true to enable.");
            return;
        }

        log.info("Starting test data loader...");

        // Kiểm tra xem dữ liệu đã tồn tại chưa
        if (userRepository.existsByEmail("nguyenvanan@gmail.com")) {
            log.info("Test data already exists. Skipping data creation.");
            return;
        }

        try {
            // 1. Tạo bác sĩ
            List<User> doctors = createDoctors();
            log.info("Created {} doctors", doctors.size());

            // 2. Tạo chủ hộ và gia đình
            List<Family> families = createFamilies();
            log.info("Created {} families", families.size());

            // 3. Tạo thành viên
            List<Member> members = createMembers(families);
            log.info("Created {} members", members.size());

            // 4. Tạo phân công bác sĩ
            createDoctorAssignments(doctors, families);
            log.info("Created doctor assignments");

            // 5. Tạo hồ sơ bệnh án
            createMedicalRecords(members, doctors);
            log.info("Created medical records");

            // 6. Tạo lịch hẹn
            createAppointments(families, members, doctors);
            log.info("Created appointments");

            // 7. Tạo cuộc trò chuyện và tin nhắn
            createConversationsAndMessages(families, doctors);
            log.info("Created conversations and messages");

            log.info("Test data loaded successfully!");
            log.info("Default password for all test users: {}", defaultPassword);

        } catch (Exception e) {
            log.error("Error loading test data", e);
        }
    }

    private List<User> createDoctors() {
        List<User> doctors = new ArrayList<>();

        doctors.add(createUser(
            "Bác sĩ Nguyễn Văn Bác",
            "bacsi.nguyen@gmail.com",
            UserRole.BacSi,
            "0912345678",
            "123 Đường Yên Bái, Quận 1, TP.HCM",
            "012345678901",
            "BS001",
            null,
            null
        ));

        doctors.add(createUser(
            "Bác sĩ Trần Thị Y",
            "bacsi.tran@gmail.com",
            UserRole.BacSi,
            "0923456789",
            "456 Đường Lê Lợi, Quận 3, TP.HCM",
            "012345678902",
            "BS002",
            null,
            null
        ));

        doctors.add(createUser(
            "Bác sĩ Lê Văn C",
            "bacsi.le@gmail.com",
            UserRole.BacSi,
            "0934567890",
            "789 Đường Nguyễn Huệ, Quận 5, TP.HCM",
            "012345678903",
            "BS003",
            null,
            null
        ));

        return userRepository.saveAll(doctors);
    }

    private List<Family> createFamilies() {
        List<Family> families = new ArrayList<>();
        List<User> heads = new ArrayList<>();

        // Tạo chủ hộ
        heads.add(createUser(
            "Nguyễn Văn An",
            "nguyenvanan@gmail.com",
            UserRole.ChuHo,
            "0945678901",
            "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
            "012345678910",
            null,
            null,
            null
        ));

        heads.add(createUser(
            "Trần Thị Bình",
            "tranthibinh@gmail.com",
            UserRole.ChuHo,
            "0956789012",
            "456 Đường Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP.HCM",
            "012345678911",
            null,
            null,
            null
        ));

        heads.add(createUser(
            "Lê Văn Cường",
            "levancuong@gmail.com",
            UserRole.ChuHo,
            "0967890123",
            "789 Đường Pasteur, Phường Đa Kao, Quận 1, TP.HCM",
            "012345678912",
            null,
            null,
            null
        ));

        heads.add(createUser(
            "Phạm Thị Dung",
            "phamthidung@gmail.com",
            UserRole.ChuHo,
            "0978901234",
            "321 Đường Điện Biên Phủ, Phường 25, Quận Bình Thạnh, TP.HCM",
            "012345678913",
            null,
            null,
            null
        ));

        heads.add(createUser(
            "Hoàng Văn Em",
            "hoangvanem@gmail.com",
            UserRole.ChuHo,
            "0989012345",
            "654 Đường Võ Văn Tần, Phường 6, Quận 3, TP.HCM",
            "012345678914",
            null,
            null,
            null
        ));

        List<User> savedHeads = userRepository.saveAll(heads);

        // Tạo gia đình
        families.add(createFamily("Gia đình Nguyễn Văn An", savedHeads.get(0).getAddress(), savedHeads.get(0)));
        families.add(createFamily("Gia đình Trần Thị Bình", savedHeads.get(1).getAddress(), savedHeads.get(1)));
        families.add(createFamily("Gia đình Lê Văn Cường", savedHeads.get(2).getAddress(), savedHeads.get(2)));
        families.add(createFamily("Gia đình Phạm Thị Dung", savedHeads.get(3).getAddress(), savedHeads.get(3)));
        families.add(createFamily("Gia đình Hoàng Văn Em", savedHeads.get(4).getAddress(), savedHeads.get(4)));

        return familyRepository.saveAll(families);
    }

    private List<Member> createMembers(List<Family> families) {
        List<Member> members = new ArrayList<>();

        // Gia đình 1: Nguyễn Văn An (3 thành viên)
        members.add(createMember(families.get(0), "Nguyễn Văn An", LocalDate.of(1980, 5, 15), Gender.Nam, "012345678910", "Chủ hộ", "0945678901"));
        members.add(createMember(families.get(0), "Nguyễn Thị Lan", LocalDate.of(1985, 8, 20), Gender.Nữ, "012345678920", "Vợ", "0945678902"));
        members.add(createMember(families.get(0), "Nguyễn Văn Minh", LocalDate.of(2010, 3, 10), Gender.Nam, null, "Con trai", null));

        // Gia đình 2: Trần Thị Bình (2 thành viên)
        members.add(createMember(families.get(1), "Trần Thị Bình", LocalDate.of(1975, 11, 25), Gender.Nữ, "012345678911", "Chủ hộ", "0956789012"));
        members.add(createMember(families.get(1), "Trần Văn Đức", LocalDate.of(2005, 7, 15), Gender.Nam, null, "Con trai", null));

        // Gia đình 3: Lê Văn Cường (3 thành viên)
        members.add(createMember(families.get(2), "Lê Văn Cường", LocalDate.of(1988, 2, 14), Gender.Nam, "012345678912", "Chủ hộ", "0967890123"));
        members.add(createMember(families.get(2), "Lê Thị Hoa", LocalDate.of(1990, 6, 18), Gender.Nữ, "012345678922", "Vợ", "0967890124"));
        members.add(createMember(families.get(2), "Lê Văn Tuấn", LocalDate.of(2015, 9, 5), Gender.Nam, null, "Con trai", null));

        // Gia đình 4: Phạm Thị Dung (2 thành viên)
        members.add(createMember(families.get(3), "Phạm Thị Dung", LocalDate.of(1982, 4, 30), Gender.Nữ, "012345678913", "Chủ hộ", "0978901234"));
        members.add(createMember(families.get(3), "Phạm Văn Hùng", LocalDate.of(2008, 12, 20), Gender.Nam, null, "Con trai", null));

        // Gia đình 5: Hoàng Văn Em (3 thành viên)
        members.add(createMember(families.get(4), "Hoàng Văn Em", LocalDate.of(1978, 9, 12), Gender.Nam, "012345678914", "Chủ hộ", "0989012345"));
        members.add(createMember(families.get(4), "Hoàng Thị Mai", LocalDate.of(1980, 1, 22), Gender.Nữ, "012345678924", "Vợ", "0989012346"));
        members.add(createMember(families.get(4), "Hoàng Văn Long", LocalDate.of(2012, 5, 8), Gender.Nam, null, "Con trai", null));

        return memberRepository.saveAll(members);
    }

    private void createDoctorAssignments(List<User> doctors, List<Family> families) {
        List<DoctorAssignment> assignments = new ArrayList<>();

        // Bác sĩ 1 phụ trách gia đình 1, 2
        assignments.add(createDoctorAssignment(doctors.get(0), families.get(0)));
        assignments.add(createDoctorAssignment(doctors.get(0), families.get(1)));

        // Bác sĩ 2 phụ trách gia đình 3, 4
        assignments.add(createDoctorAssignment(doctors.get(1), families.get(2)));
        assignments.add(createDoctorAssignment(doctors.get(1), families.get(3)));

        // Bác sĩ 3 phụ trách gia đình 5
        assignments.add(createDoctorAssignment(doctors.get(2), families.get(4)));

        doctorAssignmentRepository.saveAll(assignments);
    }

    private void createMedicalRecords(List<Member> members, List<User> doctors) {
        List<MedicalRecord> records = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Gia đình 1 - Member 0 (Nguyễn Văn An) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(0), doctors.get(0), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family1_member1_bloodtest1.pdf",
            "Xét nghiệm máu tổng quát - Kiểm tra định kỳ", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(0), doctors.get(0), MedicalRecord.FileType.Chup_XQuang,
            "https://example.com/records/family1_member1_xray1.jpg",
            "Chụp X-quang phổi - Kiểm tra sức khỏe", now.minusMonths(1)));
        records.add(createMedicalRecord(members.get(0), doctors.get(0), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family1_member1_checkup1.pdf",
            "Phiếu khám bệnh - Khám tổng quát", now.minusWeeks(2)));

        // Gia đình 1 - Member 1 (Nguyễn Thị Lan) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(1), doctors.get(0), MedicalRecord.FileType.Sieu_Am,
            "https://example.com/records/family1_member2_ultrasound1.png",
            "Siêu âm bụng tổng quát", now.minusMonths(3)));
        records.add(createMedicalRecord(members.get(1), doctors.get(0), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family1_member2_bloodtest1.pdf",
            "Xét nghiệm máu - Kiểm tra sức khỏe phụ nữ", now.minusMonths(1)));

        // Gia đình 1 - Member 2 (Nguyễn Văn Minh) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(2), doctors.get(0), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family1_member3_checkup1.pdf",
            "Khám sức khỏe định kỳ cho trẻ em", now.minusMonths(4)));
        records.add(createMedicalRecord(members.get(2), doctors.get(0), MedicalRecord.FileType.Ho_So_Tiem_Chung,
            "https://example.com/records/family1_member3_vaccine1.pdf",
            "Hồ sơ tiêm chủng - Mũi tiêm định kỳ", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(2), doctors.get(0), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family1_member3_bloodtest1.pdf",
            "Xét nghiệm máu cho trẻ em", now.minusMonths(1)));

        // Gia đình 2 - Member 3 (Trần Thị Bình) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(3), doctors.get(0), MedicalRecord.FileType.Dien_Tam_Do_ECG,
            "https://example.com/records/family2_member4_ecg1.pdf",
            "Điện tâm đồ - Kiểm tra tim mạch", now.minusMonths(3)));
        records.add(createMedicalRecord(members.get(3), doctors.get(0), MedicalRecord.FileType.Xet_Nghiem_Sinh_Hoa_Mau,
            "https://example.com/records/family2_member4_biochem1.pdf",
            "Xét nghiệm sinh hóa máu", now.minusMonths(1)));

        // Gia đình 2 - Member 4 (Trần Văn Đức) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(4), doctors.get(0), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family2_member5_checkup1.pdf",
            "Khám sức khỏe định kỳ", now.minusMonths(5)));
        records.add(createMedicalRecord(members.get(4), doctors.get(0), MedicalRecord.FileType.Chup_XQuang,
            "https://example.com/records/family2_member5_xray1.jpg",
            "Chụp X-quang ngực", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(4), doctors.get(0), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family2_member5_bloodtest1.pdf",
            "Xét nghiệm máu tổng quát", now.minusWeeks(3)));

        // Gia đình 3 - Member 5 (Lê Văn Cường) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(5), doctors.get(1), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family3_member6_bloodtest1.pdf",
            "Xét nghiệm máu tổng quát", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(5), doctors.get(1), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family3_member6_checkup1.pdf",
            "Khám sức khỏe định kỳ", now.minusMonths(1)));

        // Gia đình 3 - Member 6 (Lê Thị Hoa) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(6), doctors.get(1), MedicalRecord.FileType.Sieu_Am_San_Khoa,
            "https://example.com/records/family3_member7_ultrasound1.png",
            "Siêu âm sản khoa", now.minusMonths(4)));
        records.add(createMedicalRecord(members.get(6), doctors.get(1), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family3_member7_bloodtest1.pdf",
            "Xét nghiệm máu - Kiểm tra sức khỏe phụ nữ", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(6), doctors.get(1), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family3_member7_checkup1.pdf",
            "Khám phụ khoa định kỳ", now.minusWeeks(3)));

        // Gia đình 3 - Member 7 (Lê Văn Tuấn) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(7), doctors.get(1), MedicalRecord.FileType.Ho_So_Tiem_Chung,
            "https://example.com/records/family3_member8_vaccine1.pdf",
            "Hồ sơ tiêm chủng", now.minusMonths(6)));
        records.add(createMedicalRecord(members.get(7), doctors.get(1), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family3_member8_checkup1.pdf",
            "Khám sức khỏe cho trẻ em", now.minusMonths(2)));

        // Gia đình 4 - Member 8 (Phạm Thị Dung) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(8), doctors.get(1), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family4_member9_bloodtest1.pdf",
            "Xét nghiệm máu tổng quát", now.minusMonths(3)));
        records.add(createMedicalRecord(members.get(8), doctors.get(1), MedicalRecord.FileType.Dien_Tam_Do_ECG,
            "https://example.com/records/family4_member9_ecg1.pdf",
            "Điện tâm đồ", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(8), doctors.get(1), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family4_member9_checkup1.pdf",
            "Khám sức khỏe định kỳ", now.minusMonths(1)));

        // Gia đình 4 - Member 9 (Phạm Văn Hùng) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(9), doctors.get(1), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family4_member10_checkup1.pdf",
            "Khám sức khỏe định kỳ cho trẻ em", now.minusMonths(4)));
        records.add(createMedicalRecord(members.get(9), doctors.get(1), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family4_member10_bloodtest1.pdf",
            "Xét nghiệm máu", now.minusMonths(2)));

        // Gia đình 5 - Member 10 (Hoàng Văn Em) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(10), doctors.get(2), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family5_member11_bloodtest1.pdf",
            "Xét nghiệm máu tổng quát", now.minusMonths(3)));
        records.add(createMedicalRecord(members.get(10), doctors.get(2), MedicalRecord.FileType.Chup_XQuang,
            "https://example.com/records/family5_member11_xray1.jpg",
            "Chụp X-quang phổi", now.minusMonths(1)));

        // Gia đình 5 - Member 11 (Hoàng Thị Mai) - 3 hồ sơ
        records.add(createMedicalRecord(members.get(11), doctors.get(2), MedicalRecord.FileType.Sieu_Am,
            "https://example.com/records/family5_member12_ultrasound1.png",
            "Siêu âm bụng tổng quát", now.minusMonths(4)));
        records.add(createMedicalRecord(members.get(11), doctors.get(2), MedicalRecord.FileType.Xet_Nghiem_Mau,
            "https://example.com/records/family5_member12_bloodtest1.pdf",
            "Xét nghiệm máu", now.minusMonths(2)));
        records.add(createMedicalRecord(members.get(11), doctors.get(2), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family5_member12_checkup1.pdf",
            "Khám sức khỏe phụ nữ", now.minusMonths(1)));

        // Gia đình 5 - Member 12 (Hoàng Văn Long) - 2 hồ sơ
        records.add(createMedicalRecord(members.get(12), doctors.get(2), MedicalRecord.FileType.Ho_So_Tiem_Chung,
            "https://example.com/records/family5_member13_vaccine1.pdf",
            "Hồ sơ tiêm chủng", now.minusMonths(5)));
        records.add(createMedicalRecord(members.get(12), doctors.get(2), MedicalRecord.FileType.Phieu_Kham_Benh,
            "https://example.com/records/family5_member13_checkup1.pdf",
            "Khám sức khỏe cho trẻ em", now.minusMonths(3)));

        medicalRecordRepository.saveAll(records);
    }

    private void createAppointments(List<Family> families, List<Member> members, List<User> doctors) {
        List<Appointment> appointments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Lấy ngày đầu tuần (Thứ 2)
        LocalDateTime startOfWeek = now.with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0).withNano(0);
        if (startOfWeek.isAfter(now)) {
            startOfWeek = startOfWeek.minusWeeks(1);
        }

        // Thứ 2
        appointments.add(createAppointment(doctors.get(0), families.get(0), members.get(0),
            "Khám sức khỏe định kỳ", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(0).withHour(9).withMinute(0), 30,
            "Phòng khám số 1", "Bệnh nhân cần khám tổng quát", "Theo dõi huyết áp và đường huyết"));

        appointments.add(createAppointment(doctors.get(0), families.get(1), members.get(3),
            "Tái khám tim mạch", AppointmentType.FOLLOW_UP,
            startOfWeek.plusDays(0).withHour(10).withMinute(0), 30,
            "Phòng khám số 2", "Tái khám sau điều trị", "Kiểm tra kết quả điện tâm đồ"));

        // Thứ 3
        appointments.add(createAppointment(doctors.get(0), families.get(0), members.get(2),
            "Khám sức khỏe trẻ em", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(1).withHour(14).withMinute(0), 20,
            "Phòng khám số 1", "Khám định kỳ cho trẻ", "Kiểm tra phát triển và tiêm chủng"));

        appointments.add(createAppointment(doctors.get(1), families.get(2), members.get(6),
            "Khám phụ khoa", AppointmentType.CONSULTATION,
            startOfWeek.plusDays(1).withHour(15).withMinute(0), 30,
            "Phòng khám số 3", "Khám phụ khoa định kỳ", "Kiểm tra sức khỏe phụ nữ"));

        // Thứ 4
        appointments.add(createAppointment(doctors.get(1), families.get(2), members.get(5),
            "Khám sức khỏe tổng quát", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(2).withHour(9).withMinute(0), 30,
            "Phòng khám số 2", "Khám định kỳ", "Kiểm tra sức khỏe tổng quát"));

        appointments.add(createAppointment(doctors.get(1), families.get(3), members.get(8),
            "Tái khám tim mạch", AppointmentType.FOLLOW_UP,
            startOfWeek.plusDays(2).withHour(10).withMinute(0), 30,
            "Phòng khám số 3", "Tái khám sau điều trị", "Theo dõi kết quả điện tâm đồ"));

        // Thứ 5
        appointments.add(createAppointment(doctors.get(0), families.get(1), members.get(4),
            "Khám sức khỏe trẻ em", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(3).withHour(14).withMinute(0), 20,
            "Phòng khám số 1", "Khám định kỳ cho trẻ", "Kiểm tra phát triển"));

        appointments.add(createAppointment(doctors.get(2), families.get(4), members.get(11),
            "Khám sức khỏe phụ nữ", AppointmentType.CONSULTATION,
            startOfWeek.plusDays(3).withHour(15).withMinute(0), 30,
            "Phòng khám số 4", "Khám định kỳ", "Kiểm tra sức khỏe phụ nữ"));

        // Thứ 6
        appointments.add(createAppointment(doctors.get(0), families.get(0), members.get(1),
            "Khám sức khỏe phụ nữ", AppointmentType.CONSULTATION,
            startOfWeek.plusDays(4).withHour(9).withMinute(0), 30,
            "Phòng khám số 1", "Khám định kỳ", "Kiểm tra sức khỏe phụ nữ"));

        appointments.add(createAppointment(doctors.get(1), families.get(3), members.get(9),
            "Khám sức khỏe trẻ em", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(4).withHour(10).withMinute(0), 20,
            "Phòng khám số 2", "Khám định kỳ cho trẻ", "Kiểm tra phát triển"));

        appointments.add(createAppointment(doctors.get(2), families.get(4), members.get(10),
            "Khám sức khỏe tổng quát", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(4).withHour(14).withMinute(0), 30,
            "Phòng khám số 4", "Khám định kỳ", "Kiểm tra sức khỏe tổng quát"));

        // Thứ 7
        appointments.add(createAppointment(doctors.get(1), families.get(2), members.get(7),
            "Tiêm chủng", AppointmentType.VACCINATION,
            startOfWeek.plusDays(5).withHour(9).withMinute(0), 15,
            "Phòng khám số 3", "Tiêm chủng định kỳ", "Tiêm vaccine theo lịch"));

        appointments.add(createAppointment(doctors.get(2), families.get(4), members.get(12),
            "Khám sức khỏe trẻ em", AppointmentType.GENERAL_CHECKUP,
            startOfWeek.plusDays(5).withHour(10).withMinute(0), 20,
            "Phòng khám số 4", "Khám định kỳ cho trẻ", "Kiểm tra phát triển"));

        appointmentRepository.saveAll(appointments);
    }

    private void createConversationsAndMessages(List<Family> families, List<User> doctors) {
        List<Conversation> conversations = new ArrayList<>();
        List<Message> messages = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        // Cuộc trò chuyện 1: Bác sĩ 1 - Gia đình 1
        Conversation conv1 = Conversation.builder()
            .doctor(doctors.get(0))
            .family(families.get(0))
            .lastMessageAt(now)
            .createdAt(now.minusDays(5))
            .build();
        conversations.add(conv1);

        User head1 = families.get(0).getHeadOfFamily();
        messages.add(createMessage(conv1, head1, "Xin chào bác sĩ, tôi muốn đặt lịch khám cho gia đình", now.minusDays(5)));
        messages.add(createMessage(conv1, doctors.get(0), "Chào anh, tôi có thể giúp anh đặt lịch. Anh muốn khám vào ngày nào?", now.minusDays(5).plusMinutes(10)));
        messages.add(createMessage(conv1, head1, "Tôi muốn khám vào thứ 2 tuần sau được không ạ?", now.minusDays(4)));
        messages.add(createMessage(conv1, doctors.get(0), "Được ạ, tôi sẽ sắp xếp lịch cho anh vào 9h sáng thứ 2", now.minusDays(4).plusMinutes(5)));
        messages.add(createMessage(conv1, head1, "Cảm ơn bác sĩ nhiều ạ!", now));

        // Cuộc trò chuyện 2: Bác sĩ 1 - Gia đình 2
        Conversation conv2 = Conversation.builder()
            .doctor(doctors.get(0))
            .family(families.get(1))
            .lastMessageAt(now)
            .createdAt(now.minusDays(3))
            .build();
        conversations.add(conv2);

        User head2 = families.get(1).getHeadOfFamily();
        messages.add(createMessage(conv2, head2, "Bác sĩ ơi, kết quả xét nghiệm của tôi như thế nào ạ?", now.minusDays(3)));
        messages.add(createMessage(conv2, doctors.get(0), "Chào chị, kết quả xét nghiệm của chị bình thường. Chị có thể yên tâm", now.minusDays(3).plusHours(1)));
        messages.add(createMessage(conv2, head2, "Vậy tôi có cần tái khám không ạ?", now.minusDays(2)));
        messages.add(createMessage(conv2, doctors.get(0), "Chị nên tái khám sau 3 tháng để theo dõi. Tôi đã đặt lịch cho chị rồi", now));

        // Cuộc trò chuyện 3: Bác sĩ 2 - Gia đình 3
        Conversation conv3 = Conversation.builder()
            .doctor(doctors.get(1))
            .family(families.get(2))
            .lastMessageAt(now)
            .createdAt(now.minusDays(7))
            .build();
        conversations.add(conv3);

        User head3 = families.get(2).getHeadOfFamily();
        messages.add(createMessage(conv3, head3, "Bác sĩ cho tôi hỏi về tình trạng sức khỏe của vợ tôi", now.minusDays(7)));
        messages.add(createMessage(conv3, doctors.get(1), "Chào anh, vợ anh đang trong tình trạng tốt. Kết quả khám gần đây đều bình thường", now.minusDays(7).plusHours(1)));
        messages.add(createMessage(conv3, head3, "Cảm ơn bác sĩ, tôi yên tâm rồi", now.minusDays(6)));
        messages.add(createMessage(conv3, doctors.get(1), "Không có gì. Nếu có gì cần hỏi thêm, anh cứ liên hệ tôi", now.minusDays(5)));
        messages.add(createMessage(conv3, head3, "Bác sĩ ơi, tôi muốn đặt lịch khám cho con trai", now));

        // Cuộc trò chuyện 4: Bác sĩ 2 - Gia đình 4
        Conversation conv4 = Conversation.builder()
            .doctor(doctors.get(1))
            .family(families.get(3))
            .lastMessageAt(now)
            .createdAt(now.minusDays(2))
            .build();
        conversations.add(conv4);

        User head4 = families.get(3).getHeadOfFamily();
        messages.add(createMessage(conv4, head4, "Xin chào bác sĩ", now.minusDays(2)));
        messages.add(createMessage(conv4, doctors.get(1), "Chào chị, tôi có thể giúp gì cho chị?", now.minusDays(2).plusMinutes(30)));
        messages.add(createMessage(conv4, head4, "Tôi muốn hỏi về kết quả điện tâm đồ của tôi", now.minusDays(1)));
        messages.add(createMessage(conv4, doctors.get(1), "Kết quả điện tâm đồ của chị bình thường. Tim mạch chị đang ổn định", now));

        // Cuộc trò chuyện 5: Bác sĩ 3 - Gia đình 5
        Conversation conv5 = Conversation.builder()
            .doctor(doctors.get(2))
            .family(families.get(4))
            .lastMessageAt(now)
            .createdAt(now.minusDays(4))
            .build();
        conversations.add(conv5);

        User head5 = families.get(4).getHeadOfFamily();
        messages.add(createMessage(conv5, head5, "Bác sĩ ơi, tôi có câu hỏi về đơn thuốc", now.minusDays(4)));
        messages.add(createMessage(conv5, doctors.get(2), "Chào anh, anh có thể hỏi tôi bất cứ điều gì về đơn thuốc", now.minusDays(4).plusMinutes(25)));
        messages.add(createMessage(conv5, head5, "Tôi uống thuốc vào lúc nào trong ngày là tốt nhất ạ?", now.minusDays(3)));
        messages.add(createMessage(conv5, doctors.get(2), "Anh nên uống sau bữa ăn sáng và tối, mỗi lần 1 viên", now.minusDays(3).plusMinutes(15)));
        messages.add(createMessage(conv5, head5, "Cảm ơn bác sĩ nhiều ạ", now));

        // Lưu conversations trước
        List<Conversation> savedConversations = conversationRepository.saveAll(conversations);
        
        // Cập nhật conversation reference cho messages
        for (int i = 0; i < messages.size(); i++) {
            if (i < 5) messages.get(i).setConversation(savedConversations.get(0));
            else if (i < 9) messages.get(i).setConversation(savedConversations.get(1));
            else if (i < 14) messages.get(i).setConversation(savedConversations.get(2));
            else if (i < 18) messages.get(i).setConversation(savedConversations.get(3));
            else messages.get(i).setConversation(savedConversations.get(4));
        }

        messageRepository.saveAll(messages);
    }

    // Helper methods
    private User createUser(String fullName, String email, UserRole role, String phoneNumber,
                           String address, String cccd, String doctorCode, String hospitalName, String yearsOfExperience) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(defaultPassword));
        user.setRole(role);
        user.setPhoneNumber(phoneNumber);
        user.setAddress(address);
        user.setCccd(cccd);
        user.setDoctorCode(doctorCode);
        user.setHospitalName(hospitalName);
        user.setYearsOfExperience(yearsOfExperience);
        user.setVerified(true);
        user.setLocked(false);
        user.setProfileComplete(true);
        user.setCreatedAt(LocalDateTime.now());
        return user;
    }

    private Family createFamily(String familyName, String address, User headOfFamily) {
        Family family = new Family();
        family.setFamilyName(familyName);
        family.setAddress(address);
        family.setHeadOfFamily(headOfFamily);
        family.setCreatedAt(java.time.OffsetDateTime.now());
        return family;
    }

    private Member createMember(Family family, String fullName, LocalDate dateOfBirth, Gender gender,
                                String cccd, String relationship, String phoneNumber) {
        Member member = new Member();
        member.setFamily(family);
        member.setFullName(fullName);
        member.setDateOfBirth(dateOfBirth);
        member.setGender(gender);
        member.setCccd(cccd);
        member.setRelationship(relationship);
        member.setPhoneNumber(phoneNumber);
        member.setCreatedAt(LocalDateTime.now());
        return member;
    }

    private DoctorAssignment createDoctorAssignment(User doctor, Family family) {
        DoctorAssignment assignment = new DoctorAssignment();
        assignment.setDoctor(doctor);
        assignment.setFamily(family);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        return assignment;
    }

    private MedicalRecord createMedicalRecord(Member member, User doctor, MedicalRecord.FileType fileType,
                                              String fileLink, String description, LocalDateTime uploadDate) {
        MedicalRecord record = MedicalRecord.builder()
            .member(member)
            .doctor(doctor)
            .fileType(fileType)
            .fileLink(fileLink)
            .description(description)
            .recordDate(uploadDate.toLocalDate())
            .uploadDate(uploadDate)
            .build();
        return record;
    }

    private Appointment createAppointment(User doctor, Family family, Member member, String title,
                                         AppointmentType type, LocalDateTime appointmentDateTime, int duration,
                                         String location, String notes, String doctorNotes) {
        return Appointment.builder()
            .doctor(doctor)
            .family(family)
            .member(member)
            .title(title)
            .type(type)
            .appointmentDateTime(appointmentDateTime)
            .duration(duration)
            .status(AppointmentStatus.SCHEDULED)
            .location(location)
            .notes(notes)
            .doctorNotes(doctorNotes)
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
    }

    private Message createMessage(Conversation conversation, User sender, String content, LocalDateTime createdAt) {
        Message message = Message.builder()
            .conversation(conversation)
            .sender(sender)
            .content(content)
            .isRead(false)
            .createdAt(createdAt)
            .build();
        
        // Đánh dấu đã đọc nếu là tin nhắn cũ
        if (createdAt.isBefore(LocalDateTime.now().minusHours(1))) {
            message.setIsRead(true);
            message.setReadAt(createdAt.plusMinutes(5));
        }
        
        return message;
    }
}

