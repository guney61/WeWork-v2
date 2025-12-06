import { useState } from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Text, Button } from "@radix-ui/themes";
import { HeroSection, JobsSection } from "./components/Sections";
import { CreateJobModal } from "./components/CreateJobModal";
import { ApplyModal } from "./components/ApplyModal";

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

function App() {
  const account = useCurrentAccount();
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState(MOCK_JOBS);

  const handleCreateJob = (newJob: Job) => {
    setJobs([newJob, ...jobs]);
    setShowCreateJob(false);
  };

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

        <Flex gap="6" align="center" style={{ display: "none" }} className="nav-links">
          <Text size="2" color="gray" style={{ cursor: "pointer" }}>Jobs</Text>
          <Text size="2" color="gray" style={{ cursor: "pointer" }}>Developers</Text>
          <Text size="2" color="gray" style={{ cursor: "pointer" }}>Badges</Text>
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

      {/* Hero Section */}
      <HeroSection onPostJob={() => setShowCreateJob(true)} />

      {/* Jobs Section */}
      <JobsSection jobs={jobs} onApply={(job) => setSelectedJob(job)} />

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
