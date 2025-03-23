import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Link,
  Box,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { useAuth } from '../lib/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  
  const { signIn, signUp } = useAuth();
  const toast = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setError('');
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }

    if (tabIndex === 1 && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast({
        title: 'Logged in successfully',
        status: 'success',
        duration: 3000,
      });
      
      onClose();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      toast({
        title: 'Account created successfully',
        description: 'You have been signed up and logged in',
        status: 'success',
        duration: 5000,
      });
      
      onClose();
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tabIndex === 0) {
      handleSignIn();
    } else {
      handleSignUp();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Welcome to WheelWorker</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs 
            isFitted 
            colorScheme="teal" 
            index={tabIndex} 
            onChange={(index) => {
              setTabIndex(index);
              setError('');
            }}
            mb={4}
          >
            <TabList>
              <Tab>Sign In</Tab>
              <Tab>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <Text mb={4} color="gray.600">
                  Sign in to access your account
                </Text>
              </TabPanel>
              <TabPanel px={0}>
                <Text mb={4} color="gray.600">
                  Create a new account to get started
                </Text>
              </TabPanel>
            </TabPanels>
          </Tabs>
          
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder={tabIndex === 0 ? "Enter your password" : "Create a password"}
                  value={password}
                  onChange={handlePasswordChange}
                />
              </FormControl>
              
              {tabIndex === 1 && (
                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                  />
                </FormControl>
              )}
              
              <Button
                type="submit"
                colorScheme="teal"
                width="full"
                mt={4}
                isLoading={isLoading}
              >
                {tabIndex === 0 ? 'Sign In' : 'Create Account'}
              </Button>
            </VStack>
          </form>
          
          {tabIndex === 0 && (
            <Box textAlign="center" mt={4}>
              <Link color="teal.500">Forgot your password?</Link>
            </Box>
          )}
          
          <Text fontSize="sm" color="gray.500" mt={6} textAlign="center">
            By signing in or creating an account, you agree to our <Link color="teal.500">Terms of Service</Link> and <Link color="teal.500">Privacy Policy</Link>.
          </Text>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}