import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Center
} from '@chakra-ui/react';
import {
  Users,
  MessageSquare,
  FileText,
  UserCheck,
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  BarChart,
  Shield,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/authContext';
import { useNavigate } from 'react-router-dom';

interface VerificationRequest {
  id: string;
  user_id: string;
  license_number: string;
  full_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface User {
  id: string;
  full_name: string;
  email: string;
  is_verified: boolean;
  join_date: string;
  last_login: string;
}

export default function AdminDashboard() {
  const { profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    activeChatRooms: 0,
    activeForumPosts: 0,
    pendingVerifications: 0
  });
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !profile?.is_verified) {
      toast({
        title: 'Access denied',
        description: 'You need to be a verified driver to access the admin dashboard.',
        status: 'error',
        duration: 5000,
      });
      navigate('/');
    }
  }, [profile, authLoading, navigate, toast]);

  // Load data
  useEffect(() => {
    if (!profile?.is_verified) return;
    
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Mock data for demo - in a real app these would be actual queries
        const mockStats = {
          totalUsers: 148,
          verifiedUsers: 72,
          activeChatRooms: 4,
          activeForumPosts: 36,
          pendingVerifications: 7
        };
        
        const mockVerifications = [
          {
            id: '1',
            user_id: 'user-1',
            license_number: 'TLC-98765432',
            full_name: 'Michael Johnson',
            status: 'pending',
            created_at: '2025-03-21T14:32:21.000Z',
            profiles: {
              full_name: 'Michael Johnson',
              email: 'michael@example.com'
            }
          },
          {
            id: '2',
            user_id: 'user-2',
            license_number: 'TLC-45678901',
            full_name: 'Jessica Williams',
            status: 'approved',
            created_at: '2025-03-20T10:15:43.000Z',
            profiles: {
              full_name: 'Jessica Williams',
              email: 'jessica@example.com'
            }
          },
          {
            id: '3',
            user_id: 'user-3',
            license_number: 'TLC-12398765',
            full_name: 'David Brown',
            status: 'rejected',
            created_at: '2025-03-18T16:45:12.000Z',
            profiles: {
              full_name: 'David Brown',
              email: 'david@example.com'
            }
          },
          {
            id: '4',
            user_id: 'user-4',
            license_number: 'TLC-56781234',
            full_name: 'Amanda Smith',
            status: 'pending',
            created_at: '2025-03-22T09:12:33.000Z',
            profiles: {
              full_name: 'Amanda Smith',
              email: 'amanda@example.com'
            }
          },
          {
            id: '5',
            user_id: 'user-5',
            license_number: 'TLC-90876543',
            full_name: 'Robert Davis',
            status: 'pending',
            created_at: '2025-03-22T11:42:18.000Z',
            profiles: {
              full_name: 'Robert Davis',
              email: 'robert@example.com'
            }
          },
        ] as VerificationRequest[];
        
        const mockUsers = [
          {
            id: 'user-1',
            full_name: 'Michael Johnson',
            email: 'michael@example.com',
            is_verified: false,
            join_date: '2025-03-15',
            last_login: '2025-03-21'
          },
          {
            id: 'user-2',
            full_name: 'Jessica Williams',
            email: 'jessica@example.com',
            is_verified: true,
            join_date: '2025-03-10',
            last_login: '2025-03-22'
          },
          {
            id: 'user-3',
            full_name: 'David Brown',
            email: 'david@example.com',
            is_verified: false,
            join_date: '2025-03-12',
            last_login: '2025-03-18'
          },
          {
            id: 'user-4',
            full_name: 'Amanda Smith',
            email: 'amanda@example.com',
            is_verified: false,
            join_date: '2025-03-18',
            last_login: '2025-03-22'
          },
          {
            id: 'user-5',
            full_name: 'Robert Davis',
            email: 'robert@example.com',
            is_verified: false,
            join_date: '2025-03-20',
            last_login: '2025-03-22'
          },
          {
            id: 'user-6',
            full_name: 'Sarah Miller',
            email: 'sarah@example.com',
            is_verified: true,
            join_date: '2025-03-05',
            last_login: '2025-03-21'
          },
          {
            id: 'user-7',
            full_name: 'James Wilson',
            email: 'james@example.com',
            is_verified: true,
            join_date: '2025-03-08',
            last_login: '2025-03-20'
          },
        ] as User[];
        
        setStats(mockStats);
        setVerificationRequests(mockVerifications);
        setUsers(mockUsers);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast({
          title: 'Error loading data',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [profile, toast]);

  const handleApproveVerification = (id: string) => {
    setVerificationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      verifiedUsers: prev.verifiedUsers + 1,
      pendingVerifications: prev.pendingVerifications - 1
    }));
    
    toast({
      title: 'Verification approved',
      status: 'success',
      duration: 3000,
    });
  };

  const handleRejectVerification = (id: string) => {
    setVerificationRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      pendingVerifications: prev.pendingVerifications - 1
    }));
    
    toast({
      title: 'Verification rejected',
      status: 'error',
      duration: 3000,
    });
  };

  const filteredVerifications = verificationRequests.filter(req => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const filteredUsers = users.filter(user => {
    const searchTerms = searchQuery.toLowerCase();
    return (
      user.full_name.toLowerCase().includes(searchTerms) ||
      user.email.toLowerCase().includes(searchTerms)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading || !profile?.is_verified) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>
      
      <Tabs colorScheme="teal" variant="enclosed" isLazy>
        <TabList>
          <Tab><BarChart size={18} style={{ marginRight: '8px' }} /> Overview</Tab>
          <Tab><UserCheck size={18} style={{ marginRight: '8px' }} /> Verifications</Tab>
          <Tab><Users size={18} style={{ marginRight: '8px' }} /> Users</Tab>
          <Tab><Bell size={18} style={{ marginRight: '8px' }} /> Notifications</Tab>
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
              <GridItem>
                <Card bg="white">
                  <CardBody>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Users size={16} style={{ marginRight: '8px' }} />
                        Total Users
                      </StatLabel>
                      <StatNumber>{stats.totalUsers}</StatNumber>
                      <StatHelpText>
                        {stats.verifiedUsers} verified ({Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%)
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card bg="white">
                  <CardBody>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <MessageSquare size={16} style={{ marginRight: '8px' }} />
                        Active Chat Rooms
                      </StatLabel>
                      <StatNumber>{stats.activeChatRooms}</StatNumber>
                      <StatHelpText>
                        Last 30 days
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card bg="white">
                  <CardBody>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <FileText size={16} style={{ marginRight: '8px' }} />
                        Forum Posts
                      </StatLabel>
                      <StatNumber>{stats.activeForumPosts}</StatNumber>
                      <StatHelpText>
                        Last 30 days
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card bg="white">
                  <CardBody>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Shield size={16} style={{ marginRight: '8px' }} />
                        Pending Verifications
                      </StatLabel>
                      <StatNumber>{stats.pendingVerifications}</StatNumber>
                      <StatHelpText>
                        <Button size="xs" colorScheme="teal" mt={1}>
                          Review All
                        </Button>
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
            
            <Card bg="white" mb={6}>
              <CardBody>
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Action</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Jessica Williams</Td>
                      <Td>Verified driver account</Td>
                      <Td>{formatDate(new Date().toISOString())}</Td>
                    </Tr>
                    <Tr>
                      <Td>Michael Johnson</Td>
                      <Td>Requested verification</Td>
                      <Td>{formatDate(new Date().toISOString())}</Td>
                    </Tr>
                    <Tr>
                      <Td>Sarah Miller</Td>
                      <Td>Created forum post</Td>
                      <Td>{formatDate(new Date().toISOString())}</Td>
                    </Tr>
                    <Tr>
                      <Td>Robert Davis</Td>
                      <Td>Joined chat room</Td>
                      <Td>{formatDate(new Date().toISOString())}</Td>
                    </Tr>
                    <Tr>
                      <Td>Amanda Smith</Td>
                      <Td>Requested verification</Td>
                      <Td>{formatDate(new Date().toISOString())}</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Verifications Tab */}
          <TabPanel>
            <HStack mb={6} spacing={4}>
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                width="200px"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
              
              <Button 
                leftIcon={<Download size={18} />}
                variant="outline"
              >
                Export
              </Button>
            </HStack>
            
            <Card bg="white">
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>License</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredVerifications.length > 0 ? (
                      filteredVerifications.map((req) => (
                        <Tr key={req.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{req.profiles.full_name}</Text>
                              <Text fontSize="xs" color="gray.500">{req.profiles.email}</Text>
                            </VStack>
                          </Td>
                          <Td>{req.license_number}</Td>
                          <Td>{formatDate(req.created_at)}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                req.status === 'approved' ? 'green' : 
                                req.status === 'rejected' ? 'red' : 'yellow'
                              }
                            >
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </Badge>
                          </Td>
                          <Td>
                            {req.status === 'pending' ? (
                              <HStack spacing={2}>
                                <IconButton
                                  aria-label="Approve"
                                  icon={<CheckCircle size={18} />}
                                  colorScheme="green"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleApproveVerification(req.id)}
                                />
                                <IconButton
                                  aria-label="Reject"
                                  icon={<XCircle size={18} />}
                                  colorScheme="red"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRejectVerification(req.id)}
                                />
                              </HStack>
                            ) : (
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Options"
                                  icon={<MoreVertical size={18} />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem>View Details</MenuItem>
                                  <MenuItem>Contact User</MenuItem>
                                  {req.status === 'approved' && (
                                    <MenuItem color="red.500">Revoke Verification</MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
                            )}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={4}>
                          No verification requests found
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Users Tab */}
          <TabPanel>
            <HStack mb={6} spacing={4} wrap="wrap">
              <InputGroup width={{ base: "100%", md: "300px" }}>
                <InputLeftElement pointerEvents="none">
                  <Search size={18} color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Menu>
                <MenuButton as={Button} rightIcon={<ChevronDown size={16} />}>
                  Filters
                </MenuButton>
                <MenuList>
                  <MenuItem>All Users</MenuItem>
                  <MenuItem>Verified Only</MenuItem>
                  <MenuItem>Unverified Only</MenuItem>
                  <MenuItem>Recent Joins</MenuItem>
                </MenuList>
              </Menu>
              
              <Button 
                leftIcon={<Plus size={18} />}
                colorScheme="teal"
                ml={{ base: 0, md: "auto" }}
              >
                Add User
              </Button>
            </HStack>
            
            <Card bg="white">
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Joined</Th>
                      <Th>Last Login</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{user.full_name}</Text>
                              <Text fontSize="xs" color="gray.500">{user.email}</Text>
                            </VStack>
                          </Td>
                          <Td>{user.join_date}</Td>
                          <Td>{user.last_login}</Td>
                          <Td>
                            <Badge
                              colorScheme={user.is_verified ? 'green' : 'gray'}
                            >
                              {user.is_verified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<MoreVertical size={18} />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem>View Profile</MenuItem>
                                <MenuItem>Edit User</MenuItem>
                                <MenuItem>Reset Password</MenuItem>
                                <MenuItem color="red.500">Disable Account</MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={5} textAlign="center" py={4}>
                          No users found
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel>
            <Card bg="white" mb={6}>
              <CardBody>
                <Heading size="md" mb={4}>Send Notification</Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <Input placeholder="Notification title" />
                  </FormControl>
                  <FormControl>
                    <Input placeholder="Notification message" />
                  </FormControl>
                  <HStack>
                    <Select placeholder="Select target group">
                      <option value="all">All Users</option>
                      <option value="verified">Verified Drivers</option>
                      <option value="unverified">Unverified Users</option>
                    </Select>
                    <Button colorScheme="teal">Send</Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
            
            <Card bg="white">
              <CardBody>
                <Heading size="md" mb={4}>Recent Notifications</Heading>
                <VStack spacing={4} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>System Maintenance</AlertTitle>
                      <AlertDescription>
                        Scheduled maintenance on March 25th, 2025
                      </AlertDescription>
                    </Box>
                    <Text fontSize="sm" color="gray.500">All Users • 2 days ago</Text>
                  </Alert>
                  
                  <Alert status="success" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>New Feature Released</AlertTitle>
                      <AlertDescription>
                        Chat attachments are now available for all users
                      </AlertDescription>
                    </Box>
                    <Text fontSize="sm" color="gray.500">All Users • 5 days ago</Text>
                  </Alert>
                  
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>TLC License Update</AlertTitle>
                      <AlertDescription>
                        Important changes to license renewal process
                      </AlertDescription>
                    </Box>
                    <Text fontSize="sm" color="gray.500">Verified Drivers • 1 week ago</Text>
                  </Alert>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}