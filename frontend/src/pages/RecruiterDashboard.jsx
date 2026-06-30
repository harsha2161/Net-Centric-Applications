import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Heart, Users, Bell, UserPlus, UserMinus, CheckCircle2, ChevronRight, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';

// Mock Data
const MOCK_STUDENTS = [
    {
        id: 'std-1',
        name: 'Alex Johnson',
        bio: 'Full-stack developer passionate about building scalable web applications. Open to junior roles.',
        avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff',
        techStack: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    },
    {
        id: 'std-2',
        name: 'Sarah Williams',
        bio: 'Frontend specialist focusing on interactive UI/UX design and accessibility.',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=8B5CF6&color=fff',
        techStack: ['Vue.js', 'Tailwind CSS', 'Framer Motion', 'Figma'],
    },
    {
        id: 'std-3',
        name: 'Michael Chen',
        bio: 'Backend developer with experience in microservices and cloud architecture.',
        avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=10B981&color=fff',
        techStack: ['Go', 'Docker', 'Kubernetes', 'AWS'],
    },
    {
        id: 'std-4',
        name: 'Emma Davis',
        bio: 'Mobile app developer creating cross-platform solutions for iOS and Android.',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=F59E0B&color=fff',
        techStack: ['Flutter', 'Dart', 'Firebase'],
    },
];

const MOCK_PROJECTS = [
    {
        id: 'proj-1',
        studentId: MOCK_STUDENTS[0],
        title: 'TaskFlow Pro',
        description: 'An advanced task management tool with real-time collaboration, kanban boards, and progress analytics.',
        technologiesUsed: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
        demoUrl: '#',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'proj-2',
        studentId: MOCK_STUDENTS[1],
        title: 'DesignSystem UI',
        description: 'A comprehensive, accessible component library built for modern web applications.',
        technologiesUsed: ['Vue.js', 'Tailwind CSS', 'Storybook'],
        demoUrl: '#',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80',
    },
    {
        id: 'proj-3',
        studentId: MOCK_STUDENTS[2],
        title: 'CloudSync CLI',
        description: 'A command-line tool for synchronizing local directories with AWS S3 buckets efficiently.',
        technologiesUsed: ['Go', 'AWS SDK'],
        demoUrl: '#',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    },
     {
        id: 'proj-4',
        studentId: MOCK_STUDENTS[0],
        title: 'E-commerce API',
        description: 'Robust RESTful API for an e-commerce platform including payment processing and inventory management.',
        technologiesUsed: ['Node.js', 'Express', 'PostgreSQL', 'Stripe'],
        demoUrl: '#',
        isPublic: true,
        coverImage: null,
    },
];

const MOCK_NOTIFICATIONS = [
    { id: 'notif-1', message: "Sarah Williams just published a new project: 'DesignSystem UI'.", time: '2 hours ago', type: 'project' },
    { id: 'notif-2', message: "Alex Johnson updated their tech stack to include 'TypeScript'.", time: '5 hours ago', type: 'profile' },
    { id: 'notif-3', message: "Michael Chen is now looking for backend roles.", time: '1 day ago', type: 'status' },
];

const gradients = [
    "from-blue-500/20 to-purple-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-indigo-500/20 to-blue-500/20",
];

