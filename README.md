# LAB3: เอกสารคู่มือการทดสอบความปลอดภัยเว็บแอปพลิเคชัน
 
## Security Testing Guide & Report Template

Team: กลุ่ม 6

1. ชื่อ-สกุล: พลพัต ทรวงหิรัญ
รหัสนักศึกษา: 66543210020-4

2. ชื่อ-สกุล: นายสุรพัศ  สุภาพ
รหัสนักศึกษา: 66543210033-7

วันที่ทดสอบ: 14/09/2025
เวลาที่ใช้: 3 วัน

การเตรียมความพร้อม (Pre-Testing Checklist)

✅  ตรวจสอบระบบ

✅  ติดตั้ง Node.js และ SQL Server เรียบร้อย

✅  สร้างฐานข้อมูลและ import ข้อมูลทดสอบแล้ว

✅  Vulnerable Server (port 3000) ทำงานได้

✅  Secure Server (port 3001) ทำงานได้

✅  Frontend files เปิดได้ในเบราว์เซอร์

✅  เครื่องมือทดสอบ (Browser Developer Tools) พร้อมใช้


---

# Part 1: การทดสอบ Vulnerable Version

เอกสารนี้สรุปขั้นตอนการทดสอบและหลักฐานสำหรับช่องโหว่ **SQL Injection** บนเวอร์ชันที่ตั้งใจทำให้มีช่องโหว่ (Vulnerable Version) เพื่อการศึกษาและปรับปรุงความปลอดภัยเท่านั้น

> ⚠️ ทดสอบเฉพาะสภาพแวดล้อมที่ควบคุมได้ (local / lab) ห้ามใช้กับระบบที่ไม่ได้รับอนุญาต

---

## Test Case 1.1: SQL Injection — Login Bypass

**วัตถุประสงค์**  
ทดสอบการ bypass ระบบล็อกอินด้วยการสอดแทรกคำสั่ง SQL

### ขั้นตอนการทดสอบ
1. เปิดไฟล์ `index.html` (Vulnerable Version)  
2. ไปยังส่วน **Login**  
3. กรอกข้อมูล:
   - **Username:** `admin'; --`
   - **Password:** `anything`
4. กดปุ่ม **Login**

### บันทึกผลการทดสอบ

| ผลลัพธ์ที่คาดหวัง                                 | ผลลัพธ์จริง (สรุป) | สถานะ |
|----------------------------------------------------|---------------------|-------|
| ระบบอนุญาตให้ Login ได้โดยไม่ตรวจสอบรหัสผ่าน      |  ระบบ bypass login เพราะว่ามี -- หลัง admin ทำให้ทุก query ที่อยู่หลัง -- ไป จะถูกมองข้ามเพราะเห็นเป็น comments จึงข้ามการตรวจสอบบัญชีไป       | [✅] สำเร็จ [] ล้มเหลว |



**หลักฐาน (Screenshots):**  
แนบไฟล์รูป: `<img width="1208" height="522" alt="image" src="https://github.com/user-attachments/assets/bcb97730-8a85-436e-8c75-336280e1f228" />

### วิเคราะห์และความคิดเห็น
- **สาเหตุ:** ระบบนำค่า input ไปต่อเป็นสตริง SQL ตรง ๆ ทำให้ `--` ทำให้ทุก query ที่ต่อจาก -- นับเป็น comments ระบบจึงข้ามการตรวจสอบบัญชี
- **ผลกระทบ:** ผู้โจมตีข้ามการตรวจสอบรหัสผ่าน เข้าสู่ระบบในนามผู้ใช้ `admin` ได้
- **แนวทางป้องกัน:** ใช้ **Prepared Statements / Parameterized Queries**, ตรวจสอบ input แบบ allow‑list, จำกัดสิทธิ์ Database

---

## Test Case 1.2: SQL Injection — Data Extraction

**วัตถุประสงค์**  
ทดสอบการดึงข้อมูลผู้ใช้ด้วยเทคนิค **UNION attack**

### ขั้นตอนการทดสอบ
1. ไปยังส่วน **Product Search**  
2. กรอกข้อมูล (Payload):
   ```sql
   ' UNION SELECT id,username,password FROM Users; --
   ```
3. กดปุ่ม **Search**

### บันทึกผลการทดสอบ

| ผลลัพธ์ที่คาดหวัง                        | ผลลัพธ์จริง (สรุป) | สถานะ |
|-------------------------------------------|---------------------|-------|
| แสดงข้อมูลผู้ใช้ (เช่น username/password) |            UNION attack ไม่สำเร็จ เพราะจำนวน column ของ UNION ไม่เท่ากันกับ column ของ Users       | [] สำเร็จ [✅] ล้มเหลว |

**ข้อมูลที่ได้รับ (ถ้ามี):**
- ไม่ได้รับเพราะทำไม่เสร็จ

**หลักฐาน (Screenshots):**  
แนบไฟล์รูป: `<img width="1231" height="405" alt="image" src="https://github.com/user-attachments/assets/af2085a9-88e4-4659-bfca-ef2baa3775a6" />

