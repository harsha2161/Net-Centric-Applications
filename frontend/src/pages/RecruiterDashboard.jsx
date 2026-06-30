import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, Users, Bell, UserPlus, UserMinus, 
  CheckCircle2, ChevronRight, LayoutDashboard, Loader2, Mail, X 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
    const { token } = useAuth();
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    // Active Tab state
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'directory' | 'liked'
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Showcase Feed States
    const [feedProjects, setFeedProjects] = useState([]);
    const [feedPage, setFeedPage] = useState(1);
    const [feedPages, setFeedPages] = useState(1);
    const [showOnlyFollowed, setShowOnlyFollowed] = useState(false);

    // Student Directory States
    const [students, setStudents] = useState([]);
    const [studentsPage, setStudentsPage] = useState(1);
    const [studentsPages, setStudentsPages] = useState(1);
    const [directorySearchQuery, setDirectorySearchQuery] = useState('');
    const [showOnlyFollowedStudents, setShowOnlyFollowedStudents] = useState(false);

    // Liked Projects States
    const [likedProjects, setLikedProjects] = useState([]);
    const [likedPage, setLikedPage] = useState(1);
    const [likedPages, setLikedPages] = useState(1);

    // Notifications state
    const [notifications, setNotifications] = useState([]);

    // Quick Stats states
    const [followCount, setFollowCount] = useState(0);
    const [likedCount, setLikedCount] = useState(0);

    // Selected Student Modal states (Portfolio popup)
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudentProjects, setSelectedStudentProjects] = useState([]);
    const [isModalLoading, setIsModalLoading] = useState(false);

    // Initial Load & Tab switching fetches
    useEffect(() => {
        if (!token) return;
        fetchNotifications();
        fetchQuickStats();
    }, [token]);

    useEffect(() => {
        if (!token) return;
        if (activeTab === 'feed') {
            fetchFeed(1);
        } else if (activeTab === 'directory') {
            fetchDirectory(1, directorySearchQuery);
        } else if (activeTab === 'liked') {
            fetchLiked(1);
        }
    }, [activeTab, token, showOnlyFollowed, showOnlyFollowedStudents]);

    // Fetchers
    const fetchFeed = async (page = 1) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${backendUrl}/api/projects`, {
                params: {
                    page,
                    limit: 6,
                    followedOnly: showOnlyFollowed
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeedProjects(res.data.projects || []);
            setFeedPage(res.data.page || 1);
            setFeedPages(res.data.pages || 1);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load showcase projects feed.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDirectory = async (page = 1, search = '') => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${backendUrl}/api/users`, {
                params: {
                    role: 'Student',
                    page,
                    limit: 6,
                    search,
                    followedOnly: showOnlyFollowedStudents
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(res.data.users || []);
            setStudentsPage(res.data.page || 1);
            setStudentsPages(res.data.pages || 1);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load student directory.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLiked = async (page = 1) => {
        setIsLoading(true);
        setErrorMsg('');
        try {
            const res = await axios.get(`${backendUrl}/api/projects/liked`, {
                params: { page, limit: 6 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikedProjects(res.data.projects || []);
            setLikedPage(res.data.page || 1);
            setLikedPages(res.data.pages || 1);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load liked projects.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Failed to load notifications:', err);
        }
    };

    const fetchQuickStats = async () => {
        try {
            const resFollow = await axios.get(`${backendUrl}/api/users`, {
                params: { role: 'Student', limit: 1, followedOnly: true },
                headers: { Authorization: `Bearer ${token}` }
            });
            setFollowCount(resFollow.data.total || resFollow.data.users?.length || 0);

            const resLikes = await axios.get(`${backendUrl}/api/projects/liked`, {
                params: { limit: 1 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setLikedCount(resLikes.data.total || resLikes.data.projects?.length || 0);
        } catch (err) {
            console.error('Failed to fetch quick stats:', err);
        }
    };

    // Interaction handlers
    const toggleLike = async (projectId) => {
        try {
            const res = await axios.post(`${backendUrl}/api/projects/${projectId}/likes`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { action } = res.data;
            
            // Update Showcase Feed projects
            setFeedProjects(prev => prev.map(p => {
                if (p.id === projectId || p._id === projectId) {
                    return { 
                        ...p, 
                        userLiked: action === 'liked', 
                        likesCount: action === 'liked' ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1) 
                    };
                }
                return p;
            }));

            // Update Liked Projects tab
            if (activeTab === 'liked' && action === 'unliked') {
                setLikedProjects(prev => prev.filter(p => p.id !== projectId && p._id !== projectId));
            }

            // Update Selected Student portfolio projects modal
            setSelectedStudentProjects(prev => prev.map(p => {
                if (p.id === projectId || p._id === projectId) {
                    return { 
                        ...p, 
                        userLiked: action === 'liked', 
                        likesCount: action === 'liked' ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 0) - 1) 
                    };
                }
                return p;
            }));

            fetchQuickStats();
        } catch (err) {
            console.error('Failed to toggle like:', err);
        }
    };

    const toggleFollow = async (studentId) => {
        try {
            const res = await axios.post(`${backendUrl}/api/interactions/users/${studentId}/follow`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const isFollowing = res.data.status === 'followed';

            // Update Student Directory listing
            setStudents(prev => prev.map(s => {
                if (s.id === studentId || s._id === studentId) {
                    return { ...s, isFollowing };
                }
                return s;
            }));

            // Update Selected Student portfolio modal
            if (selectedStudent && (selectedStudent.id === studentId || selectedStudent._id === studentId)) {
                setSelectedStudent(prev => ({ ...prev, isFollowing }));
            }

            fetchQuickStats();

            // Refresh feed/directory lists if we filter by followed only
            if (showOnlyFollowed) fetchFeed(feedPage);
            if (showOnlyFollowedStudents) fetchDirectory(studentsPage, directorySearchQuery);
        } catch (err) {
            console.error('Failed to toggle follow:', err);
        }
    };

    // Modal Portfolio Open
    const openStudentPortfolio = async (student) => {
        setSelectedStudent(student);
        setIsModalLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/projects`, {
                params: { studentId: student.id || student._id },
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedStudentProjects(res.data.projects || []);
        } catch (err) {
            console.error('Failed to fetch student projects:', err);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setDirectorySearchQuery(query);
        fetchDirectory(1, query);
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-zinc-100 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
                {/* Background decoration */}
                <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px] pointer-events-none" />
                <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="flex items-start gap-3.5">
                            <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30 shrink-0 mt-1">
                                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <motion.h1 
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
                                >
                                    Recruiter <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Dashboard</span>
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-zinc-400 max-w-2xl text-sm md:text-base mt-1"
                                >
                                    Discover top talent, track their latest projects, and connect with promising student developers.
                                </motion.p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Content Area */}
                        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                            {/* Tabs Navigation */}
                            <div className="flex space-x-1 glass rounded-2xl p-1.5 border border-zinc-800/50 w-fit">
                                <button
                                    onClick={() => setActiveTab('feed')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                        activeTab === 'feed'
                                            ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Showcase Feed
                                </button>
                                <button
                                    onClick={() => setActiveTab('directory')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                        activeTab === 'directory'
                                            ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <Users className="w-4 h-4" /> Student Directory
                                </button>
                                <button
                                    onClick={() => setActiveTab('liked')}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                        activeTab === 'liked'
                                            ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <Heart className="w-4 h-4" /> Liked Projects
                                </button>
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-32">
                                        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
                                        <p className="text-zinc-400 text-sm">Fetching real-time updates...</p>
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'feed' && (
                                            <motion.div
                                                key="feed"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center justify-between glass p-4 rounded-2xl border border-zinc-800/50">
                                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                        Latest Public Projects
                                                    </h2>
                                                    <label className="flex items-center gap-3 cursor-pointer group">
                                                        <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Only followed students</span>
                                                        <div className="relative">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only" 
                                                                checked={showOnlyFollowed}
                                                                onChange={(e) => setShowOnlyFollowed(e.target.checked)}
                                                            />
                                                            <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${showOnlyFollowed ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${showOnlyFollowed ? 'translate-x-4' : ''}`}></div>
                                                        </div>
                                                    </label>
                                                </div>

                                                {feedProjects.length === 0 ? (
                                                    <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                            <LayoutDashboard className="w-8 h-8 text-zinc-600" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white mb-1">No projects found</h3>
                                                        <p className="text-zinc-400">Try unfollowing students or wait for new uploads.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <motion.div 
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                                        >
                                                            {feedProjects.map((project, index) => (
                                                                <ProjectCard
                                                                    key={project.id || project._id}
                                                                    project={{
                                                                        ...project,
                                                                        id: project.id || project._id,
                                                                        technologies: project.technologiesUsed || []
                                                                    }}
                                                                    index={index}
                                                                    showLikeButton={true}
                                                                    isLiked={project.userLiked}
                                                                    onLike={toggleLike}
                                                                    showAuthorFooter={true}
                                                                    hoverBorderClass="hover:border-emerald-500/30"
                                                                    hoverTextClass="group-hover:text-emerald-400"
                                                                    variants={itemVariants}
                                                                />
                                                            ))}
                                                        </motion.div>

                                                        {/* Showcase Feed Pagination */}
                                                        {feedPages > 1 && (
                                                            <div className="flex items-center justify-between mt-8 glass p-4 rounded-2xl border border-zinc-800/50">
                                                                <button 
                                                                    disabled={feedPage === 1}
                                                                    onClick={() => fetchFeed(feedPage - 1)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Previous
                                                                </button>
                                                                <span className="text-sm text-zinc-400">
                                                                    Page <strong className="text-zinc-200">{feedPage}</strong> of {feedPages}
                                                                </span>
                                                                <button 
                                                                    disabled={feedPage === feedPages}
                                                                    onClick={() => fetchFeed(feedPage + 1)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'directory' && (
                                            <motion.div
                                                key="directory"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center glass p-4 rounded-2xl border border-zinc-800/50">
                                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                        Student Directory
                                                    </h2>
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                                        <label className="flex items-center gap-3 cursor-pointer group shrink-0">
                                                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">Only followed students</span>
                                                            <div className="relative">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="sr-only" 
                                                                    checked={showOnlyFollowedStudents}
                                                                    onChange={(e) => setShowOnlyFollowedStudents(e.target.checked)}
                                                                />
                                                                <div className={`block w-10 h-6 rounded-full transition-colors duration-300 ${showOnlyFollowedStudents ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${showOnlyFollowedStudents ? 'translate-x-4' : ''}`}></div>
                                                            </div>
                                                        </label>
                                                        <div className="relative w-full sm:w-72">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search by name or email..."
                                                                value={directorySearchQuery}
                                                                onChange={handleSearchChange}
                                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {students.length === 0 ? (
                                                    <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                            <Users className="w-8 h-8 text-zinc-600" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white mb-1">No students found</h3>
                                                        <p className="text-zinc-400">Try adjusting your filters or search query.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <motion.div 
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                        >
                                                            {students.map(student => {
                                                                const isFollowed = student.isFollowing;
                                                                return (
                                                                    <motion.div 
                                                                        key={student.id || student._id} 
                                                                        variants={itemVariants}
                                                                        className="glass p-5 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors flex flex-col h-full group"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="relative cursor-pointer" onClick={() => openStudentPortfolio(student)}>
                                                                                    <img 
                                                                                        src={student.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0D8ABC&color=fff`} 
                                                                                        alt={student.name} 
                                                                                        className="w-14 h-14 rounded-full ring-2 ring-zinc-800 object-cover" 
                                                                                    />
                                                                                    {isFollowed && (
                                                                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-background">
                                                                                            <CheckCircle2 className="w-3 h-3 text-white" />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div>
                                                                                    <h3 
                                                                                        onClick={() => openStudentPortfolio(student)} 
                                                                                        className="font-bold text-white text-lg group-hover:text-emerald-400 cursor-pointer transition-colors"
                                                                                    >
                                                                                        {student.name}
                                                                                    </h3>
                                                                                    <p className="text-xs text-zinc-500 font-medium">
                                                                                        {student.techStack?.length || 0} skills
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                onClick={() => toggleFollow(student.id || student._id)}
                                                                                className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm cursor-pointer ${
                                                                                    isFollowed 
                                                                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:text-white' 
                                                                                    : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white shadow-emerald-500/20'
                                                                                }`}
                                                                                title={isFollowed ? 'Unfollow' : 'Follow'}
                                                                            >
                                                                                {isFollowed ? <UserMinus className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                                                                            </button>
                                                                        </div>
                                                                        
                                                                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2 flex-1">{student.bio}</p>
                                                                        
                                                                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                                                                            {student.techStack && student.techStack.map(tech => (
                                                                                <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                                                    {tech}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                )
                                                            })}
                                                        </motion.div>

                                                        {/* Student Directory Pagination */}
                                                        {studentsPages > 1 && (
                                                            <div className="flex items-center justify-between mt-8 glass p-4 rounded-2xl border border-zinc-800/50">
                                                                <button 
                                                                    disabled={studentsPage === 1}
                                                                    onClick={() => fetchDirectory(studentsPage - 1, directorySearchQuery)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Previous
                                                                </button>
                                                                <span className="text-sm text-zinc-400">
                                                                    Page <strong className="text-zinc-200">{studentsPage}</strong> of {studentsPages}
                                                                </span>
                                                                <button 
                                                                    disabled={studentsPage === studentsPages}
                                                                    onClick={() => fetchDirectory(studentsPage + 1, directorySearchQuery)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'liked' && (
                                            <motion.div
                                                key="liked"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-6"
                                            >
                                                <div className="flex items-center justify-between glass p-4 rounded-2xl border border-zinc-800/50">
                                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                                        My Liked Projects
                                                    </h2>
                                                </div>

                                                {likedProjects.length === 0 ? (
                                                    <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                            <Heart className="w-8 h-8 text-zinc-600" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-white mb-1">No liked projects</h3>
                                                        <p className="text-zinc-400">Projects you like will appear here.</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <motion.div 
                                                            variants={containerVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                                        >
                                                            {likedProjects.map((project, index) => (
                                                                <ProjectCard
                                                                    key={project.id || project._id}
                                                                    project={{
                                                                        ...project,
                                                                        id: project.id || project._id,
                                                                        technologies: project.technologiesUsed || []
                                                                    }}
                                                                    index={index}
                                                                    showLikeButton={true}
                                                                    isLiked={true}
                                                                    onLike={toggleLike}
                                                                    showAuthorFooter={true}
                                                                    hoverBorderClass="hover:border-emerald-500/30"
                                                                    hoverTextClass="group-hover:text-emerald-400"
                                                                    variants={itemVariants}
                                                                />
                                                            ))}
                                                        </motion.div>

                                                        {/* Liked Projects Pagination */}
                                                        {likedPages > 1 && (
                                                            <div className="flex items-center justify-between mt-8 glass p-4 rounded-2xl border border-zinc-800/50">
                                                                <button 
                                                                    disabled={likedPage === 1}
                                                                    onClick={() => fetchLiked(likedPage - 1)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Previous
                                                                </button>
                                                                <span className="text-sm text-zinc-400">
                                                                    Page <strong className="text-zinc-200">{likedPage}</strong> of {likedPages}
                                                                </span>
                                                                <button 
                                                                    disabled={likedPage === likedPages}
                                                                    onClick={() => fetchLiked(likedPage + 1)}
                                                                    className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    Next
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar / Notifications Panel */}
                        <div className="lg:col-span-4 xl:col-span-3">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass rounded-3xl border border-zinc-800/50 p-6 sticky top-28 shadow-2xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                                        <div className="relative">
                                            <Bell className="w-5 h-5 text-zinc-400" />
                                            {notifications.some(n => !n.isRead) && (
                                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-900"></span>
                                            )}
                                        </div>
                                        Activity Feed
                                    </h3>
                                </div>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                    {notifications.length === 0 ? (
                                        <p className="text-xs text-zinc-500 italic text-center py-4">No recent activities</p>
                                    ) : (
                                        notifications.map((notif, index) => (
                                            <motion.div 
                                                key={notif.id || notif._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative pl-6 pb-4 border-l border-zinc-850 last:border-0 last:pb-0 group"
                                            >
                                                <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-zinc-900/50 group-hover:bg-emerald-400 transition-colors"></div>
                                                <p className="text-sm text-zinc-300 leading-snug mb-1">
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-zinc-650 font-medium block">
                                                    {new Date(notif.createdAt).toLocaleDateString()}
                                                </span>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-800/50">
                                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quick Stats</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                                            <div className="text-2xl font-bold text-white mb-1">{followCount}</div>
                                            <div className="text-xs text-zinc-400 font-medium">Following</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                                            <div className="text-2xl font-bold text-white mb-1">{likedCount}</div>
                                            <div className="text-xs text-zinc-400 font-medium">Liked Projects</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Portfolio Modal Popup */}
            <AnimatePresence>
                {selectedStudent && (
                    <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                        >
                            {/* Close button */}
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-6 right-6 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Student Header */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-zinc-800/60">
                                <div className="flex items-center gap-5">
                                    <img 
                                        src={selectedStudent.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=0D8ABC&color=fff`} 
                                        alt={selectedStudent.name} 
                                        className="w-20 h-20 rounded-full ring-4 ring-zinc-800 object-cover" 
                                    />
                                    <div>
                                        <h2 className="text-2xl font-black text-white">{selectedStudent.name}</h2>
                                        <p className="text-sm text-zinc-400 font-medium flex items-center gap-1.5 mt-1">
                                            <Mail className="w-4 h-4 text-zinc-500" /> {selectedStudent.email}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleFollow(selectedStudent.id || selectedStudent._id)}
                                    className={`px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                                        selectedStudent.isFollowing 
                                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700/80 hover:text-white' 
                                        : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-400 text-white shadow-emerald-500/20'
                                    }`}
                                >
                                    {selectedStudent.isFollowing ? (
                                        <>
                                            <UserMinus className="w-4 h-4" /> Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" /> Follow Student
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Bio & Skills details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="md:col-span-2">
                                    <h3 className="text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Bio / Profile</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed">{selectedStudent.bio}</p>
                                </div>
                                <div>
                                    <h3 className="text-zinc-300 font-bold mb-2 text-sm uppercase tracking-wider">Skills / Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedStudent.techStack && selectedStudent.techStack.length > 0 ? (
                                            selectedStudent.techStack.map(tech => (
                                                <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                    {tech}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-zinc-500">No tech stack listed yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Student Projects list */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Portfolio Projects ({selectedStudentProjects.length})</h3>
                                {isModalLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                                        <p className="text-sm text-zinc-400">Loading student projects...</p>
                                    </div>
                                ) : selectedStudentProjects.length === 0 ? (
                                    <p className="text-sm text-zinc-500 text-center py-8 bg-zinc-900/50 rounded-2xl border border-zinc-800/40">
                                        This student hasn't uploaded any public projects yet.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {selectedStudentProjects.map((project, index) => (
                                            <ProjectCard
                                                key={project.id || project._id}
                                                project={{
                                                    ...project,
                                                    id: project.id || project._id,
                                                    technologies: project.technologiesUsed || []
                                                }}
                                                index={index}
                                                showLikeButton={true}
                                                isLiked={project.userLiked}
                                                onLike={toggleLike}
                                                showAuthorFooter={false}
                                                hoverBorderClass="hover:border-emerald-500/30"
                                                hoverTextClass="group-hover:text-emerald-400"
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Empty block for rendering */}
        </>
    );
};

// Simple helper to avoid code blocks linting error on React Fragment empty tag closes
const ProjectPortfolioModalOverlay = ({ children }) => {
    return children;
};

export default RecruiterDashboard;