const RecruiterDashboard = () => {
    // State
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'directory'
    const [followedStudents, setFollowedStudents] = useState(['std-1', 'std-2']); // Pre-follow some for demo
    const [likedProjects, setLikedProjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyFollowed, setShowOnlyFollowed] = useState(false);

    // Handlers
    const toggleFollow = (studentId) => {
        setFollowedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleLike = (projectId) => {
        setLikedProjects(prev => 
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    // Derived Data
    const filteredProjects = MOCK_PROJECTS.filter(project => {
        if (showOnlyFollowed && !followedStudents.includes(project.studentId.id)) {
            return false;
        }
        return true; // Simplified feed search for now
    });

    const likedProjectsList = MOCK_PROJECTS.filter(project => likedProjects.includes(project.id));

    const filteredStudents = MOCK_STUDENTS.filter(student => {
        const query = searchQuery.toLowerCase();
        return (
            student.name.toLowerCase().includes(query) ||
            student.techStack.some(tech => tech.toLowerCase().includes(query))
        );
    });

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
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                                    activeTab === 'feed'
                                        ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                }`}
                            >
                                <LayoutDashboard className="w-4 h-4" /> Showcase Feed
                            </button>
                            <button
                                onClick={() => setActiveTab('directory')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                                    activeTab === 'directory'
                                        ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50'
                                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                                }`}
                            >
                                <Users className="w-4 h-4" /> Student Directory
                            </button>
                            <button
                                onClick={() => setActiveTab('liked')}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
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

                                    {filteredProjects.length === 0 ? (
                                        <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                <LayoutDashboard className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">No projects found</h3>
                                            <p className="text-zinc-400">Try unfollowing students or wait for new uploads.</p>
                                        </div>
                                    ) : (
                                        <motion.div 
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            {filteredProjects.map((project, index) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
                                                    index={index}
                                                    showLikeButton={true}
                                                    isLiked={likedProjects.includes(project.id)}
                                                    onLike={toggleLike}
                                                    showAuthorFooter={true}
                                                    hoverBorderClass="hover:border-emerald-500/30"
                                                    hoverTextClass="group-hover:text-emerald-400"
                                                    variants={itemVariants}
                                                />
                                            ))}
                                        </motion.div>
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
                                        <div className="relative w-full sm:w-72">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or tech..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <motion.div 
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {filteredStudents.map(student => {
                                            const isFollowed = followedStudents.includes(student.id);
                                            return (
                                                <motion.div 
                                                    key={student.id} 
                                                    variants={itemVariants}
                                                    className="glass p-5 rounded-3xl border border-zinc-800/50 hover:border-zinc-700 transition-colors flex flex-col h-full group"
                                                >
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <img src={student.avatar} alt={student.name} className="w-14 h-14 rounded-full ring-2 ring-zinc-800 object-cover" />
                                                                {isFollowed && (
                                                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-background">
                                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{student.name}</h3>
                                                                <p className="text-xs text-zinc-500 font-medium">{student.techStack.length} skills • {MOCK_PROJECTS.filter(p=>p.studentId.id === student.id).length} projects</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleFollow(student.id)}
                                                            className={`p-2 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
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
                                                        {student.techStack.map(tech => (
                                                            <span key={tech} className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </motion.div>

                                    {filteredStudents.length === 0 && (
                                        <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                <Users className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">No students found</h3>
                                            <p className="text-zinc-400">Adjust your search terms to see results.</p>
                                        </div>
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

                                    {likedProjectsList.length === 0 ? (
                                        <div className="text-center py-20 glass rounded-3xl border border-zinc-800/50">
                                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                                <Heart className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-1">No liked projects</h3>
                                            <p className="text-zinc-400">Projects you like will appear here.</p>
                                        </div>
                                    ) : (
                                        <motion.div 
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                        >
                                            {likedProjectsList.map((project, index) => (
                                                <ProjectCard
                                                    key={project.id}
                                                    project={project}
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
                                    )}
                                </motion.div>
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
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <div className="relative">
                                        <Bell className="w-5 h-5 text-zinc-400" />
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-900"></span>
                                    </div>
                                    Activity Feed
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {MOCK_NOTIFICATIONS.map((notif, index) => (
                                    <motion.div 
                                        key={notif.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative pl-6 pb-4 border-l border-zinc-800 last:border-0 last:pb-0 group"
                                    >
                                        {/* Timeline dot */}
                                        <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-zinc-900/50 group-hover:bg-emerald-400 transition-colors"></div>
                                        
                                        <p className="text-sm text-zinc-300 leading-snug mb-1">
                                            {notif.message}
                                        </p>
                                        <span className="text-xs text-zinc-600 font-medium block">
                                            {notif.time}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-800/50">
                                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Quick Stats</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                                        <div className="text-2xl font-bold text-white mb-1">{followedStudents.length}</div>
                                        <div className="text-xs text-zinc-400 font-medium">Following</div>
                                    </div>
                                    <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                                        <div className="text-2xl font-bold text-white mb-1">{likedProjects.length}</div>
                                        <div className="text-xs text-zinc-400 font-medium">Liked Projects</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default RecruiterDashboard;
