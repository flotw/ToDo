# 📝 Todo API (Express.js + PostgreSQL)

RESTful API สำหรับ Todo List รองรับ CRUD โดยเก็บข้อมูลใน PostgreSQL  
ทำงานคู่กับ Frontend React (https://github.com/<username>/todo-frontend)

---

## 🚀 Features
- [x] เพิ่มรายการ (Create)
- [x] แสดงรายการทั้งหมด (Read)
- [x] แก้ไข (Update: title, completed)
- [x] ลบ (Delete)
- [x] เก็บข้อมูลจริงใน PostgreSQL

---

## 🛠️ Tech Stack
- Node.js + Express.js
- PostgreSQL (pg library)
- dotenv (จัดการ Environment variables)
- CORS + express-session

---

## 📂 Database Schema

Database: `ToDo`  
Schema: `todo`  
Table: `list`

| Column    | Type      | Notes                        |
|-----------|-----------|------------------------------|
| id        | serial PK | Primary key                  |
| title     | text      | รายละเอียดงาน                |
| completed | boolean   | ค่า default = false          |
| time      | timestamp | default = NOW()              |

---
