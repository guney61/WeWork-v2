import { useState, useEffect } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text, Button } from "@radix-ui/themes";
import { HeroSection, JobsSection } from "./components/Sections";
import { CreateJobModal } from "./components/CreateJobModal";
import { ApplyModal } from "./components/ApplyModal";
import { JobSeekerProfile } from "./components/JobSeekerProfile";
import { GitHubCallback } from "./components/GitHubCallback";
import type { ScoreBreakdown } from "./utils/githubScoring";

// Mock data for demo
const MOCK_JOBS = [
  {
    id: "1",
    employer: "0x123456789abcdef",
    title: "Senior Smart Contract Developer",
    description: "We are looking for an experienced Move developer to build DeFi protocols on Sui blockchain. Must have experience with AMMs and lending protocols.",
    budget: 5000,
    is_active: true,
    company: "SuiSwap",
    tags: ["Move", "DeFi", "Sui", "Smart Contracts"],
  },
  {
    id: "2",
    employer: "0x456def789abcdef",
    title: "Full-Stack Web3 Developer",
    description: "Build a decentralized marketplace frontend using React and integrate with our Sui smart contracts. Experience with dApp development required.",
    budget: 3500,
    is_active: true,
    company: "NFT Labs",
    tags: ["React", "TypeScript", "Web3", "NFT"],
  },
  {
    id: "3",
    employer: "0x789ghi789abcdef",
    title: "Blockchain Security Auditor",
    description: "Perform security audits on Move smart contracts. Looking for someone with a track record of finding critical vulnerabilities.",
    budget: 8000,
    is_active: true,
    company: "SecureSui",
    tags: ["Security", "Audit", "Move", "Penetration Testing"],
  },
  {
    id: "4",
    employer: "0xabc123789abcdef",
    title: "DevOps Engineer - Blockchain Infrastructure",
    description: "Set up and maintain Sui validator nodes and blockchain infrastructure. Experience with Kubernetes and cloud providers required.",
    budget: 4500,
    is_active: true,
    company: "NodeMasters",
    tags: ["DevOps", "Kubernetes", "AWS", "Validators"],
  },
];

type Job = typeof MOCK_JOBS[0];

// Check if we have a GitHub OAuth code in URL (means we're on callback)
function hasGitHubCode(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && (
    window.location.pathname.includes('callback') ||
    window.location.pathname === '/' ||
    window.location.pathname.includes('auth')
  );
}

function App() {
  const account = useCurrentAccount();
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'profile'>('home');
  // Check for callback immediately on initial render
  const [isCallback] = useState(() => hasGitHubCode());
  const [githubData, setGithubData] = useState<{
    username: string;
    score: ScoreBreakdown;
    avatarUrl: string;
  } | null>(null);

  // Load saved data and check URL params on mount
  useEffect(() => {
    // Check URL params for initial tab
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'profile' || tab === 'jobs' || tab === 'home') {
      setActiveTab(tab);
    }

    // Load saved GitHub data from localStorage
    const saved = localStorage.getItem('wework_github_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGithubData(data);
        console.log('Loaded GitHub data from localStorage:', data);
      } catch (e) {
        console.error('Failed to parse saved GitHub data');
      }
    }
  }, []);

  const handleCreateJob = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowCreateJob(false);
  };

  const handleGitHubSuccess = (data: {
    username: string;
    score: ScoreBreakdown;
    avatarUrl: string;
    accessToken: string;
  }) => {
    // Save to state and localStorage
    const saveData = {
      username: data.username,
      score: data.score,
      avatarUrl: data.avatarUrl,
    };
    setGithubData(saveData);
    localStorage.setItem('wework_github_data', JSON.stringify(saveData));

    // Redirect back to profile page
    window.location.href = '/?tab=profile';
  };

  const handleGitHubError = (error: string) => {
    console.error('GitHub OAuth error:', error);
    // Redirect back with error
    window.location.href = '/?error=' + encodeURIComponent(error);
  };

  // If on callback route, show callback handler
  if (isCallback) {
    return (
      <GitHubCallback
        onSuccess={handleGitHubSuccess}
        onError={handleGitHubError}
      />
    );
  }

  return (
    <>
      {/* Navbar */}
      <Flex
        position="sticky"
        px="6"
        py="3"
        justify="between"
        align="center"
        style={{
          borderBottom: "1px solid var(--gray-a4)",
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(20px)",
          zIndex: 100,
          top: 0,
        }}
      >
        <Flex gap="3" align="center">
          <Box
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "1.25rem",
            }}
          >
            W
          </Box>
          <Heading size="5" style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            WeWork
          </Heading>
        </Flex>

        {/* Navigation Tabs */}
        <Flex gap="6" align="center">
          <Text
            size="2"
            weight={activeTab === 'home' ? 'bold' : 'regular'}
            color={activeTab === 'home' ? undefined : 'gray'}
            onClick={() => setActiveTab('home')}
            style={{ cursor: "pointer" }}
          >
            Home
          </Text>
          <Text
            size="2"
            weight={activeTab === 'jobs' ? 'bold' : 'regular'}
            color={activeTab === 'jobs' ? undefined : 'gray'}
            onClick={() => setActiveTab('jobs')}
            style={{ cursor: "pointer" }}
          >
            Jobs
          </Text>
          <Text
            size="2"
            weight={activeTab === 'profile' ? 'bold' : 'regular'}
            color={activeTab === 'profile' ? undefined : 'gray'}
            onClick={() => setActiveTab('profile')}
            style={{ cursor: "pointer" }}
          >
            Profile
          </Text>
        </Flex>

        <Flex gap="3" align="center">
          {account && (
            <Button
              variant="soft"
              onClick={() => setShowCreateJob(true)}
              style={{ cursor: "pointer" }}
            >
              + Post Job
            </Button>
          )}
          <ConnectButton />
        </Flex>
      </Flex>

      {/* Content based on active tab */}
      {activeTab === 'home' && (
        <>
          <HeroSection onPostJob={() => setShowCreateJob(true)} onBrowseJobs={() => setActiveTab('jobs')} />
          <JobsSection jobs={jobs} onApply={(job) => setSelectedJob(job)} />
        </>
      )}

      {activeTab === 'jobs' && (
        <JobsSection jobs={jobs} onApply={(job) => setSelectedJob(job)} />
      )}

      {activeTab === 'profile' && (
        <JobSeekerProfile
          savedGithubData={githubData}
          onBadgeEarned={(tier, score) => {
            console.log(`Badge earned: ${tier} with ${score} points`);
          }}
        />
      )}

      {/* Footer */}
      <Box
        py="6"
        style={{
          borderTop: "1px solid var(--gray-a4)",
          textAlign: "center",
        }}
      >
        <Container size="3">
          <Flex justify="between" align="center">
            <Text size="2" color="gray">© 2024 WeWork. Built on Sui.</Text>
            <Flex gap="4">
              <Text size="2" color="gray" style={{ cursor: "pointer" }}>About</Text>
              <Text size="2" color="gray" style={{ cursor: "pointer" }}>Docs</Text>
              <Text size="2" color="gray" style={{ cursor: "pointer" }}>GitHub</Text>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Modals */}
      <CreateJobModal
        open={showCreateJob}
        onClose={() => setShowCreateJob(false)}
        onSubmit={handleCreateJob}
      />

      <ApplyModal
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
      />
    </>
  );
}

export default App;
