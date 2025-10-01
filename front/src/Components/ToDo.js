import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8081/api";
axios.defaults.withCredentials = true;

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  // สำหรับแก้ไขชื่อ
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  // ฟิลเตอร์แสดงผล
  const [filter, setFilter] = useState("all"); // all | active | completed

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE}/todos`);
      setTodos(res.data || []);
    } catch (e) {
      setError("ไม่สามารถดึงรายการได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const remaining = useMemo(
    () => todos.filter((t) => !t.completed).length,
    [todos]
  );

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => !!t.completed);
    return todos;
  }, [todos, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    try {
      setBusyId("add");
      const res = await axios.post(`${API_BASE}/todos`, { title: t });
      setTodos((prev) => [res.data, ...prev]);
      setTitle("");
    } catch (e) {
      setError(e?.response?.data?.error || "เพิ่มงานไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (id, currentCompleted) => {
    try {
      setBusyId(id);
      const res = await axios.patch(`${API_BASE}/todos/${id}`, {
        completed: !currentCompleted,
      });
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data : t)));
    } catch {
      setError("อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("ต้องการลบงานนี้หรือไม่?")) return;
    try {
      setBusyId(id);
      await axios.delete(`${API_BASE}/todos/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("ลบงานไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };

  // ===== แก้ไขชื่อ =====
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };
  const saveEdit = async (id) => {
    const newTitle = editTitle.trim();
    if (!newTitle) return;
    try {
      setBusyId(id);
      const res = await axios.patch(`${API_BASE}/todos/${id}`, { title: newTitle });
      setTodos((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      cancelEdit();
    } catch {
      setError("แก้ไขงานไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  };
  const onEditKeyDown = (e, id) => {
    if (e.key === "Enter") { e.preventDefault(); saveEdit(id); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  };

  return (
    <div className="container py-5">
      <div className="mx-auto" style={{ maxWidth: 780 }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center gap-2">
            <i className="bi bi-journal-check fs-2 text-primary"></i>
            <h1 className="app-title m-0">Todo List</h1>
          </div>
        </div>

        {/* แถบสรุป + ฟิลเตอร์ */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
          <span className="badge text-bg-primary px-3 py-2">
            เหลือทำ {remaining} / ทั้งหมด {todos.length}
          </span>

          <div className="filter-pill btn-group">
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("all")}
            >
              ทั้งหมด
            </button>
            <button
              className={`btn btn-sm ${filter === "active" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("active")}
            >
              ยังไม่เสร็จ
            </button>
            <button
              className={`btn btn-sm ${filter === "completed" ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setFilter("completed")}
            >
              เสร็จแล้ว
            </button>
          </div>
        </div>

        {/* ฟอร์มเพิ่ม */}
        <div className="card card-glass shadow-sm mb-4">
          <div className="card-body">
            <form className="row g-2 input-elevated" onSubmit={handleAdd}>
              <div className="col-12 col-md-9">
                <input
                  className="form-control"
                  type="text"
                  placeholder="เพิ่มงาน เช่น “อ่านหนังสือ 30 นาที”"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="col-12 col-md-3 d-grid">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={busyId === "add" || !title.trim()}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  {busyId === "add" ? "กำลังเพิ่ม..." : "เพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ข้อผิดพลาด */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* รายการ */}
        <div className="card card-glass shadow-sm">
          <div className="card-body p-0">
            {loading ? (
              <div className="p-4 text-center">กำลังโหลด...</div>
            ) : filteredTodos.length === 0 ? (
              <div className="empty-state text-center">ยังไม่มีรายการตามเงื่อนไข</div>
            ) : (
              <ul className="list-group list-group-flush">
                {filteredTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="list-group-item todo-item d-flex align-items-center justify-content-between gap-3"
                  >
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={!!todo.completed}
                        onChange={() => handleToggle(todo.id, !!todo.completed)}
                        disabled={busyId === todo.id || editingId === todo.id}
                      />

                      {editingId === todo.id ? (
                        <input
                          className="form-control"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => onEditKeyDown(e, todo.id)}
                          autoFocus
                        />
                      ) : (
                        <span className={todo.completed ? "todo-done" : ""}>
                          {todo.title}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {editingId === todo.id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm btn-icon"
                            onClick={() => saveEdit(todo.id)}
                            disabled={busyId === todo.id || !editTitle.trim()}
                          >
                            <i className="bi bi-check2-circle"></i> บันทึก
                          </button>
                          <button
                            className="btn btn-secondary btn-sm btn-icon"
                            onClick={cancelEdit}
                            disabled={busyId === todo.id}
                          >
                            <i className="bi bi-x-circle"></i> ยกเลิก
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-primary btn-sm btn-icon"
                          onClick={() => startEdit(todo)}
                          disabled={busyId === todo.id}
                        >
                          <i className="bi bi-pencil-square"></i> แก้ไข
                        </button>
                      )}

                      <button
                        className="btn btn-outline-danger btn-sm btn-icon"
                        onClick={() => handleDelete(todo.id)}
                        disabled={busyId === todo.id || editingId === todo.id}
                      >
                        <i className="bi bi-trash3"></i> ลบ
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="text-center mt-4 footer-note">
          เคล็ดลับ: กด <b>Enter</b> เพื่อบันทึกการแก้ไข • กด <b>Esc</b> เพื่อยกเลิก
        </p>
      </div>
    </div>
  );
}
