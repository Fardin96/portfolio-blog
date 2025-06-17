import { jest } from '@jest/globals';
// We will import this dynamically
// import { getRepositoryData } from '../utils/githubServices';

// Mock the entire @octokit/rest module before any imports
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn(),
}));

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

// Mock environment variables
const originalEnv = process.env;

describe('GitHub Services - Unit Tests', () => {
  let mockOctokit: any;
  let mockGetContent: jest.Mock;
  let MockedOctokit: jest.MockedClass<any>;
  let getRepositoryData: (path?: string) => Promise<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockClear();
    consoleLogSpy.mockClear();

    // Reset environment variables
    process.env = { ...originalEnv };
    process.env.GITHUB_OWNER = 'test-owner';
    process.env.GITHUB_REPO = 'test-repo';
    process.env.GITHUB_BRANCH = 'test-branch';
    process.env.REPOSITORY_ACCESS_TOKEN = 'test-token';

    // Mock Octokit instance
    mockGetContent = jest.fn();
    mockOctokit = {
      repos: {
        getContent: mockGetContent,
      },
    };

    // Get the mocked Octokit constructor and the function to test
    MockedOctokit = require('@octokit/rest').Octokit as jest.MockedClass<any>;
    MockedOctokit.mockImplementation(() => mockOctokit);
    getRepositoryData = require('../utils/githubServices').getRepositoryData;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getRepositoryData', () => {
    it('should successfully get repository data with default path', async () => {
      const mockData = {
        name: 'README.md',
        content: 'SGVsbG8gV29ybGQ=', // base64 encoded "Hello World"
        encoding: 'base64',
        type: 'file',
      };

      mockGetContent.mockResolvedValue({ data: mockData } as never);

      const result = await getRepositoryData();

      expect(MockedOctokit).toHaveBeenCalledWith({
        auth: 'test-token',
      });
      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        path: '',
        ref: 'test-branch',
        headers: {
          accept: 'application/vnd.github.html+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should successfully get repository data with custom path', async () => {
      const mockData = {
        name: 'docs',
        type: 'dir',
      };
      const customPath = 'docs/api';

      mockGetContent.mockResolvedValue({ data: mockData } as never);

      const result = await getRepositoryData(customPath);

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
        path: customPath,
        ref: 'test-branch',
        headers: {
          accept: 'application/vnd.github.html+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should use default environment values when not provided', async () => {
      delete process.env.GITHUB_OWNER;
      delete process.env.GITHUB_REPO;
      delete process.env.GITHUB_BRANCH;

      jest.resetModules();
      const { Octokit } = require('@octokit/rest');
      Octokit.mockImplementation(() => mockOctokit);
      const {
        getRepositoryData: localGetRepositoryData,
      } = require('../utils/githubServices');

      const mockData = { name: 'test.md' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      await localGetRepositoryData();

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'yourusername',
        repo: 'your-docs-repo',
        path: '',
        ref: 'main',
        headers: {
          accept: 'application/vnd.github.html+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
    });

    it('should handle Octokit initialization errors', async () => {
      MockedOctokit.mockImplementation(() => {
        throw new Error('Authentication failed');
      });

      await expect(getRepositoryData()).rejects.toThrow(
        'Authentication failed'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '+----------------------initOctokit-------------------+'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ initOctokit: ',
        expect.any(Error)
      );
    });

    it('should handle repository API errors', async () => {
      mockGetContent.mockRejectedValue(
        new Error('Repository not found') as never
      );

      await expect(getRepositoryData()).rejects.toThrow('Repository not found');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ getRepositoryData: ',
        expect.any(Error)
      );
    });

    it('should handle network errors', async () => {
      mockGetContent.mockRejectedValue(new Error('Network timeout') as never);

      await expect(getRepositoryData('docs')).rejects.toThrow(
        'Network timeout'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ getRepositoryData: ',
        expect.any(Error)
      );
    });

    it('should handle 404 errors for non-existent paths', async () => {
      const notFoundError = new Error('Not Found');
      (notFoundError as any).status = 404;
      mockGetContent.mockRejectedValue(notFoundError as never);

      await expect(getRepositoryData('non-existent-path')).rejects.toThrow(
        'Not Found'
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error @ getRepositoryData: ',
        expect.any(Error)
      );
    });

    it('should handle missing access token', async () => {
      delete process.env.REPOSITORY_ACCESS_TOKEN;
      const {
        getRepositoryData: localGetRepositoryData,
      } = require('../utils/githubServices');

      const mockData = { name: 'public-file.md' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      const result = await localGetRepositoryData();

      expect(MockedOctokit).toHaveBeenCalledWith({
        auth: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('should handle empty path parameter', async () => {
      const mockData = { name: 'root-content' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      const result = await getRepositoryData('');

      expect(mockGetContent).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should handle array response for directory listings', async () => {
      const mockDirectoryData = [
        { name: 'file1.md', type: 'file' },
        { name: 'file2.md', type: 'file' },
        { name: 'subdirectory', type: 'dir' },
      ];
      mockGetContent.mockResolvedValue({ data: mockDirectoryData } as never);

      const result = await getRepositoryData('docs');

      expect(result).toEqual(mockDirectoryData);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should pass correct headers for HTML format', async () => {
      const mockData = { content: '<h1>Title</h1>' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      await getRepositoryData();

      expect(mockGetContent).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: {
            accept: 'application/vnd.github.html+json',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        })
      );
    });
  });

  describe('Environment Variable Combinations', () => {
    it('should handle partial environment variable setup', async () => {
      process.env.GITHUB_OWNER = 'custom-owner';
      delete process.env.GITHUB_REPO;
      process.env.GITHUB_BRANCH = 'develop';

      jest.resetModules();
      const { Octokit } = require('@octokit/rest');
      Octokit.mockImplementation(() => mockOctokit);
      const {
        getRepositoryData: localGetRepositoryData,
      } = require('../utils/githubServices');

      const mockData = { name: 'test.md' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      await localGetRepositoryData();

      expect(mockGetContent).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'custom-owner',
          repo: 'your-docs-repo', // default value
          ref: 'develop',
        })
      );
    });

    it('should handle empty string environment variables', async () => {
      process.env.GITHUB_OWNER = '';
      process.env.GITHUB_REPO = '';
      process.env.GITHUB_BRANCH = '';

      jest.resetModules();
      const { Octokit } = require('@octokit/rest');
      Octokit.mockImplementation(() => mockOctokit);
      const {
        getRepositoryData: localGetRepositoryData,
      } = require('../utils/githubServices');

      const mockData = { name: 'test.md' };
      mockGetContent.mockResolvedValue({ data: mockData } as never);

      await localGetRepositoryData();

      expect(mockGetContent).toHaveBeenCalledWith(
        expect.objectContaining({
          owner: 'yourusername',
          repo: 'your-docs-repo',
          ref: 'main',
        })
      );
    });
  });
});
