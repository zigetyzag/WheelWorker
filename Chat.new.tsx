import { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Heading,
  useToast,
  Avatar,
  Flex,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Badge,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Textarea,
  Select,
  Tooltip,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Divider,
  Image,
  Stack,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
} from '@chakra-ui/react';
import { 
  Send, 
  Lock, 
  AlertTriangle, 
  FileUp, 
  HelpCircle,
  UserCheck, 
  Users, 
  ChevronRight, 
  Info,
  File,
  PhoneCall,
  BookOpen,
  Shield,
  Calendar,
  MapPin,
  Star,
  Mail,
  Settings,
  Paperclip,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/authContext';
import { uploadMultipleFiles, isImageFile, isDocumentFile, formatFileSize } from '../lib/fileUploadService';
import AuthModal from '../components/AuthModal';

interface AnonymousUser {
  name: string;
  email: string;
  isVerified?: boolean;
  profile?: UserProfile;
}

interface UserProfile {
  jobTitle?: string;
  experience?: string;
  location?: string;
  phone?: string;
  licenseNumber?: string;
  joinDate?: string;
  rating?: number;
}

interface ChatMessage {
  id: string;
  room_id: string;
  content: string;
  sender_name: string;
  sender_email: string;
  created_at: string;
  is_urgent?: boolean;
  sender_verified?: boolean;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface ChatRoom {
  id: string;
  name: string;
  is_restricted: boolean;
  description?: string;
}

interface HelpResource {
  id: string;
  title: string;
  description: string;
  url?: string;
  category: string;
}

export default function Chat() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [anonymousUser, setAnonymousUser] = useState<AnonymousUser | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [helpResources, setHelpResources] = useState<HelpResource[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedHelpCategory, setSelectedHelpCategory] = useState<string>('all');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (!anonymousUser) {
      onOpen();
    } else {
      loadRooms();
      loadHelpResources();
      subscribeToRooms();
      if (currentRoom) {
        loadMessages(currentRoom);
        subscribeToMessages(currentRoom);
      }
    }
  }, [currentRoom, anonymousUser]);

  // Use the auth context
  const { user, profile } = useAuth();

  // Handle anonymous login (for demo without requiring auth)
  const handleAnonymousLogin = (name: string, email: string, isVerified: boolean = false) => {
    const defaultProfile = {
      jobTitle: 'TLC Driver',
      experience: '0-1 years',
      location: 'New York, NY',
      phone: '',
      licenseNumber: '',
      joinDate: new Date().toISOString().split('T')[0],
      rating: 5.0
    };

    setAnonymousUser({ 
      name, 
      email, 
      isVerified,
      profile: defaultProfile
    });
    onClose();
  };

  // Set user data from auth context if available
  useEffect(() => {
    if (user && profile) {
      setAnonymousUser({
        name: profile.full_name,
        email: user.email || '',
        isVerified: profile.is_verified,
        profile: {
          jobTitle: profile.job_title || 'TLC Driver',
          experience: profile.experience || '0-1 years',
          location: profile.location || 'New York, NY',
          phone: profile.phone || '',
          licenseNumber: profile.license_number || '',
          joinDate: profile.join_date,
          rating: profile.rating || 5.0
        }
      });
    }
  }, [user, profile]);

  const loadRooms = async () => {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error loading chat rooms',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setRooms(data);
    if (data.length > 0 && !currentRoom) {
      setCurrentRoom(data[0].id);
    }
  };

  const loadMessages = async (roomId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error loading messages',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setMessages(data);
    scrollToBottom();
  };

  const loadHelpResources = async () => {
    // In a real app, you'd fetch these from the database
    const mockResources: HelpResource[] = [
      {
        id: '1',
        title: 'TLC License Renewal Guide',
        description: 'Step-by-step guide for renewing your TLC license',
        url: 'https://example.com/tlc-renewal',
        category: 'licenses'
      },
      {
        id: '2',
        title: 'Emergency Contact Numbers',
        description: 'Important contact numbers for emergencies',
        url: 'https://example.com/emergency',
        category: 'emergency'
      },
      {
        id: '3',
        title: 'Vehicle Maintenance Tips',
        description: 'Regular maintenance tips for your vehicle',
        url: 'https://example.com/maintenance',
        category: 'vehicle'
      },
      {
        id: '4',
        title: 'Tax Filing for TLC Drivers',
        description: 'Guide for filing taxes as a TLC driver',
        url: 'https://example.com/taxes',
        category: 'financial'
      },
      {
        id: '5',
        title: 'Safety Guidelines',
        description: 'Safety guidelines for TLC drivers',
        url: 'https://example.com/safety',
        category: 'safety'
      }
    ];

    setHelpResources(mockResources);
  };

  const subscribeToRooms = () => {
    supabase
      .channel('rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_rooms'
      }, () => {
        loadRooms();
      })
      .subscribe();
  };

  const subscribeToMessages = (roomId: string) => {
    supabase
      .channel(`messages:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${roomId}`
      }, () => {
        loadMessages(roomId);
      })
      .subscribe();
  };

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || !anonymousUser) return;

    setIsUploading(true);
    let fileAttachments = [];

    try {
      // Upload attachments if there are any
      if (attachments.length > 0) {
        setUploadProgress(10);
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 300);

        // Upload files
        fileAttachments = await uploadMultipleFiles(attachments);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
      }

      // Create message in the database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom,
          content: newMessage.trim(),
          sender_name: anonymousUser.name,
          sender_email: anonymousUser.email,
          is_urgent: isUrgent,
          sender_verified: anonymousUser.isVerified,
          attachments: fileAttachments.length > 0 ? fileAttachments : null,
          // Add user_id if authenticated
          ...(user ? { user_id: user.id } : {})
        });

      if (error) {
        throw error;
      }

      setNewMessage('');
      setAttachments([]);
      setIsUrgent(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setAttachments([...attachments, ...fileArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredHelpResources = selectedHelpCategory === 'all' 
    ? helpResources 
    : helpResources.filter(resource => resource.category === selectedHelpCategory);

  const AnonymousLoginModal = () => {
    // If using real auth, show the auth modal
    const { isOpen: isAuthOpen, onOpen: onAuthOpen, onClose: onAuthClose } = useDisclosure();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [tlcNumber, setTlcNumber] = useState('');
    const [showVerification, setShowVerification] = useState(false);

    const handleVerification = () => {
      // Mock verification - in a real app, this would make an API call
      if (tlcNumber === 'TLC-12345678' || tlcNumber === 'TLC-87654321') {
        setIsVerified(true);
        toast({
          title: 'Driver verified',
          description: 'Your TLC license has been verified',
          status: 'success',
          duration: 3000,
        });
        setShowVerification(false);
      } else {
        toast({
          title: 'Verification failed',
          description: 'Invalid TLC license number',
          status: 'error',
          duration: 3000,
        });
      }
    };

    return (
      <>
        <AuthModal isOpen={isAuthOpen} onClose={onAuthClose} />
        
        <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Enter Chat Details</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Alert status="info" mb={2}>
                  <AlertIcon />
                  <AlertDescription>
                    <Text fontSize="sm">
                      Sign in to save your chat history and settings
                    </Text>
                  </AlertDescription>
                  <Button size="xs" ml={2} onClick={() => {
                    onClose();
                    onAuthOpen();
                  }}>
                    Sign In
                  </Button>
                </Alert>
                
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormControl>
                
                <HStack spacing={2} width="100%">
                  <Badge colorScheme={isVerified ? "green" : "gray"}>
                    {isVerified ? "Verified Driver" : "Unverified"}
                  </Badge>
                  {!isVerified && (
                    <Button size="xs" onClick={() => setShowVerification(true)}>
                      Verify Now
                    </Button>
                  )}
                </HStack>

                {showVerification && (
                  <Box width="100%" p={3} bg="gray.50" borderRadius="md">
                    <FormControl>
                      <FormLabel>TLC License Number</FormLabel>
                      <Input
                        placeholder="TLC-12345678"
                        value={tlcNumber}
                        onChange={(e) => setTlcNumber(e.target.value)}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        For demo use: TLC-12345678 or TLC-87654321
                      </Text>
                    </FormControl>
                    <Button size="sm" mt={3} onClick={handleVerification}>
                      Verify License
                    </Button>
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="teal"
                onClick={() => handleAnonymousLogin(name, email, isVerified)}
                isDisabled={!name || !email}
              >
                Join Chat
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  const ProfileDrawer = () => {
    const [editMode, setEditMode] = useState(false);
    const [profile, setProfile] = useState(anonymousUser?.profile);

    const saveProfile = () => {
      if (anonymousUser && profile) {
        setAnonymousUser({
          ...anonymousUser,
          profile
        });
        setEditMode(false);
        
        toast({
          title: 'Profile updated',
          status: 'success',
          duration: 3000,
        });
      }
    };

    return (
      <Drawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Driver Profile
            {anonymousUser?.isVerified && (
              <Badge colorScheme="green" ml={2}>
                <Flex align="center">
                  <UserCheck size={14} />
                  <Text ml={1}>Verified</Text>
                </Flex>
              </Badge>
            )}
          </DrawerHeader>
          <DrawerBody>
            {!editMode ? (
              <VStack spacing={6} align="stretch" pt={4}>
                <Flex justifyContent="center" mb={6}>
                  <Avatar
                    size="2xl"
                    name={anonymousUser?.name}
                  />
                </Flex>
                
                <Flex justifyContent="space-between">
                  <Heading size="md">{anonymousUser?.name}</Heading>
                  <Button size="sm" onClick={() => setEditMode(true)}>Edit Profile</Button>
                </Flex>
                
                <Box>
                  <Text color="gray.500" fontSize="sm">Email</Text>
                  <Text>{anonymousUser?.email}</Text>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text color="gray.500" fontSize="sm">Job Title</Text>
                  <Text>{profile?.jobTitle}</Text>
                </Box>
                
                <HStack>
                  <Box flex={1}>
                    <Text color="gray.500" fontSize="sm">Experience</Text>
                    <Text>{profile?.experience}</Text>
                  </Box>
                  
                  <Box flex={1}>
                    <Text color="gray.500" fontSize="sm">Rating</Text>
                    <Flex align="center">
                      <Text>{profile?.rating}</Text>
                      <Star size={16} fill="gold" color="gold" style={{marginLeft: '4px'}} />
                    </Flex>
                  </Box>
                </HStack>
                
                <Box>
                  <Text color="gray.500" fontSize="sm">Location</Text>
                  <Flex align="center">
                    <MapPin size={16} style={{marginRight: '4px'}} />
                    <Text>{profile?.location}</Text>
                  </Flex>
                </Box>
                
                {profile?.phone && (
                  <Box>
                    <Text color="gray.500" fontSize="sm">Phone</Text>
                    <Flex align="center">
                      <PhoneCall size={16} style={{marginRight: '4px'}} />
                      <Text>{profile?.phone}</Text>
                    </Flex>
                  </Box>
                )}
                
                {profile?.licenseNumber && (
                  <Box>
                    <Text color="gray.500" fontSize="sm">TLC License</Text>
                    <Flex align="center">
                      <Shield size={16} style={{marginRight: '4px'}} />
                      <Text>{profile?.licenseNumber}</Text>
                    </Flex>
                  </Box>
                )}
                
                <Box>
                  <Text color="gray.500" fontSize="sm">Member Since</Text>
                  <Flex align="center">
                    <Calendar size={16} style={{marginRight: '4px'}} />
                    <Text>{profile?.joinDate}</Text>
                  </Flex>
                </Box>
              </VStack>
            ) : (
              <VStack spacing={4} align="stretch" pt={4}>
                <FormControl>
                  <FormLabel>Job Title</FormLabel>
                  <Input 
                    value={profile?.jobTitle} 
                    onChange={(e) => setProfile({...profile!, jobTitle: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Experience</FormLabel>
                  <Select 
                    value={profile?.experience}
                    onChange={(e) => setProfile({...profile!, experience: e.target.value})}
                  >
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Location</FormLabel>
                  <Input 
                    value={profile?.location}
                    onChange={(e) => setProfile({...profile!, location: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input 
                    value={profile?.phone}
                    onChange={(e) => setProfile({...profile!, phone: e.target.value})}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>TLC License Number</FormLabel>
                  <Input 
                    value={profile?.licenseNumber}
                    onChange={(e) => setProfile({...profile!, licenseNumber: e.target.value})}
                  />
                </FormControl>
                
                <Flex justify="flex-end" mt={4}>
                  <Button mr={2} onClick={() => setEditMode(false)}>Cancel</Button>
                  <Button colorScheme="teal" onClick={saveProfile}>Save</Button>
                </Flex>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  const HelpResourcesDrawer = () => {
    return (
      <Drawer 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
        placement="right" 
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <HelpCircle size={20} style={{marginRight: '8px'}} />
              Help Resources
            </Flex>
          </DrawerHeader>
          <DrawerBody>
            <Tabs isFitted colorScheme="teal" mb={4}>
              <TabList>
                <Tab onClick={() => setSelectedHelpCategory('all')}>All</Tab>
                <Tab onClick={() => setSelectedHelpCategory('emergency')}>Emergency</Tab>
                <Tab onClick={() => setSelectedHelpCategory('licenses')}>Licenses</Tab>
                <Tab onClick={() => setSelectedHelpCategory('safety')}>Safety</Tab>
              </TabList>
            </Tabs>
            
            <VStack spacing={4} align="stretch">
              {filteredHelpResources.map(resource => (
                <Box 
                  key={resource.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  _hover={{ 
                    bg: 'gray.50',
                    transform: 'translateY(-2px)',
                    shadow: 'sm',
                    transition: 'all 0.2s'
                  }}
                >
                  <Heading size="sm" mb={2}>
                    {resource.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {resource.description}
                  </Text>
                  {resource.url && (
                    <Link href={resource.url} isExternal color="teal.500">
                      <Flex align="center">
                        <Text>View resource</Text>
                        <ChevronRight size={16} />
                      </Flex>
                    </Link>
                  )}
                </Box>
              ))}
              
              {filteredHelpResources.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No resources found in this category</Text>
                </Box>
              )}
            </VStack>
            
            <Box mt={8} p={4} bg="blue.50" borderRadius="md">
              <Heading size="sm" mb={2}>Need More Help?</Heading>
              <Text fontSize="sm" mb={3}>
                Contact our support team for personalized assistance
              </Text>
              <HStack spacing={4} mt={2}>
                <Button size="sm" leftIcon={<PhoneCall size={16} />} colorScheme="blue">
                  Call Support
                </Button>
                <Button size="sm" leftIcon={<Mail size={16} />} variant="outline" colorScheme="blue">
                  Email Us
                </Button>
              </HStack>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <Box h="calc(100vh - 100px)" display="flex" gap={4}>
      <AnonymousLoginModal />
      <ProfileDrawer />
      <HelpResourcesDrawer />
      
      {/* Left Sidebar: Rooms & Profile */}
      <Box w="250px" display="flex" flexDirection="column" gap={4}>
        {/* User Profile Card */}
        {anonymousUser && (
          <Box bg="white" p={4} borderRadius="lg" shadow="sm">
            <Flex align="center" mb={2}>
              <Avatar size="sm" name={anonymousUser.name} mr={2} />
              <Box flex={1}>
                <Text fontWeight="medium" fontSize="sm" isTruncated>
                  {anonymousUser.name}
                </Text>
                <Flex align="center">
                  {anonymousUser.isVerified ? (
                    <Badge colorScheme="green" variant="subtle" size="sm">
                      <Flex align="center">
                        <UserCheck size={10} />
                        <Text fontSize="xs" ml={1}>Verified</Text>
                      </Flex>
                    </Badge>
                  ) : (
                    <Badge colorScheme="gray" variant="subtle" size="sm">
                      <Text fontSize="xs">Unverified</Text>
                    </Badge>
                  )}
                </Flex>
              </Box>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsProfileOpen(true)}
              >
                <Settings size={16} />
              </Button>
            </Flex>
          </Box>
        )}
        
        {/* Rooms List */}
        <Box flex={1} bg="white" p={4} borderRadius="lg" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md">Chat Rooms</Heading>
            <IconButton
              aria-label="Help resources"
              icon={<HelpCircle size={16} />}
              size="sm"
              variant="ghost"
              onClick={() => setIsHelpOpen(true)}
            />
          </Flex>
          <List spacing={2}>
            {rooms.map((room) => (
              <ListItem key={room.id}>
                <Button
                  w="full"
                  variant={currentRoom === room.id ? 'solid' : 'ghost'}
                  colorScheme="teal"
                  justifyContent="flex-start"
                  onClick={() => setCurrentRoom(room.id)}
                  leftIcon={room.is_restricted ? <Lock size={16} /> : null}
                  disabled={room.is_restricted && !anonymousUser?.isVerified}
                >
                  <Text isTruncated># {room.name}</Text>
                  {room.is_restricted && (
                    <Tooltip label={anonymousUser?.isVerified 
                      ? "Verified drivers only" 
                      : "Verification required to join"
                    }>
                      <Badge ml={2} colorScheme={anonymousUser?.isVerified ? "green" : "purple"}>
                        {anonymousUser?.isVerified ? "✓" : "🔒"}
                      </Badge>
                    </Tooltip>
                  )}
                </Button>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box flex={1} bg="white" borderRadius="lg" shadow="sm" display="flex" flexDirection="column">
        {currentRoom ? (
          <>
            {/* Room Header */}
            <Flex
              p={4}
              borderBottom="1px"
              borderColor="gray.100"
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <Heading size="md" mr={2}>
                  {rooms.find(r => r.id === currentRoom)?.name}
                </Heading>
                {rooms.find(r => r.id === currentRoom)?.is_restricted && (
                  <Badge colorScheme="green">Verified Drivers</Badge>
                )}
              </Flex>
              
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    aria-label="Room info"
                    icon={<Info size={16} />}
                    size="sm"
                    variant="ghost"
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>Room Info</PopoverHeader>
                  <PopoverBody>
                    <Text fontSize="sm" mb={2}>
                      {rooms.find(r => r.id === currentRoom)?.description || "No description available"}
                    </Text>
                    {rooms.find(r => r.id === currentRoom)?.is_restricted && (
                      <Badge colorScheme="green">Verified drivers only</Badge>
                    )}
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Flex>

            {/* Messages */}
            <Box flex={1} p={4} overflowY="auto">
              <VStack spacing={4} align="stretch">
                {messages.map((message) => (
                  <Box key={message.id}>
                    <HStack spacing={3} align="flex-start">
                      <Avatar
                        size="sm"
                        name={message.sender_name}
                      />
                      <Box 
                        bg={message.is_urgent ? "red.50" : "gray.50"} 
                        p={3} 
                        borderRadius="lg" 
                        maxW="80%" 
                        borderLeft={message.is_urgent ? "4px solid" : "none"}
                        borderColor="red.400"
                      >
                        <Flex align="center" mb={1}>
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">
                            {message.sender_name}
                          </Text>
                          {message.sender_verified && (
                            <Badge colorScheme="green" ml={1} size="sm">
                              <Flex align="center">
                                <UserCheck size={10} />
                                <Text fontSize="xs" ml={1}>Verified</Text>
                              </Flex>
                            </Badge>
                          )}
                          {message.is_urgent && (
                            <Badge colorScheme="red" ml={1}>
                              <Flex align="center">
                                <AlertTriangle size={10} />
                                <Text fontSize="xs" ml={1}>Urgent</Text>
                              </Flex>
                            </Badge>
                          )}
                          <Text fontSize="xs" color="gray.500" ml={2}>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </Flex>
                        <Text>{message.content}</Text>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <Box mt={2}>
                            <Text fontSize="xs" color="gray.500" mb={1}>
                              Attachments ({message.attachments.length})
                            </Text>
                            <Flex wrap="wrap" gap={2}>
                              {message.attachments.map((attachment) => (
                                <Box
                                  key={attachment.id}
                                  borderWidth="1px"
                                  borderRadius="md"
                                  p={2}
                                  bg="white"
                                  fontSize="xs"
                                >
                                  <Flex align="center">
                                    <File size={14} />
                                    <Text ml={1} isTruncated maxW="120px">
                                      {attachment.name}
                                    </Text>
                                  </Flex>
                                </Box>
                              ))}
                            </Flex>
                          </Box>
                        )}
                      </Box>
                    </HStack>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            {/* Message Input */}
            <Box p={4} borderTop="1px" borderColor="gray.100">
              {attachments.length > 0 && (
                <Flex wrap="wrap" gap={2} mb={2}>
                  {attachments.map((file, index) => (
                    <Box
                      key={index}
                      borderWidth="1px"
                      borderRadius="md"
                      p={2}
                      bg="gray.50"
                      fontSize="xs"
                    >
                      <Flex align="center">
                        <File size={14} />
                        <Text ml={1} mr={2} isTruncated maxW="120px">
                          {file.name}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => removeAttachment(index)}
                        >
                          ✕
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              )}
              
              <form onSubmit={sendMessage}>
                <VStack spacing={2} align="stretch">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    size="sm"
                    resize="none"
                    rows={2}
                    isDisabled={isUploading}
                  />
                  
                  {isUploading && (
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={1}>
                        Uploading files... {uploadProgress}%
                      </Text>
                      <Progress 
                        value={uploadProgress} 
                        size="xs" 
                        colorScheme="teal" 
                        borderRadius="full"
                      />
                    </Box>
                  )}
                  
                  <Flex justify="space-between" align="center">
                    <HStack>
                      <Tooltip label="Attach file">
                        <IconButton
                          aria-label="Attach file"
                          icon={<Paperclip size={16} />}
                          onClick={openFileDialog}
                          size="sm"
                          variant="ghost"
                          isDisabled={isUploading}
                        />
                      </Tooltip>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                      />
                      
                      <Tooltip label={isUrgent ? "Urgent message" : "Mark as urgent"}>
                        <IconButton
                          aria-label="Mark as urgent"
                          icon={<AlertCircle size={16} />}
                          onClick={() => setIsUrgent(!isUrgent)}
                          size="sm"
                          variant={isUrgent ? "solid" : "ghost"}
                          colorScheme={isUrgent ? "red" : "gray"}
                          isDisabled={isUploading}
                        />
                      </Tooltip>
                    </HStack>
                    
                    <Button
                      type="submit"
                      colorScheme="teal"
                      isDisabled={
                        ((!newMessage.trim() && attachments.length === 0) || !anonymousUser) || 
                        isUploading
                      }
                      isLoading={isUploading}
                      loadingText="Sending..."
                      rightIcon={<Send size={16} />}
                    >
                      Send
                    </Button>
                  </Flex>
                </VStack>
              </form>
            </Box>
          </>
        ) : (
          <Flex justify="center" align="center" h="full">
            <Text color="gray.500">Select a chat room to start messaging</Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}