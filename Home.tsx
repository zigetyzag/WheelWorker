import { useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  SimpleGrid,
  useDisclosure,
  Flex
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Shield, Clock, DollarSign, MessageSquare, Users, LogIn } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../lib/authContext';

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, profile } = useAuth();

  return (
    <Box>
      <AuthModal isOpen={isOpen} onClose={onClose} />
      
      {/* Hero Section */}
      <Box 
        bg="teal.500" 
        color="white" 
        py={20}
        borderRadius="xl"
        backgroundImage="url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: "blackAlpha.600",
          borderRadius: "xl",
        }}
      >
        <Container maxW="container.xl" position="relative">
          <VStack spacing={6} align="flex-start" maxW="xl">
            <Heading size="2xl">
              Drive with Confidence
            </Heading>
            <Text fontSize="xl">
              Join the most trusted network of professional drivers. 
              Quick verification, better opportunities.
            </Text>
            <HStack spacing={4}>
              {user ? (
                <Link to="/chat">
                  <Button size="lg" colorScheme="white" variant="solid">
                    Start Chatting
                  </Button>
                </Link>
              ) : (
                <>
                  <Button size="lg" colorScheme="white" variant="solid" onClick={onOpen} leftIcon={<LogIn size={20} />}>
                    Sign In
                  </Button>
                  <Link to="/verify">
                    <Button size="lg" colorScheme="teal" variant="outline" _hover={{ bg: 'whiteAlpha.200' }}>
                      Verify Now
                    </Button>
                  </Link>
                </>
              )}
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} mt={20}>
        <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
          <Box p={3} bg="teal.50" borderRadius="full">
            <Shield size={24} className="text-teal-600" />
          </Box>
          <Heading size="md">Secure Verification</Heading>
          <Text textAlign="center" color="gray.600">
            Industry-leading verification process ensuring safety and trust
          </Text>
        </VStack>

        <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
          <Box p={3} bg="teal.50" borderRadius="full">
            <Clock size={24} className="text-teal-600" />
          </Box>
          <Heading size="md">Quick Process</Heading>
          <Text textAlign="center" color="gray.600">
            Complete your verification in minutes, not days
          </Text>
        </VStack>

        <VStack spacing={4} p={6} bg="white" borderRadius="lg" shadow="md">
          <Box p={3} bg="teal.50" borderRadius="full">
            <DollarSign size={24} className="text-teal-600" />
          </Box>
          <Heading size="md">Better Earnings</Heading>
          <Text textAlign="center" color="gray.600">
            Access premium opportunities with verified status
          </Text>
        </VStack>
      </SimpleGrid>

      {/* Community Features Section */}
      <Box mt={20}>
        <Heading textAlign="center" mb={12}>Connect with Fellow Drivers</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Box 
            p={8} 
            bg="white" 
            borderRadius="lg" 
            shadow="md" 
            position="relative" 
            overflow="hidden"
          >
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              height="8px" 
              bg="teal.500" 
            />
            <Flex justify="space-between" align="start">
              <VStack align="start" spacing={4}>
                <Heading size="md" display="flex" alignItems="center">
                  <MessageSquare size={24} style={{ marginRight: '12px' }} />
                  Real-Time Chat
                </Heading>
                <Text color="gray.600">
                  Connect instantly with other drivers in your area. 
                  Share tips, get advice, and stay updated with local information.
                </Text>
                <Link to="/chat">
                  <Button colorScheme="teal" variant="outline" mt={2}>
                    Join Chat
                  </Button>
                </Link>
              </VStack>
            </Flex>
          </Box>
          
          <Box 
            p={8} 
            bg="white" 
            borderRadius="lg" 
            shadow="md" 
            position="relative" 
            overflow="hidden"
          >
            <Box 
              position="absolute" 
              top={0} 
              left={0} 
              right={0} 
              height="8px" 
              bg="teal.500" 
            />
            <Flex justify="space-between" align="start">
              <VStack align="start" spacing={4}>
                <Heading size="md" display="flex" alignItems="center">
                  <Users size={24} style={{ marginRight: '12px' }} />
                  Community Forum
                </Heading>
                <Text color="gray.600">
                  Discuss industry topics, share experiences, and 
                  learn from the community in our dedicated driver forums.
                </Text>
                <Link to="/forum">
                  <Button colorScheme="teal" variant="outline" mt={2}>
                    Browse Forums
                  </Button>
                </Link>
              </VStack>
            </Flex>
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}