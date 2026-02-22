import { useState, useEffect } from "react";
import axios from "axios";
import { UploadCloud, FileText, Trash2, Edit3, X, Check, Users, Download, Play, Plus } from "lucide-react";
import * as XLSX from "xlsx";
import API_BASE_URL from "./config";

const programs = ['B.Tech', 'B.Pharm', 'MCA', 'Diploma'];
const branches = ['CS', 'AIML', 'AIDS', 'IT', 'EC', 'ME', 'CE', 'EE'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Dashboard({ token, setAuthToken }) {
    const [resources, setResources] = useState([]);
    const [users, setUsers] = useState([]);
    const [videos, setVideos] = useState([]);
    const [activeTab, setActiveTab] = useState("pdfs"); // pdfs, videos, subjects, branches, notifications
    const [showUsers, setShowUsers] = useState(false);

    // Notification Management State
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationMessage, setNotificationMessage] = useState("");
    const [notificationType, setNotificationType] = useState("announcement");
    const [notifications, setNotifications] = useState([]);

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
    const [videoUrl, setVideoUrl] = useState("");

    // Video Management State
    const [editingVideoId, setEditingVideoId] = useState(null);
    const [videoTitle, setVideoTitle] = useState("");
    const [videoYoutubeUrl, setVideoYoutubeUrl] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [videoSubjectCode, setVideoSubjectCode] = useState("");
    const [videoSubjectName, setVideoSubjectName] = useState("");

    // Subject Management State
    const [subjects, setSubjects] = useState([]);
    const [newSubjectName, setNewSubjectName] = useState("");
    const [newSubjectCode, setNewSubjectCode] = useState("");

    // Branch Management State
    const [allBranches, setAllBranches] = useState([...branches]);
    const [newBranch, setNewBranch] = useState("");

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

    const fetchVideos = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/videos`);
            setVideos(res.data);
        } catch (err) {
            console.log("Error fetching videos", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/users`);
            setUsers(res.data);
        } catch (err) {
            console.log("Error fetching users", err);
        }
    };

    const exportUsersToExcel = () => {
        if (users.length === 0) {
            alert("No users to export");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(users);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `RGPV_Users_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handleShowUsers = () => {
        setShowUsers(!showUsers);
        if (!showUsers) {
            fetchUsers();
        }
    };

    useEffect(() => {
        fetchResources();
        fetchVideos();
        loadSubjectsFromResources();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setAuthToken(null);
    };

    const handleUploadOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = { title, type, program, branch, semester, subjectName, subjectCode, fileUrl, videoUrl };
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
            setTitle(""); setFileUrl(""); setVideoUrl(""); setSubjectName(""); setSubjectCode("");
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
        setFileUrl(r.fileUrl || "");
        setVideoUrl(r.videoUrl || "");
        // Assuming branch and program could also exist in robust data
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setTitle(""); setFileUrl(""); setVideoUrl(""); setSubjectName(""); setSubjectCode("");
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

    // ━━━━━ VIDEO MANAGEMENT ━━━━━
    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                subjectCode: videoSubjectCode,
                subjectName: videoSubjectName,
                title: videoTitle,
                youtubeUrl: videoYoutubeUrl,
                description: videoDescription,
            };
            if (editingVideoId) {
                await axios.put(`${API_BASE_URL}/api/videos/${editingVideoId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Video updated successfully!");
            } else {
                await axios.post(`${API_BASE_URL}/api/videos`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                alert("Video added successfully!");
            }
            fetchVideos();
            clearVideoForm();
        } catch (error) {
            alert("Failed to save video: " + (error.response?.data?.message || error.message));
        }
    };

    const editVideo = (video) => {
        setEditingVideoId(video._id);
        setVideoTitle(video.title);
        setVideoYoutubeUrl(video.youtubeUrl);
        setVideoDescription(video.description || "");
        setVideoSubjectCode(video.subjectCode);
        setVideoSubjectName(video.subjectName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearVideoForm = () => {
        setEditingVideoId(null);
        setVideoTitle("");
        setVideoYoutubeUrl("");
        setVideoDescription("");
        setVideoSubjectCode("");
        setVideoSubjectName("");
    };

    const deleteVideo = async (id) => {
        if (!window.confirm("Delete this video?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchVideos();
        } catch (error) {
            alert("Delete failed");
        }
    };

    // ━━━━━ SUBJECT MANAGEMENT ━━━━━
    const loadSubjectsFromResources = () => {
        const uniqueSubjects = Array.from(
            new Map(
                resources.map(r => [r.subjectCode, { code: r.subjectCode, name: r.subjectName }])
            ).values()
        );
        setSubjects(uniqueSubjects);
    };

    const addSubject = () => {
        if (!newSubjectCode.trim() || !newSubjectName.trim()) {
            alert("Both code and name are required");
            return;
        }
        if (subjects.some(s => s.code === newSubjectCode)) {
            alert("Subject already exists");
            return;
        }
        setSubjects([...subjects, { code: newSubjectCode, name: newSubjectName }]);
        setNewSubjectCode("");
        setNewSubjectName("");
        alert("Subject added! Create a resource for this subject to save it permanently.");
    };

    const removeSubject = (code) => {
        if (window.confirm(`Remove ${code} from subjects?`)) {
            setSubjects(subjects.filter(s => s.code !== code));
        }
    };

    // ━━━━━ BRANCH MANAGEMENT ━━━━━
    const addBranch = () => {
        if (!newBranch.trim()) {
            alert("Branch code is required");
            return;
        }
        if (allBranches.some(b => b === newBranch.toUpperCase())) {
            alert("Branch already exists");
            return;
        }
        setAllBranches([...allBranches, newBranch.toUpperCase()]);
        setNewBranch("");
        alert("Branch added!");
    };

    const removeBranch = (code) => {
        if (window.confirm(`Remove ${code} from branches?`)) {
            setAllBranches(allBranches.filter(b => b !== code));
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
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'pdfs' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => setActiveTab('pdfs')}>
                            <FileText size={20} /> <span>Manage PDFs</span>
                        </li>
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'videos' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => setActiveTab('videos')}>
                            <Play size={20} /> <span>YouTube Videos</span>
                        </li>
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'subjects' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => setActiveTab('subjects')}>
                            <FileText size={20} /> <span>Manage Subjects</span>
                        </li>
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'branches' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => setActiveTab('branches')}>
                            <FileText size={20} /> <span>Manage Branches</span>
                        </li>
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'users' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => { setActiveTab('users'); fetchUsers(); }}>
                            <Users size={20} /> <span>View Users</span>
                        </li>
                        <li className={`flex items-center space-x-3 py-3 px-4 rounded-xl border cursor-pointer transition-all ${activeTab === 'notifications' ? 'text-white bg-blue-600/20 text-blue-400 shadow-inner border-blue-500/20' : 'border-slate-700 hover:bg-slate-800/30'}`} onClick={() => { setActiveTab('notifications'); }}>
                            <span className="text-xl">🔔</span> <span>Send Notification</span>
                        </li>
                    </ul>
                </div>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 font-bold bg-red-400/10 py-3 rounded-xl border border-red-500/20 transition duration-200">Log out</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto">

                {/* ━━━ PDFs Section ━━━ */}
                {activeTab === 'pdfs' && (
                    <>
                        <ViewHeader title={editingId ? "Edit Resource PDF" : "Upload New PDF"} />

                        {/* Upload Form */}
                        <form onSubmit={handleUploadOrUpdate} className="bg-[#1e293b] rounded-3xl p-8 mb-10 border border-slate-700 shadow-2xl relative">
                            {editingId && (
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">EDITING MODE</span>
                                    <button type="button" onClick={cancelEdit} className="bg-slate-700 text-white rounded-full p-1"><X size={16} /></button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Program</label>
                                    <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={program} onChange={(e) => setProgram(e.target.value)}>
                                        {programs.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Branch</label>
                                    <select className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={branch} onChange={(e) => setBranch(e.target.value)}>
                                        {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
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
                                        <option value="VIDEO">YouTube Video</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Document Title</label>
                                    <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. 2023 Solved Paper" value={title} onChange={(e) => setTitle(e.target.value)} required />
                                </div>
                                {type === "VIDEO" ? (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">YouTube Video Link</label>
                                        <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://www.youtube.com/embed/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
                                    </div>
                                ) : (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Google Drive/Cloudinary Link</label>
                                        <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required />
                                    </div>
                                )}
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
                            <div className="flex space-x-3">
                                <select className="bg-[#1e293b] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                                    <option value="All">All Branches</option>
                                    {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                                <select className="bg-[#1e293b] border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none" value={filterSem} onChange={(e) => setFilterSem(e.target.value)}>
                                    <option value="All">All Semesters</option>
                                    {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
                                </select>
                            </div>
                        </div>

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
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-full border uppercase ${item.type === 'PYQ' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : item.type === 'NOTE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : item.type === 'VIDEO' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
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
                                            <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">No resources found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ━━━ YouTube Videos Section ━━━ */}
                {activeTab === 'videos' && (
                    <>
                        <ViewHeader title={editingVideoId ? "Edit YouTube Video" : "Add YouTube Video"} />

                        <form onSubmit={handleVideoSubmit} className="bg-[#1e293b] rounded-3xl p-8 mb-10 border border-slate-700 shadow-2xl relative">
                            {editingVideoId && (
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">EDITING</span>
                                    <button type="button" onClick={clearVideoForm} className="bg-slate-700 text-white rounded-full p-1"><X size={16} /></button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Subject Code</label>
                                    <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CS-302" value={videoSubjectCode} onChange={(e) => setVideoSubjectCode(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Subject Name</label>
                                    <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Data Structures" value={videoSubjectName} onChange={(e) => setVideoSubjectName(e.target.value)} required />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Video Title</label>
                                <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Full Course Tutorial" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">YouTube URL</label>
                                <input className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://www.youtube.com/watch?v=..." value={videoYoutubeUrl} onChange={(e) => setVideoYoutubeUrl(e.target.value)} required />
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Description (Optional)</label>
                                <textarea className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Video description..." value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} rows="3" />
                            </div>

                            <button type="submit" className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${editingVideoId ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-pink-600 to-red-600'}`}>
                                {editingVideoId ? <><Check size={20} /> <span>Update Video</span></> : <><Play size={20} /> <span>Add YouTube Video</span></>}
                            </button>
                        </form>

                        <div className="mb-6">
                            <h3 className="text-2xl font-bold">All Videos ({videos.length})</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {videos.map((video) => (
                                <div key={video._id} className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden hover:shadow-xl transition duration-200">
                                    <div className="bg-black h-40 flex items-center justify-center">
                                        <Play size={40} className="text-red-500" />
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-slate-400 mb-1">{video.subjectCode}</p>
                                        <h4 className="text-sm font-bold text-white mb-1">{video.title}</h4>
                                        <p className="text-xs text-slate-500 mb-3">{video.subjectName}</p>
                                        <div className="flex gap-2">
                                            <button onClick={() => editVideo(video)} className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-bold transition">
                                                Edit
                                            </button>
                                            <button onClick={() => deleteVideo(video._id)} className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition">
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {videos.length === 0 && <p className="text-center text-slate-400 py-10">No videos added yet.</p>}
                    </>
                )}

                {/* ━━━ Subjects Management ━━━ */}
                {activeTab === 'subjects' && (
                    <>
                        <ViewHeader title="Manage Subjects" />
                        <div className="bg-[#1e293b] rounded-3xl p-8 mb-10 border border-slate-700 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <input className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Code (e.g. CS-302)" value={newSubjectCode} onChange={(e) => setNewSubjectCode(e.target.value.toUpperCase())} />
                                <input className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Name (e.g. Data Structures)" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                                <button onClick={addSubject} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition">
                                    <Plus size={18} /> Add Subject
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subjects.map((subject) => (
                                    <div key={subject.code} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">{subject.code}</p>
                                            <p className="text-xs text-slate-400">{subject.name}</p>
                                        </div>
                                        <button onClick={() => removeSubject(subject.code)} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {subjects.length === 0 && <p className="text-center text-slate-400 py-10">No subjects added yet.</p>}
                        </div>
                    </>
                )}

                {/* ━━━ Branches Management ━━━ */}
                {activeTab === 'branches' && (
                    <>
                        <ViewHeader title="Manage Branches" />
                        <div className="bg-[#1e293b] rounded-3xl p-8 mb-10 border border-slate-700 shadow-2xl">
                            <div className="flex gap-4 mb-6">
                                <input className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Branch Code (e.g. VLSI)" value={newBranch} onChange={(e) => setNewBranch(e.target.value.toUpperCase())} />
                                <button onClick={addBranch} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl px-6 py-3 flex items-center gap-2 transition">
                                    <Plus size={18} /> Add Branch
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {allBranches.map((branch) => (
                                    <div key={branch} className="bg-gradient-to-br from-indigo-800 to-indigo-900 rounded-xl p-4 border border-indigo-700 text-center relative group">
                                        <p className="font-bold text-white text-lg">{branch}</p>
                                        <button onClick={() => removeBranch(branch)} className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* ━━━ Users Section ━━━ */}
                {activeTab === 'users' && (
                    <>
                        <ViewHeader title="Registered Users" />

                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <h3 className="text-2xl font-bold">All Registered Users</h3>
                                <p className="text-slate-400 text-sm mt-1">Total {users.length} users</p>
                            </div>
                            <button onClick={exportUsersToExcel} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
                                <Download size={18} /> Export to Excel
                            </button>
                        </div>

                        <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-[#0f172a] text-slate-400 font-bold uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Phone</th>
                                        <th className="px-6 py-4">Program</th>
                                        <th className="px-6 py-4">Branch</th>
                                        <th className="px-6 py-4">Semester</th>
                                        <th className="px-6 py-4">Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition duration-150">
                                            <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                            <td className="px-6 py-4 font-medium text-slate-300">{user.phone}</td>
                                            <td className="px-6 py-4">{user.program || 'B.Tech'}</td>
                                            <td className="px-6 py-4">{user.branch || 'CS'}</td>
                                            <td className="px-6 py-4 font-bold text-indigo-400">{user.semester || 1}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(user.joinedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">No users registered yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* ━━━ NOTIFICATIONS Section ━━━ */}
                {activeTab === 'notifications' && (
                    <>
                        <ViewHeader title="📢 Send Notifications" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Send Notification Form */}
                            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">✉️ New Notification</h3>
                                </div>
                                <div className="p-8">
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            const payload = {
                                                title: notificationTitle,
                                                message: notificationMessage,
                                                type: notificationType,
                                            };
                                            await axios.post(`${API_BASE_URL}/api/notifications`, payload, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            alert("Notification sent to all users!");
                                            setNotificationTitle("");
                                            setNotificationMessage("");
                                            setNotificationType("announcement");
                                        } catch (error) {
                                            alert("Failed to send notification: " + (error.response?.data?.error || error.message));
                                        }
                                    }}>
                                        <div className="mb-6">
                                            <label className="block text-slate-300 font-semibold mb-2">Notification Type</label>
                                            <select value={notificationType} onChange={(e) => setNotificationType(e.target.value)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none">
                                                <option value="announcement">📢 Announcement</option>
                                                <option value="resource">📚 New Resource</option>
                                                <option value="alert">⚠️ Alert</option>
                                                <option value="update">🔄 Update</option>
                                                <option value="maintenance">🛠️ Maintenance</option>
                                                <option value="event">📅 Event</option>
                                            </select>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-slate-300 font-semibold mb-2">Title</label>
                                            <input type="text" placeholder="Notification title..." value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 outline-none" required />
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-slate-300 font-semibold mb-2">Message</label>
                                            <textarea placeholder="Notification message..." value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} rows="5" className="w-full bg-[#0f172a] border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 outline-none" required></textarea>
                                        </div>
                                        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2">
                                            <span>🔔</span> Send to All Users
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Notification Preview */}
                            <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
                                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">👁️ Preview</h3>
                                </div>
                                <div className="p-8 flex flex-col justify-center min-h-[400px]">
                                    {notificationTitle ? (
                                        <div className="bg-[#0f172a] rounded-xl border border-blue-600/40 p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${{
                                                    'resource': 'bg-blue-600/20',
                                                    'announcement': 'bg-green-600/20',
                                                    'alert': 'bg-red-600/20',
                                                    'update': 'bg-purple-600/20',
                                                    'maintenance': 'bg-yellow-600/20',
                                                    'event': 'bg-pink-600/20',
                                                }[notificationType]}`}>
                                                    {{
                                                        'resource': '📚',
                                                        'announcement': '📢',
                                                        'alert': '⚠️',
                                                        'update': '🔄',
                                                        'maintenance': '🛠️',
                                                        'event': '📅',
                                                    }[notificationType]}
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-sm">RGPV Hub Notification</p>
                                                    <p className="text-slate-300 text-xs">Just now</p>
                                                </div>
                                            </div>
                                            <h4 className="text-white font-bold text-lg mb-2">{notificationTitle || 'Title'}</h4>
                                            <p className="text-slate-300 text-sm leading-relaxed">{notificationMessage || 'Message will appear here...'}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-slate-500 text-lg">Enter title to see preview</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}

function ViewHeader({ title }) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-slate-400 mt-2">Manage resources and content for the mobile app.</p>
        </div>
    );
}
