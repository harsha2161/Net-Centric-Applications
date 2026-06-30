const Project = require('../models/Project');
const eventEmitter = require('../events/emitters');
const { uploadToCloudinary } = require('../utils/cloudinary');

class ProjectService {
  async createProject(studentId, projectData, files, user) {
    let coverImage = '';
    let additionalImages = [];

    if (files) {
      if (files.coverImage && files.coverImage.length > 0) {
        coverImage = await uploadToCloudinary(files.coverImage[0].path, 'projects/covers');
      }
      if (files.additionalImages && files.additionalImages.length > 0) {
        const uploadPromises = files.additionalImages.map(file => 
          uploadToCloudinary(file.path, 'projects/additional')
        );
        additionalImages = await Promise.all(uploadPromises);
      }
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
    const { search, technologies } = queryParams;
    const query = {};

    if (user.role === 'Student') {
      query.$or = [{ isPublic: true }, { studentId: user._id || user.id }];
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

    return await Project.find(query).populate('studentId', 'name email profilePicture').sort({ createdAt: -1 });
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

  async updateProject(projectId, updateData, files, user) {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const isOwner = project.studentId.toString() === (user._id || user.id).toString();
    const isAdmin = user.role === 'Admin';
    if (!isOwner && !isAdmin) throw new Error('Forbidden: Only the project owner or an admin can edit this project');

    let coverImage = project.coverImage;
    if (files && files.coverImage && files.coverImage.length > 0) {
      coverImage = await uploadToCloudinary(files.coverImage[0].path, 'projects/covers');
    }

    let additionalImages = [];
    if (updateData.additionalImages) {
      try {
        additionalImages = typeof updateData.additionalImages === 'string'
          ? JSON.parse(updateData.additionalImages)
          : updateData.additionalImages;
      } catch (e) {
        additionalImages = Array.isArray(updateData.additionalImages) 
          ? updateData.additionalImages 
          : [updateData.additionalImages];
      }
    } else {
      additionalImages = project.additionalImages || [];
    }

    if (files && files.additionalImages && files.additionalImages.length > 0) {
      const uploadPromises = files.additionalImages.map(file => 
        uploadToCloudinary(file.path, 'projects/additional')
      );
      const newUploadedImages = await Promise.all(uploadPromises);
      additionalImages = [...additionalImages, ...newUploadedImages];
    }

    let technologiesUsed = updateData.technologiesUsed;
    if (typeof technologiesUsed === 'string') {
      technologiesUsed = technologiesUsed.split(',').map(t => t.trim());
    }

    project.title = updateData.title !== undefined ? updateData.title : project.title;
    project.description = updateData.description !== undefined ? updateData.description : project.description;
    project.technologiesUsed = technologiesUsed !== undefined ? technologiesUsed : project.technologiesUsed;
    project.coverImage = coverImage;
    project.additionalImages = additionalImages;
    project.demoUrl = updateData.demoUrl !== undefined ? updateData.demoUrl : project.demoUrl;
    project.gitRepoUrl = updateData.gitRepoUrl !== undefined ? updateData.gitRepoUrl : project.gitRepoUrl;
    project.isPublic = updateData.isPublic !== undefined ? (updateData.isPublic === 'true' || updateData.isPublic === true) : project.isPublic;

    await project.save();
    return project;
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
