import { Router } from 'express';
import githubService from '../services/githubService.js';

const router = Router();

// Get authenticated user
router.get('/user', async (req, res, next) => {
  try {
    const user = await githubService.getUser();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// List repositories
router.get('/repos', async (req, res, next) => {
  try {
    const { sort, per_page, page } = req.query;
    const repos = await githubService.listRepos({ sort, per_page, page });
    res.json(repos);
  } catch (error) {
    next(error);
  }
});

// Create repository
router.post('/repos', async (req, res, next) => {
  try {
    const { name, description, private: isPrivate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' });
    }
    
    const repo = await githubService.createRepo(name, description, isPrivate);
    res.status(201).json(repo);
  } catch (error) {
    next(error);
  }
});

// Get repository
router.get('/repos/:owner/:repo', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const repository = await githubService.getRepo(owner, repo);
    res.json(repository);
  } catch (error) {
    next(error);
  }
});

// Create or update file
router.put('/repos/:owner/:repo/contents/:path(*)', async (req, res, next) => {
  try {
    const { owner, repo, path } = req.params;
    const { content, message, branch } = req.body;
    
    if (!content || !message) {
      return res.status(400).json({ error: 'Content and message are required' });
    }
    
    const result = await githubService.createOrUpdateFile(owner, repo, path, content, message, branch);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get file content
router.get('/repos/:owner/:repo/contents/:path(*)', async (req, res, next) => {
  try {
    const { owner, repo, path } = req.params;
    const { ref } = req.query;
    const content = await githubService.getFileContent(owner, repo, path, ref);
    res.json(content);
  } catch (error) {
    next(error);
  }
});

// List branches
router.get('/repos/:owner/:repo/branches', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branches = await githubService.listBranches(owner, repo);
    res.json(branches);
  } catch (error) {
    next(error);
  }
});

// Create branch
router.post('/repos/:owner/:repo/branches', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { branch, from } = req.body;
    
    if (!branch) {
      return res.status(400).json({ error: 'Branch name is required' });
    }
    
    const result = await githubService.createBranch(owner, repo, branch, from);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Create pull request
router.post('/repos/:owner/:repo/pulls', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { title, head, base, body } = req.body;
    
    if (!title || !head) {
      return res.status(400).json({ error: 'Title and head branch are required' });
    }
    
    const pullRequest = await githubService.createPullRequest(owner, repo, title, head, base, body);
    res.status(201).json(pullRequest);
  } catch (error) {
    next(error);
  }
});

export default router;