import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderGit2, Users, PlusCircle, Search, 
  ExternalLink, Edit3, Clock, Globe, 
  Camera, Image as ImageIcon, X, ChevronRight,
  Code, Bell
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const STUDENT_MOCK_NOTIFICATIONS = [
  { id: 'notif-1', message: "Recruiter 'Sarah Williams' liked your project: 'Nexus - Social Platform'.", time: '2 hours ago', type: 'like' },
  { id: 'notif-2', message: "Admin approved your project: 'Aura - Health Tracker' and it is now Public.", time: '5 hours ago', type: 'approval' },
  { id: 'notif-3', message: "Recruiter 'Michael Chen' started following you.", time: '1 day ago', type: 'follow' },
];

// Mock Data
const INITIAL_MY_PROJECTS = [
  {
    id: 1,
    title: 'Nexus - Social Platform',
    description: 'A modern social networking platform built with React and Node.js. Features real-time chat and AI content moderation.',
    technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
    demoLink: 'https://nexus-demo.app',
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    screenshots: [],
    status: 'Public'
  },
  {
    id: 2,
    title: 'Aura - Health Tracker',
    description: 'Personal health tracking application that integrates with wearable devices.',
    technologies: ['React Native', 'Firebase', 'HealthKit'],
    demoLink: 'https://aura-health.app',
    coverImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop',
    screenshots: [],
    status: 'Private / Pending Admin Approval'
  }
];

const INITIAL_PEER_PROJECTS = [
  {
    id: 3,
    title: 'Lumina Dashboard',
    description: 'Analytics dashboard for SaaS companies to track user engagement and retention metrics.',
    technologies: ['Vue.js', 'D3.js', 'PostgreSQL'],
    demoLink: 'https://lumina-dash.io',
    coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    studentName: 'Alex Chen',
    status: 'Public'
  },
  {
    id: 4,
    title: 'Nova E-Commerce',
    description: 'Headless e-commerce storefront with blazing fast performance and SEO optimization.',
    technologies: ['Next.js', 'Tailwind CSS', 'Stripe'],
    demoLink: 'https://nova-store.dev',
    coverImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1000&auto=format&fit=crop',
    studentName: 'Sarah Jenkins',
    status: 'Public'
  }
];

