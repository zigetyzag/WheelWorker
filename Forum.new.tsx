import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Input,
  Textarea,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Avatar,
  Badge,
  useToast,
  Divider,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  Image,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Tag,
  Spinner,
  Collapse,
  Grid,
  GridItem,
  Alert,
  AlertIcon,
  Center
} from '@chakra-ui/react';
import { 
  Plus, 
  MessageCircle, 
  Search, 
  ChevronDown,
  ThumbsUp,
  MessageSquare,
  Share,
  Bookmark,
  Filter,
  Star,
  UserCheck,
  AlertTriangle,
  Trash,
  Edit,
  Send,
  Clock,
  Calendar,
  Eye,
  LogIn
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/authContext';
import AuthModal from '../components/AuthModal';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
}

interface ForumPost {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    is_verified?: boolean;
  };
  comments: { count: number }[];
  likes_count?: number;
  tags?: string[];
  is_pinned?: boolean;
}

interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
    is_verified?: boolean;
  };
}

export default function Forum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [] });
  const [newComment, setNewComment] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState({});
  const [currentTag, setCurrentTag] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isPostDetailOpen, 
    onOpen: onPostDetailOpen, 
    onClose: onPostDetailClose 
  } = useDisclosure();
  const {
    isOpen: isAuthOpen,
    onOpen: onAuthOpen,
    onClose: onAuthClose
  } = useDisclosure();
  
  const { user, profile } = useAuth();
  const toast = useToast();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadCategories();
    if (selectedCategory) {
      loadPosts(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedPost) {
      loadComments(selectedPost.id);
    }
  }, [selectedPost]);

  useEffect(() => {
    if (searchQuery.trim() === '' && !currentTag) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTag = currentTag ? post.tags?.includes(currentTag) : true;
        
        return matchesSearch && matchesTag;
      });
      setFilteredPosts(filtered);
    }
  }, [posts, searchQuery, currentTag]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('name');

    if (error) {
      toast({
        title: 'Error loading categories',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setCategories(data);
  };

  const loadPosts = async (categoryId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          is_verified
        ),
        comments:forum_comments (count)
      `)
      .eq('category_id', categoryId)
      .order('is_pinned', { ascending: false })
      .order(sortBy(), { ascending: sortDirection() });

    if (error) {
      toast({
        title: 'Error loading posts',
        status: 'error',
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    // Add mock data for likes, tags, etc.
    const enhancedData = data.map(post => ({
      ...post,
      likes_count: Math.floor(Math.random() * 50),
      tags: getRandomTags(),
      is_pinned: Math.random() > 0.9 // Random pinning
    }));

    setPosts(enhancedData);
    setFilteredPosts(enhancedData);
    setIsLoading(false);
  };

  const loadComments = async (postId: string) => {
    const { data, error } = await supabase
      .from('forum_comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error loading comments',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setComments(data || []);
  };

  const createPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    try {
      // Use the authenticated user's ID if available
      const userId = user ? user.id : 'anon-' + Math.random().toString(36).substring(2, 9);
      
      const postData = {
        category_id: selectedCategory,
        user_id: userId,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        tags: newPost.tags // Store tags as JSONB in Supabase
      };

      const { error } = await supabase
        .from('forum_posts')
        .insert(postData);

      if (error) {
        throw error;
      }

      setNewPost({ title: '', content: '', tags: [] });
      onClose();
      loadPosts(selectedCategory!);
      
      toast({
        title: 'Post created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error creating post',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const createComment = async (postId: string) => {
    if (!newComment.trim()) return;
    
    try {
      // If not logged in, prompt to sign in
      if (!user) {
        onAuthOpen();
        return;
      }
      
      // Use the authenticated user's ID
      const userId = user.id;

      const { error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: newComment.trim(),
        });

      if (error) {
        throw error;
      }

      setNewComment('');
      
      // If we're in the detailed view, refresh comments
      if (selectedPost && selectedPost.id === postId) {
        loadComments(postId);
      }
      
      // If we're in the list view, refresh posts to update comment count
      loadPosts(selectedCategory!);
      
      toast({
        title: 'Comment added',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Error adding comment',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handlePostClick = (post: ForumPost) => {
    setSelectedPost(post);
    onPostDetailOpen();
  };

  const sortBy = () => {
    if (sortOption === 'newest' || sortOption === 'oldest') {
      return 'created_at';
    } else if (sortOption === 'most_comments') {
      return 'comments:forum_comments(count)';
    }
    return 'created_at';
  };

  const sortDirection = () => {
    return sortOption === 'oldest';
  };

  const getRandomTags = () => {
    const allTags = [
      'question', 'tips', 'recommendation', 'help', 'discussion',
      'maintenance', 'safety', 'regulations', 'earnings', 'apps',
      'traffic', 'customers', 'vehicle', 'routes', 'taxi'
    ];
    
    const numTags = Math.floor(Math.random() * 3) + 1; // 1 to 3 tags
    const tags = [];
    
    for (let i = 0; i < numTags; i++) {
      const randomIndex = Math.floor(Math.random() * allTags.length);
      tags.push(allTags[randomIndex]);
      allTags.splice(randomIndex, 1);
    }
    
    return tags;
  };

  const toggleCommentSection = (postId: string) => {
    setIsCommentOpen(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    
    // Focus on comment input when opening
    if (!isCommentOpen[postId]) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddTag = (tag: string) => {
    if (!newPost.tags.includes(tag)) {
      setNewPost({
        ...newPost,
        tags: [...newPost.tags, tag]
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewPost({
      ...newPost,
      tags: newPost.tags.filter(t => t !== tag)
    });
  };

  const renderPostItem = (post: ForumPost) => {
    return (
      <Card 
        key={post.id}
        bg="white"
        p={0}
        borderRadius="lg"
        shadow="sm"
        transition="all 0.2s"
        _hover={{ shadow: 'md' }}
        position="relative"
        overflow="hidden"
      >
        {post.is_pinned && (
          <Box 
            position="absolute" 
            top="0" 
            right="0" 
            bg="yellow.400" 
            px={2} 
            py={1} 
            borderBottomLeftRadius="md"
          >
            <Text fontSize="xs" fontWeight="bold">PINNED</Text>
          </Box>
        )}
        
        <CardHeader py={4} px={6}>
          <HStack spacing={4} mb={4}>
            <Avatar
              size="sm"
              name={post.profiles?.full_name}
              src={post.profiles?.avatar_url}
            />
            <VStack align="start" spacing={0}>
              <Flex align="center">
                <Text fontWeight="medium">
                  {post.profiles?.full_name || 'Anonymous'}
                </Text>
                {post.profiles?.is_verified && (
                  <Badge colorScheme="green" ml={1}>
                    <Flex align="center">
                      <UserCheck size={10} />
                      <Text fontSize="xs" ml={1}>Verified Driver</Text>
                    </Flex>
                  </Badge>
                )}
              </Flex>
              <HStack spacing={2}>
                <Flex align="center" fontSize="xs" color="gray.500">
                  <Calendar size={12} style={{ marginRight: '4px' }} />
                  {formatDate(post.created_at)}
                </Flex>
                <Flex align="center" fontSize="xs" color="gray.500">
                  <Clock size={12} style={{ marginRight: '4px' }} />
                  {formatTime(post.created_at)}
                </Flex>
              </HStack>
            </VStack>
          </HStack>

          <Heading 
            size="md" 
            mb={2} 
            onClick={() => handlePostClick(post)} 
            cursor="pointer"
            _hover={{ color: 'teal.500' }}
          >
            {post.title}
          </Heading>
          
          <Text 
            color="gray.600" 
            mb={4} 
            noOfLines={3}
            onClick={() => handlePostClick(post)} 
            cursor="pointer"
          >
            {post.content}
          </Text>
          
          {post.tags && post.tags.length > 0 && (
            <Flex wrap="wrap" gap={2} mb={4}>
              {post.tags.map(tag => (
                <Tag 
                  key={tag} 
                  size="sm" 
                  variant="subtle" 
                  colorScheme="teal"
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentTag(currentTag === tag ? null : tag);
                  }}
                  backgroundColor={currentTag === tag ? 'teal.100' : undefined}
                >
                  {tag}
                </Tag>
              ))}
            </Flex>
          )}
        </CardHeader>

        <CardFooter 
          pt={0} 
          pb={4} 
          px={6} 
          borderTop="1px solid" 
          borderColor="gray.100"
        >
          <HStack spacing={4} width="100%">
            <Button 
              variant="ghost" 
              size="sm"
              leftIcon={<ThumbsUp size={16} />}
            >
              {post.likes_count || 0}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              leftIcon={<MessageSquare size={16} />}
              onClick={() => toggleCommentSection(post.id)}
            >
              {post.comments[0].count}
            </Button>
            
            <Tooltip label="View full post">
              <Button 
                variant="ghost" 
                size="sm"
                leftIcon={<Eye size={16} />}
                onClick={() => handlePostClick(post)}
                ml="auto"
              >
                View
              </Button>
            </Tooltip>
          </HStack>
        </CardFooter>
        
        <Collapse in={isCommentOpen[post.id]} animateOpacity>
          <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
            <HStack mb={4}>
              <Avatar size="xs" />
              <Textarea
                ref={commentInputRef}
                placeholder="Write a comment..."
                size="sm"
                resize="none"
                rows={2}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <IconButton
                aria-label="Post comment"
                icon={<Send size={16} />}
                size="sm"
                colorScheme="teal"
                isDisabled={!newComment.trim()}
                onClick={() => createComment(post.id)}
              />
            </HStack>
            
            <Box maxH="200px" overflowY="auto">
              <Text fontSize="sm" fontWeight="medium" mb={2}>
                Recent Comments
              </Text>
              
              <VStack align="stretch" spacing={3}>
                {/* Show 2 sample comments - in a real app, you'd load these from the database */}
                <Box p={2} bg="white" borderRadius="md">
                  <Flex align="center" mb={1}>
                    <Avatar size="2xs" mr={2} />
                    <Text fontSize="xs" fontWeight="medium">Sample User</Text>
                    <Text fontSize="xs" color="gray.500" ml={2}>Just now</Text>
                  </Flex>
                  <Text fontSize="sm">This is a sample comment. Click "View" to see all comments.</Text>
                </Box>
                
                <Button 
                  size="xs" 
                  variant="link" 
                  colorScheme="teal"
                  onClick={() => handlePostClick(post)}
                >
                  View all comments ({post.comments[0].count})
                </Button>
              </VStack>
            </Box>
          </Box>
        </Collapse>
      </Card>
    );
  };

  return (
    <Box>
      <AuthModal isOpen={isAuthOpen} onClose={onAuthClose} />
      
      <Heading mb={6}>Community Forum</Heading>
      
      {!user && (
        <Alert status="info" mb={6}>
          <AlertIcon />
          <Text flex="1">Sign in to participate in discussions and create posts</Text>
          <Button colorScheme="teal" size="sm" onClick={onAuthOpen} leftIcon={<LogIn size={16} />}>
            Sign In
          </Button>
        </Alert>
      )}

      {/* Search and filter bar */}
      <Flex mb={6} align="center" gap={4} wrap={{ base: "wrap", md: "nowrap" }}>
        <InputGroup flex={1} maxW={{ base: "100%", md: "400px" }}>
          <InputLeftElement pointerEvents="none">
            <Search size={18} color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDown size={16} />} variant="outline">
            <Flex align="center">
              <Filter size={16} style={{ marginRight: '8px' }} />
              {sortOption === 'newest' && 'Newest first'}
              {sortOption === 'oldest' && 'Oldest first'}
              {sortOption === 'most_comments' && 'Most comments'}
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => setSortOption('newest')}>Newest first</MenuItem>
            <MenuItem onClick={() => setSortOption('oldest')}>Oldest first</MenuItem>
            <MenuItem onClick={() => setSortOption('most_comments')}>Most comments</MenuItem>
          </MenuList>
        </Menu>
        
        {currentTag && (
          <Tag 
            colorScheme="teal" 
            size="md"
            cursor="pointer"
            onClick={() => setCurrentTag(null)}
          >
            {currentTag} ✕
          </Tag>
        )}
      </Flex>

      {/* Categories Grid */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} mb={8}>
        {categories.map((category) => (
          <Box
            key={category.id}
            bg={selectedCategory === category.id ? 'teal.50' : 'white'}
            p={4}
            borderRadius="lg"
            shadow="sm"
            cursor="pointer"
            onClick={() => setSelectedCategory(category.id)}
            transition="all 0.2s"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
            borderLeft={selectedCategory === category.id ? "4px solid" : "none"}
            borderColor="teal.500"
          >
            <Heading size="md" mb={2}>{category.name}</Heading>
            <Text color="gray.600" noOfLines={2}>{category.description}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {selectedCategory && (
        <>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">
              {categories.find(c => c.id === selectedCategory)?.name}
            </Heading>
            <Button
              leftIcon={<Plus size={18} />}
              colorScheme="teal"
              onClick={user ? onOpen : onAuthOpen}
            >
              New Post
            </Button>
          </HStack>

          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="teal.500" />
            </Flex>
          ) : filteredPosts.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {filteredPosts.map(post => renderPostItem(post))}
            </VStack>
          ) : (
            <Box 
              py={10} 
              textAlign="center" 
              bg="gray.50" 
              borderRadius="lg"
            >
              <Text mb={4} color="gray.600">No posts found</Text>
              <Button
                leftIcon={<Plus size={18} />}
                colorScheme="teal"
                onClick={onOpen}
              >
                Create the first post
              </Button>
            </Box>
          )}
        </>
      )}

      {/* New Post Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Post title"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your post content here..."
                  rows={6}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Flex wrap="wrap" gap={2} mb={2}>
                  {newPost.tags.map(tag => (
                    <Tag 
                      key={tag} 
                      size="md" 
                      variant="subtle" 
                      colorScheme="teal"
                      cursor="pointer"
                    >
                      {tag}
                      <Tag 
                        ml={1} 
                        size="sm" 
                        variant="solid" 
                        colorScheme="red"
                        cursor="pointer"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ✕
                      </Tag>
                    </Tag>
                  ))}
                </Flex>
                
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} size="sm" variant="outline" leftIcon={<Plus size={14} />}>
                    Add Tags
                  </MenuButton>
                  <MenuList>
                    {['question', 'tips', 'help', 'maintenance', 'safety', 'regulations', 'vehicle'].map(tag => (
                      <MenuItem 
                        key={tag} 
                        onClick={() => handleAddTag(tag)}
                        isDisabled={newPost.tags.includes(tag)}
                      >
                        {tag}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={createPost}
              isDisabled={!newPost.title.trim() || !newPost.content.trim()}
            >
              Create Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Post Detail Modal */}
      <Modal 
        isOpen={isPostDetailOpen} 
        onClose={onPostDetailClose} 
        size="xl" 
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPost?.title}
            {selectedPost?.is_pinned && (
              <Badge colorScheme="yellow" ml={2}>Pinned</Badge>
            )}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack align="stretch" spacing={6}>
              {/* Author info */}
              <HStack>
                <Avatar
                  size="md"
                  name={selectedPost?.profiles?.full_name}
                  src={selectedPost?.profiles?.avatar_url}
                />
                <Box>
                  <Flex align="center">
                    <Text fontWeight="medium">
                      {selectedPost?.profiles?.full_name || 'Anonymous'}
                    </Text>
                    {selectedPost?.profiles?.is_verified && (
                      <Badge colorScheme="green" ml={1}>
                        <Flex align="center">
                          <UserCheck size={10} />
                          <Text fontSize="xs" ml={1}>Verified Driver</Text>
                        </Flex>
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.500">
                    Posted on {selectedPost && formatDate(selectedPost.created_at)}
                  </Text>
                </Box>
              </HStack>

              {/* Post content */}
              <Box>
                <Text whiteSpace="pre-line">{selectedPost?.content}</Text>
              </Box>
              
              {/* Post tags */}
              {selectedPost?.tags && selectedPost.tags.length > 0 && (
                <Flex wrap="wrap" gap={2}>
                  {selectedPost.tags.map(tag => (
                    <Tag key={tag} size="md" variant="subtle" colorScheme="teal">
                      {tag}
                    </Tag>
                  ))}
                </Flex>
              )}

              <HStack spacing={6} pt={2}>
                <Button variant="ghost" leftIcon={<ThumbsUp size={18} />}>
                  {selectedPost?.likes_count || 0} Likes
                </Button>
                <Button variant="ghost" leftIcon={<MessageCircle size={18} />}>
                  {selectedPost?.comments[0].count || 0} Comments
                </Button>
                <Button variant="ghost" leftIcon={<Share size={18} />}>
                  Share
                </Button>
                <Button variant="ghost" leftIcon={<Bookmark size={18} />}>
                  Save
                </Button>
              </HStack>
              
              <Divider />
              
              {/* Comments section */}
              <Box>
                <Heading size="md" mb={4}>Comments ({comments.length})</Heading>
                
                {/* New comment input */}
                <HStack mb={6}>
                  <Avatar size="sm" />
                  <Box flex={1}>
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      size="sm"
                      resize="none"
                    />
                  </Box>
                  <Button
                    colorScheme="teal"
                    onClick={() => createComment(selectedPost!.id)}
                    isDisabled={!newComment.trim()}
                  >
                    Comment
                  </Button>
                </HStack>
                
                {/* Comments list */}
                <VStack align="stretch" spacing={4}>
                  {comments.length > 0 ? (
                    comments.map(comment => (
                      <Box key={comment.id} p={4} bg="gray.50" borderRadius="md">
                        <HStack mb={2}>
                          <Avatar
                            size="sm"
                            name={comment.profiles?.full_name}
                            src={comment.profiles?.avatar_url}
                          />
                          <Box>
                            <Flex align="center">
                              <Text fontWeight="medium" fontSize="sm">
                                {comment.profiles?.full_name || 'Anonymous'}
                              </Text>
                              {comment.profiles?.is_verified && (
                                <Badge colorScheme="green" ml={1} size="sm">
                                  <Flex align="center">
                                    <UserCheck size={10} />
                                    <Text fontSize="xs" ml={1}>Verified</Text>
                                  </Flex>
                                </Badge>
                              )}
                            </Flex>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(comment.created_at)} at {formatTime(comment.created_at)}
                            </Text>
                          </Box>
                        </HStack>
                        <Text ml={10}>{comment.content}</Text>
                      </Box>
                    ))
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Text color="gray.500">No comments yet. Be the first to comment!</Text>
                    </Box>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button onClick={onPostDetailClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}