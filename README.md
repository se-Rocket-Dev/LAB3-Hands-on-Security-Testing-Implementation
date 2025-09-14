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
| SQL Injection Protection | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |
| XSS Protection | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |
| IDOR Protection | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |
| Rate Limiting | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |
| Input Validation | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |
| Error Handling | ปลอดภัย  /  ไม่ปลอดภัย | ปลอดภัย  /  ไม่ปลอดภัย |  |
| Authentication | ○ มี  ○ ไม่มี | ○ มี  ○ ไม่มี |  |

---

# Part 5: การวิเคราะห์และข้อเสนอแนะ

## 5.1 ช่องโหว่ที่พบและผลกระทบ

**ช่องโหว่ความรุนแรงสูง:**  
1. ________________________________  
   - ผลกระทบ: _____________________  
   - ความเสี่ยง: ____________________  
2. ________________________________  
   - ผลกระทบ: _____________________  
   - ความเสี่ยง: ____________________  

**ช่องโหว่ความรุนแรงปานกลาง:**  
1. ________________________________  
   - ผลกระทบ: _____________________  
   - ความเสี่ยง: ____________________  
2. ________________________________  
   - ผลกระทบ: _____________________  
   - ความเสี่ยง: ____________________  

## 5.2 วิธีการป้องกันที่มีประสิทธิภาพ (Top 3)

1. ________________________________  
   เหตุผล: _________________________  
2. ________________________________  
   เหตุผล: _________________________  
3. ________________________________  
   เหตุผล: _________________________  

## 5.3 ข้อเสนอแนะสำหรับการพัฒนา

**สำหรับ Developer:**  
1. ________________________________  
2. ________________________________  
3. ________________________________  

**สำหรับ Security Team:**  
1. ________________________________  
2. ________________________________  
3. ________________________________  

**สำหรับ Management:**  
1. ________________________________  
2. ________________________________  
3. ________________________________  

---

# Part 6: สรุปและบทเรียน

## 6.1 สิ่งที่เรียนรู้

**ด้านเทคนิค:**  
- ________________________________  
- ________________________________  
- ________________________________  

**ด้านกระบวนการ:**  
- ________________________________  
- ________________________________  
- ________________________________  

**ด้าน Business Impact:**  
- ________________________________  
- ________________________________  
- ________________________________  

## 6.2 ความท้าทายที่พบ

ในการทดสอบ:  
1. ________________________________  
   แก้ไขโดย: _______________________  
2. ________________________________  
   แก้ไขโดย: _______________________
---

## 6.3 การประยุกต์ใช้ในอนาคต

**ในการพัฒนาโปรเจค:**  
1. ________________________________  
2. ________________________________  
3. ________________________________  

**ในการทำงาน:**  
1. ________________________________  
2. ________________________________  
3. ________________________________  

---

## คะแนนการประเมินตนเอง

| หัวข้อ                          | คะแนนเต็ม | คะแนนที่ได้ | หมายเหตุ |
|---------------------------------|:---------:|:-----------:|----------|
| การทดสอบ Vulnerable Version     | 25        |             |          |
| การทดสอบ Secure Version         | 25        |             |          |
| การวิเคราะห์และเปรียบเทียบ     | 20        |             |          |
| การเขียนรายงาน                 | 15        |             |          |
| ความคิดสร้างสรรค์              | 15        |             |          |
| **รวม**                         | **100**   |             |          |

**ความคิดเห็นเพิ่มเติม:**  
เขียนความคิดเห็นส่วนตัวเกี่ยวกับผลแล็บ:  
- สิ่งที่ทำได้ดี  
- สิ่งที่อยากให้ปรับปรุง  
- ข้อเสนอแนะในการปรับปรุง  
- การนำไปใช้ในชีวิตจริง  

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
```js
// Example (Node.js + mysql2)
const [rows] = await db.execute(
  'SELECT * FROM users WHERE username = ? AND password = ?',
  [username, hashedPassword]
);
```

### C. เอกสารอ้างอิง
- OWASP Top 10: https://owasp.org/Top10/
- Security Testing Guide: https://owasp.org/www-project-web-security-testing-guide/
- Lab Materials: [ระบุแหล่งที่มา]
- IDOR: https://www.facebook.com/share/p/1EmfMUCfrw/