### วิเคราะห์และความคิดเห็น
- **สาเหตุ:** ถ้า Query ไม่ผูกพารามิเตอร์ `UNION` จะสามารถรวมข้อมูลจากตาราง `Users` ออกมาได้
- **ผลกระทบ:** ข้อมูลของผู้ใช้เสี่ยงต่อการรั่วไหล และสามารถโจมตีครั้งต่อๆไปได้อีก
- **แนวทางป้องกัน:** ใช้ **Prepared Statements**, validate/normalize input, จำกัดสิทธิ์ Database

---

## Test Case 1.3: Cross-Site Scripting (XSS)

**วัตถุประสงค์**  
ทดสอบการแทรก JavaScript code ผ่าน comment

### ขั้นตอนการทดสอบ
1. Login ด้วย user ปกติ (`john/password`)
2. ไปยังส่วน **Comments**
3. กรอก comment:
   ```html
   <script>alert('XSS Attack!');</script>
   ```
4. Submit comment

### บันทึกผลการทดสอบ

| ผลลัพธ์ที่คาดหวัง                    | ผลลัพธ์จริง (สรุป) | สถานะ |
|--------------------------------------|---------------------|-------|
| JavaScript execute และแสดง alert     | ไม่มี aleart XSS Attack! เกิดขึ้น | [] สำเร็จ [✅] ล้มเหลว |

---

### ทดสอบ XSS เพิ่มเติม

**Test 1.3.1: Cookie Stealing Simulation**
- Payload:
  ```html
  <script>alert('cookie: ' + document.cookie);</script>
  ```
- ผลลัพธ์: ไม่ผ่านเพราะ frontend render comment เป็น plain text

**Test 1.3.2: DOM Manipulation**
- Payload:
  ```html
  <img src=x onerror="alert('XSS via IMG tag')">
  ```
- ผลลัพธ์: ไม่ผ่านเพราะ frontend render comment เป็น plain text เหมือนกับข้อ 1.3 และ 1.3.1

---

### วิเคราะห์และความคิดเห็น

วิเคราะห์ความเสี่ยงจาก XSS:
- มีความเสี่ยงว่าจะถูกขโมย session/cookie
- การ redirect เข้าไปเว็บที่เสี่ยงและอันตรายต่อเรา
  
---

## Test Case 1.4: Insecure Direct Object Reference (IDOR)

**วัตถุประสงค์**  
ทดสอบการเข้าถึงข้อมูลผู้ใช้อื่นโดยไม่ได้รับอนุญาต

### ขั้นตอนการทดสอบ
1. Login ด้วย `john/password`  
2. ไปยังส่วน **User Profile**  
3. ลองเปลี่ยน **User ID** เป็น `1`, `2`, `3`  
4. สังเกตข้อมูลที่ได้รับ

### บันทึกผลการทดสอบ

| User ID | ข้อมูลที่แสดง | สามารถเข้าถึงได้ |
|--------:|----------------|------------------|
| 1 | User Profile:
ID: 1
Username: admin
Email: admin@example.com
Password: admin123
Role: admin
Created: 9/13/2025 | [✅] ใช่  [] ไม่ |
| 2 | User Profile:
ID: 2
Username: john
Email: john@example.com
Password: password
Role: user
Created: 9/13/2025 | [✅] ใช่  [] ไม่ |
| 3 |User Profile:
ID: 3
Username: jane
Email: jane@example.com
Password: qwerty
Role: user
Created: 9/13/2025| [✅] ใช่  [] ไม่ |

