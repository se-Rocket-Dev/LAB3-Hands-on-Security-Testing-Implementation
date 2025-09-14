# Security Testing Report


## สรุปผลการทดลองแบบตาราง

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
