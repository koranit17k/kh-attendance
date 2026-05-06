---
title: Folder Structure
description: โครงสร้างโฟลเดอร์และหน้าที่ของไฟล์ต่างๆ ในโปรเจกต์
navigation:
  icon: i-lucide-folder-tree
---

# โครงสร้างโฟลเดอร์ (Folder Structure)

แผนผังโครงสร้างไฟล์และโฟลเดอร์ของโปรเจกต์ **kh-attendance** ฉบับละเอียด

```text
kh-attendance/
├── 📁 assets/                     # ไฟล์ CSS, รูปภาพ, ฟอนต์
├── 📁 components/                 # คอมโพเนนต์ Vue หลัก
│   ├── 📄 AttendanceChart.vue     # กราฟแท่งความเคลื่อนไหว
│   ├── 📄 AttendanceSum.vue       # KPI Cards สรุป
│   ├── 📄 Attendancetable.vue     # ตารางแสดงข้อมูลการเข้างาน
│   ├── 📄 Calendar.vue            # ปฏิทินสถานะรายวัน (เขียว/เหลือง/แดง)
│   ├── 📄 CompanyPieChart.vue     # กราฟวงกลมแบ่งบริษัท
│   ├── 📄 Editattendance.vue      # หน้าต่างแก้ไขข้อมูลการเข้างาน
│   ├── 📄 Editemployee.vue        # หน้าต่างแก้ไขข้อมูลพนักงาน
│   ├── 📄 Employeetable.vue       # ตารางรายชื่อพนักงาน
│   └── 📄 Report.vue              # คอมโพเนนต์จัดการรายงาน
├── 📁 content/                    # ไฟล์เอกสารคู่มือ (Markdown)
│   ├── 📁 1.attendance/           # หน้าใช้งานหลัก (Report, Emp, Att)
│   └── 📁 2.workprocess/          # ขั้นตอนการทำงานและคู่มือทั้งหมด
├── 📁 pages/                      # หน้าเว็บหลักตาม Routing
├── 📁 public/                     # ไฟล์ Static (Favicon, Logo)
├── 📁 report/                     # ระบบรายงาน Jasper Reports
│   ├── 📄 A01.jrxml               # รายงานเช็คเวลาประจำวัน
│   ├── 📄 A02.jrxml               # รายงานตรวจสอบรายบุคคล
│   ├── 📄 A03.jrxml               # รายงานสรุปประจำเดือน
│   ├── 📄 A04.jrxml               # รายงานวิเคราะห์พนักงาน
│   ├── 📄 A05.jrxml               # รายงานวิเคราะห์บริษัท
│   └── 📄 A06.jrxml               # รายงานวิเคราะห์พนักงานสาย
├── 📁 script/                     # สคริปต์จัดการระบบ (Shell Scripts)
│   ├── 📄 deploy.sh               # Build & Deploy ขึ้น Oracle Cloud
│   ├── 📄 copyreportcloud.sh      # ส่งไฟล์รายงานขึ้นคลาวด์
│   ├── 📄 copyreport.sh           # คัดลอกไฟล์รายงานในเครื่อง
│   ├── 📄 backup.sh               # สำรองฐานข้อมูล
│   ├── 📄 restore.sh              # กู้คืนฐานข้อมูล
│   └── 📄 runtest.sh              # รันการทดสอบ SQL
├── 📁 server/                     # ส่วนของหลังบ้าน (Nitro Engine)
│   ├── 📁 api/                    # API Endpoints (15+ ตัว)
│   ├── 📁 middleware/             # ระบบนับ Session/Visitor
│   ├── 📁 plugins/                # ตัวเชื่อมต่อฐานข้อมูล (DB Plugin)
│   └── 📁 utils/                  # ฟังก์ชันช่วยเหลือ (db.ts)
├── 📁 sql/                        # สคริปต์ฐานข้อมูล MySQL
│   ├── 📁 sqltest/                # ไฟล์ทดสอบความถูกต้องด้วย SQL
│   │   ├── 📄 1.seed_test_data.sql
│   │   ├── 📄 2.check_results.sql
│   │   └── 📄 3.cleartest.sql
│   ├── 📁 storage/                # ไฟล์ SQL สำรองและฟังก์ชันเสริม
│   │   ├── 📄 insert_attendance.sql
│   │   └── 📄 update_attendance.sql
│   ├── 📄 1.database.sql          # สร้าง DB & User
│   ├── 📄 2.table.sql             # สร้างตารางทั้งหมด
│   ├── 📄 3.view.sql              # สร้าง View พื้นฐาน
│   ├── 📄 4.myview.sql            # View สำหรับคำนวณ Logic
│   ├── 📄 5.procedure.sql         # Procedure ประมวลผล
│   ├── 📄 6.insert_and_clean.sql  # จัดการข้อมูลพนักงาน
│   ├── 📄 7.setup_autorun.sql     # ตั้งค่า Event Scheduler
│   └── 📄 8.check_autorun.sql     # ตรวจสอบการทำงานอัตโนมัติ
├── 📁 test/                       # ไฟล์ทดสอบระบบ (Unit Test)
│   └── 📄 att.test.js             # ทดสอบ Logic การคำนวณเวลางาน
├── 📄 nuxt.config.ts              # คอนฟิกหลักของระบบ
├── 📄 package.json                # รายการ Library และ Scripts
└── 📄 tsconfig.json               # คอนฟิกของ TypeScript
```

---

## 📝 คำอธิบายหมวดหมู่

### 📂 content/ (Documentation)
เป็นโฟลเดอร์ที่เก็บไฟล์ Markdown ทั้งหมดสำหรับแสดงผลเป็นคู่มือหน้าเว็บ:
- **1.attendance:** หน้าสำหรับใช้งานระบบ (Report, Employee, Attendance)
- **2.workprocess:** รวบรวม Workflow การพัฒนา, คู่มือการ Deploy และเทคนิคการเขียนโค้ดทั้งหมด

### 📂 report/ (A01 - A06)
แยกประเภทรายงานตามวัตถุประสงค์การใช้งาน:
- **A01-A03:** เน้นการตรวจสอบข้อมูลรายวันและรายเดือนเพื่อทำ Payroll
- **A04-A06:** เน้นการวิเคราะห์ (Analytics) ประสิทธิภาพพนักงานและบริษัท

### 📂 sql/ (Database & Logic)
- **sqltest:** ใช้สำหรับรันชุดทดสอบความถูกต้องของข้อมูลผ่าน SQL โดยตรง
- **ลำดับ 1-8:** เป็นหัวใจของระบบ Automation ที่ทำให้ข้อมูลอัปเดตทุกวันโดยไม่ต้องรันมือ

### 📂 server/api
- จัดการ API ทั้งหมด 15+ ตัว รองรับทั้งการดึงข้อมูล แก้ไขข้อมูล และการออกรายงานแบบ Real-time