### วิเคราะห์และความคิดเห็น
วิเคราะห์ที่มาของปัญหา IDOR:
- ข้อมูลที่ผู้ใช้ไม่ควรเห็นแต่มันดันเข้าถึงได้ซะงั้น
- เป็นวิธีการที่เข้าถึงข้อมูลที่ไม่ควรมีสิทธิ์ดูได้โดยการเปลี่ยนหมายเลขอ้างอิง เช่น user ID, invoice number, หรือ file name โดยที่ระบบไม่มีการตรวจสอบสิทธิ์ให้เหมาะสม    

---

# Part 2: การทดสอบ Secure Version

## Test Case 2.1: SQL Injection Protection

**วัตถุประสงค์**  
ทดสอบมาตรการป้องกัน SQL Injection

### ขั้นตอนการทดสอบ
1. เปิด `secure.html` (Secure Version)  
2. ทดสอบ payloads เดียวกับฝั่ง vulnerable version

### บันทึกผลการทดสอบ

| Payload | ผลลัพธ์ | การป้องกัน |
|---|---|---|
| `admin'; --` | ไม่สามารถ bypass login ได้ | [✅] ถูกบล็อก  [] ผ่านได้ |
| `' UNION SELECT * FROM Users; --` | ไม่สามารถใช้ UNION Attack เพื่อดูข้อมูลได้ | [✅] ถูกบล็อก  [] ผ่านได้ |
| `'; DROP TABLE Products; --` | ไม่สามารถลบตาราง products และใช้ comments | [✅] ถูกบล็อก  [] ผ่านได้ |

### วิธีการป้องกันที่สังเกตได้:
- [✅] Input validation  
- [✅] Prepared statements  
- [✅] Error message ที่ไม่เปิดเผยรายละเอียด  
- [✅] อื่นๆ: Maximum Length Restrictions, No Direct Query Construction และ Generic Error Messages

### วิเคราะห์และความคิดเห็น
เปรียบเทียบกับ vulnerable version:
- มีการตรวจสอบหรือกำหนด input ให้ใส่ได้เฉพาะ input ที่กำหนดเท่านั้น 
- ใช้ query ต่อกับพารามิเตอร์แทน การต่อ string โดยตรง เพื่อป้องกัน SQL injection, ไม่ใช้บัญชี sa หรือ root สำหรับ production
- เพิ่ม Server-Side Validation Layer , Implement Web Application Firewall

---

## Test Case 2.2: XSS Protection

**วัตถุประสงค์**  
ทดสอบมาตรการป้องกัน Cross-Site Scripting

### ขั้นตอนการทดสอบ
1. Login ในระบบ **secure version**  
2. ทดสอบ XSS payloads ในช่อง comment

### บันทึกผลการทดสอบ

| Payload | ผลลัพธ์ที่แสดง | Script Execute หรือไม่ |
|---|---|---|
| `<script>alert('XSS')</script>` | ไม่ผ่านการเขียน comments ตามรูปแบบที่กำหนด  | [] ใช่  [✅] ไม่ |
| `<img src=x onerror=alert('XSS')>` | ไม่ผ่านการเขียน comments ตามรูปแบบที่กำหนด | [] ใช่  [✅] ไม่ |
| `<svg onload=alert('XSS')>` |  | [ ไม่ผ่านการเขียน comments ตามรูปแบบที่กำหนด ] ใช่  [✅] ไม่ |

### วิธีการป้องกันที่สังเกตได้:
- [✅] HTML encoding  
- [✅] Input sanitization  
- [✅] Content validation  
- [✅] CSP (Content Security Policy)  
- [✅] อื่นๆ: Forbidden Word Filtering, Authentication Required, XSS Demo Payloads encode

### วิเคราะห์และความคิดเห็น
การป้องกัน XSS ที่มีประสิทธิภาพ:
- HTML Encoding ของ input  
- ทุก input ถูก HTML encode ก่อน render, มี sanitization + forbidden word filter, จำกัดความยาวข้อความ comment และ แสดงผลโดย escape code แทนที่จะรัน script 
- Vulnerable: โจมตี XSS ผ่าน comment ผู้ใช้ที่เปิดหน้าเว็บอาจโดนขโมย cookie/session
Secure: มี HTML encoding + sanitization โค้ดอันตรายจะถูกแสดงเป็น text ไม่รันจริง

