# Security Testing Report

## การทดสอบ SQL Injection

### ✅ Vulnerable Version
- ✅ สามารถ **Bypass login** ด้วย `admin'; --`
- ⛔ การดึงข้อมูลด้วย **UNION attack** ไม่สำเร็จ (คอลัมน์ไม่ตรงกัน)
- ✅ เห็นผลจาก **error handling ที่ไม่ปลอดภัย** (บอกใบ้โครงสร้าง query ได้บ้าง)

**หลักฐาน**
- ![](https://github.com/user-attachments/assets/bcb97730-8a85-436e-8c75-336280e1f228)
- ![](https://github.com/user-attachments/assets/af2085a9-88e4-4659-bfca-ef2baa3775a6)

### ✅ Secure Version
- ✅ **Prepared statements** ปิดช่อง SQLi (login bypass/UNION ไม่ผ่าน)
- ✅ **Input validation + length limit**
- ✅ **Generic error messages** ไม่เปิดเผยรายละเอียด DB/Query

---

## การทดสอบ XSS

### ✅ Vulnerable Version
- ⛔ Payload แบบ `<script>alert(...)</script>` **ไม่ถูก execute** (เรนเดอร์เป็น text)
- ⛔ Payload `<img onerror=...>` **ไม่ทำงาน** (ยังเป็น text)
- 🔎 หมายเหตุ: ยังควรระวัง **DOM-based XSS** หากมีการใช้ `innerHTML` ในอนาคต

**หลักฐาน**
- ![](https://github.com/user-attachments/assets/4b00838f-6b16-4923-8eb7-0783032df4e8)
- ![](https://github.com/user-attachments/assets/cad42a5f-cb86-40c9-a6d2-2b2661f1468a)
- ![](https://github.com/user-attachments/assets/c1ea4550-79cf-42e2-8e8a-52c9750c8f98)

### ✅ Secure Version
- ✅ **HTML encoding + sanitization** ก่อนแสดงผล
- ✅ **CSP** และ **Forbidden word filtering**
- ✅ จำกัดความยาว/รูปแบบของข้อความ comment

**หลักฐาน**
- ![](https://github.com/user-attachments/assets/1a6aea35-788e-47d2-9e69-94e9c5d41ca3)

---

## การทดสอบ IDOR

### ✅ Vulnerable Version
- ✅ **เข้าถึงโปรไฟล์ผู้ใช้อื่น** ได้ด้วยการแก้เลข `User ID`
- ✅ ไม่มีการตรวจสิทธิ์ในระดับวัตถุ (Object-level)

**หลักฐาน**
- ![](https://github.com/user-attachments/assets/ed397b0a-7e55-4d62-8821-b0664b5a1504)

### ✅ Secure Version
- ✅ ใช้ **JWT token + Authorization checks**
- ✅ **Role-based access control** (RBAC) — user ดูได้เฉพาะของตนเอง, admin ดูได้ทั้งหมด

**หลักฐาน**
- ![](https://github.com/user-attachments/assets/89d2c359-70a0-4e95-8344-0c138b4dd3db)

---

## สรุปผล (Summary Table)

| ช่องโหว่ | Vulnerable | Secure | วิธีรับมือหลัก |
|---|---|---|---|
| SQL Injection | ✅ พบการ bypass login | ✅ ปิดได้ | **Prepared statements**, Input validation, Generic errors |
| XSS | ⛔ ไม่พบการ execute จาก payload ที่ทดสอบ | ✅ ปิดได้ | **HTML encoding + sanitization**, CSP |
| IDOR | ✅ เข้าถึงข้อมูลคนอื่นได้ | ✅ ปิดได้ | **JWT + Authorization checks**, RBAC |
| Rate Limiting | – | ✅ จำกัดคำขอเกินกำหนด | **Express rate limiter / WAF** |
| Authentication | – | ✅ JWT + expiry | ตรวจลายเซ็น/วันหมดอายุ, ตรวจสิทธิ์ตาม role |
| Error Handling | ⛔ ไม่ครอบคลุม | ✅ ปลอดภัยกว่า | ซ่อนรายละเอียดภายใน/ใช้ข้อความทั่วไป |

> หมายเหตุ: สถานะ “Secure” หมายถึง *มาตรการป้องกันที่นำมาใช้แล้วในเวอร์ชันปลอดภัย* สามารถบรรเทาผลของการโจมตีจากการทดสอบนี้

---

## คำถามท้ายบท (ฉบับสั้น)

- **Prepared Statement vs String Concatenation:** ต่อสตริง = เสี่ยง SQLi, Prepared = bind ค่าเป็นพารามิเตอร์ กัน SQLi โดยดีไซน์  
- **ทำไม HTML Encoding กัน XSS:** แปลง `< > " ' &` เป็นรหัส HTML ทำให้เบราว์เซอร์แสดงเป็นข้อความ ไม่รันสคริปต์  
- **JWT กัน IDOR อย่างไร:** JWT บอกตัวตน (`userId/role`) เซิร์ฟเวอร์ตรวจลายเซ็น/วันหมดอายุ แล้ว **เทียบสิทธิ์กับทรัพยากร** — ไม่ตรงคืน `403`  
- **Rate Limiting กันอะไร:** ลด brute force / enumeration / API abuse / app-layer DoS  
- **วิธีป้องกันเพิ่มเติม (3 ข้อ):** CSRF token + SameSite, Least-Privilege & เก็บ secret ให้มิด, เปิดสแกน SAST/DAST ใน CI/CD

---

## ภาคผนวก: หลักฐานภาพรวม

### SQL Injection
![](https://github.com/user-attachments/assets/dcca3511-edbc-41fb-98fb-b21281754b75)
![](https://github.com/user-attachments/assets/e0697426-9adc-4083-8322-f88b95c77765)

### XSS
![](https://github.com/user-attachments/assets/4b00838f-6b16-4923-8eb7-0783032df4e8)
![](https://github.com/user-attachments/assets/cad42a5f-cb86-40c9-a6d2-2b2661f1468a)
![](https://github.com/user-attachments/assets/c1ea4550-79cf-42e2-8e8a-52c9750c8f98)

### IDOR
![](https://github.com/user-attachments/assets/ed397b0a-7e55-4d62-8821-b0664b5a1504)
![](https://github.com/user-attachments/assets/89d2c359-70a0-4e95-8344-0c138b4dd3db)

### อื่น ๆ
![](https://github.com/user-attachments/assets/93d0c547-d649-411c-aa4a-88b55571e121)
![](https://github.com/user-attachments/assets/1855af58-23c2-4944-819d-1bc0332d2861)
![](https://github.com/user-attachments/assets/4899c41b-1e66-45c5-92f5-3152f107e975)

---

_Updated: 2025-09-14 21:57_
