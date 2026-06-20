# Faculty of Education Project Tracking Dashboard (ระบบติดตามแผนงานโครงการ คณะครุศาสตร์)

เว็บไซต์ Dashboard แสดงผลการติดตามแผนงานโครงการสำหรับผู้บริหารโรงเรียน/คณะครุศาสตร์ โดยดึงข้อมูลโดยตรงจาก Google Sheets แบบ Real-time ทุกครั้งที่มีการเปิดหน้าเว็บ

## 🌟 คุณสมบัติเด่น (Features)
- **Real-time Data Sync**: ดึงข้อมูลและสรุปผลใหม่โดยอัตโนมัติทุกครั้งที่มีผู้ใช้งานเปิดหน้า Dashboard โดยไม่มีข้อมูลตกค้างหรือแคช
- **KPI Metrics**: คำนวณสรุปสถิติสำคัญ ได้แก่
  - งบประมาณทั้งหมดที่จัดสรร
  - งบประมาณใช้จ่ายสะสม (พร้อมสัดส่วนเปอร์เซ็นต์)
  - งบประมาณคงเหลือทั้งหมด (พร้อมสัดส่วนเปอร์เซ็นต์)
  - ความคืบหน้าภาพรวม (คำนวณแบบถ่วงน้ำหนักตามงบประมาณของแต่ละโครงการ - Weighted Average Progress เพื่อความแม่นยำในการรายงานผล)
  - จำนวนโครงการที่เสร็จสิ้น
- **Interactive Visualizations**:
  - แผนภูมิแท่งเปรียบเทียบงบประมาณจัดสรร vs งบประมาณใช้ไป รายกลุ่มงาน (เปรียบเทียบงบประมาณของแต่ละกลุ่มงานอย่างชัดเจน)
  - แผนภูมิวงโดนัทสัดส่วนสถานะโครงการ (ดำเนินการแล้ว, อยู่ระหว่างดำเนินการ, ยังไม่ดำเนินการ)
- **Advanced Filtering**: ค้นหาโครงการตามชื่อหรือผู้รับผิดชอบ และกรองข้อมูลแยกตามกลุ่มงานหรือสถานะ
- **Detail View Modal**: คลิกที่แถวโครงการเพื่อแสดงรายละเอียดของแต่ละโครงการเชิงลึก (ผู้รับผิดชอบ, งบประมาณแต่ละส่วน, เปอร์เซ็นต์ความคืบหน้า และสถานะ)
- **Theme Customization**: สลับโหมดการแสดงผล (Dark Mode / Light Mode) โดยจดจำการตั้งค่าของท่านผ่าน `localStorage`
- **Premium Interface**: ออกแบบด้วยสไตล์ Glassmorphism สวยงาม ทันสมัย รองรับการแสดงผลบนอุปกรณ์พกพาและเดสก์ท็อปทุกประเภท (Responsive Design)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
1. **Core**: HTML5, Vanilla CSS3, Vanilla JS (ES6)
2. **Data Parsing**: [PapaParse](https://www.papaparse.com/) สำหรับแปลงข้อมูล CSV จาก Google Sheets
3. **Data Visualization**: [ApexCharts](https://apexcharts.com/) เพื่อการวาดแผนภูมิเชิงปฏิสัมพันธ์ที่ลื่นไหล
4. **Icons**: [Lucide Icons](https://lucide.dev/)
5. **Fonts**: Google Fonts (Outfit & Sarabun)

---

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)
```
proAI/
├── index.html        # โครงสร้างหน้าเว็บหลักและองค์ประกอบ
├── styles.css        # สไตล์ชีทระบบ Glassmorphism, ธีมมืด/สว่าง และ Responsive
├── app.js            # ระบบการดึงข้อมูล Google Sheets การประมวลผล สรุปสถิติ และควบคุมแผนภูมิ
└── README.md         # เอกสารแนะนำโครงการนี้
```

---

## 🔗 แหล่งข้อมูล (Google Sheet Data Source)
ข้อมูลหลักถูกจัดเก็บและอัปเดตบน Google Sheet:
- **Link**: [Google Sheet](https://docs.google.com/spreadsheets/d/13qFdAZsaw8KE4sDDK9aFpeWHOleCw6JHg4F_7cyQmDQ/edit?usp=sharing)
- **Data Export Endpoint**: หน้าเว็บจะเชื่อมโยงข้อมูลผ่าน URL ด้านล่างนี้ในรูปแบบ CSV เพื่อความรวดเร็วและหลีกเลี่ยงข้อจำกัดการเข้าถึง API:
  `https://docs.google.com/spreadsheets/d/13qFdAZsaw8KE4sDDK9aFpeWHOleCw6JHg4F_7cyQmDQ/export?format=csv`

---

## 🚀 วิธีการนำขึ้น GitHub Pages (Deployment)
เมื่อพัฒนาเสร็จสิ้น สามารถอัปโหลดขึ้น GitHub เพื่อเผยแพร่ได้ฟรีดังนี้:

1. **สร้าง Git Repository ในเครื่องและ Commit ไฟล์**
   เปิด Command Prompt/PowerShell หรือ Terminal ในโฟลเดอร์โครงการแล้วรัน:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Education Dashboard"
   ```

2. **เชื่อมต่อไปยัง GitHub**
   สร้าง Repository เปล่าตัวใหม่ใน GitHub (ห้ามมี README.md, LICENSE หรือ .gitignore ในขั้นตอนสร้างบนเว็บ) แล้วคัดลอกลิงก์ repository นั้นมารันคำสั่ง:
   ```bash
   git branch -M main
   git remote add origin <URL_REPOSITORY_ของคุณ_บน_GITHUB>
   git push -u origin main
   ```

3. **เปิดใช้งาน GitHub Pages**
   1. เข้าไปที่หน้า Repository ของคุณบนเว็บไซต์ GitHub
   2. ไปที่แท็บ **Settings** > **Pages** (อยู่ในเมนูด้านซ้าย)
   3. ในหัวข้อ **Build and deployment** > **Source** ให้เลือกเป็น **Deploy from a branch**
   4. ในหัวข้อ **Branch** ให้เลือกเป็น `main` และโฟลเดอร์ `/ (root)` จากนั้นกด **Save**
   5. รอประมาณ 1-2 นาที GitHub จะสร้างลิงก์เว็บไซต์สำหรับเผยแพร่ให้โดยอัตโนมัติ (เช่น `https://<ชื่อยูสเซอร์>.github.io/<ชื่อคลังข้อมูล>/`)
