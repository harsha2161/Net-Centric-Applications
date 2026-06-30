const Project = require('../models/Project');
const eventEmitter = require('../events/emitters');

class ProjectService {
  async createProject(studentId, projectData, files, user) {
    let coverImage = '';
    let additionalImages = [];

    if (files) {
      if (files.coverImage && files.coverImage.length > 0) coverImage = `/uploads/${files.coverImage[0].filename}`;
      if (files.additionalImages && files.additionalImages.length > 0) additionalImages = files.additionalImages.map(file => `/uploads/${file.filename}`);
    }

    let technologiesUsed = projectData.technologiesUsed;
    if (typeof technologiesUsed === 'string') technologiesUsed = technologiesUsed.split(',').map(tech => tech.trim());

    const project = await Project.create({
      studentId,
      title: projectData.title,
      description: projectData.description,
      technologiesUsed: technologiesUsed || [],
      coverImage: coverImage || projectData.coverImage || '',
      additionalImages: additionalImages.length > 0 ? additionalImages : (projectData.additionalImages || []),
      demoUrl: projectData.demoUrl || '',
      gitRepoUrl: projectData.gitRepoUrl || '',
      isPublic: projectData.isPublic === 'true' || projectData.isPublic === true
    });

    await project.populate('studentId', 'name email role');
    eventEmitter.emit('ProjectCreated', { project, user });
    return project;
  }

  async getProjects(user, queryParams) {
    const { search, technologies, page, limit, followedOnly, studentId } = queryParams;
    const query = {};

    if (studentId) {
      query.studentId = studentId;
    }

    // Role-based visibility boundaries
    if (user.role === 'Student') {
      query.$or = [{ isPublic: true }, { studentId: user._id || user.id }];
    } else if (user.role === 'Recruiter') {
      query.isPublic = true;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
      });
    }

    if (technologies) {
      const techArray = Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim());
      query.technologiesUsed = { $in: techArray.map(t => new RegExp(t, 'i')) };
    }

    // Followed only filter (for Recruiters)
    if (followedOnly === 'true' && user.role === 'Recruiter') {
      const Follower = require('../models/Follower');
      const recruiterId = user._id || user.id;
      const follows = await Follower.find({ recruiterId });
      const studentIds = follows.map(f => f.studentId);
      query.studentId = { $in: studentIds };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('studentId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute userLiked and likesCount
    const Like = require('../models/Like');
    const userId = user._id || user.id;
    const projectIds = projects.map(p => p._id);
    
    const userLikes = await Like.find({ userId, projectId: { $in: projectIds } });
    const likedIdsSet = new Set(userLikes.map(l => l.projectId.toString()));

    const allLikes = await Like.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]);
    const likesMap = {};
    allLikes.forEach(item => {
      likesMap[item._id.toString()] = item.count;
    });

    const projectsWithLikes = projects.map(p => {
      const pObj = p.toJSON();
      pObj.userLiked = likedIdsSet.has(p._id.toString());
      pObj.likesCount = likesMap[p._id.toString()] || 0;
      return pObj;
    });

    return { projects: projectsWithLikes, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
  }

  async getProjectById(projectId, user) {
    const project = await Project.findById(projectId).populate('studentId', 'name email profilePicture');
    if (!project) throw new Error('Project not found');

    if (user.role === 'Student') {
      const isOwner = project.studentId._id.toString() === (user._id || user.id).toString();
      if (!project.isPublic && !isOwner) throw new Error('Access denied: Private project');
    }
    return project;
  }

  async updateProject(projectId, updateData, user) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isOwner = project.studentId.toString() === (user._id || user.id).toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) throw new Error('Forbidden: Only the project owner or an admin can edit this project');

    if (updateData.technologiesUsed && typeof updateData.technologiesUsed === 'string') {
      updateData.technologiesUsed = updateData.technologiesUsed.split(',').map(t => t.trim());
    }

    Object.assign(project, updateData);
    await project.save();
    return project;
  }

  async getLikedProjects(user, queryParams) {
    const { page, limit } = queryParams;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const Like = require('../models/Like');
    const userId = user._id || user.id;
    const likes = await Like.find({ userId });
    const projectIds = likes.map(like => like.projectId);

    const query = { _id: { $in: projectIds } };
    
    // Only return public projects for Recruiter
    if (user.role === 'Recruiter') {
      query.isPublic = true;
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('studentId', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute userLiked (always true for this list) and likesCount
    const projectIdsInList = projects.map(p => p._id);
    const allLikes = await Like.aggregate([
      { $match: { projectId: { $in: projectIdsInList } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]);
    const likesMap = {};
    allLikes.forEach(item => {
      likesMap[item._id.toString()] = item.count;
    });

    const projectsWithLikes = projects.map(p => {
      const pObj = p.toJSON();
      pObj.userLiked = true;
      pObj.likesCount = likesMap[p._id.toString()] || 0;
      return pObj;
    });

    return { projects: projectsWithLikes, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) };
  }

  async deleteProject(projectId, user) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isOwner = project.studentId.toString() === (user._id || user.id).toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) throw new Error('Forbidden: Only the project owner or an admin can delete this project');

    await project.deleteOne();
    return { id: projectId };
  }

  async updateVisibility(projectId, isPublic, user) {
    if (user.role !== 'Recruiter' && user.role !== 'Admin') throw new Error('Forbidden: Only recruiters or admins can update public visibility status');
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    project.isPublic = isPublic !== undefined ? isPublic : true;
    await project.save();
    return project;
  }
}

module.exports = new ProjectService();
