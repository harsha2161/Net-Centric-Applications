const projectService = require('../services/projectService');

const createProject = async (req, res) => {
  try {
    const project = await projectService.createProject(
      req.user.id || req.user._id,
      req.body,
      req.files,
      req.user
    );
    return res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getProjects(req.user, req.query);
    return res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id, req.user);
    return res.status(200).json({ project });
  } catch (error) {
    const statusCode = error.message.includes('Access denied') ? 403 : 404;
    return res.status(statusCode).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body, req.files, req.user);
    return res.status(200).json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    const statusCode = error.message.includes('Forbidden') ? 403 : 400;
    return res.status(statusCode).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const result = await projectService.deleteProject(req.params.id, req.user);
    return res.status(200).json({
      message: 'Project deleted successfully',
      ...result
    });
  } catch (error) {
    const statusCode = error.message.includes('Forbidden') ? 403 : 400;
    return res.status(statusCode).json({ message: error.message });
  }
};

const updateVisibility = async (req, res) => {
  try {
    const { isPublic } = req.body;
    const project = await projectService.updateVisibility(req.params.id, isPublic, req.user);
    return res.status(200).json({
      message: `Project visibility updated to public: ${project.isPublic}`,
      project
    });
  } catch (error) {
    const statusCode = error.message.includes('Forbidden') ? 403 : 400;
    return res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateVisibility
};