---

## Test Case 2.3: IDOR Protection

**วัตถุประสงค์**  
ทดสอบมาตรการป้องกัน Insecure Direct Object Reference

### ขั้นตอนการทดสอบ
1. Login ด้วย user ปกติ  
2. ทดสอบการเข้าถึง **profile ของผู้ใช้อื่น**  
3. ทดสอบด้วย **admin account** (ถ้ามี)

### บันทึกผลการทดสอบ

| User Account | Target User ID | สามารถเข้าถึงได้ | Error Message |
|---|---:|---|---|
| john (user) | 1 | ○ ใช่  [✅] ไม่ | ไม่มีเพราะถูกล็อกให้ดูได้แค่ Target User ID ที่ 2 |
| john (user) | 3 | ○ ใช่  [✅] ไม่ | ไม่มีเพราะถูกล็อกให้ดูได้แค่ Target User ID ที่ 2 |
| admin | 2 | [✅] ใช่  ○ ไม่ | ไม่มี เพราะเป็น admin สามารถดูและตรวจสอบได้หมด|

### วิธีการป้องกันที่สังเกตได้:
- [✅] JWT token validation  
- [✅] Authorization checks  
- [✅] Role-based access control  
- [✅] อื่นๆ: Input validation บน user ID

### วิเคราะห์และความคิดเห็น
ประสิทธิภาพของมาตรการป้องกัน IDOR:
- user ถูกจำกัดสิทธิ์ให้ดูข้อมูลที่อนุญาตเท่านั้น ส่วน admin มีสิทธิ์ทั้งหมด สามารถตรวจสอบได้ทุกคน 
- มีการแจ้งเตือนข้อมูลชัดเจน , เข้าใจง่ายไม่ซับซ้อน
- ระดับความปลอดภัยที่ได้รับ : ใช้ JWT + role-based check ทำให้มีความเสี่ยงต่ำเพราะมีการจำกัดสิทธิ์ผู้ใช้งาน

---

# Part 3: การทดสอบความปลอดภัยเพิ่มเติม

## Test Case 3.1: Rate Limiting

**วัตถุประสงค์**  
ทดสอบการจำกัดจำนวนคำขอ (request)

### ขั้นตอนการทดสอบ
1. ใช้ **Security Testing Dashboard** ใน secure version  
2. กดปุ่ม **Run Rate Limit Test**  
3. สังเกตผลลัพธ์

### บันทึกผลการทดสอบ

| Attempt | Response Status | Rate Limited |
|---:|---|---|
| 1 | Attempt 1: Status 401 | [] ใช่  [✅] ไม่ |
| 2 | Attempt 2: Status 401 | [] ใช่  [✅] ไม่ |
| 3 | Attempt 3: Status 401 | [] ใช่  [✅] ไม่ |
| 4 | Attempt 4: Status 401 | [] ใช่  [✅] ไม่ |
| 5 | Attempt 5: Status 401 | [] ใช่  [✅] ไม่ |
| 6 | Attempt 6: 🚫 Rate limited | [✅] ใช่  [] ไม่ |

**จำนวน attempts ก่อนถูกบล็อก:** 5 ครั้ง

### วิเคราะห์และความคิดเห็น
ประสิทธิภาพของ Rate Limiting:
- มีความเหมาะสม ไม่น้อย ไม่มากเกินไป
- ผลกระทบต่อ user experience : ถ้า user จำ password หรือ username ไม่ได้จริงๆ จะมีปัญหาในการเข้าระบบอย่างชัดเจน แต่ถ้าเรื่องของการป้องกัน คือ ระบบจะไม่ถูก request มากเกินไป
- การป้องกัน brute force attacks : Rate Limiting จำกัดคำขอเพื่อป้องกันการ brute force, Generic Error Messages และ JWT Token Authentication

---

## Test Case 3.2: Authentication & Authorization

**วัตถุประสงค์**  
ทดสอบระบบยืนยันตัวตนและการให้สิทธิ์

### ขั้นตอนการทดสอบ
1. ทดสอบการเข้าถึงหน้าต่าง ๆ โดยไม่ login  
2. ทดสอบการใช้ **invalid JWT token**  
3. ทดสอบการ **expire ของ token**

