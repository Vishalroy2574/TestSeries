import { useEffect, useState } from "react";
import api from "../services/api.js";

const emptyQuestion = { question: "", options: ["", "", "", ""], correctAnswer: "" };

const AdminPanel = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTest, setEditingTest] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "CA",
    duration: 60,
    questions: [emptyQuestion],
    pdfUrl: "",
    pdfPublicId: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const loadTests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tests");
      setTests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const resetForm = () => {
    setEditingTest(null);
    setForm({
      title: "",
      description: "",
      category: "CA",
      duration: 60,
      questions: [emptyQuestion],
      pdfUrl: "",
      pdfPublicId: "",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      questions[qIndex] = { ...questions[qIndex], [field]: value };
      return { ...prev, questions };
    });
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setForm((prev) => {
      const questions = [...prev.questions];
      const options = [...questions[qIndex].options];
      options[optIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      return { ...prev, questions };
    });
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, emptyQuestion],
    }));
  };

  const removeQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setForm({
      title: test.title,
      description: test.description || "",
      category: test.category,
      duration: test.duration,
      questions: test.questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      pdfUrl: test.pdfUrl || "",
      pdfPublicId: test.pdfPublicId || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this test?")) return;
    try {
      await api.delete(`/tests/${id}`);
      await loadTests();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTest) {
        await api.put(`/tests/${editingTest._id}`, form);
      } else {
        await api.post("/tests", form);
      }
      resetForm();
      await loadTests();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/uploads/pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({
        ...prev,
        pdfUrl: data.url,
        pdfPublicId: data.public_id,
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setUploadingPdf(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-500">
          Create and manage PDF-based test series for each course.
        </p>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingTest ? "Edit Test" : "Create New Test"}
            </h2>
            {editingTest && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel edit
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Title
              </label>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Category
              </label>
              <select
                className="input"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="CA">CA</option>
                <option value="INTER">INTER</option>
                <option value="FINAL">FINAL</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Duration (minutes)
              </label>
              <input
                type="number"
                className="input"
                name="duration"
                min={1}
                value={form.duration}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Description
              </label>
              <textarea
                className="input min-h-[70px]"
                name="description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Attach Test PDF
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="text-xs text-slate-700 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-rose-500 file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-rose-600"
                />
                {uploadingPdf && (
                  <span className="text-xs text-slate-500">Uploading PDF...</span>
                )}
                {form.pdfUrl && !uploadingPdf && (
                  <a
                    href={form.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-rose-500 underline"
                  >
                    View current PDF
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="rounded-full border border-rose-200 px-3 py-1 text-xs text-rose-500 hover:bg-rose-50"
              >
                Add Question
              </button>
            </div>
            <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
              {form.questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                    <span>Question {qIndex + 1}</span>
                    {form.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-[11px] text-rose-400 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    className="input mb-2 text-xs"
                    placeholder="Question text"
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(qIndex, "question", e.target.value)
                    }
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        className="input text-xs"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(qIndex, optIndex, e.target.value)
                        }
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Correct Answer (must match one of the options exactly)
                    </label>
                    <input
                      className="input text-xs"
                      placeholder="Correct answer"
                      value={q.correctAnswer}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, "correctAnswer", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving..." : editingTest ? "Update Test" : "Create Test"}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Existing Tests</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading tests...</p>
        ) : tests.length === 0 ? (
          <p className="text-sm text-slate-500">No tests created yet.</p>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {tests.map((test) => (
              <div
                key={test._id}
                className="flex items-start justify-between rounded-lg border border-slate-100 bg-white p-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900">{test.title}</div>
                  <div className="mt-1 text-slate-500">
                    {test.category} • {test.duration} min •{" "}
                    {test.questions?.length} questions
                  </div>
                  {test.pdfUrl && (
                    <a
                      href={test.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-[11px] font-medium text-rose-500 underline"
                    >
                      View PDF
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => handleEdit(test)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(test._id)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-[11px] text-rose-500 hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

