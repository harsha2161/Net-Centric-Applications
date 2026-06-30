import { useState, useEffect } from 'react';
import axios from "axios";
import { motion } from 'framer-motion';
import { Search, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const separator = url.startsWith('/') ? '' : '/';
  return `${backendUrl}${separator}${url}`;
};

const demoProjects = [
    {
        id: 'demo-1',
        studentId: { name: 'Demo Student' },
        title: 'E-Commerce Platform',
        description: 'A full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product search, shopping cart, and payment gateway integration.',
        technologiesUsed: ['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
        demoUrl: 'https://demo-ecommerce.example.com',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
     
    },
    {
        id: 'demo-2',
        studentId: { name: 'Demo Student' },
        title: 'Task Management App',
        description: 'A collaborative task management application allowing teams to create, assign, and track tasks. Includes real-time updates and an intuitive drag-and-drop interface.',
        technologiesUsed: ['Vue.js', 'Firebase', 'Vuetify'],
        demoUrl: 'https://demo-taskapp.example.com',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
    },
     {
        id: 'demo-2',
        studentId: { name: 'Demo Student' },
        title: 'Task Management App',
        description: 'A collaborative task management application allowing teams to create, assign, and track tasks. Includes real-time updates and an intuitive drag-and-drop interface.',
        technologiesUsed: ['Vue.js', 'Firebase', 'Vuetify'],
        demoUrl: 'https://demo-taskapp.example.com',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
    },
     {
        id: 'demo-2',
        studentId: { name: 'Demo Student' },
        title: 'Task Management App',
        description: 'A collaborative task management application allowing teams to create, assign, and track tasks. Includes real-time updates and an intuitive drag-and-drop interface.',
        technologiesUsed: ['Vue.js', 'Firebase', 'Vuetify'],
        demoUrl: 'https://demo-taskapp.example.com',
        isPublic: true,
        coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&q=80',
    },
]


// Fallback gradients for empty cover images
const gradients = [
    "from-blue-500/20 to-purple-500/20",
    "from-emerald-500/20 to-teal-500/20",
    "from-orange-500/20 to-red-500/20",
    "from-indigo-500/20 to-blue-500/20",
    "from-pink-500/20 to-rose-500/20"
];

const BrowseProjects = () => {
    const [projects, setProjects] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()

    const token = localStorage.getItem("token")

    useEffect(() => {

        setIsLoading(true)
        axios.get(import.meta.env.VITE_BACKEND_URL + "/api/projects/" + searchQuery, {
            headers: {
                Authorization: `Bearer ${token}`
            },

        }).then((res) => {
            const fetchedProjects = res.data.projects || [];
            const projectsArray = fetchedProjects.length > 0 ? fetchedProjects : demoProjects;
            setProjects(projectsArray)

        }).catch((err) => {
            console.error("Error fetching projects", err)

        }).finally(() => {
            setIsLoading(false)
        })
    }, [searchQuery, token])

    const filteredProjects = projects.filter(project => {
        if (!project.isPublic) return false;

        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            project.title.toLowerCase().includes(searchLower) ||
            project.description.toLowerCase().includes(searchLower) ||
            project.technologiesUsed.some(tech => tech.toLowerCase().includes(searchLower));

        return matchesSearch;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-24 pb-12 px-6 lg:px-12 max-w-7xl mx-auto">
                {/* Header Section */}
            <div className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-purple-400 bg-clip-text text-transparent mb-4"
                    >
                        Explore Projects
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-text-muted text-lg max-w-2xl"
                    >
                        Discover innovative ideas, collaborate with brilliant minds, and find your next big venture.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 bg-surface p-2 rounded-2xl border border-border w-full md:w-auto"
                >
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search projects, technologies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none outline-none py-2 pl-10 pr-4 text-text-main placeholder:text-text-muted/60"
                        />
                    </div>
                </motion.div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : (
                <>
                    {/* Projects Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredProjects.map((project, index) => {
                            const gradient = gradients[index % gradients.length];
                            // Handle cases where studentId might not be populated or profilePicture is missing
                            const authorName = project.studentId?.name || "Anonymous Student";
                            const authorAvatar = project.studentId?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;

                            return (
                                <motion.div
                                    key={project.id}
                                    variants={itemVariants}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className="group relative bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col cursor-pointer"
                                >
                                    {/* Image & Gradient Overlay */}
                                    <div className="relative h-48 w-full overflow-hidden bg-surface shrink-0">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-overlay z-10 opacity-60 group-hover:opacity-40 transition-opacity`}></div>
                                        {project.coverImage ? (
                                            <img
                                                src={getFullImageUrl(project.coverImage)}
                                                alt={project.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-surface border-b border-border/50">
                                                <span className="text-text-muted text-lg font-medium">No Image Provided</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-text-main group-hover:text-primary-400 transition-colors line-clamp-2 pr-4">
                                                {project.title}
                                            </h3>
                                            {project.demoUrl && (
                                                <a
                                                    href={project.demoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 -mt-2 -mr-2 text-text-muted hover:text-primary-500 transition-colors shrink-0"
                                                    title="View Demo"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>

                                        <p className="text-text-muted text-sm line-clamp-3 mb-4 flex-1">
                                            {project.description}
                                        </p>

                                        {/* Technologies */}
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {project.technologiesUsed.map(tech => (
                                                <span key={tech} className="text-xs px-2 py-1 rounded-md bg-border/50 text-text-muted border border-border">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                            {/* Author */}
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={authorAvatar}
                                                    alt={authorName}
                                                    className="w-8 h-8 rounded-full ring-2 ring-background object-cover"
                                                />
                                                <span className="text-sm font-medium text-text-main">{authorName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-24">
                            <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-text-muted/50" />
                            </div>
                            <h3 className="text-xl font-semibold text-text-main mb-2">No projects found</h3>
                            <p className="text-text-muted">Try adjusting your search or filters to find what you're looking for.</p>
                        </div>
                    )}
                </>
            )}
        </div>
        </>
    );
};

export default BrowseProjects;