### บันทึกผลการทดสอบ

| การทดสอบ | URL/Action | ผลลัพธ์ | HTTP Status |
|---|---|---|---|
| No token | `/comments` POST | ไม่อนุญาตให้ request Post ได้ ถ้าไม่มี token | 405 Method Not Allowed |
| Invalid token | `/user/1` GET | ไม่สามารถ request Get ได้ | 404 Not Found |
| Expired token | `/admin/users` | ไม่สามารถ POST หรือ Get ได้ | 405 Method Not Allowed |

### วิเคราะห์และความคิดเห็น
ความเห็นเกี่ยวกับระบบ authentication:
- มีการใช้ JWT ในการยืนยันตัวตนหลังจากผู้ใช้ login สำเร็จ, มีการกำหนด expiry time ของ token และ Token ถูกตรวจสอบทุกครั้งก่อนเข้าถึงข้อมูลที่สำคัญ
- ทำให้ผู้โจมตีไม่สามารถใช้ข้อความ error มาช่วยเดาโครงสร้างฐานข้อมูล หรือหาช่องโหว่ได้, ในระบบ Secure Version ใช้ generic error message เช่น "Invalid credentials" แทนที่จะโชว์รายละเอียด query หรือ database error 
- ใช้ JWT + expiry เพื่อป้องกันการใช้งาน session ยาวนานเกินไป , มีมาตรการ rate limiting มีความปลอดภัยต่อระบบและผู้ใช้

---

# Part 4: การเปรียบเทียบและวิเคราะห์

## Security Features Comparison

เปรียบเทียบฟีเจอร์ด้านความปลอดภัย:

| ฟีเจอร์ | Vulnerable Version | Secure Version | ผลกระทบต่อความปลอดภัย |
|---|---|---|---|
| SQL Injection Protection | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |
| XSS Protection | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |
| IDOR Protection | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |
| Rate Limiting | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |
| Input Validation | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |
| Error Handling | [] ปลอดภัย  /  [✅] ไม่ปลอดภัย | [✅] ปลอดภัย  /  [] ไม่ปลอดภัย |  |
| Authentication | [] มี  [✅] ไม่มี | [✅] มี  ○ ไม่มี |  |

---

# Part 5: การวิเคราะห์และข้อเสนอแนะ

## 5.1 ช่องโหว่ที่พบและผลกระทบ

**ช่องโหว่ความรุนแรงสูง:**  
1. SQL Injection  
   - ผลกระทบ: ผู้โจมตีสามารถ bypass login, ดึงข้อมูลผู้ใช้ หรือแก้ไข/ลบตารางในฐานข้อมูล  
   - ความเสี่ยง: ข้อมูลรั่วไหล, การเปลี่ยนแปลงข้อมูลโดยไม่ได้รับอนุญาต, ระบบล่ม  
2. Cross-Site Scripting  
   - ผลกระทบ: ผู้โจมตีสามารถ inject script เพื่อขโมย session/cookie ของผู้ใช้ หรือเปลี่ยนเนื้อหาในหน้าเว็บ  
   - ความเสี่ยง: การยึดบัญชีผู้ใช้งาน, การ redirect ไป phishing site  

**ช่องโหว่ความรุนแรงปานกลาง:**  
1. IDOR
   - ผลกระทบ: ผู้ใช้สามารถเข้าถึง profile ของผู้ใช้อื่นได้เพียงแค่แก้ไข user ID ใน URL  
   - ความเสี่ยง: ข้อมูลส่วนบุคคลรั่วไหล, ละเมิด privacy 
2. Authentication & Session Management ที่ไม่ครอบคลุม 
   - ผลกระทบ: ไม่มี token/expiry จะทำให้ session สามารถถูก reuse ได้, เสี่ยงถูก hijack  
   - ความเสี่ยง: ผู้โจมตีสามารถเข้าระบบโดยใช้ session เดิมที่ถูกขโมยมาได้ 

## 5.2 วิธีการป้องกันที่มีประสิทธิภาพ (Top 3)

1. Prepared Statements / Parameterized Queries  
   เหตุผล: เป็นมาตรการสำคัญที่สุดในการป้องกัน SQL Injection เพราะ input ของผู้ใช้จะถูก bind เป็น parameter ไม่สามารถกลายเป็นคำสั่ง SQL ได้  
