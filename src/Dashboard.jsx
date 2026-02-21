import { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, FileText, Trash2, Edit3, X, Check } from "lucide-react";
import API_BASE_URL from "./config";

const programs = ['B.Tech', 'B.Pharm', 'MCA', 'Diploma'];
const branches = ['CS', 'AIML', 'AIDS', 'IT', 'EC', 'ME', 'CE', 'EE'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Dashboard({ token, setAuthToken }) {
    const [resources, setResources] = useState([]);

    // Upload/Edit Form state
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState("");
    const [type, setType] = useState("NOTE");
    const [program, setProgram] = useState("B.Tech");
    const [branch, setBranch] = useState("CS");
    const [semester, setSemester] = useState(1);
    const [subjectName, setSubjectName] = useState("");
    const [subjectCode, setSubjectCode] = useState("");
    const [fileUrl, setFileUrl] = useState("");

    // Filter states for view table
    const [filterBranch, setFilterBranch] = useState("All");
    const [filterSem, setFilterSem] = useState("All");

    const fetchResources = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/resources`);
            setResources(res.data);
        } catch (err) {
            console.log("Error fetching", err);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setAuthToken(null);
    };

    const handleUploadOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { title, type, program, branch, semester, subjectName, subjectCode, fileUrl };
            if (editingId) {
                // Update existing
                await axios.put(`${API_BASE_URL}/api/resources/${editingId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Successfully Updated!");
                setEditingId(null);
            } else {
                // Create new
                await axios.post(`${API_BASE_URL}/api/resources`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert("Successfully Uploaded to App!");
            }
            fetchResources();
            setTitle(""); setFileUrl(""); setSubjectName(""); setSubjectCode("");
        } catch (error) {
            alert("Failed to save. Make sure Node.js server is running.");
        }
    };

    const editResource = (r) => {
        setEditingId(r._id);
        setTitle(r.title);
        setType(r.type);
        setSemester(r.semester || 1);
        setSubjectName(r.subjectName);
        setSubjectCode(r.subjectCode);
        setFileUrl(r.fileUrl);
        // Assuming branch and program could also exist in robust data
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle(""); setFileUrl(""); setSubjectName(""); setSubjectCode("");
    };

    const deleteResource = async (id) => {
        if (!window.confirm("Are you sure you want to delete this PDF?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/resources/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchResources();
        } catch (error) {
            alert("Delete failed");
        }
    };

    const filteredResources = resources.filter(r => {
        let branchMatch = filterBranch === "All" || r.subjectCode.startsWith(filterBranch);
        let semMatch = filterSem === "All" || r.semester === Number(filterSem);
        return branchMatch && semMatch;
    });

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans flex">
            {/* Sidebar Nav */}
            <div className="w-64 bg-[#1e293b] p-6 flex flex-col justify-between hidden md:flex border-r border-slate-700 shadow-2xl">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent mb-1">
                        RGPV Panel
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mb-8 tracking-widest uppercase">Admin Portal</p>
                    <ul className="space-y-4 text-slate-400 font-medium">
                        <li className="flex items-center space-x-3 text-white bg-blue-600/20 text-blue-400 py-3 px-4 rounded-xl shadow-inner border border-blue-500/20">
                            <FileText size={20} /> <span>Manage PDFs</span>
                        </li>
                    </ul>
                </div>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-bold bg-red-400/10 py-3 rounded-xl border border-red-500/20 transition duration-200">Log out</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto">

                <ViewHeader title={editingId ? "Edit Resource PDF" : "Upload New PDF"} />

                {/* Glassmorphism Upload Form */}
                <form onSubmit={handleUploadOrUpdate} className="bg-[#1e293b] rounded-3xl p-8 mb-10 border border-slate-700 shadow-2xl relative">
                    {editingId && (
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">EDITING MODE</span>
                            <button type="button" onClick={cancelEdit} className="bg-slate-700 text-white rounded-full p-1"><X size={16} /></button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Structure Hierarchy Selectors */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Program</label>
                            <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={program} onChange={(e) => setProgram(e.target.value)}>
                                {programs.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Branch</label>
                            <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Semester</label>
                            <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
                                {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Subject Code</label>
                            <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. CS-302" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Subject Name</label>
                            <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Data Structures" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">File Type</label>
                            <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="NOTE">Notes</option>
                                <option value="PYQ">PYQ</option>
                                <option value="SYLLABUS">Syllabus</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Document Title</label>
                            <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2023 Solved Paper" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Google Drive/Cloudinary Link</label>
                            <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${editingId ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'}`}>
                        {editingId ? <><Check size={20} /> <span>Save Changes</span></> : <><UploadCloud size={20} /> <span>Upload to Database</span></>}
                    </button>
                </form>

                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h3 className="text-2xl font-bold">Uploaded Resources</h3>
                        <p className="text-slate-400 text-sm mt-1">Found {filteredResources.length} items</p>
                    </div>

                    {/* Filters */}
                    <div className="flex space-x-3">
                        <select className="bg-[#1e293b] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                            <option value="All">All Branches</option>
                            <option value="CS">CS</option>
                            <option value="BT">BT (Common)</option>
                            <option value="AL">AIML</option>
                            <option value="IT">IT</option>
                        </select>
                        <select className="bg-[#1e293b] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                            <option value="All">All Semesters</option>
                            {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table representation */}
                <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-[#0f172a] text-slate-400 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Sem</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResources.map((item) => (
                                <tr key={item._id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition duration-150">
                                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-200">{item.subjectCode}</div>
                                        <div className="text-xs text-slate-500">{item.subjectName}</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-indigo-400">{item.semester}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full border uppercase ${item.type === 'PYQ' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : item.type === 'NOTE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-400">{item.views || 0}</td>
                                    <td className="px-6 py-4 flex justify-end space-x-2">
                                        <button onClick={() => editResource(item)} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition duration-200">
                                            <Edit3 size={16} />
                                        </button>
                                        <button onClick={() => deleteResource(item._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition duration-200">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredResources.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">No results found for these filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}

function ViewHeader({ title }) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-slate-400 mt-2">Manage PDFs exactly as they will appear inside the mobile app.</p>
        </div>
    );
}
