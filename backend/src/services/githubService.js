import { Octokit } from 'octokit';

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
  }

  // Get user info
  async getUser() {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // List repositories
  async listRepos(options = {}) {
    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 30,
        ...options
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Create repository
  async createRepo(name, description = '', isPrivate = false) {
    try {
      const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: true
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Get repository
  async getRepo(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Create or update file
  async createOrUpdateFile(owner, repo, path, content, message, branch = 'main') {
    try {
      // Check if file exists
      let sha;
      try {
        const { data: existingFile } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        sha = existingFile.sha;
      } catch (error) {
        // File doesn't exist, which is fine
      }

      const { data } = await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        ...(sha && { sha })
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Get file content
  async getFileContent(owner, repo, path, ref = 'main') {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });
      
      if (data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return { ...data, decodedContent: content };
      }
      
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // List branches
  async listBranches(owner, repo) {
    try {
      const { data } = await this.octokit.rest.repos.listBranches({
        owner,
        repo
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Create branch
  async createBranch(owner, repo, branch, from = 'main') {
    try {
      // Get the SHA of the branch to branch from
      const { data: refData } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${from}`
      });

      // Create new branch
      const { data } = await this.octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branch}`,
        sha: refData.object.sha
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }

  // Create pull request
  async createPullRequest(owner, repo, title, head, base = 'main', body = '') {
    try {
      const { data } = await this.octokit.rest.pulls.create({
        owner,
        repo,
        title,
        head,
        base,
        body
      });
      return data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw error;
    }
  }
}

export default new GitHubService();