2. Input Validation & Encoding  
   เหตุผล: การตรวจสอบรูปแบบ input (allow-list) และการ encode HTML ก่อน render เป็นวิธีที่มีประสิทธิภาพสูงในการป้องกัน XSS และป้องกัน payload อันตรายไม่ให้ execute ได้  
3. JWT Token Authentication + และการจำกัดสิทธิ์ผู้ใช้งาน  
   เหตุผล: ช่วยป้องกัน IDOR และปัญหา session hijacking ได้ โดยทุก request ต้องตรวจสอบ token และสิทธิ์ก่อนเข้าถึงข้อมูล  

## 5.3 ข้อเสนอแนะสำหรับการพัฒนา

**สำหรับ Developer:**  
1. ใช้ ORM หรือ query builder ที่บังคับใช้ parameterized queries เช่น Sequelize, Prisma 
2. เขียน validation layer ฝั่ง server-side
3. เพิ่ม unit test และ integration test สำหรับ payload SQLi/XSS/IDOR 

**สำหรับ Security Team:**  
1. ใช้เครื่องมือสแกนช่องโหว่ (OWASP ZAP, Burp Suite) ทดสอบอย่างสม่ำเสมอ  
2. ทำ code review โดยเน้นเรื่อง security ก่อน deploy  
3. Monitor log ของการ login และการเข้าถึงผิดปกติ พร้อม alert เมื่อพบความเสี่ยง 

**สำหรับ Management:**  
1. จัด training เรื่อง secure coding ให้ทีมพัฒนา  
2. กำหนดนโยบาย security baseline เช่น ต้องใช้ HTTPS, ต้องมีการตรวจสอบ token ทุกครั้ง  
3. ลงทุนในระบบ WAF (Web Application Firewall) เพื่อเสริมการป้องกันจาก layer ภายนอก 

---

# Part 6: สรุปและบทเรียน

## 6.1 สิ่งที่เรียนรู้

**ด้านเทคนิค:**  
- เรียนรู้หลักการป้องกัน SQL Injection ด้วยการใช้ prepared statements และการตรวจสอบ input
- เข้าใจการป้องกัน Cross-Site Scripting ผ่านการทำ HTML encoding, การ sanitize ข้อมูล และการ validate ความยาว input  
- เห็นความสำคัญของ JWT Token + Role-based Access Control ในการป้องกัน IDOR และจัดการสิทธิ์ผู้ใช้อย่างปลอดภัย  

**ด้านกระบวนการ:**  
- ฝึกทักษะการสร้าง test case ที่ครอบคลุมทั้งช่องโหว่และมาตรการป้องกัน  
- เห็นความสำคัญของ error handling ที่เหมาะสม เพื่อลดการรั่วไหลของข้อมูลระบบ  
- ได้ประสบการณ์เขียนรายงาน วิเคราะห์ + ข้อเสนอแนะ เพื่อนำเสนอผลทดสอบและการป้องกันอย่างเป็นระบบ  

**ด้าน Business Impact:**  
- ตระหนักว่าช่องโหว่พื้นฐานอย่าง SQLi, XSS, IDOR สามารถทำให้ ข้อมูลผู้ใช้รั่วไหล และสร้างความเสียหายต่อชื่อเสียงขององค์กร  
- เข้าใจว่า การลงทุนด้าน security เช่น WAF, automated testing, และการอบรม secure coding ช่วยลดความเสี่ยงได้อย่างคุ้มค่า  
- เห็นว่าความปลอดภัยของระบบมีผลโดยตรงต่อ ความเชื่อมั่นของผู้ใช้งาน และความน่าเชื่อถือขององค์กร  

## 6.2 ความท้าทายที่พบ

ในการทดสอบ:  
1. การทดสอบ SQL Injection แบบ UNION ไม่สำเร็จในบางครั้ง  
   แก้ไขโดย: ตรวจสอบจำนวนและชนิดคอลัมน์ของตารางก่อน แล้วใช้ UNION ALL SELECT ให้ตรงกับ schema  
