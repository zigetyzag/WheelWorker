import { 
  Box, 
  Container, 
  Flex, 
  Button, 
  Heading, 
  Avatar, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  MenuDivider,
  Badge
} from '@chakra-ui/react';
import { 
  Truck, 
  MessageSquare, 
  Users, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  BarChart4, 
  Bell
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <Box bg="white" shadow="sm">
      <Container maxW="container.xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <Link to="/">
            <Flex alignItems="center" gap={2}>
              <Truck size={24} className="text-teal-600" />
              <Heading size="md">WheelWorker</Heading>
            </Flex>
          </Link>
          
          <Flex gap={4} alignItems="center">
            <Link to="/chat">
              <Button leftIcon={<MessageSquare size={18} />} colorScheme="teal" variant="ghost">
                Chat
              </Button>
            </Link>
            <Link to="/forum">
              <Button leftIcon={<Users size={18} />} colorScheme="teal" variant="ghost">
                Forum
              </Button>
            </Link>
            
            {user ? (
              <Menu>
                <MenuButton 
                  as={Button} 
                  rightIcon={<ChevronDown size={16} />}
                  variant="ghost"
                  display="flex"
                  alignItems="center"
                >
                  <Flex align="center">
                    <Avatar 
                      size="sm" 
                      name={profile?.full_name || user.email || 'User'} 
                      src={profile?.avatar_url || undefined}
                      mr={2}
                    />
                    {profile?.is_verified && (
                      <Badge colorScheme="green" mr={2}>
                        <Shield size={12} style={{ marginRight: '4px' }} />
                        Verified
                      </Badge>
                    )}
                  </Flex>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<User size={16} />}>Profile</MenuItem>
                  <MenuItem icon={<Settings size={16} />} onClick={() => navigate('/settings')}>
                    Settings
                  </MenuItem>
                  <MenuItem icon={<Bell size={16} />}>Notifications</MenuItem>
                  
                  {profile?.is_verified && (
                    <>
                      <MenuDivider />
                      <MenuItem icon={<BarChart4 size={16} />} onClick={() => navigate('/admin')}>
                        Admin Dashboard
                      </MenuItem>
                    </>
                  )}
                  
                  <MenuDivider />
                  <MenuItem icon={<LogOut size={16} />} onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Link to="/verify">
                <Button colorScheme="teal" variant="solid">
                  Driver Verification
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}