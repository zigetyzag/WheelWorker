import { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Image,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Badge,
  useToast,
  Flex,
  Center,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormHelperText,
  PinInput,
  PinInputField,
  useDisclosure
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../lib/authContext';
import AuthModal from '../components/AuthModal';

// Mock TLC database
const mockTLCDatabase = {
  'TLC-12345678': { name: 'John Smith', status: 'Active', expirationDate: '2025-12-31' },
  'TLC-87654321': { name: 'Sara Johnson', status: 'Active', expirationDate: '2025-10-15' }
};

const steps = [
  { title: 'TLC License', description: 'Enter your license details' },
  { title: 'Phone Verification', description: 'Verify your phone number' },
  { title: 'Review', description: 'Complete verification' }
];

interface VerificationData {
  tlcNumber: string;
  fullName: string;
  phone: string;
  phoneVerified: boolean;
  verificationId?: string;
}

export default function VerificationDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [verificationData, setVerificationData] = useState<VerificationData>({
    tlcNumber: '',
    fullName: '',
    phone: '',
    phoneVerified: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, profile, verifyDriver } = useAuth();

  const verifyTLCLicense = async () => {
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const licenseData = mockTLCDatabase[verificationData.tlcNumber];

    if (!licenseData) {
      setError('TLC license not found in database');
      setLoading(false);
      return false;
    }

    if (licenseData.status !== 'Active') {
      setError('TLC license is not active');
      setLoading(false);
      return false;
    }

    // Basic name matching (case-insensitive)
    if (licenseData.name.toLowerCase() !== verificationData.fullName.toLowerCase()) {
      setError('Name does not match TLC license records');
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const isValid = await verifyTLCLicense();
      if (!isValid) return;

      toast({
        title: 'TLC License Verified',
        status: 'success',
        duration: 3000
      });
    }

    setActiveStep(prev => prev + 1);
  };

  const handlePhoneVerification = () => {
    setShowPhoneVerification(true);
  };

  const verifyPhoneCode = async () => {
    setLoading(true);
    setError('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (verificationCode === '123456') {
      setVerificationData(prev => ({ ...prev, phoneVerified: true }));
      setShowPhoneVerification(false);
      setActiveStep(2);
      toast({
        title: 'Phone number verified',
        status: 'success',
        duration: 3000
      });
    } else {
      setError('Invalid verification code');
    }

    setLoading(false);
  };

  // verifyDriver already defined in the auth context extraction above

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // If user is logged in, use the real verification API
      if (user) {
        const { success, error, message } = await verifyDriver(
          verificationData.tlcNumber,
          verificationData.fullName
        );
        
        if (!success) {
          setError(message || 'Verification failed');
          setLoading(false);
          return;
        }
        
        // Generate a verification ID for the UI
        const verificationId = `VER-${Math.random().toString(36).substr(2, 9)}`;
        
        setVerificationData(prev => ({
          ...prev,
          verificationId
        }));
        
        setSubmitSuccess(true);
      } else {
        // For demo purposes without login
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a mock verification ID
        const verificationId = `VER-${Math.random().toString(36).substr(2, 9)}`;
        
        setVerificationData(prev => ({
          ...prev,
          verificationId
        }));
        
        setSubmitSuccess(true);
      }
    } catch (err) {
      setError('Verification submission failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Card variant="outline" mt={6}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">TLC License Information</Heading>
                <Text color="gray.600">
                  Enter your TLC license details exactly as they appear on your license.
                </Text>

                <FormControl isRequired>
                  <FormLabel>TLC License Number</FormLabel>
                  <Input
                    placeholder="TLC-12345678"
                    value={verificationData.tlcNumber}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, tlcNumber: e.target.value }))}
                  />
                  <FormHelperText>Example: TLC-12345678</FormHelperText>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Full Name (as on license)</FormLabel>
                  <Input
                    placeholder="John Smith"
                    value={verificationData.fullName}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, fullName: e.target.value }))}
                  />
                  <FormHelperText>Enter your name exactly as it appears on your TLC license</FormHelperText>
                </FormControl>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  colorScheme="teal"
                  isLoading={loading}
                  onClick={handleNext}
                  isDisabled={!verificationData.tlcNumber || !verificationData.fullName}
                >
                  Verify & Continue
                </Button>
              </VStack>
            </CardBody>
          </Card>
        );

      case 1:
        return (
          <Card variant="outline" mt={6}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Phone Verification</Heading>
                <Text color="gray.600">
                  Please verify your phone number to continue.
                </Text>

                <FormControl isRequired>
                  <FormLabel>Phone Number</FormLabel>
                  <Input
                    type="tel"
                    placeholder="(212) 555-1234"
                    value={verificationData.phone}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </FormControl>

                <Button
                  colorScheme="teal"
                  onClick={handlePhoneVerification}
                  isDisabled={!verificationData.phone}
                >
                  Send Verification Code
                </Button>

                <Modal isOpen={showPhoneVerification} onClose={() => setShowPhoneVerification(false)}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Enter Verification Code</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                      <VStack spacing={4}>
                        <Text>Enter the 6-digit code sent to your phone</Text>
                        <Text fontSize="sm" color="gray.500">
                          (Use code 123456 for this demo)
                        </Text>

                        <HStack justify="center">
                          <PinInput
                            value={verificationCode}
                            onChange={setVerificationCode}
                            otp
                          >
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                            <PinInputField />
                          </PinInput>
                        </HStack>

                        {error && (
                          <Alert status="error">
                            <AlertIcon />
                            {error}
                          </Alert>
                        )}

                        <Button
                          colorScheme="teal"
                          onClick={verifyPhoneCode}
                          isLoading={loading}
                          isFullWidth
                        >
                          Verify Code
                        </Button>
                      </VStack>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </VStack>
            </CardBody>
          </Card>
        );

      case 2:
        return (
          <Card variant="outline" mt={6}>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Review & Submit</Heading>

                {submitSuccess ? (
                  <Alert
                    status="success"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    borderRadius="md"
                    py={6}
                  >
                    <AlertIcon boxSize="40px" mr={0} />
                    <Heading size="md" mt={4} mb={1}>
                      Verification Submitted!
                    </Heading>
                    <Text mb={4}>
                      Your verification request has been submitted and is now being processed.
                      You'll receive an email once your verification is complete.
                    </Text>
                    <Text fontWeight="bold">
                      Verification ID: {verificationData.verificationId}
                    </Text>
                  </Alert>
                ) : (
                  <>
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">Almost there!</Text>
                        <Text>
                          Please review your information before submitting. Once submitted,
                          verification typically takes 24-48 hours.
                        </Text>
                      </Box>
                    </Alert>

                    <Box borderWidth="1px" borderRadius="md" p={4}>
                      <Heading size="sm" mb={3}>Verification Summary</Heading>

                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">TLC License:</Text>
                          <Text>{verificationData.tlcNumber}</Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontWeight="medium">Full Name:</Text>
                          <Text>{verificationData.fullName}</Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontWeight="medium">Phone:</Text>
                          <Flex align="center">
                            <Text>{verificationData.phone}</Text>
                            <Badge colorScheme="green" ml={2}>Verified</Badge>
                          </Flex>
                        </HStack>
                      </VStack>
                    </Box>

                    {error && (
                      <Alert status="error">
                        <AlertIcon />
                        {error}
                      </Alert>
                    )}

                    <Button
                      colorScheme="teal"
                      onClick={handleSubmit}
                      isLoading={loading}
                      loadingText="Submitting..."
                    >
                      Submit Verification
                    </Button>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <AuthModal isOpen={isOpen} onClose={onClose} />
      
      <Heading mb={8} textAlign="center">WheelWorker Driver Verification</Heading>
      
      {!user && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="bold">
              Create an account to save your verification progress
            </Text>
            <Text>
              Sign in or create an account to save your verification status and access all features.
            </Text>
          </Box>
          <Button colorScheme="teal" onClick={onOpen}>
            Sign In
          </Button>
        </Alert>
      )}

      <Stepper index={activeStep} mb={10} colorScheme="teal">
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepIcon />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>

            <Box flexShrink="0">
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>

      {renderStep()}
    </Box>
  );
}