2. การทดสอบ XSS Payload ไม่ trigger เนื่องจาก frontend encode input อัตโนมัติ  
   แก้ไขโดย: ตรวจสอบโค้ด render comment และใช้ payload ที่ไม่พัง query เช่น <img src=x onerror=alert('XSS')> เพื่อยืนยันผล
---

## 6.3 การประยุกต์ใช้ในอนาคต

**ในการพัฒนาโปรเจค:**  
1. นำแนวทาง secure coding practices (SQLi/XSS prevention, validation) มาใช้กับโปรเจคจริง  
2. เพิ่มระบบ logging และ monitoring เพื่อเก็บหลักฐานการโจมตีและแจ้งเตือนแบบเรียลไทม์  
3. เขียน automated test cases ที่ครอบคลุมการทดสอบ security เพื่อตรวจสอบทุกครั้งก่อน deploy 

**ในการทำงาน:**  
1. ปรับ mindset ของทีมพัฒนาให้คำนึงถึง security by design ตั้งแต่ต้น  
2. ทำงานร่วมกับทีม Security เพื่อทำ penetration test และแก้ไขก่อนส่งมอบระบบ 
3. นำความรู้ที่ได้ไปสอน/แชร์ให้กับเพื่อนร่วมทีมเพื่อยกระดับมาตรฐานความปลอดภัยในองค์กร 

---

## คะแนนการประเมินตนเอง

| หัวข้อ                          | คะแนนเต็ม | คะแนนที่ได้ | หมายเหตุ |
|---------------------------------|:---------:|:-----------:|----------|
| การทดสอบ Vulnerable Version     | 25        | 20            |     มีบางการทดสอบที่ลองใช้แล้ว ไม่เห็นการแสดงผลลัพธ์ที่ชัดเจน    |
| การทดสอบ Secure Version         | 25        | 25           |    ลองทดสอบได้ตามทุกรูปแบบที่กำหนด     |
| การวิเคราะห์และเปรียบเทียบ     | 20        | 15            |     เปรียบเทียบแบบชัดเจนไม่ค่อยได้ เพราะไม่เคยลองทำกับตอนทำเว็บไซต์     |
| การเขียนรายงาน                 | 15        | 15      |     ข้อมูลครบถ้วน     |
| ความคิดสร้างสรรค์              | 15        |   15          | พยายามปรับรายงานให้ดูง่ายขึ้น         |
| **รวม**                         | **100**   | 90        |          |

**ความคิดเห็นเพิ่มเติม:**  
เขียนความคิดเห็นส่วนตัวเกี่ยวกับผลแล็บ:  
- การเขียนรายงานเพราะให้ข้อมูลครบถ้วน 
- ความรู้เกี่ยวกับ Cyber ยังมองภาพบางเคสไม่ค่อยออก ต้องได้ลองทำด้วยตัวเอง แต่บางการทดสอบลองทำแล้ว ไม่ได้ผลตามที่โจทย์กำหนดไว้
- รายละเอียดในการ connect เข้ากับ SQL server management studio กับ Azure data studio ต้องศึกษาและลองผิด ลองถูกด้วยตัวเอง เพราะตอนแรกลองทำตามแล้ว error หลายรูปแบบมากครับ เลยต้องไล่ดูคลิปเพื่อหาคำตอบเอง
- สามารถนำไปปรับใช้กับเว็บไซต์ตอนทำงานจริงกับบริษัทได้ อย่างเช่น การฝึกสหกิจ การออกไปทำงานจริง ในตำแหน่งที่เกี่ยวกับ web development ต่างๆ  

---

## ภาคผนวก