const StudentsDashbourd = () => {
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio', 'showcase'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const [myProjects, setMyProjects] = useState([]);
  const [peerProjects, setPeerProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // File Upload states
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [screenshotFiles, setScreenshotFiles] = useState([null, null, null, null, null]);
  const [screenshotPreviews, setScreenshotPreviews] = useState(['', '', '', '', '']);

  const { token, user } = useAuth();

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const fetchProjects = () => {
    setIsLoading(true);
    axios.get(import.meta.env.VITE_BACKEND_URL + "/api/projects", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((res) => {
      const fetchedProjects = res.data.projects || [];
      const userId = user._id || user.id;

      const myProjs = [];
      const peerProjs = [];

      fetchedProjects.forEach(project => {
        const mappedProject = {
          ...project,
          id: project._id || project.id,
          technologies: project.technologiesUsed || [],
          demoLink: project.demoUrl || '',
          screenshots: project.additionalImages || [],
          status: project.isPublic ? 'Public' : 'Private / Pending Admin Approval',
          studentName: project.studentId?.name || 'Unknown Student'
        };

        const projectStudentId = project.studentId?._id || project.studentId?.id || project.studentId;
        
        if (projectStudentId === userId) {
          myProjs.push(mappedProject);
        } else if (project.isPublic) {
          peerProjs.push(mappedProject);
        }
      });
      
      setMyProjects(myProjs);
      setPeerProjects(peerProjs);
    }).catch((err) => {
      console.error("Error fetching projects", err);
      setMyProjects(INITIAL_MY_PROJECTS);
      setPeerProjects(INITIAL_PEER_PROJECTS);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    demoLink: ''
  });

  const filteredPeerProjects = peerProjects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.technologies.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenForm = (project = null) => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        technologies: project.technologies ? project.technologies.join(', ') : '',
        demoLink: project.demoLink || ''
      });
      setEditingProject(project.id);
      
      setCoverImageFile(null);
      setCoverImagePreview(project.coverImage || '');
      
      const initialPreviews = ['', '', '', '', ''];
      const currentScreenshots = project.screenshots || [];
      currentScreenshots.forEach((src, idx) => {
        if (idx < 5) initialPreviews[idx] = src;
      });
      setScreenshotPreviews(initialPreviews);
      setScreenshotFiles([null, null, null, null, null]);
    } else {
      setFormData({
        title: '',
        description: '',
        technologies: '',
        demoLink: ''
      });
      setEditingProject(null);
      setCoverImageFile(null);
      setCoverImagePreview('');
      setScreenshotFiles([null, null, null, null, null]);
      setScreenshotPreviews(['', '', '', '', '']);
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('technologiesUsed', formData.technologies);
      formDataObj.append('demoUrl', formData.demoLink);

      // Cover image
      if (coverImageFile) {
        formDataObj.append('coverImage', coverImageFile);
      } else if (coverImagePreview) {
        formDataObj.append('coverImage', coverImagePreview);
      }

      // Screenshots
      const keptScreenshots = [];
      screenshotPreviews.forEach((preview, idx) => {
        const file = screenshotFiles[idx];
        if (file) {
          formDataObj.append('additionalImages', file);
        } else if (preview && (preview.startsWith('http') || preview.startsWith('/uploads'))) {
          keptScreenshots.push(preview);
        }
      });
      formDataObj.append('additionalImages', JSON.stringify(keptScreenshots));

      let res;
      if (editingProject) {
        res = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${editingProject}`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/projects`, formDataObj, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      fetchProjects();
      handleCloseForm();
    } catch (err) {
      console.error('Error saving project:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setIsLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert(err.response?.data?.message || err.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background text-zinc-100 pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <header className="mb-10 flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2.5 rounded-xl border border-indigo-500/30">
              <FolderGit2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Student <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Dashboard</span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base mt-1">
                Manage your project portfolio and discover inspiring work from your peers.
              </p>
            </div>
          </header>

          {isFormOpen ? (
            /* PROJECT FORM VIEW */
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto"
            >
              <button 
                onClick={handleCloseForm}
                className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
              >
                <X size={16} /> Cancel & Return
              </button>

              <Card className="p-8 md:p-10">
                <div className="mb-8 border-b border-zinc-800 pb-6">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {editingProject ? 'Edit Project' : 'Create New Project'}
                  </h2>
                  <p className="text-zinc-400">
                    Fill in the details below. <span className="text-amber-400 font-medium">Note: Saving will set this project's status to Private / Pending Admin Approval.</span>
                  </p>
                </div>

                <form onSubmit={handleSaveProject} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Project Title *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                        placeholder="e.g. Nexus Social Network"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description *</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all resize-none"
                        placeholder="Describe your project, its goals, and what you achieved..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
                          <Code size={14} /> Technologies Used *
                        </label>
                        <input 
                          required
                          type="text" 
                          value={formData.technologies}
                          onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                          placeholder="e.g. React, Node.js, Tailwind (comma separated)"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-2">
                          <ExternalLink size={14} /> Demo Link
                        </label>
                        <input 
                          type="url" 
                          value={formData.demoLink}
                          onChange={(e) => setFormData({...formData, demoLink: e.target.value})}
                          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                          placeholder="https://your-demo-url.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                      <Camera size={18} /> Media & Screenshots
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Cover Image *</label>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                          {coverImagePreview ? (
                            <div className="relative w-40 h-24 rounded-xl overflow-hidden border border-zinc-800 shrink-0 bg-zinc-950">
                              <img src={coverImagePreview} alt="Cover Preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  setCoverImageFile(null);
                                  setCoverImagePreview('');
                                }}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 p-1.5 rounded-full text-red-400 border border-white/10 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ) : (
                            <label className="w-40 h-24 border border-dashed border-zinc-700 hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-zinc-900/50 hover:bg-zinc-900/80 transition-all shrink-0">
                              <ImageIcon className="w-6 h-6 text-zinc-500 mb-1" />
                              <span className="text-xs text-zinc-400">Select Cover</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    setCoverImageFile(file);
                                    setCoverImagePreview(URL.createObjectURL(file));
                                  }
                                }}
                              />
                            </label>
                          )}
                          <div className="text-xs text-zinc-500">
                            Recommended: High quality landscape image. Max file size: 5MB.
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-3">Additional Screenshots (Up to 5)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                          {[0, 1, 2, 3, 4].map((index) => {
                            const preview = screenshotPreviews[index];
                            return (
                              <div key={index} className="aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/50 flex items-center justify-center">
                                {preview ? (
                                  <>
                                    <img src={preview} alt={`Screenshot ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newPreviews = [...screenshotPreviews];
                                        newPreviews[index] = '';
                                        setScreenshotPreviews(newPreviews);

                                        const newFiles = [...screenshotFiles];
                                        newFiles[index] = null;
                                        setScreenshotFiles(newFiles);
                                      }}
                                      className="absolute top-1 right-1 bg-black/70 hover:bg-black/90 p-1 rounded-full text-red-400 border border-white/10 transition-colors"
                                    >
                                      <X size={12} />
                                    </button>
                                  </>
                                ) : (
                                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-colors">
                                    <PlusCircle className="w-5 h-5 text-zinc-600 mb-1 hover:text-indigo-400 transition-colors" />
                                    <span className="text-[10px] text-zinc-500 font-medium">Slot {index + 1}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          const newPreviews = [...screenshotPreviews];
                                          newPreviews[index] = URL.createObjectURL(file);
                                          setScreenshotPreviews(newPreviews);

                                          const newFiles = [...screenshotFiles];
                                          newFiles[index] = file;
                                          setScreenshotFiles(newFiles);
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={handleCloseForm}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProject ? 'Save Changes' : 'Create Project'}
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : (
            /* TWO COLUMN DASHBOARD GRID VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Tabs & Content */}
              <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                
                {/* Tabs Navigation (Left Aligned like Recruiter page) */}
                <div className="flex space-x-1 glass rounded-2xl p-1.5 border border-zinc-800/50 w-fit">
                  <button
                    onClick={() => setActiveTab('portfolio')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'portfolio' 
                        ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <FolderGit2 size={16} />
                    My Portfolio
                  </button>
                  <button
                    onClick={() => setActiveTab('showcase')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      activeTab === 'showcase' 
                        ? 'bg-zinc-800 text-white shadow-lg border border-zinc-700/50' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }`}
                  >
                    <Users size={16} />
                    Peer Showcase
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'portfolio' && (
                    <motion.div
                      key="portfolio"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center glass p-4 rounded-2xl border border-zinc-800/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                          My Uploaded Projects
                        </h2>
                        <Button onClick={() => handleOpenForm()}>
                          <PlusCircle size={18} />
                          New Project
                        </Button>
                      </div>

                      {myProjects.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
                          <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mx-auto mb-4 text-zinc-500">
                            <FolderGit2 size={28} />
                          </div>
                          <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                            Start building your portfolio by adding your first project. Showcase your skills to the world.
                          </p>
                          <Button onClick={() => handleOpenForm()}>Create First Project</Button>
                        </div>
                      ) : (
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          {myProjects.map((project, index) => (
                            <ProjectCard
                              key={project.id || project._id}
                              project={project}
                              index={index}
                              isOwner={true}
                              showStatusBadge={true}
                              onEdit={handleOpenForm}
                              onDelete={handleDeleteProject}
                              hoverBorderClass="hover:border-indigo-500/30"
                              hoverTextClass="group-hover:text-indigo-400"
                              variants={itemVariants}
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'showcase' && (
                    <motion.div
                      key="showcase"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass p-4 rounded-2xl border border-zinc-800/50">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                          Discover Peer Projects
                        </h2>
                        
                        <div className="relative w-full sm:w-72">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-zinc-500" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search projects or skills..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm text-zinc-100"
                          />
                        </div>
                      </div>

                      {filteredPeerProjects.length === 0 ? (
                        <div className="text-center py-20">
                          <p className="text-zinc-500">No public projects found matching your search.</p>
                        </div>
                      ) : (
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                          {filteredPeerProjects.map((project, index) => (
                            <ProjectCard
                              key={project.id || project._id}
                              project={project}
                              index={index}
                              isOwner={false}
                              showAuthorBadge={true}
                              hoverBorderClass="hover:border-purple-500/30"
                              hoverTextClass="group-hover:text-purple-400"
                              variants={itemVariants}
                            />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Activity Feed / Notifications & Stats */}
              <div className="lg:col-span-4 xl:col-span-3">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass rounded-3xl border border-zinc-800/50 p-6 sticky top-28 shadow-2xl space-y-6"
                >
                  {/* Activity Feed Header */}
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                      <div className="relative">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-900"></span>
                      </div>
                      Activity Feed
                    </h3>

                    <div className="space-y-4">
                      {STUDENT_MOCK_NOTIFICATIONS.map((notif, index) => (
                        <motion.div 
                          key={notif.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-6 pb-4 border-l border-zinc-800 last:border-0 last:pb-0 group"
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-zinc-900/50 group-hover:bg-indigo-400 transition-colors"></div>
                          
                          <p className="text-sm text-zinc-300 leading-snug mb-1">
                            {notif.message}
                          </p>
                          <span className="text-xs text-zinc-600 font-medium block">
                            {notif.time}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="pt-6 border-t border-zinc-800/50">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Your Stats</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                        <div className="text-2xl font-bold text-white mb-1">{myProjects.length}</div>
                        <div className="text-xs text-zinc-400 font-medium">Uploaded</div>
                      </div>
                      <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/50">
                        <div className="text-2xl font-bold text-white mb-1">
                          {myProjects.filter(p => p.isPublic || p.status === 'Public').length}
                        </div>
                        <div className="text-xs text-zinc-400 font-medium">Public</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StudentsDashbourd;
