import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Select,
  Avatar,
  useToast,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  Badge,
  Flex,
  Switch,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { UserCheck, Bell, Shield, Lock, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { useRef } from 'react';

export default function UserSettings() {
  const { profile, updateProfile, signOut, verifyDriver } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    job_title: '',
    experience: '',
    location: '',
    phone: '',
    license_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    license_number: '',
    full_name: '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    chatMessages: true,
    forumReplies: true,
    newsUpdates: false,
  });
  
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        job_title: profile.job_title || '',
        experience: profile.experience || '',
        location: profile.location || '',
        phone: profile.phone || '',
        license_number: profile.license_number || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVerificationData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (name: string) => {
    setNotifications(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } else {
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });
    }
    
    setIsLoading(false);
  };

  const handleVerification = async () => {
    setIsLoading(true);
    
    const { success, error, message } = await verifyDriver(
      verificationData.license_number, 
      verificationData.full_name
    );
    
    toast({
      title: success ? 'Verification successful' : 'Verification failed',
      description: message,
      status: success ? 'success' : 'error',
      duration: 5000,
    });
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
    });
  };

  return (
    <Box>
      <Heading mb={6}>Account Settings</Heading>
      
      <Tabs colorScheme="teal" variant="enclosed">
        <TabList>
          <Tab><User size={18} style={{ marginRight: '8px' }} /> Profile</Tab>
          <Tab><Shield size={18} style={{ marginRight: '8px' }} /> Verification</Tab>
          <Tab><Bell size={18} style={{ marginRight: '8px' }} /> Notifications</Tab>
          <Tab><Lock size={18} style={{ marginRight: '8px' }} /> Security</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Tab */}
          <TabPanel>
            <Card variant="outline" bg="white" mb={6}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Flex justifyContent="center" p={6}>
                    <Avatar 
                      size="2xl" 
                      name={profile?.full_name || 'User'} 
                      src={profile?.avatar_url || undefined}
                    />
                  </Flex>
                  
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Personal Information</Heading>
                    <Badge 
                      colorScheme={profile?.is_verified ? "green" : "gray"}
                      py={1}
                      px={2}
                      borderRadius="full"
                    >
                      <Flex align="center">
                        {profile?.is_verified && <UserCheck size={14} style={{ marginRight: '4px' }} />}
                        {profile?.is_verified ? 'Verified Driver' : 'Unverified'}
                      </Flex>
                    </Badge>
                  </Flex>
                  
                  <FormControl>
                    <FormLabel>Full Name</FormLabel>
                    <Input 
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  
                  <HStack spacing={4}>
                    <FormControl flex={1}>
                      <FormLabel>Job Title</FormLabel>
                      <Input 
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    
                    <FormControl flex={1}>
                      <FormLabel>Experience</FormLabel>
                      <Select 
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                      >
                        <option value="">Select experience</option>
                        <option value="0-1 years">0-1 years</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </Select>
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input 
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Phone Number</FormLabel>
                    <Input 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>TLC License Number</FormLabel>
                    <Input 
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      isReadOnly={profile?.is_verified}
                      bg={profile?.is_verified ? "gray.50" : undefined}
                    />
                    {profile?.is_verified && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        License number cannot be changed after verification
                      </Text>
                    )}
                  </FormControl>
                  
                  <Button 
                    colorScheme="teal" 
                    onClick={handleProfileUpdate}
                    isLoading={isLoading}
                    alignSelf="flex-end"
                  >
                    Save Changes
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Verification Tab */}
          <TabPanel>
            <Card variant="outline" bg="white" mb={6}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Driver Verification</Heading>
                  
                  {profile?.is_verified ? (
                    <Box
                      p={6}
                      bg="green.50"
                      borderRadius="md"
                      borderLeft="4px solid"
                      borderColor="green.500"
                    >
                      <Flex align="center" mb={2}>
                        <UserCheck size={24} color="green" style={{ marginRight: '12px' }} />
                        <Heading size="md" color="green.600">Verified Driver</Heading>
                      </Flex>
                      <Text>
                        Your driver status has been verified. You now have access to all verified driver features.
                      </Text>
                    </Box>
                  ) : (
                    <VStack spacing={4} align="stretch">
                      <Text>
                        Complete verification to access premium features and join exclusive driver communities.
                      </Text>
                      
                      <FormControl isRequired>
                        <FormLabel>TLC License Number</FormLabel>
                        <Input 
                          name="license_number"
                          value={verificationData.license_number}
                          onChange={handleVerificationChange}
                          placeholder="Example: TLC-12345678"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          For demo use: TLC-12345678 or TLC-87654321
                        </Text>
                      </FormControl>
                      
                      <FormControl isRequired>
                        <FormLabel>Full Name (as on license)</FormLabel>
                        <Input 
                          name="full_name"
                          value={verificationData.full_name}
                          onChange={handleVerificationChange}
                          placeholder="Exactly as it appears on your license"
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          For demo use: John Smith or Sara Johnson
                        </Text>
                      </FormControl>
                      
                      <Button
                        colorScheme="teal"
                        onClick={handleVerification}
                        isLoading={isLoading}
                        isDisabled={!verificationData.license_number || !verificationData.full_name}
                      >
                        Verify Now
                      </Button>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Notifications Tab */}
          <TabPanel>
            <Card variant="outline" bg="white" mb={6}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Notification Preferences</Heading>
                  
                  <HStack justify="space-between">
                    <Text>Email Notifications</Text>
                    <Switch 
                      colorScheme="teal" 
                      isChecked={notifications.email}
                      onChange={() => handleNotificationChange('email')}
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Push Notifications</Text>
                    <Switch 
                      colorScheme="teal" 
                      isChecked={notifications.push}
                      onChange={() => handleNotificationChange('push')}
                    />
                  </HStack>
                  
                  <Divider />
                  
                  <Heading size="sm">What to notify me about:</Heading>
                  
                  <HStack justify="space-between">
                    <Text>Chat Messages</Text>
                    <Switch 
                      colorScheme="teal" 
                      isChecked={notifications.chatMessages}
                      onChange={() => handleNotificationChange('chatMessages')}
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Forum Replies</Text>
                    <Switch 
                      colorScheme="teal" 
                      isChecked={notifications.forumReplies}
                      onChange={() => handleNotificationChange('forumReplies')}
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>News & Updates</Text>
                    <Switch 
                      colorScheme="teal" 
                      isChecked={notifications.newsUpdates}
                      onChange={() => handleNotificationChange('newsUpdates')}
                    />
                  </HStack>
                  
                  <Button 
                    colorScheme="teal" 
                    alignSelf="flex-end"
                  >
                    Save Preferences
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Security Tab */}
          <TabPanel>
            <Card variant="outline" bg="white" mb={6}>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <Heading size="md">Security Settings</Heading>
                  
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <Input type="password" placeholder="Enter current password" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input type="password" placeholder="Enter new password" />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input type="password" placeholder="Confirm new password" />
                  </FormControl>
                  
                  <Button colorScheme="teal" alignSelf="flex-end">
                    Change Password
                  </Button>
                  
                  <Divider my={4} />
                  
                  <Box>
                    <Heading size="md" mb={4} color="red.500">Danger Zone</Heading>
                    <Button 
                      leftIcon={<LogOut size={18} />} 
                      colorScheme="red" 
                      variant="outline"
                      onClick={onOpen}
                    >
                      Log Out
                    </Button>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Log Out
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to log out? You will need to log back in to access your account.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleLogout} ml={3}>
                Log Out
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}