### A. Screenshots หลักฐาน
(แนบ screenshots ของการทดสอบในแต่ละขั้นตอน)  
ตัวอย่างการแทรกภาพ:
```
# Part 1: การทดสอบ Vulnerable Version
![Test Case 1.1: SQL Injection - Login Bypass](<img width="1211" height="523" alt="image" src="https://github.com/user-attachments/assets/dcca3511-edbc-41fb-98fb-b21281754b75" />)
![Test Case 1.2: SQL Injection - Data Extraction](<img width="1262" height="420" alt="image" src="https://github.com/user-attachments/assets/e0697426-9adc-4083-8322-f88b95c77765" />)
![Test Case 1.3: Cross-Site Scripting (XSS)](<img width="1902" height="676" alt="image" src="https://github.com/user-attachments/assets/4b00838f-6b16-4923-8eb7-0783032df4e8" />)
![Test 1.3.1: Cookie Stealing Simulation](<img width="1902" height="458" alt="image" src="https://github.com/user-attachments/assets/cad42a5f-cb86-40c9-a6d2-2b2661f1468a" />)
![Test 1.3.2: DOM Manipulation](<img width="1890" height="494" alt="image" src="https://github.com/user-attachments/assets/c1ea4550-79cf-42e2-8e8a-52c9750c8f98" />)
![Test Case 1.4: Insecure Direct Object Reference (IDOR)](<img width="1378" height="567" alt="image" src="https://github.com/user-attachments/assets/ed397b0a-7e55-4d62-8821-b0664b5a1504" />)

---

# Part 2: การทดสอบ Secure Version

![Test Case 2.1: SQL Injection Protection](<img width="1453" height="735" alt="image" src="https://github.com/user-attachments/assets/93d0c547-d649-411c-aa4a-88b55571e121" />)
![Test Case 2.2: XSS Protection](<img width="1642" height="650" alt="image" src="https://github.com/user-attachments/assets/1a6aea35-788e-47d2-9e69-94e9c5d41ca3" />)
![Test Case 2.3: IDOR Protection1](<img width="1499" height="780" alt="image" src="https://github.com/user-attachments/assets/89d2c359-70a0-4e95-8344-0c138b4dd3db" />)

---

# Part 3: การทดสอบความปลอดภัยเพิ่มเติม

![Test Case 3.1: Rate Limiting](<img width="366" height="627" alt="image" src="https://github.com/user-attachments/assets/4899c41b-1e66-45c5-92f5-3152f107e975" />)
![Test Case 3.2: Authentication & Authorization](<img width="1360" height="262" alt="image" src="https://github.com/user-attachments/assets/1855af58-23c2-4944-819d-1bc0332d2861" />)

```


### B. Code Snippets ที่สำคัญ
(แนบโค้ดส่วนที่เกี่ยวกับการป้องกัน/ช่องโหว่ที่พบ)

ตัวอย่างบล็อกโค้ด (Prepared Statement):
# 1. ช่องโหว่ SQL Injection (Vulnerable Version)
```
//ปลอดภัยกว่า
const query = `SELECT * FROM Users WHERE username='${username}' AND password='${password}'`;
const result = await sql.query(query);

```

# 2. การป้องกัน SQL Injection ด้วย Prepared Statement (Secure Version)
```
//ปลอดภัย
const [rows] = await db.execute(
  'SELECT * FROM Users WHERE username = ? AND password = ?',
  [username, hashedPassword]
);

if (rows.length > 0) {
  // Login success
} else {
  // Invalid credentials
}

```

# 3. การป้องกัน SQL Injection ด้วย Prepared Statement (Secure Version)
```
//ไม่ปลอดภัย
const query = `INSERT INTO Comments (user_id, content) VALUES (${userId}, '${content}')`;
await sql.query(query);
```

# 4. การป้องกัน XSS (Secure Version)
```
// ปลอดภัยกว่า
const sanitizedContent = sanitizeHtml(content, {
  allowedTags: [], // หรือ allow-list ที่ต้องการ
  allowedAttributes: {}
});
await db.execute(
  'INSERT INTO Comments (user_id, content) VALUES (?, ?)',
  [userId, sanitizedContent]
);
```

# 5. การป้องกัน IDOR ด้วย JWT + Role Check (Secure Version)
```
// ปลอดภัย
app.get('/user/:id', authenticateJWT, async (req, res) => {
  const requestedId = parseInt(req.params.id, 10);
  const currentUser = req.user; // ข้อมูลจาก JWT

  if (currentUser.role !== 'admin' && currentUser.id !== requestedId) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const [rows] = await db.execute('SELECT * FROM Users WHERE id = ?', [requestedId]);
  res.json(rows[0]);
});

```

### C. เอกสารอ้างอิง
- OWASP Top 10: https://owasp.org/Top10/
- Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- Lab Materials: [[Lab 3 Readme.md]](https://github.com/se-rmutl/ENGSE214/blob/main/Labs/lab3/README.md)
- IDOR: https://www.facebook.com/share/p/1EmfMUCfrw/














