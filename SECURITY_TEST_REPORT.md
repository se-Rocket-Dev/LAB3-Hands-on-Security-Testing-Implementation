# Security Testing Report (with Captions)


## สรุปผลการทดลองแบบตาราง (ตามหัวข้อใน ref)

### 1) SQL Injection
| รายการทดสอบ | Vulnerable | Secure | หมายเหตุ |
|---|---|---|---|
| Login bypass ด้วย `admin'; --` | ✅ ทำได้ | ✅ ถูกบล็อก | ดูภาพ Appendix A → Test Case 1.1 |
| UNION data extraction | ⛔ ไม่สำเร็จ (คอลัมน์ไม่ตรง) | ✅ ถูกบล็อก | Appendix A → Test Case 1.2 |
| Error handling เผยข้อมูล | ⚠️ มีบอกใบ้บางส่วน | ✅ ใช้ข้อความ generic | ลดโอกาสเปิดเผย schema |

### 2) XSS
| รายการทดสอบ | Vulnerable | Secure | หมายเหตุ |
|---|---|---|---|
| `<script>alert(...)</script>` | ⛔ ไม่ execute (render เป็นข้อความ) | ✅ ถูก encode/sanitize | Appendix A → Test Case 1.3 / 2.2 |
| `<img src=x onerror=...>` | ⛔ ไม่ execute | ✅ ถูก encode/sanitize | Appendix A → Test 1.3.2 |
| นโยบายเสริม (CSP ฯลฯ) | – | ✅ มีใช้งาน | ลดความเสี่ยง DOM-based XSS |

### 3) IDOR
| รายการทดสอบ | Vulnerable | Secure | หมายเหตุ |
|---|---|---|---|
| เปลี่ยน `User ID` เพื่อดูโปรไฟล์ผู้อื่น | ✅ ทำได้ | ✅ ถูกบล็อก (ยกเว้น admin) | Appendix A → Test Case 1.4 / 2.3 |
| ตรวจสิทธิ์เชิงวัตถุ (Object-level) | ❌ ไม่มี | ✅ มี (JWT + RBAC) | เช็ค `userId/role` กับทรัพยากร |

### 4) Rate Limiting
| รายการทดสอบ | ผลลัพธ์ | หมายเหตุ |
|---|---|---|
| ยิงคำขอซ้ำ ๆ (login/api) | ✅ บล็อคที่ครั้งที่ 6 | 5 ครั้งแรก 401, ครั้งที่ 6 โดน rate limit (Appendix A → 3.1) |

### 5) Authentication & Authorization
| การทดสอบ | ผลลัพธ์ | HTTP Status | หมายเหตุ |
|---|---|---|---|
| No token → POST `/comments` | ✅ ถูกบล็อก | 405 | ไม่อนุญาตโดยไม่มีโทเค็น |
| Invalid token → GET `/user/1` | ✅ ถูกบล็อก | 404 | ไม่อนุญาต/ไม่เปิดเผยรายละเอียด |
| Expired token → `/admin/users` | ✅ ถูกบล็อก | 405 | ต้อง login ใหม่ |

> อ้างอิงภาพประกอบ: ดู **Appendix A** ด้านล่าง (เพิ่ม title กำกับไว้เหนือภาพแล้ว)


## ภาคผนวก A: Screenshots หลักฐาน
(เพิ่ม **title** กำกับเหนือภาพเพื่อระบุว่าเป็นภาพจากหัวข้อใด)

---

### Part 1: การทดสอบ Vulnerable Version

**จากหัวข้อ Test Case 1.1: SQL Injection — Login Bypass**  
![Test Case 1.1: SQL Injection - Login Bypass](https://github.com/user-attachments/assets/dcca3511-edbc-41fb-98fb-b21281754b75)

**จากหัวข้อ Test Case 1.2: SQL Injection — Data Extraction (UNION)**  
![Test Case 1.2: SQL Injection - Data Extraction](https://github.com/user-attachments/assets/e0697426-9adc-4083-8322-f88b95c77765)

**จากหัวข้อ Test Case 1.3: Cross-Site Scripting (XSS)**  
![Test Case 1.3: Cross-Site Scripting (XSS)](https://github.com/user-attachments/assets/4b00838f-6b16-4923-8eb7-0783032df4e8)

**จากหัวข้อ Test 1.3.1: Cookie Stealing Simulation**  
![Test 1.3.1: Cookie Stealing Simulation](https://github.com/user-attachments/assets/cad42a5f-cb86-40c9-a6d2-2b2661f1468a)

**จากหัวข้อ Test 1.3.2: DOM Manipulation (IMG onerror)**  
![Test 1.3.2: DOM Manipulation](https://github.com/user-attachments/assets/c1ea4550-79cf-42e2-8e8a-52c9750c8f98)

**จากหัวข้อ Test Case 1.4: Insecure Direct Object Reference (IDOR)**  
![Test Case 1.4: Insecure Direct Object Reference (IDOR)](https://github.com/user-attachments/assets/ed397b0a-7e55-4d62-8821-b0664b5a1504)

---

### Part 2: การทดสอบ Secure Version

**จากหัวข้อ Test Case 2.1: SQL Injection Protection**  
![Test Case 2.1: SQL Injection Protection](https://github.com/user-attachments/assets/93d0c547-d649-411c-aa4a-88b55571e121)

**จากหัวข้อ Test Case 2.2: XSS Protection**  
![Test Case 2.2: XSS Protection](https://github.com/user-attachments/assets/1a6aea35-788e-47d2-9e69-94e9c5d41ca3)

**จากหัวข้อ Test Case 2.3: IDOR Protection**  
![Test Case 2.3: IDOR Protection](https://github.com/user-attachments/assets/89d2c359-70a0-4e95-8344-0c138b4dd3db)

---

### Part 3: การทดสอบความปลอดภัยเพิ่มเติม

**จากหัวข้อ Test Case 3.1: Rate Limiting**  
![Test Case 3.1: Rate Limiting](https://github.com/user-attachments/assets/4899c41b-1e66-45c5-92f5-3152f107e975)

**จากหัวข้อ Test Case 3.2: Authentication & Authorization**  
![Test Case 3.2: Authentication & Authorization](https://github.com/user-attachments/assets/1855af58-23c2-4944-819d-1bc0332d2861)

---

_Updated: 2025-09-14 21:58 (ICT)_


_Last updated: 2025-09-14 22:02 (ICT)_
